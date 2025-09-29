# Architecture Overview

## Deployment Model: VPS Native (No Docker)
```
User Request
    ↓
Nginx (31.97.129.78)
    ↓
├─ Static Files → /var/www/html/ (React SPA)
├─ API Proxy → Node.js Express (systemd service)
└─ WordPress Proxy → cms.saraivavision.com.br (external)
```

## Services (Native OS)
- **Nginx**: Web server + reverse proxy
- **Node.js**: API backend (systemd service)
- **Supabase**: PostgreSQL external (main database)
- **WordPress**: External CMS (JSON API only)
- **Redis**: Cache + sessions (optional)

## WordPress Dual Subdomain
- **blog.saraivavision.com.br**: HTML rendering (public browsing)
- **cms.saraivavision.com.br**: JSON REST API (React integration)

## Deployment Process
1. Local: `npm run build` → `dist/` (168MB source)
2. VPS: `bash scripts/deploy-production.sh`
   - Auto-backup (Nginx + files)
   - Copy dist/* → /var/www/html/
   - Test Nginx config
   - Reload (zero downtime)
   - Verify health checks