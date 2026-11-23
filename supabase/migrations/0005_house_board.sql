-- Members' message board. Apply in the Supabase SQL editor after preview review.
-- Service role bypasses RLS. Anon and authenticated have no policies:
-- the Next.js server reads and writes with the service role and filters hidden rows.
-- Do not grant the anon key direct table access.

create table if not exists board_threads (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  body text not null check (char_length(body) between 1 and 4000),
  author_account_id uuid not null references house_accounts(id),
  category text not null check (category in ('great-hall', 'gallery-art', 'forge', 'shop-releases')),
  created_at timestamptz not null default now(),
  pinned boolean not null default false,
  locked boolean not null default false,
  hidden boolean not null default false,
  check (position('<' in title) = 0 and position('>' in title) = 0),
  check (position('<' in body) = 0 and position('>' in body) = 0)
);

create table if not exists board_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references board_threads(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  author_account_id uuid not null references house_accounts(id),
  created_at timestamptz not null default now(),
  hidden boolean not null default false,
  check (position('<' in body) = 0 and position('>' in body) = 0)
);

create index if not exists board_threads_floor_idx
  on board_threads (pinned desc, created_at desc);

create index if not exists board_threads_category_idx
  on board_threads (category, created_at desc);

create index if not exists board_threads_author_idx
  on board_threads (author_account_id, created_at desc);

create index if not exists board_replies_thread_idx
  on board_replies (thread_id, created_at);

create index if not exists board_replies_author_idx
  on board_replies (author_account_id, created_at desc);

alter table board_threads enable row level security;
alter table board_replies enable row level security;
