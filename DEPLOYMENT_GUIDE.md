# Relief Works Deployment Guide

## Architecture

```
Browser
  -> Vercel static frontend
  -> Vercel Express API
  -> Supabase PostgreSQL / services
```

This repository no longer needs split hosting for admin. Vercel serves the frontend and backend on the same origin.

## Deployment

### 1. Set up Supabase

- Create or confirm your Supabase project.
- Collect:
  - `DATABASE_URL`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `VITE_SUPABASE_URL`

### 2. Deploy to Vercel

- Import the repo into Vercel
- Use:
  - Framework Preset: `Other`
  - Build Command: `npm run build`
  - Root Directory: `.`
- Add the required environment variables from [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

### 3. Verify

- Visit `/`
- Visit `/admin`
- Confirm `/api/admin/session` returns JSON instead of `404`
- Create a test inquiry
- If admin is configured, log in and confirm dashboard data loads

## Important Files

- [index.ts](./index.ts): Vercel Express entrypoint
- [server/app.ts](./server/app.ts): shared Express app setup
- [server/admin-auth.ts](./server/admin-auth.ts): signed admin cookie auth
- [vercel.json](./vercel.json): SPA rewrites
- [vite.config.ts](./vite.config.ts): builds to root `public/` on Vercel

## Troubleshooting

### `/admin` still 404s

- Confirm the latest commit deployed to Vercel
- Confirm `vercel.json` exists in that deployment
- Confirm `public/index.html` is being built during deploy

### `/api/...` still 404s

- Confirm root `index.ts` is present in the deployment
- Check Vercel Function logs
- Confirm required server env vars are set

### Admin login fails

- Check `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, and `SESSION_SECRET`
- Confirm the Vercel function can reach Supabase if dashboard data fails after login
