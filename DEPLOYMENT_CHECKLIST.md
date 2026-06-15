# Relief Works Deployment Checklist

## Before Deploy

- [ ] Code is pushed to GitHub
- [ ] Vercel project is connected to the repo
- [ ] Supabase project is active
- [ ] `DATABASE_URL` is ready
- [ ] `SUPABASE_URL` is ready
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is ready
- [ ] `VITE_SUPABASE_URL` is ready
- [ ] `ADMIN_EMAIL` is ready
- [ ] `ADMIN_PASSWORD` is ready
- [ ] `ADMIN_NAME` is ready
- [ ] `SESSION_SECRET` is ready

## Vercel Settings

- [ ] Framework Preset is `Other`
- [ ] Root Directory is `.`
- [ ] Build Command is `npm run build`
- [ ] Environment variables are set in Vercel

## After Deploy

- [ ] Home page loads
- [ ] `/admin` loads without a Vercel 404
- [ ] `/api/admin/session` returns JSON
- [ ] Admin login works
- [ ] Dashboard data loads after login
- [ ] Inquiry submission works
- [ ] If PayFast is enabled, webhook URLs point to `/api/payfast/...`

## If Something Breaks

- [ ] Check Vercel build logs
- [ ] Check Vercel Function logs
- [ ] Confirm the latest commit deployed
- [ ] Confirm root `index.ts` exists in the deployed commit
- [ ] Confirm `vercel.json` exists in the deployed commit
