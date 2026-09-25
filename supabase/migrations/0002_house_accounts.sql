-- House credentials. Apply in the Supabase SQL editor or CLI.
-- Service role bypasses RLS. Anon has no write policies.

create table if not exists house_accounts (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  username_key text not null unique,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table house_accounts enable row level security;
