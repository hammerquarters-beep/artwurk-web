# ARTWURK Production Data Architecture

ARTWURK uses Supabase for production persistence and Supabase Auth for account creation.

## Required Production Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ARTWURK_OWNER_NOTIFICATION_EMAIL=Hammer.quarters@gmail.com`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## Tables

- User accounts: `auth.users`
- Collector account profiles: `public.artwurk_collectors`
- Email list signups: `public.artwurk_email_signups`
- Inquiries: `public.artwurk_inquiries`
- Collector leads: `public.artwurk_leads`
- Website analytics/events: `public.artwurk_events`
- Orders/sales: `public.artwurk_orders`
- Campaign requests: `public.artwurk_campaigns`
- Owner notification log: `public.artwurk_owner_notifications`

## Persistence

Supabase Postgres data persists through Vercel redeploys. The previous JSON file/mock storage has been replaced for production API writes.

## Authentication

Create / Sign In uses Supabase Auth. Passwords are submitted directly to Supabase Auth and are not stored by ARTWURK application code.

## Duplicate Email Prevention

Duplicate prevention is enforced with unique email constraints on:

- `public.artwurk_collectors.email`
- `public.artwurk_email_signups.email`

Application writes use Supabase `upsert` with `onConflict: "email"` so repeated signups update the existing collector/email-list record instead of creating duplicates.

## Owner Notifications

Signup, inquiry, and order notifications are sent to `Hammer.quarters@gmail.com` when `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are configured. Notification attempts are also logged to `public.artwurk_owner_notifications`.

## Migration

Run `supabase/migrations/001_artwurk_production.sql` in the Supabase SQL editor or apply it through the Supabase CLI before setting production traffic live.
