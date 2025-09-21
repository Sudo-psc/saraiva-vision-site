# Saraiva Vision Site - Project Overview

## Purpose
Medical website for "Saraiva Vision" clinic - a specialized ophthalmology practice. The site provides information about services, doctors, testimonials, contact information, and includes a blog system powered by WordPress backend.

## Tech Stack
- **Frontend Framework**: React 18.2.0 with Vite 7.1.3
- **Routing**: React Router DOM 6.16.0 (SPA with multiple routes)
- **UI Components**: Radix UI components with Tailwind CSS
- **Animations**: Framer Motion
- **Internationalization**: i18next with browser language detection
- **Backend Integration**: WordPress REST API proxy, Supabase
- **PWA**: Service Worker with Workbox
- **Build Tool**: Vite with TypeScript support
- **Deployment**: Vercel (already configured)

## Key Features
- Multi-language support (i18n)
- Code splitting with lazy loading for performance
- PWA capabilities
- WordPress blog integration
- Contact forms with Resend integration
- Google Maps integration
- Medical article content
- Accessibility features
- WhatsApp widget
- Admin panel integration
- Cookie consent management

## Current Deployment Status
- Already configured for Vercel deployment
- Uses modern runtime (@vercel/node instead of legacy version)
- Has comprehensive deployment scripts
- Environment variables properly configured with VITE_ prefix