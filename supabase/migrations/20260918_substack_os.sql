create extension if not exists pgcrypto;

create table if not exists public.substack_publications (
 id uuid primary key default gen_random_uuid(),
 name text not null unique,
 publication_url text,
 created_at timestamptz not null default now()
);

create table if not exists public.substack_daily_metrics (
 id bigserial primary key,
 publication_id uuid not null references public.substack_publications(id) on delete cascade,
 metric_date date not null,
 subscribers integer not null default 0,
 paid_subscribers integer not null default 0,
 free_subscribers integer not null default 0,
 revenue numeric(12,2) not null default 0,
 views integer not null default 0,
 new_subscribers integer not null default 0,
 unsubscribes integer not null default 0,
 created_at timestamptz not null default now(),
 unique(publication_id,metric_date)
);

create table if not exists public.substack_posts (
 id uuid primary key default gen_random_uuid(),
 publication_id uuid not null references public.substack_publications(id) on delete cascade,
 external_id text,
 title text not null,
 published_at timestamptz,
 views integer not null default 0,
 likes integer not null default 0,
 comments integer not null default 0,
 free_signups integer not null default 0,
 paid_signups integer not null default 0,
 revenue numeric(12,2) not null default 0,
 traffic_source text,
 category text,
 created_at timestamptz not null default now(),
 unique(publication_id,external_id)
);

create table if not exists public.substack_ingest_config (
 publication_id uuid primary key references public.substack_publications(id) on delete cascade,
 ingest_enabled boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

alter table public.substack_publications enable row level security;
alter table public.substack_daily_metrics enable row level security;
alter table public.substack_posts enable row level security;
alter table public.substack_ingest_config enable row level security;

revoke all on public.substack_publications from anon, authenticated;
revoke all on public.substack_daily_metrics from anon, authenticated;
revoke all on public.substack_posts from anon, authenticated;
revoke all on public.substack_ingest_config from anon, authenticated;