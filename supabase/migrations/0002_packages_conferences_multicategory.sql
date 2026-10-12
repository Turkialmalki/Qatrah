-- =====================================================================
-- QATRAH — migration 0002
--   1. ready-made service packages + mandatory media for custom services
--   2. conferences & exhibitions track (new event types + details table)
--   3. providers may offer several service categories
--   4. public storage bucket for provider-uploaded service images
--
-- The `alter type ... add value` statements live in 0002a and must run in
-- their own transaction — Postgres refuses to use a new enum label in the
-- same transaction that created it.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0002a — enum additions (run this block on its own, first)
-- ---------------------------------------------------------------------
alter type event_type add value if not exists 'conference';
alter type event_type add value if not exists 'exhibition';
alter type event_type add value if not exists 'forum';
alter type event_type add value if not exists 'workshop';
alter type event_type add value if not exists 'festival';

alter type provider_category add value if not exists 'av';
alter type provider_category add value if not exists 'translation';
alter type provider_category add value if not exists 'booths';
alter type provider_category add value if not exists 'security';
alter type provider_category add value if not exists 'transport';

-- ---------------------------------------------------------------------
-- 0002b — everything else (run after 0002a has committed)
-- ---------------------------------------------------------------------

-- 3. A provider is no longer pinned to a single category. `category` is kept
--    as the primary/display category; `categories` is the full set they serve.
alter table provider_profiles add column if not exists categories provider_category[] not null default '{}';
update provider_profiles set categories = array[category] where cardinality(categories) = 0;

-- 1. Where a service came from: a platform package, or the provider's own listing.
alter table services add column if not exists package_key text;
alter table services add column if not exists inclusions text[] not null default '{}';

-- A provider who does NOT adopt a ready-made package must supply their own
-- photo and a full description. Added NOT VALID so pre-existing demo rows are
-- left alone — the rule binds every insert and update from here on.
alter table services drop constraint if exists services_custom_requires_media;
alter table services add constraint services_custom_requires_media check (
  package_key is not null
  or (coalesce(array_length(images, 1), 0) > 0 and char_length(coalesce(description, '')) >= 80)
) not valid;

-- 2. Conference / exhibition specifics, one row per event on that track.
create table if not exists conference_details (
  event_id uuid primary key references events(id) on delete cascade,
  organizer_entity text,
  days_count int not null default 1 check (days_count between 1 and 30),
  sessions_count int not null default 0 check (sessions_count >= 0),
  speakers_count int not null default 0 check (speakers_count >= 0),
  needs_av boolean not null default true,
  needs_translation boolean not null default false,
  needs_booths boolean not null default false,
  booths_count int not null default 0 check (booths_count >= 0),
  needs_registration boolean not null default true,
  needs_security boolean not null default false,
  needs_transport boolean not null default false,
  agenda_notes text,
  created_at timestamptz not null default now()
);

alter table conference_details enable row level security;

drop policy if exists "conference_details_select" on conference_details;
create policy "conference_details_select" on conference_details for select
  using (exists (select 1 from events e where e.id = event_id and (
    e.client_id = auth.uid() or is_admin()
    or exists (select 1 from matches m where m.event_id = e.id and m.provider_id = auth.uid()))));

drop policy if exists "conference_details_manage" on conference_details;
create policy "conference_details_manage" on conference_details for all
  using (exists (select 1 from events e where e.id = event_id and (e.client_id = auth.uid() or is_admin())))
  with check (exists (select 1 from events e where e.id = event_id and (e.client_id = auth.uid() or is_admin())));

-- 4. Public bucket for provider-uploaded service photos. Files are written
--    under `<provider uuid>/…` so a provider can only touch their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('service-images', 'service-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "service_images_public_read" on storage.objects;
create policy "service_images_public_read" on storage.objects for select
  using (bucket_id = 'service-images');

drop policy if exists "service_images_insert_own_folder" on storage.objects;
create policy "service_images_insert_own_folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'service-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "service_images_update_own_folder" on storage.objects;
create policy "service_images_update_own_folder" on storage.objects for update to authenticated
  using (bucket_id = 'service-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "service_images_delete_own_folder" on storage.objects;
create policy "service_images_delete_own_folder" on storage.objects for delete to authenticated
  using (bucket_id = 'service-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- 3b. Signup now carries a list of categories for providers; keep the single
--     primary `category` as the fallback so older clients still work.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'client')
  );

  if coalesce(new.raw_user_meta_data->>'role', 'client') = 'provider' then
    insert into public.provider_profiles (id, business_name, category, categories)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'business_name', 'مقدم خدمة جديد'),
      coalesce((new.raw_user_meta_data->>'category')::provider_category, 'other'),
      coalesce(
        (select array_agg(value::text::provider_category)
           from jsonb_array_elements(new.raw_user_meta_data->'categories')),
        array[coalesce((new.raw_user_meta_data->>'category')::provider_category, 'other')]
      )
    );
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;
