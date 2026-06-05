-- Media Survey Supabase schema
-- Run this file in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.responden (
  id uuid primary key default gen_random_uuid(),
  nama text,
  umur integer not null check (umur between 10 and 100),
  jenis_kelamin text not null check (jenis_kelamin in ('Laki-laki', 'Perempuan', 'Lainnya')),
  pekerjaan text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.jawaban_survei (
  id uuid primary key default gen_random_uuid(),
  responden_id uuid not null references public.responden(id) on delete cascade,
  platform_utama text not null,
  durasi_harian text not null,
  tujuan_utama text not null,
  frekuensi text not null,
  bantu_informasi text not null,
  ganggu_produktivitas text not null,
  pengaruh_kehidupan text not null check (pengaruh_kehidupan in ('Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative')),
  saran text,
  created_at timestamptz not null default now()
);

create index if not exists idx_responden_created_at on public.responden(created_at desc);
create index if not exists idx_jawaban_created_at on public.jawaban_survei(created_at desc);
create index if not exists idx_jawaban_responden_id on public.jawaban_survei(responden_id);
create index if not exists idx_jawaban_platform on public.jawaban_survei(platform_utama);

alter table public.responden enable row level security;
alter table public.jawaban_survei enable row level security;

drop policy if exists "Public can submit respondents" on public.responden;
drop policy if exists "Public can submit survey answers" on public.jawaban_survei;
drop policy if exists "Authenticated admins can read respondents" on public.responden;
drop policy if exists "Authenticated admins can read answers" on public.jawaban_survei;
drop policy if exists "Authenticated admins can update respondents" on public.responden;
drop policy if exists "Authenticated admins can update answers" on public.jawaban_survei;
drop policy if exists "Authenticated admins can delete respondents" on public.responden;
drop policy if exists "Authenticated admins can delete answers" on public.jawaban_survei;
drop policy if exists "Public can read dashboard-safe respondent summaries" on public.responden;
drop policy if exists "Public can read dashboard-safe answer summaries" on public.jawaban_survei;

create policy "Public can submit respondents"
on public.responden
for insert
to anon
with check (true);

create policy "Public can submit survey answers"
on public.jawaban_survei
for insert
to anon
with check (true);

-- These SELECT policies let the public landing page show aggregate previews.
-- If you need stricter privacy, remove the two public SELECT policies and keep
-- the dashboard/statistics pages behind authentication only.
create policy "Public can read dashboard-safe respondent summaries"
on public.responden
for select
to anon
using (true);

create policy "Public can read dashboard-safe answer summaries"
on public.jawaban_survei
for select
to anon
using (true);

create policy "Authenticated admins can read respondents"
on public.responden
for select
to authenticated
using (true);

create policy "Authenticated admins can read answers"
on public.jawaban_survei
for select
to authenticated
using (true);

create policy "Authenticated admins can update respondents"
on public.responden
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated admins can update answers"
on public.jawaban_survei
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated admins can delete respondents"
on public.responden
for delete
to authenticated
using (true);

create policy "Authenticated admins can delete answers"
on public.jawaban_survei
for delete
to authenticated
using (true);