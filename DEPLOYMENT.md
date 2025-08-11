# CloudHub Deployment Guide

## Vercel Setup

Create three separate Vercel projects for each app:

### 1. Staff App (cloudhub.cloudrenovation.ca)
- **Project:** Connect to `/apps/cloudhub`
- **Domain:** `cloudhub.cloudrenovation.ca`
- **Environment Variables:**
```
NEXT_PUBLIC_SITE_URL=https://cloudhub.cloudrenovation.ca
API_BASE_URL=https://api.cloudrenovation.ca
NEXT_PUBLIC_SUPABASE_URL=https://clrizuinzyznvkpoqoln.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscml6dWluenl6bnZrcG9xb2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4Njg4NTIsImV4cCI6MjA3MDQ0NDg1Mn0.QtUXD9AXdxL4MJ6dMIf6v9MWghutFrRJX9MejxfD-78
NODE_ENV=production
```

### 2. Customer Portal (portal.cloudrenovation.ca)
- **Project:** Connect to `/apps/portal`
- **Domain:** `portal.cloudrenovation.ca`
- **Environment Variables:**
```
NEXT_PUBLIC_SITE_URL=https://portal.cloudrenovation.ca
API_BASE_URL=https://api.cloudrenovation.ca
NEXT_PUBLIC_SUPABASE_URL=https://clrizuinzyznvkpoqoln.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscml6dWluenl6bnZrcG9xb2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4Njg4NTIsImV4cCI6MjA3MDQ0NDg1Mn0.QtUXD9AXdxL4MJ6dMIf6v9MWghutFrRJX9MejxfD-78
NODE_ENV=production
```

### 3. API Server (api.cloudrenovation.ca)
- **Project:** Connect to `/apps/api`
- **Domain:** `api.cloudrenovation.ca`
- **Environment Variables:**
```
NEXT_PUBLIC_SITE_URL=https://api.cloudrenovation.ca
API_BASE_URL=https://api.cloudrenovation.ca
NEXT_PUBLIC_SUPABASE_URL=https://clrizuinzyznvkpoqoln.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscml6dWluenl6bnZrcG9xb2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4Njg4NTIsImV4cCI6MjA3MDQ0NDg1Mn0.QtUXD9AXdxL4MJ6dMIf6v9MWghutFrRJX9MejxfD-78
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscml6dWluenl6bnZrcG9xb2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg2ODg1MiwiZXhwIjoyMDcwNDQ0ODUyfQ.pRF0vScSjL6YqP0cFZW88kMliNp8BPAcyF88HtaLY-s
R2_ACCOUNT_ID=5aaa1ad8f395c6c0bb0dacc2809d30aa
R2_ACCESS_KEY_ID=4eeb6dd33272fd3cd7bd7526f6252177
R2_SECRET_ACCESS_KEY=908d96206b81aea692112f9ae708dce97255ab5a4128fab250bdde35bc8c23d6
R2_BUCKET=files
R2_ENDPOINT=https://5aaa1ad8f395c6c0bb0dacc2809d30aa.r2.cloudflarestorage.com
RESEND_API_KEY=re_CwLdT3J9_DFEWn6zEDycU8o2Bjq55FY3N
NODE_ENV=production
```

## Database Setup

The Supabase database is already configured. You may need to run migrations or set up database tables. Connect to your Supabase project at:
- **URL:** https://clrizuinzyznvkpoqoln.supabase.co
- **Dashboard:** https://supabase.com/dashboard

### Required Database Tables
The platform expects these tables to exist:
- `organizations`
- `locations` 
- `deals`
- `projects`
- `users` (managed by Supabase Auth)

Check `/packages/lib/src/supabase.ts` for the complete schema.

## File Storage

Cloudflare R2 is configured and ready:
- **Bucket:** `files`
- **Account ID:** `5aaa1ad8f395c6c0bb0dacc2809d30aa`
- **Endpoint:** Custom endpoint configured

## Email Service

Resend is configured for transactional emails:
- **API Key:** Set and ready to use
- **Domain:** Configure your sending domain in Resend dashboard

## Next Steps

1. **Vercel Projects:** Create the three projects in Vercel dashboard
2. **Domain Configuration:** Point your domains to the Vercel projects
3. **Database Migration:** Run any pending database migrations
4. **SSL Certificates:** Vercel will handle SSL automatically
5. **Monitoring:** Consider adding Sentry for error tracking

## Stripe Integration (Optional)

When you're ready to add payments:
1. Get Stripe keys from dashboard
2. Add to environment variables
3. Set up webhook endpoints
4. Configure products and pricing

## Security Notes

- All sensitive keys are properly scoped
- Supabase RLS policies should be configured
- API endpoints have proper authentication
- File uploads are secured with signed URLs

The platform is ready for production deployment! 🚀