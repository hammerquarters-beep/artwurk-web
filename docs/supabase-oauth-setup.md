# ARTWURK Supabase OAuth Setup

Google and Apple sign-in buttons are wired in the public account panel through Supabase Auth. Code support is active, but each provider still needs dashboard credentials before production users can complete OAuth.

## Google

1. Open Supabase Dashboard > ARTWURK project > Authentication > Providers.
2. Enable Google.
3. Add the Google OAuth client ID and client secret from Google Cloud Console.
4. In Google Cloud Console, add this authorized redirect URI:
   `https://zymxercwsbsltsyegewx.supabase.co/auth/v1/callback`
5. Save the provider.
6. Confirm `https://artwurk.net` is allowed in Supabase Authentication > URL Configuration.

## Apple

1. Open Supabase Dashboard > ARTWURK project > Authentication > Providers.
2. Enable Apple.
3. Add Apple Services ID, Team ID, Key ID, and private key from Apple Developer.
4. In Apple Developer, add this callback/return URL where Apple requests the Supabase redirect:
   `https://zymxercwsbsltsyegewx.supabase.co/auth/v1/callback`
5. Save the provider.
6. Keep the ARTWURK Apple button visible in production. It will work as soon as Apple credentials are configured in Supabase.

## Redirect URLs

In Supabase Dashboard > Authentication > URL Configuration, confirm these URLs are allowed:

- `https://artwurk.net`
- `https://artwurk.net/profile`
- `https://artwurk.net/profile?auth=google`
- `https://artwurk.net/profile?auth=apple`
- `https://artwurk.net/profile?auth=magic`
- local development URLs if needed, such as `http://localhost:3000/profile`

## Production Behavior

- Email/password sign-in remains active.
- One-time email login links are wired through Supabase OTP.
- Google sign-in calls `supabase.auth.signInWithOAuth({ provider: "google" })` and redirects back to `https://artwurk.net/profile?auth=google`.
- Apple sign-in calls `supabase.auth.signInWithOAuth({ provider: "apple" })` and redirects back to `https://artwurk.net/profile?auth=apple` once Apple Developer credentials are configured.
- OAuth customers are synced into `artwurk_collectors` after return through the `/profile` session hydration flow.
- Welcome emails use the existing Resend dedupe path.
- Owner notifications use the existing lead/notification flow and are only triggered once per customer browser session.
- Public headers and account dropdowns do not expose CRM links; owner/admin access remains controlled by the private allowlist.
