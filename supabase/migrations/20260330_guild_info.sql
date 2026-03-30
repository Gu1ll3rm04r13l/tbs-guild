-- Guild-editable content: apply page info cards
-- Run this in Supabase SQL Editor

create table if not exists public.guild_info (
  key        text        primary key,
  value      jsonb       not null,
  updated_at timestamptz not null default now()
);

-- Public read (content is not sensitive)
alter table public.guild_info enable row level security;

create policy "guild_info_read_all"
  on public.guild_info for select
  using (true);

-- All writes go through service_role (admin client), which bypasses RLS.
-- No insert/update policy needed for anon or authenticated roles.
