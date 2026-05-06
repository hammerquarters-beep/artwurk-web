alter table public.artwurk_owner_notifications
  add column if not exists resend_message_id text,
  add column if not exists error_message text,
  add column if not exists sent_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists set_artwurk_owner_notifications_updated_at on public.artwurk_owner_notifications;
create trigger set_artwurk_owner_notifications_updated_at
before update on public.artwurk_owner_notifications
for each row execute function public.set_artwurk_updated_at();
