alter table public.artwurk_collectors
  add column if not exists shipping_address text,
  add column if not exists shipping_city text,
  add column if not exists shipping_state text,
  add column if not exists shipping_zip text,
  add column if not exists shipping_country text,
  add column if not exists preferred_contact text;

create index if not exists artwurk_collectors_user_metadata_idx
  on public.artwurk_collectors using gin (metadata);
