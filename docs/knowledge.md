# Saraiva Vision Project Knowledge

## Project Overview
Saraiva Vision is a modern medical clinic website built with React 18, Vite, and TypeScript. It features a hybrid architecture with healthcare-focused frontend and comprehensive backend integration using native VPS services.

## Key Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js REST API with Express.js (native systemd service)
- **Database**: Supabase (PostgreSQL) + MySQL for WordPress
- **CMS**: WordPress Headless with PHP-FPM 8.1+
- **Web Server**: Nginx (native service)
- **Cache**: Redis (native service)

## Development Commands
- `npm run dev` - Start development server (port 3002)
- `npm run build` - Build for production
- `npm test` - Run tests in watch mode
- `npm run test:comprehensive` - Run all test suites

## Medical Compliance (CFM)
- Brazilian Medical Council compliance system with automated validation
- CFM compliance component for real-time content validation
- Medical disclaimer injection for all medical content
- PII detection and anonymization to prevent patient data exposure

## Architecture Notes
- Native VPS deployment (no Docker)
- All services run directly on Ubuntu/Debian host
- Nginx serves static files and proxies API requests
- systemd manages Node.js backend services

## Key Directories
- `src/components/` - React components with test co-location
- `src/pages/` - Route-level page components
- `api/` - Node.js API endpoints (backend)
- `src/hooks/` - Custom React hooks
- `src/lib/` - Core utilities and configurations

## Environment Variables Required
- `VITE_SUPABASE_URL` - Supabase database URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps integration
- `RESEND_API_KEY` - Email service API key
- `VITE_WORDPRESS_API_URL` - WordPress headless API

## Testing Strategy
- Unit tests with React Testing Library
- Integration tests for API endpoints
- CFM compliance validation testing
- Performance monitoring with Core Web Vitals

## Deployment
- Build: `npm run build`
- Deploy: Copy `dist/*` to `/var/www/html/`
- Reload: `sudo systemctl reload nginx`
- Server: Brazilian VPS (31.97.129.78)

## Security & Compliance
- LGPD compliance with consent management
- Role-based access control via Supabase Auth
- Input validation using Zod schemas
- Rate limiting on contact forms
- Medical data protection with CFM compliance
