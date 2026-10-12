-- =====================================================================
-- QATRAH — migration 0002a: enum additions
--
-- RUN THIS FILE FIRST, ON ITS OWN, AND LET IT COMMIT.
-- Postgres refuses to use a new enum label inside the same transaction that
-- created it, so 0002b cannot run until this has committed.
-- =====================================================================

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
