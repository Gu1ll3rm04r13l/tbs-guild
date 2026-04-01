-- Enable Row Level Security on all public tables
-- Run this in Supabase SQL Editor

-- ============================================
-- PROFILES
-- ============================================
alter table public.profiles enable row level security;

-- Public roster is visible to everyone
create policy "profiles_read_all"
  on public.profiles for select
  using (true);

-- Users can only update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Inserts are handled by service_role (NextAuth callback) — bypasses RLS, no policy needed.

-- ============================================
-- APPLICATIONS
-- ============================================
alter table public.applications enable row level security;

-- Anyone can submit an application (public recruitment form)
create policy "applications_insert_public"
  on public.applications for insert
  with check (true);

-- SELECT / UPDATE / DELETE are handled exclusively by the officer dashboard
-- via createAdminClient() (service_role key), which bypasses RLS — no policy needed.

-- ============================================
-- RAID_PROGRESS
-- ============================================
alter table public.raid_progress enable row level security;

-- Displayed publicly on the home page hero widget
create policy "raid_progress_read_all"
  on public.raid_progress for select
  using (true);

-- Writes are handled via service_role only — bypasses RLS, no policy needed.
