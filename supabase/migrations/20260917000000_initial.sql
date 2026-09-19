create extension if not exists pgcrypto;
create table public.recipients (id text primary key, display_name text not null, birth_date date not null, birthday_label text not null, owner_id uuid not null references auth.users(id) on delete cascade, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.participations (id uuid primary key default gen_random_uuid(), recipient_id text not null references public.recipients(id) on delete cascade, display_name varchar(30) not null check (length(trim(display_name)) > 0), relationship varchar(20), exam_choice smallint check (exam_choice between 0 and 3), exam_score smallint not null check (exam_score in (0, 100)), practice_answers jsonb not null, practice_score smallint not null check (practice_score between 0 and 3), message varchar(300) not null check (length(trim(message)) > 0), client_submission_key uuid not null unique, created_at timestamptz not null default now());
alter table public.recipients enable row level security;
alter table public.participations enable row level security;
revoke all on public.recipients, public.participations from anon, authenticated;
grant select on public.recipients, public.participations to authenticated;
create policy "owner reads recipient" on public.recipients for select to authenticated using (owner_id = auth.uid());
create policy "owner reads participations" on public.participations for select to authenticated using (exists (select 1 from public.recipients r where r.id = recipient_id and r.owner_id = auth.uid()));
-- After creating the owner's Auth account, insert recipient 'yejin-22' with that owner UUID.
