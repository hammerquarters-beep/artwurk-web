create extension if not exists pgcrypto;
create extension if not exists citext;

alter table public.artwurk_collectors
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists display_name text,
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists sms_consent boolean not null default false,
  add column if not exists welcome_email_sent_at timestamptz;

create table if not exists public.artwurk_cart_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email citext,
  anonymous_id text,
  status text not null default 'active',
  subtotal numeric(12, 2) not null default 0,
  currency text not null default 'USD',
  last_activity_at timestamptz not null default now(),
  abandoned_after timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artwurk_cart_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.artwurk_cart_sessions(id) on delete cascade,
  artwork_id text not null,
  display_id text,
  title text not null,
  image text,
  dimensions text,
  price_label text,
  unit_amount numeric(12, 2),
  quantity integer not null default 1,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, artwork_id)
);

create table if not exists public.artwurk_cart_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.artwurk_cart_sessions(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  email citext,
  event_name text not null,
  artwork_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.artwurk_cart_followups (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.artwurk_cart_sessions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email citext,
  type text not null default 'abandoned_cart',
  status text not null default 'queued',
  resend_message_id text,
  error_message text,
  scheduled_for timestamptz not null default (now() + interval '3 hours'),
  sent_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artwurk_customer_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email citext not null,
  type text not null,
  status text not null default 'queued',
  resend_message_id text,
  error_message text,
  sent_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email, type)
);

drop trigger if exists set_artwurk_cart_sessions_updated_at on public.artwurk_cart_sessions;
create trigger set_artwurk_cart_sessions_updated_at
before update on public.artwurk_cart_sessions
for each row execute function public.set_artwurk_updated_at();

drop trigger if exists set_artwurk_cart_items_updated_at on public.artwurk_cart_items;
create trigger set_artwurk_cart_items_updated_at
before update on public.artwurk_cart_items
for each row execute function public.set_artwurk_updated_at();

drop trigger if exists set_artwurk_cart_followups_updated_at on public.artwurk_cart_followups;
create trigger set_artwurk_cart_followups_updated_at
before update on public.artwurk_cart_followups
for each row execute function public.set_artwurk_updated_at();

drop trigger if exists set_artwurk_customer_email_deliveries_updated_at on public.artwurk_customer_email_deliveries;
create trigger set_artwurk_customer_email_deliveries_updated_at
before update on public.artwurk_customer_email_deliveries
for each row execute function public.set_artwurk_updated_at();

alter table public.artwurk_cart_sessions enable row level security;
alter table public.artwurk_cart_items enable row level security;
alter table public.artwurk_cart_events enable row level security;
alter table public.artwurk_cart_followups enable row level security;
alter table public.artwurk_customer_email_deliveries enable row level security;

create index if not exists artwurk_cart_sessions_user_idx on public.artwurk_cart_sessions (user_id);
create index if not exists artwurk_cart_sessions_email_idx on public.artwurk_cart_sessions (email);
create index if not exists artwurk_cart_sessions_status_idx on public.artwurk_cart_sessions (status, last_activity_at desc);
create index if not exists artwurk_cart_items_session_idx on public.artwurk_cart_items (session_id);
create index if not exists artwurk_cart_events_created_idx on public.artwurk_cart_events (created_at desc);
create index if not exists artwurk_cart_followups_status_idx on public.artwurk_cart_followups (status, scheduled_for);
create index if not exists artwurk_customer_email_deliveries_email_idx on public.artwurk_customer_email_deliveries (email, type);

create unique index if not exists artwurk_cart_followups_session_type_idx
  on public.artwurk_cart_followups (session_id, type);
