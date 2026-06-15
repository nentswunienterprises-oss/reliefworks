# Vercel Deployment for Relief Works

This project now deploys to Vercel as a single app:

- the React frontend is built into root `public/`
- the Express backend is exported from root [index.ts](./index.ts)
- Vercel serves static assets and runs the API on the same domain

## Environment Variables

Set these in your Vercel project settings:

```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_SUPABASE_URL=https://your-project.supabase.co

ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_strong_password
ADMIN_NAME=Relief Works Admin
SESSION_SECRET=your_long_random_secret

PAYFAST_SANDBOX=false
PAYFAST_MERCHANT_ID=your_live_merchant_id
PAYFAST_MERCHANT_KEY=your_live_merchant_key
PAYFAST_PASSPHRASE=your_live_passphrase_if_set
PAYFAST_RETURN_URL=https://yourdomain.com/payments/success
PAYFAST_CANCEL_URL=https://yourdomain.com/payments/cancelled
PAYFAST_NOTIFY_URL=https://yourdomain.com/api/payfast/itn
PAYFAST_SUBSCRIPTION_NOTIFY_URL=https://yourdomain.com/api/payfast/subscriptions/itn
PAYFAST_TRUSTED_IPS=comma_separated_payfast_ips

PAYFAST_SANDBOX_MERCHANT_ID=your_sandbox_merchant_id
PAYFAST_SANDBOX_MERCHANT_KEY=your_sandbox_merchant_key
PAYFAST_SANDBOX_PASSPHRASE=your_sandbox_passphrase_if_set
PAYFAST_SANDBOX_RETURN_URL=https://your-preview-domain.vercel.app/payments/success
PAYFAST_SANDBOX_CANCEL_URL=https://your-preview-domain.vercel.app/payments/cancelled
PAYFAST_SANDBOX_NOTIFY_URL=https://your-preview-domain.vercel.app/api/payfast/itn

RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=Relief Works <billing@yourdomain.com>
PUBLIC_APP_ORIGIN=https://yourdomain.com
```

## Build Settings

- Framework Preset: `Other`
- Root Directory: `.`
- Build Command: `npm run build`

`vercel.json` rewrites `/admin`, `/services`, `/diagnosis`, and `/quote/:token` to `index.html` so direct navigation works in production.

## Deploy Steps

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Set the environment variables above.
4. Deploy.
5. Open `https://your-domain/admin` and log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Notes

- Admin auth now uses a signed cookie, not in-memory `express-session`, which makes it compatible with Vercel Functions.
- The public inquiry flow still uses the Supabase Edge Function URL from `VITE_SUPABASE_URL`.
- If PayFast webhooks are enabled, point them at your Vercel domain under `/api/payfast/...`.
