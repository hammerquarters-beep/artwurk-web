create extension if not exists pgcrypto;
create extension if not exists citext;

create table if not exists public.artwurk_collectors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  email citext unique not null,
  name text,
  phone text,
  preferred_contact text,
  source text,
  status text not null default 'new',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artwurk_email_signups (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  name text,
  source text not null,
  discount_code text,
  audience text,
  amount_off_percent integer,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artwurk_events (
  id text primary key,
  event_name text not null,
  route text not null,
  page text not null,
  source text not null,
  occurred_at timestamptz not null,
  artwork jsonb,
  context jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.artwurk_inquiries (
  id text primary key,
  status text not null default 'new',
  intent text not null,
  route text not null,
  page text not null,
  source text not null,
  occurred_at timestamptz not null,
  artwork jsonb not null,
  inquiry jsonb not null default '{}'::jsonb,
  customer_email citext,
  customer_name text,
  customer_phone text,
  customer_message text,
  context jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artwurk_leads (
  id text primary key,
  status text not null default 'new',
  intent text not null,
  route text not null,
  page text not null,
  source text not null,
  occurred_at timestamptz not null,
  artwork jsonb,
  customer_email citext,
  customer_name text,
  customer_phone text,
  preferred_contact text,
  context jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artwurk_orders (
  id uuid primary key default gen_random_uuid(),
  artwork text not null,
  amount numeric(12, 2) not null,
  email citext,
  status text not null default 'paid',
  payload jsonb not null default '{}'::jsonb,
  sold_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.artwurk_campaigns (
  id uuid primary key default gen_random_uuid(),
  sender_email citext,
  subject text,
  message text,
  sms text,
  audience text not null default 'all_clients',
  channel text,
  status text not null default 'queued',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.artwurk_owner_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  recipient_email citext not null,
  subject text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create or replace function public.set_artwurk_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_artwurk_collectors_updated_at on public.artwurk_collectors;
create trigger set_artwurk_collectors_updated_at
before update on public.artwurk_collectors
for each row execute function public.set_artwurk_updated_at();

drop trigger if exists set_artwurk_email_signups_updated_at on public.artwurk_email_signups;
create trigger set_artwurk_email_signups_updated_at
before update on public.artwurk_email_signups
for each row execute function public.set_artwurk_updated_at();

drop trigger if exists set_artwurk_inquiries_updated_at on public.artwurk_inquiries;
create trigger set_artwurk_inquiries_updated_at
before update on public.artwurk_inquiries
for each row execute function public.set_artwurk_updated_at();

drop trigger if exists set_artwurk_leads_updated_at on public.artwurk_leads;
create trigger set_artwurk_leads_updated_at
before update on public.artwurk_leads
for each row execute function public.set_artwurk_updated_at();

create or replace function public.create_artwurk_collector_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.artwurk_collectors (
    user_id,
    email,
    name,
    source,
    metadata
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    'supabase_auth',
    coalesce(new.raw_user_meta_data, '{}'::jsonb)
  )
  on conflict (email) do update
  set
    user_id = excluded.user_id,
    name = coalesce(nullif(excluded.name, ''), public.artwurk_collectors.name),
    source = excluded.source,
    metadata = public.artwurk_collectors.metadata || excluded.metadata,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_artwurk_collector on auth.users;
create trigger on_auth_user_created_artwurk_collector
after insert on auth.users
for each row execute function public.create_artwurk_collector_from_auth_user();

alter table public.artwurk_collectors enable row level security;
alter table public.artwurk_email_signups enable row level security;
alter table public.artwurk_events enable row level security;
alter table public.artwurk_inquiries enable row level security;
alter table public.artwurk_leads enable row level security;
alter table public.artwurk_orders enable row level security;
alter table public.artwurk_campaigns enable row level security;
alter table public.artwurk_owner_notifications enable row level security;

create index if not exists artwurk_events_occurred_at_idx on public.artwurk_events (occurred_at desc);
create index if not exists artwurk_inquiries_occurred_at_idx on public.artwurk_inquiries (occurred_at desc);
create index if not exists artwurk_leads_occurred_at_idx on public.artwurk_leads (occurred_at desc);
create index if not exists artwurk_collectors_email_idx on public.artwurk_collectors (email);
create index if not exists artwurk_email_signups_email_idx on public.artwurk_email_signups (email);
