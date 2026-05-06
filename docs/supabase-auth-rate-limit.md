# Supabase Auth Email Rate Limit

During production verification, Supabase Auth returned `email rate limit exceeded`.

To unblock repeat signup/login testing:

1. Open the ARTWURK Supabase project dashboard.
2. Go to `Authentication` -> `Rate Limits`.
3. Increase the email-sending limits temporarily for production verification, or wait for the current email window to reset.
4. If the project is using Supabase's default email provider, configure a custom SMTP provider for production under `Authentication` -> `Email Templates` / SMTP settings.
5. Re-run `npm run verify:security` and the live auth signup/login pass after the limit resets.

Keep limits reasonable after testing so signup endpoints cannot be abused publicly.
