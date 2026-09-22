-- Project SiXXX live-edit CMS. Apply in the Supabase SQL editor or CLI.
-- Service role bypasses RLS. Anon has no write policies.

create table if not exists journal_posts (
  stream text not null,
  slug text not null,
  category text,
  title text not null,
  date text not null,
  excerpt text not null default '',
  dek text not null default '',
  teaser text not null default '',
  body text not null default '',
  status text not null default 'draft',
  tags text not null default '',
  author text,
  updated_at timestamptz not null default now(),
  primary key (stream, slug)
);

create table if not exists house_roles (
  email text primary key,
  role text not null check (role in ('blog_admin', 'shop_admin')),
  display_name text,
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists artists (
  slug text primary key,
  name text not null,
  role text not null default 'Collaborator',
  status text not null default 'sample',
  bio text not null default '',
  email text not null default '',
  social jsonb not null default '[]'::jsonb,
  store jsonb not null default '[]'::jsonb,
  media_pending boolean not null default true,
  featured boolean not null default false,
  featured_rank integer,
  updated_at timestamptz not null default now()
);

create table if not exists artist_works (
  id uuid primary key default gen_random_uuid(),
  artist_slug text not null references artists(slug) on delete cascade,
  title text not null,
  year text not null default '',
  medium text not null default '',
  caption text not null default '',
  media_url text,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists homepage_slots (
  slot text primary key,
  title text not null default '',
  body text not null default '',
  attribution text not null default '',
  href text,
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists affiliate_products (
  slug text primary key,
  category text not null,
  name text not null,
  dek text not null default '',
  belief text not null default '',
  body text,
  merchant text not null default '',
  merchant_url text not null default '',
  network text not null default 'merchant',
  status text not null default 'sample',
  price_hint text not null default '',
  featured boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists library_titles (
  slug text primary key,
  title text not null,
  dek text not null default '',
  author text not null default 'House',
  year text not null default '',
  status text not null default 'sample',
  format text not null default '',
  blurb text not null default '',
  sample jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  featured_rank integer,
  updated_at timestamptz not null default now()
);

alter table journal_posts enable row level security;
alter table house_roles enable row level security;
alter table artists enable row level security;
alter table artist_works enable row level security;
alter table homepage_slots enable row level security;
alter table affiliate_products enable row level security;
alter table library_titles enable row level security;
