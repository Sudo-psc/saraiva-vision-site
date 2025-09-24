# Saraiva Vision - Clínica Oftalmológica

## Project Overview
React/Vite frontend for ophthalmology clinic with WordPress headless CMS backend. Deployed on Vercel with VPS backend services.

## Architecture
- **Frontend**: React 18 + Vite + Tailwind CSS (Vercel)
- **Backend**: Node.js API + WordPress headless CMS (VPS)
- **Database**: MySQL + Redis cache
- **Services**: Resend email, reCAPTCHA, analytics

## Development Commands
- `npm run dev` - Start development server (port 3002)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests

## Docker Services
- WordPress backend in `wordpress-backend/`
- All containers healthy and nginx properly configured
- Health endpoint: `http://localhost/health`

## Error Prevention
- Defensive wrappers for external scripts (analytics/reCAPTCHA)
- Prevents `classList` null errors from third-party code
- Global error handling in main.jsx

## Key Files
- `src/main.jsx` - Entry point with defensive wrappers
- `src/utils/errorTracking.js` - Error prevention utilities
- `vercel.json` - SPA routing configuration
- `wordpress-backend/docker-compose.yml` - Backend services

## Deployment
- Frontend: Vercel automatic deployment
- Backend: VPS with Docker containers
- Environment variables managed in Vercel dashboard

## Recent Fixes
- Fixed nginx configuration issues in Docker containers
- Implemented defensive wrappers for external script errors
- Added proper health checks and error boundaries
