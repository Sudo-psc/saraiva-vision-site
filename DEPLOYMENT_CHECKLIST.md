# Vercel Deployment Checklist

## Prerequisites
- [ ] Vercel CLI installed (`npm i -g vercel`)
- [ ] Logged in to Vercel (`vercel login`)
- [ ] Project linked to Vercel (`vercel link`)

## Environment Variables
- [ ] RESEND_API_KEY set for all environments
- [ ] DOCTOR_EMAIL set for all environments
- [ ] SUPABASE_URL set for all environments
- [ ] SUPABASE_ANON_KEY set for all environments
- [ ] SUPABASE_SERVICE_ROLE_KEY set for all environments
- [ ] ZENVIA_API_TOKEN set for all environments
- [ ] ZENVIA_FROM_NUMBER set for all environments
- [ ] SPOTIFY_RSS_URL set for all environments
- [ ] OPENAI_API_KEY set for all environments
- [ ] POSTHOG_KEY set for all environments
- [ ] WP_REVALIDATE_SECRET set for all environments
- [ ] WP_WEBHOOK_SECRET set for all environments

## Configuration
- [ ] vercel.json configured with functions
- [ ] vercel.json configured with cron jobs
- [ ] vercel.json configured with headers and CORS
- [ ] vercel.json configured with rewrites

## Testing
- [ ] Build process works (`npm run build`)
- [ ] Contact API function works
- [ ] Health endpoint works
- [ ] Cron jobs configured correctly

## Deployment
- [ ] Preview deployment successful (`vercel`)
- [ ] Production deployment successful (`vercel --prod`)
- [ ] All API endpoints responding
- [ ] Cron jobs running as expected
- [ ] Monitoring and logging working

## Post-Deployment
- [ ] Contact form tested
- [ ] Appointment booking tested
- [ ] Podcast sync tested
- [ ] Dashboard accessible
- [ ] Analytics tracking working
