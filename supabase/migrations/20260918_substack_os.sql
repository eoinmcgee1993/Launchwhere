create extension if not exists pgcrypto;
create table if not exists public.substack_publications (
 id uuid primary key default gen_random_uuid(),
 name text not null,
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
 created_at timestamptz not null default now()
);
alter table public.substack_publications enable row level security;
alter table public.substack_daily_metrics enable row level security;
alter table public.substack_posts enable row level security;