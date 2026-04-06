-- Track which officer accepted/rejected each application
alter table public.applications
  add column if not exists reviewed_by text default null;
