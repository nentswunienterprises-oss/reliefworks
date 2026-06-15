# Vercel Deployment Configuration for Relief Works Frontend

This configuration deploys the React frontend to Vercel.

## Environment Variables

Set these in your Vercel project settings:

```
VITE_API_URL=your_railway_api_url_here
VITE_SUPABASE_URL=https://pzqhneluoquohtskfwkr.supabase.co

# Admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_strong_password
ADMIN_NAME=Relief Works Admin
SESSION_SECRET=your_long_random_secret

# PayFast (production)
PAYFAST_SANDBOX=false
PAYFAST_MERCHANT_ID=your_live_merchant_id
PAYFAST_MERCHANT_KEY=your_live_merchant_key
PAYFAST_PASSPHRASE=your_live_passphrase_if_set
PAYFAST_RETURN_URL=https://yourdomain.com/payments/success
PAYFAST_CANCEL_URL=https://yourdomain.com/payments/cancelled
PAYFAST_NOTIFY_URL=https://yourdomain.com/api/payfast/itn
PAYFAST_SUBSCRIPTION_NOTIFY_URL=https://yourdomain.com/api/payfast/subscriptions/itn
PAYFAST_TRUSTED_IPS=comma_separated_payfast_ips

# PayFast (preview/sandbox)
PAYFAST_SANDBOX_MERCHANT_ID=your_sandbox_merchant_id
PAYFAST_SANDBOX_MERCHANT_KEY=your_sandbox_merchant_key
PAYFAST_SANDBOX_PASSPHRASE=your_sandbox_passphrase_if_set
PAYFAST_SANDBOX_RETURN_URL=https://your-preview-domain.vercel.app/payments/success
PAYFAST_SANDBOX_CANCEL_URL=https://your-preview-domain.vercel.app/payments/cancelled
PAYFAST_SANDBOX_NOTIFY_URL=https://your-preview-domain.vercel.app/api/payfast/itn

# Transactional email (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=Relief Works <billing@yourdomain.com>
PUBLIC_APP_ORIGIN=https://yourdomain.com
```

Example:
```
VITE_API_URL=https://relief-works-api.up.railway.app
```

## Build Settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist/public`
- **Root Directory**: `.` (project root)

## Steps to Deploy

1. Push your repository to GitHub
2. Go to [vercel.com](https://vercel.com) and import your project
3. Select the project root as the root directory
4. Add the environment variables listed above.
5. In Vercel, set production values for Production environment and sandbox values for Preview environment.
6. Ensure `PAYFAST_NOTIFY_URL` is public HTTPS and points to your deployed backend ITN endpoint.
7. Click "Deploy"

## Automatic Deployments

Vercel will automatically deploy on every push to your main branch.

## Custom Domain

After deployment, you can add a custom domain in Vercel project settings.
