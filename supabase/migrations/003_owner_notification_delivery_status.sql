alter table public.artwurk_owner_notifications
  add column if not exists delivery_status text;
