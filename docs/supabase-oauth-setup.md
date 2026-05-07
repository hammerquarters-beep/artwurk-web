# ARTWURK Supabase OAuth Setup

Google and Apple sign-in buttons are wired in the public account panel through Supabase Auth. Code support is active, but each provider still needs dashboard credentials before production users can complete OAuth.

## Google

1. Open Supabase Dashboard > ARTWURK project > Authentication > Providers.
2. Enable Google.
3. Add the Google OAuth client ID and client secret from Google Cloud Console.
4. In Google Cloud Console, add the Supabase callback URL shown in the Google provider panel. It usually follows:
   `https://<supabase-project-ref>.supabase.co/auth/v1/callback`
5. Save the provider.

## Apple

1. Open Supabase Dashboard > ARTWURK project > Authentication > Providers.
2. Enable Apple.
3. Add Apple Services ID, Team ID, Key ID, and private key from Apple Developer.
4. In Apple Developer, add the Supabase callback URL shown in the Apple provider panel:
   `https://<supabase-project-ref>.supabase.co/auth/v1/callback`
5. Save the provider.

## Redirect URLs

In Supabase Dashboard > Authentication > URL Configuration, confirm these URLs are allowed:

- `https://artwurk.net/profile`
- `https://artwurk.net/profile?auth=google`
- `https://artwurk.net/profile?auth=apple`
- `https://artwurk.net/profile?auth=magic`
- local development URLs if needed, such as `http://localhost:3000/profile`

## Production Behavior

- Email/password sign-in remains active.
- One-time email login links are wired through Supabase OTP.
- OAuth customers are synced into `artwurk_collectors` after return.
- Welcome emails use the existing Resend dedupe path.
- Owner notifications use the existing lead/notification flow and are only triggered once per customer browser session.
