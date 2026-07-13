# Document Generator Deployment

This checklist covers the internal document generator routes added to Relief Works:

- `/generate-email`
- `/generate-pdf`
- `/api/generate-pdf`
- `/api/document-drafts`

## Required environment

Set these before deploying:

- `DATABASE_URL`
  Required. The production server exits without it.
- `PUBLIC_APP_ORIGIN`
  Recommended. Keeps absolute URL generation stable behind proxies.

Set these when needed:

- `PUPPETEER_EXECUTABLE_PATH`
  Optional for local Windows development if Chrome or Edge is not auto-detected.
- `VITE_EMAIL_LOGO_URL`
  Optional in the current implementation. The generator uses a text wordmark by default.

## Runtime expectations

- The document generator is protected by the existing admin cookie/session guard.
- PDF generation is rate limited in the server route.
- Draft APIs are also admin-protected and backed by the main Postgres database.
- Vercel rewrites already include `/generate-email` and `/generate-pdf`.

## Pre-deploy checks

1. Confirm `DATABASE_URL` is present in the deployment environment.
2. Confirm the admin login works in the target environment.
3. Open `/generate-email` and verify preview, copy, and HTML download.
4. Open `/generate-pdf` and verify preview and PDF download.
5. Save, reload, and delete a remote draft.
6. Verify the deployment runtime can launch Chromium for `/api/generate-pdf`.

## Known operational note

The built app can pass `npm run build` and still fail at runtime if `DATABASE_URL` is missing. That is the first thing to verify if the deployment boots but API routes are unavailable.
