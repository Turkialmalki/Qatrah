-- =====================================================================
-- QATRAH (قاطرة) PLATFORM — DATABASE SCHEMA
-- Run this once in the Supabase SQL editor on a fresh project.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
create type user_role as enum ('client', 'provider', 'admin');
create type provider_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type provider_category as enum ('hall', 'catering', 'decor', 'photography', 'music', 'planning',
                                      'av', 'translation', 'booths', 'security', 'transport', 'other');
create type event_status as enum ('draft', 'planning', 'matched', 'confirmed', 'in_execution', 'completed', 'cancelled');
create type event_type as enum ('wedding', 'engagement', 'graduation', 'corporate', 'birthday',
                               'conference', 'exhibition', 'forum', 'workshop', 'festival', 'other');
create type match_status as enum ('proposed', 'quoted', 'accepted', 'declined', 'expired');
create type booking_status as enum ('pending_payment', 'paid', 'in_progress', 'completed', 'cancelled', 'disputed');
create type payment_status as enum ('pending', 'paid', 'refunded', 'failed');
create type task_status as enum ('todo', 'in_progress', 'done', 'blocked');
create type quality_status as enum ('pending', 'passed', 'flagged', 'failed');

-- ---------------------------------------------------------------------
-- PROFILES  (1: إدارة المستخدمين / user management)
-- ---------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role user_role not null default 'client',
  avatar_url text,
  city text default 'الرياض',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table provider_profiles (
  id uuid primary key references profiles(id) on delete cascade,
  business_name text not null,
  category provider_category not null,          -- primary / display category
  categories provider_category[] not null default '{}',  -- every category this provider serves
  bio text,
  status provider_status not null default 'pending',
  commercial_registration text,
  years_experience int default 0,
  quality_score numeric(3,2) default 0,     -- 0..5, rule-based, module 12 الجودة
  fair_price_index numeric(4,2) default 1,  -- module 8 محرك التسعير العادل
  response_rate numeric(4,1) default 100,
  completed_jobs int default 0,
  base_city text default 'الرياض',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- HALLS  (3: إدارة القاعات)
-- ---------------------------------------------------------------------
create table halls (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  name text not null,
  city text not null default 'الرياض',
  address text,
  capacity_min int default 0,
  capacity_max int not null,
  base_price numeric(10,2) not null,
  amenities text[] default '{}',
  images text[] default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- SERVICES  (4: إدارة الخدمات) — catering, decor, photography, music...
-- ---------------------------------------------------------------------
create table services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  category provider_category not null,
  title text not null,
  description text,
  unit text default 'package', -- package | per_person | per_hour
  base_price numeric(10,2) not null,
  min_price numeric(10,2),
  max_price numeric(10,2),
  package_key text,            -- adopted platform package, null = provider's own listing
  inclusions text[] default '{}',
  images text[] default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  -- A provider who does not adopt a ready-made package must supply their own
  -- photo and a full description of what they offer.
  constraint services_custom_requires_media check (
    package_key is not null
    or (coalesce(array_length(images, 1), 0) > 0 and char_length(coalesce(description, '')) >= 80)
  )
);

-- ---------------------------------------------------------------------
-- EVENTS  (2: إدارة المناسبات)
-- ---------------------------------------------------------------------
create table events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  event_type event_type not null default 'wedding',
  city text not null default 'الرياض',
  guest_count int not null default 100,
  event_date date,
  total_budget numeric(10,2) not null,
  status event_status not null default 'draft',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- selections the client made for the event (which service categories they need)
create table event_requirements (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  category provider_category not null,
  priority int not null default 3, -- 1..5, used by budget optimization engine
  allocated_budget numeric(10,2),
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- CONFERENCES & EXHIBITIONS — extra detail for the non-social event track
-- ---------------------------------------------------------------------
create table conference_details (
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

-- ---------------------------------------------------------------------
-- DESIGN  (6: إدارة التصميم) — decor moodboards / concepts per event
-- ---------------------------------------------------------------------
create table design_concepts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  provider_id uuid references provider_profiles(id) on delete set null,
  title text not null,
  palette text[] default '{}',
  style text,
  images text[] default '{}',
  estimated_cost numeric(10,2),
  is_selected boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- MATCHING ENGINE  (5: محرك المطابقة الذكية) — rule-based
-- ---------------------------------------------------------------------
create table matches (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  requirement_id uuid references event_requirements(id) on delete cascade,
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  hall_id uuid references halls(id) on delete cascade,
  service_id uuid references services(id) on delete cascade,
  match_score numeric(5,2) not null default 0, -- 0..100 rule-based score
  score_breakdown jsonb default '{}',
  status match_status not null default 'proposed',
  quoted_price numeric(10,2),
  fair_price_delta numeric(5,2), -- % deviation from fair_price_index, module 8
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- BOOKINGS / APPROVAL & PAYMENT (الاعتماد والدفع)
-- ---------------------------------------------------------------------
create table bookings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  amount numeric(10,2) not null,
  status booking_status not null default 'pending_payment',
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  amount numeric(10,2) not null,
  status payment_status not null default 'pending',
  method text default 'card',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- EXECUTION  (10: إدارة التنفيذ, 11: محرك التخطيط الذكي)
-- ---------------------------------------------------------------------
create table execution_tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  booking_id uuid references bookings(id) on delete cascade,
  title text not null,
  category provider_category,
  due_date date,
  status task_status not null default 'todo',
  owner_provider_id uuid references provider_profiles(id) on delete set null,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- QUALITY  (12: الجودة)
-- ---------------------------------------------------------------------
create table quality_checks (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  checklist jsonb not null default '[]',
  status quality_status not null default 'pending',
  reviewed_by uuid references profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- EVALUATION  (13: التقييم)
-- ---------------------------------------------------------------------
create table evaluations (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  rating_quality int not null check (rating_quality between 1 and 5),
  rating_price int not null check (rating_price between 1 and 5),
  rating_timeliness int not null check (rating_timeliness between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- FINANCIAL SETTLEMENT (التسوية المالية) — platform commission ledger
-- ---------------------------------------------------------------------
create table settlements (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  gross_amount numeric(10,2) not null,
  commission_rate numeric(4,3) not null default 0.10,
  commission_amount numeric(10,2) not null,
  net_payout numeric(10,2) not null,
  status text not null default 'pending', -- pending | released
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- KNOWLEDGE BASE  (14: قاعدة المعرفة)
-- ---------------------------------------------------------------------
create table knowledge_base (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  content text not null,
  tags text[] default '{}',
  published boolean not null default true,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- TRIGGERS
-- =====================================================================
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
      -- `categories` carries every category the provider signed up to serve;
      -- fall back to the single primary category when the list is absent.
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger events_updated_at before update on events
  for each row execute function set_updated_at();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table profiles enable row level security;
alter table provider_profiles enable row level security;
alter table halls enable row level security;
alter table services enable row level security;
alter table events enable row level security;
alter table event_requirements enable row level security;
alter table conference_details enable row level security;
alter table design_concepts enable row level security;
alter table matches enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;
alter table execution_tasks enable row level security;
alter table quality_checks enable row level security;
alter table evaluations enable row level security;
alter table settlements enable row level security;
alter table knowledge_base enable row level security;

create or replace function is_admin()
returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql security definer stable;

-- PROFILES
create policy "profiles_select_own_or_admin" on profiles for select
  using (id = auth.uid() or is_admin());
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid());
create policy "profiles_insert_own" on profiles for insert
  with check (id = auth.uid());

-- PROVIDER PROFILES — publicly viewable when approved, else own/admin
create policy "provider_profiles_select" on provider_profiles for select
  using (status = 'approved' or id = auth.uid() or is_admin());
create policy "provider_profiles_update_own_or_admin" on provider_profiles for update
  using (id = auth.uid() or is_admin());
create policy "provider_profiles_insert_own" on provider_profiles for insert
  with check (id = auth.uid());

-- HALLS — public read of active halls; providers manage their own
create policy "halls_select_public" on halls for select using (true);
create policy "halls_insert_own" on halls for insert with check (provider_id = auth.uid());
create policy "halls_update_own_or_admin" on halls for update using (provider_id = auth.uid() or is_admin());
create policy "halls_delete_own_or_admin" on halls for delete using (provider_id = auth.uid() or is_admin());

-- SERVICES
create policy "services_select_public" on services for select using (true);
create policy "services_insert_own" on services for insert with check (provider_id = auth.uid());
create policy "services_update_own_or_admin" on services for update using (provider_id = auth.uid() or is_admin());
create policy "services_delete_own_or_admin" on services for delete using (provider_id = auth.uid() or is_admin());

-- EVENTS — owner client, matched providers, or admin
create policy "events_select_owner_or_admin" on events for select
  using (
    client_id = auth.uid()
    or is_admin()
    or exists (select 1 from matches m where m.event_id = events.id and m.provider_id = auth.uid())
  );
create policy "events_insert_own" on events for insert with check (client_id = auth.uid());
create policy "events_update_own_or_admin" on events for update using (client_id = auth.uid() or is_admin());
create policy "events_delete_own_or_admin" on events for delete using (client_id = auth.uid() or is_admin());

-- EVENT REQUIREMENTS
create policy "requirements_select" on event_requirements for select
  using (exists (select 1 from events e where e.id = event_id and (e.client_id = auth.uid() or is_admin()
    or exists (select 1 from matches m where m.event_id = e.id and m.provider_id = auth.uid()))));
create policy "requirements_manage" on event_requirements for all
  using (exists (select 1 from events e where e.id = event_id and (e.client_id = auth.uid() or is_admin())))
  with check (exists (select 1 from events e where e.id = event_id and (e.client_id = auth.uid() or is_admin())));

-- CONFERENCE DETAILS
create policy "conference_details_select" on conference_details for select
  using (exists (select 1 from events e where e.id = event_id and (e.client_id = auth.uid() or is_admin()
    or exists (select 1 from matches m where m.event_id = e.id and m.provider_id = auth.uid()))));
create policy "conference_details_manage" on conference_details for all
  using (exists (select 1 from events e where e.id = event_id and (e.client_id = auth.uid() or is_admin())))
  with check (exists (select 1 from events e where e.id = event_id and (e.client_id = auth.uid() or is_admin())));

-- DESIGN CONCEPTS
create policy "design_select" on design_concepts for select
  using (exists (select 1 from events e where e.id = event_id and (e.client_id = auth.uid() or is_admin()))
    or provider_id = auth.uid());
create policy "design_insert" on design_concepts for insert
  with check (provider_id = auth.uid() or exists (select 1 from events e where e.id = event_id and e.client_id = auth.uid()));
create policy "design_update" on design_concepts for update
  using (provider_id = auth.uid() or exists (select 1 from events e where e.id = event_id and e.client_id = auth.uid()) or is_admin());

-- MATCHES
create policy "matches_select" on matches for select
  using (provider_id = auth.uid() or is_admin()
    or exists (select 1 from events e where e.id = event_id and e.client_id = auth.uid()));
create policy "matches_insert" on matches for insert
  with check (is_admin() or exists (select 1 from events e where e.id = event_id and e.client_id = auth.uid()) or provider_id = auth.uid());
create policy "matches_update" on matches for update
  using (provider_id = auth.uid() or is_admin()
    or exists (select 1 from events e where e.id = event_id and e.client_id = auth.uid()));

-- BOOKINGS
create policy "bookings_select" on bookings for select
  using (client_id = auth.uid() or provider_id = auth.uid() or is_admin());
create policy "bookings_insert" on bookings for insert with check (client_id = auth.uid() or is_admin());
create policy "bookings_update" on bookings for update
  using (client_id = auth.uid() or provider_id = auth.uid() or is_admin());

-- PAYMENTS
create policy "payments_select" on payments for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.client_id = auth.uid() or b.provider_id = auth.uid() or is_admin())));
create policy "payments_insert" on payments for insert
  with check (exists (select 1 from bookings b where b.id = booking_id and b.client_id = auth.uid()));
create policy "payments_update" on payments for update
  using (exists (select 1 from bookings b where b.id = booking_id and (b.client_id = auth.uid() or is_admin())));

-- EXECUTION TASKS
create policy "tasks_select" on execution_tasks for select
  using (owner_provider_id = auth.uid() or is_admin()
    or exists (select 1 from events e where e.id = event_id and e.client_id = auth.uid()));
create policy "tasks_manage" on execution_tasks for all
  using (owner_provider_id = auth.uid() or is_admin()
    or exists (select 1 from events e where e.id = event_id and e.client_id = auth.uid()))
  with check (owner_provider_id = auth.uid() or is_admin()
    or exists (select 1 from events e where e.id = event_id and e.client_id = auth.uid()));

-- QUALITY CHECKS
create policy "quality_select" on quality_checks for select
  using (is_admin() or exists (select 1 from bookings b where b.id = booking_id and (b.client_id = auth.uid() or b.provider_id = auth.uid())));
create policy "quality_manage" on quality_checks for all using (is_admin()) with check (is_admin());

-- EVALUATIONS
create policy "evaluations_select" on evaluations for select using (true);
create policy "evaluations_insert" on evaluations for insert with check (client_id = auth.uid());

-- SETTLEMENTS
create policy "settlements_select" on settlements for select using (provider_id = auth.uid() or is_admin());
create policy "settlements_manage" on settlements for all using (is_admin()) with check (is_admin());

-- KNOWLEDGE BASE
create policy "kb_select_published" on knowledge_base for select using (published or is_admin());
create policy "kb_manage_admin" on knowledge_base for all using (is_admin()) with check (is_admin());

-- =====================================================================
-- SEED: sample knowledge base articles
-- =====================================================================
insert into knowledge_base (category, title, content, tags) values
('التسعير', 'كيف يعمل محرك التسعير العادل', 'يقارن محرك التسعير العادل سعر كل مزود بمتوسط السوق لنفس فئة الخدمة والمدينة، ويحسب مؤشر عدالة السعر لضمان شفافية الأسعار للعميل.', array['تسعير','شفافية']),
('الجودة', 'معايير قبول مقدمي الخدمة', 'لا تقبل منصة قاطرة إلا مقدمي الخدمة المتخصصين الذين يجتازون معايير الجودة والتحقق من السجل التجاري والخبرة.', array['جودة','اعتماد']),
('الميزانية', 'محرك تحسين الميزانية', 'يوزع محرك تحسين الميزانية ميزانية العميل على بنود المناسبة (قاعة، تصوير، ديكور...) حسب الأولوية التي يحددها العميل لكل بند.', array['ميزانية']);

-- =====================================================================
-- STORAGE — public bucket for provider-uploaded service photos.
-- Files are written under `<provider uuid>/…` so each provider can only
-- write inside their own folder.
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('service-images', 'service-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "service_images_public_read" on storage.objects for select
  using (bucket_id = 'service-images');
create policy "service_images_insert_own_folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'service-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "service_images_update_own_folder" on storage.objects for update to authenticated
  using (bucket_id = 'service-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "service_images_delete_own_folder" on storage.objects for delete to authenticated
  using (bucket_id = 'service-images' and (storage.foldername(name))[1] = auth.uid()::text);
