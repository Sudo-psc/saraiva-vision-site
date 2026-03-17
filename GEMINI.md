# Gemini Code Assistant Context

This document provides a comprehensive overview of the Saraiva Vision website project, its architecture, and development workflows, tailored to guide Gemini CLI interactions.

## Project Overview

**Saraiva Vision** is a modern, high-performance medical ophthalmology platform. It ensures healthcare compliance (CFM) and data privacy (LGPD).

### Architecture

The project utilizes a **native VPS architecture without Docker**, ensuring high performance and precise control directly on the operating system.

*   **Frontend:** React 18 Single Page Application (SPA) built with Vite and styled with Tailwind CSS. Served natively via Nginx.
*   **Backend:** Node.js and Express.js REST API running as a native `systemd` service (`saraiva-api` on port 3001).
*   **CMS:** A hybrid blog architecture using Sanity CMS as the primary source with a static fallback (`src/data/blogPosts.js`) for 100% uptime.
*   **Caching & Integrations:** Redis is used for caching (e.g., Google Business reviews). Integrations include Stripe (payments), Resend (emails), and WhatsApp.
*   **Proxy:** Nginx handles SSL, serves static files from `/var/www/saraivavision/current/`, and acts as a reverse proxy for the backend API.

### 🚨 CRITICAL BUILD RULE

**THIS PROJECT USES VITE, NOT NEXT.JS FOR PRODUCTION!**

*   ✅ **ALWAYS USE:** `npm run build:vite` to build the frontend into `dist/` for production deployment.
*   ❌ **NEVER USE:** `npm run build` for deployment. Next.js is only used for local API route compatibility during development. The `.next/` directory is NOT deployed.

## Building and Running

The project relies on `npm` for scripting and dependency management.

### Development

```bash
npm run dev:vite      # Starts the Vite frontend dev server (port 3002)
npm run dev           # Starts Next.js dev server for API routes (port 3000)
```

### Building for Production

```bash
npm run build:vite    # Builds production Vite frontend, prerenders pages, and generates sitemaps
```

### Running Tests

The project uses Vitest. Ensure components using `useConfig` are wrapped in `<ConfigProvider>` during tests.

```bash
npm run test:run           # Run all tests once
npm run test               # Run tests in watch mode
npm run test:comprehensive # Run full suite (unit, integration, API, frontend)
npm run test:ui            # Open Vitest UI
```

### System Health

```bash
npm run check:system       # Run full system health diagnostics
```

## Deployment

Deployment is handled natively on the VPS via scripts that manage the build, backup, atomic swap, and Nginx reloads.

```bash
sudo npm run deploy:quick  # Quick, automated deployment script (used for 90% of cases)
```

## Development Conventions

*   **Code Organization:**
    *   React Components: `PascalCase.jsx` (e.g., `ContactForm.jsx`)
    *   Hooks and Utilities: `camelCase.js` (e.g., `useAuth.js`)
    *   Aliased Imports: Use `@/` to import from the `src/` directory.
*   **Commits:** The project strictly follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for automated changelog generation.
*   **Performance:** Favor lazy loading for routes (`React.lazy()`). Optimize images (WebP/AVIF) and utilize manual chunk splitting.
*   **SEO:**
    *   Use `@/components/SafeHelmet` for simple pages, forms, or admin areas.
    *   Use `@/components/SEOHead` for main content pages requiring i18n, medical metadata, and structured data.
*   **Compliance & Accessibility:**
    *   Healthcare content must adhere to CFM regulations.
    *   No PII (Patient Identifiable Information) in frontend code (LGPD compliance).
    *   WCAG 2.1 AA accessibility standards are mandatory.
*   **Styling:** Tailwind CSS is the primary styling solution. The primary brand color is Cyan (`cyan-600/700`).
