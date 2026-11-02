-- Newsletter addresses from the house site. Apply in the Supabase SQL editor or CLI.
-- Service role bypasses RLS. Anon may insert only. No select policy, so addresses stay unreadable.

create table if not exists house_leads (
  email text primary key,
  source text not null,
  tag text,
  consent text not null default 'yes-opt-in',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table house_leads enable row level security;

drop policy if exists house_leads_insert on house_leads;
create policy house_leads_insert on house_leads
  for insert
  to anon, authenticated
  with check (char_length(email) between 3 and 320 and position('@' in email) > 1);
