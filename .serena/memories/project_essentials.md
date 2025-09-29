# Saraiva Vision - Project Essentials

## Core Identity
- **Medical ophthalmology clinic** in Caratinga, MG, Brazil
- **Production VPS** at 31.97.129.78 (native deployment, no Docker)
- **CFM/LGPD compliance** required for medical industry
- **Current Branch**: external-wordpress (stable deployment)

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js 22+ + Express + Nginx
- **Database**: Supabase PostgreSQL + WordPress external (cms.saraivavision.com.br)
- **Authentication**: Supabase Auth + WordPress JWT for admin ops

## Key Commands
```bash
npm run dev              # Dev server (port 3002)
npm run build            # Production build → dist/
npm run test:comprehensive  # Full test suite
bash scripts/deploy-production.sh  # VPS deployment (on server)
```

## Critical Features
- **Patient Management**: Appointments, contact forms, reviews
- **WordPress Integration**: External CMS via REST API (cms.saraivavision.com.br)
- **Social**: Instagram feed, Spotify podcasts, Google Reviews
- **AI**: Pulse.live chatbot integration
- **Compliance**: Medical disclaimers, PII detection, LGPD consent

## Architecture
```
User → Nginx (31.97.129.78) → Static Files (/var/www/html)
                            → API Proxy (/api/*) → Node.js Express
                            → WordPress Proxy (/wp-json/*) → cms.saraivavision.com.br
```

## Deployment Flow
1. Build locally: `npm run build`
2. Execute on VPS: `bash scripts/deploy-production.sh`
3. Script auto-handles: backups, Nginx test, file copy, permissions, reload
4. Zero-downtime deployment with rollback capability

## Database Schema (Supabase)
- `contact_messages` - Patient inquiries (LGPD compliant)
- `appointments` - Booking system with reminders
- `message_outbox` - Async email/SMS queue
- `podcast_episodes` - Content management with RSS
- `profiles` - User auth with RBAC (user/admin/super_admin)

## Environment Variables
```bash
VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY  # Database
VITE_GOOGLE_MAPS_API_KEY                     # Maps integration
VITE_WORDPRESS_API_URL=https://cms.saraivavision.com.br  # WordPress JSON API
RESEND_API_KEY                               # Email service
```

## Current State (2025-09-29)
- ✅ VPS deployment successful (bundle: 154KB main, 11MB assets)
- ✅ WordPress REST API working (cms.saraivavision.com.br)
- ✅ Nginx optimized with CORS, security headers, rate limiting
- ✅ Build optimizations: aggressive chunking, no sourcemaps in prod
- ✅ Production verified: all health checks passing