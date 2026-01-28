# Vercel Deployment Configuration for Relief Works Frontend

This configuration deploys the React frontend to Vercel.

## Environment Variables

Set these in your Vercel project settings:

```
VITE_API_URL=your_railway_api_url_here
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
4. Add environment variable:
   - Key: `VITE_API_URL`
   - Value: Your Railway backend URL (e.g., `https://relief-works-api.up.railway.app`)
5. Click "Deploy"

## Automatic Deployments

Vercel will automatically deploy on every push to your main branch.

## Custom Domain

After deployment, you can add a custom domain in Vercel project settings.
