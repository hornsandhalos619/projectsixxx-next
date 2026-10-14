-- Newsletter / lead capture (lib/leads.ts).
-- Service role bypasses RLS. Anon and authenticated have no policies.

create table if not exists newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and position('@' in email) > 1),
  source text not null default 'unknown',
  tag text,
  consent text not null default 'yes-opt-in',
  created_at timestamptz not null default now(),
  last_touch timestamptz not null default now()
);

alter table newsletter_signups enable row level security;

revoke all on newsletter_signups from anon, authenticated;
