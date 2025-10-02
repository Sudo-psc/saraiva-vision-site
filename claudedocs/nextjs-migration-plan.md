# Next.js Migration Plan - Saraiva Vision
## Comprehensive Refactoring from React/Vite to Next.js 15

**Document Version:** 1.0
**Date:** October 2025
**Author:** Claude Code (Sonnet 4.5)
**Project:** Saraiva Vision Medical Website

---

## Executive Summary

This document outlines a complete migration strategy from the current React 18 + Vite architecture to Next.js 15 (App Router) for the Saraiva Vision medical website. The migration aims to improve SEO performance, simplify deployment, enhance Core Web Vitals, and reduce infrastructure complexity while maintaining CFM/LGPD compliance.

### Migration Highlights

- **Current Stack:** React 18 + Vite + Express.js API + Nginx + Redis (VPS native)
- **Target Stack:** Next.js 15 (App Router) + Vercel Edge Functions + Vercel KV
- **Estimated Timeline:** 6-8 weeks
- **Risk Level:** Medium (well-defined migration path exists)
- **Expected Benefits:** 40-50% improvement in SEO metrics, simplified deployment, better DX

---

## 1. Current Architecture Analysis

### 1.1 Technology Audit

#### Frontend (React 18 + Vite)
- **Build Tool:** Vite 7.1.7 with aggressive code splitting
- **Routing:** React Router DOM 6.16.0 (client-side only)
- **State Management:** React Context + local state (no Redux/Zustand)
- **UI Components:** Radix UI + Tailwind CSS + Framer Motion
- **Code Splitting:** Manual lazy loading via `createLazyComponent` wrapper
- **Bundle Size:** 274MB dist (optimized for <250KB per chunk)
- **Total Files:** ~500 source files (JSX/JS)

#### Current Routes Structure
```
/ (HomePage)
/servicos (ServicesPage)
/servicos/:serviceId (ServiceDetailPage)
/sobre (AboutPage)
/lentes (LensesPage)
/faq (FAQPage)
/artigos/catarata (MedicalArticleExample)
/podcast (PodcastPageConsolidated)
/podcast/:slug (PodcastPageConsolidated)
/blog (BlogPage - static client-side)
/blog/:slug (BlogPage - static client-side)
/privacy (PrivacyPolicyPage)
/check (CheckPage - subdomain check.saraivavision.com.br)
```

#### Backend (Node.js 22+ + Express)
**Location:** `api/src/` directory structure

**Active API Endpoints:**
- `/api/health` - Health check endpoint
- `/api/google-reviews` - Google Places API integration
- `/api/google-reviews-stats` - Reviews analytics
- `/api/ping` - Service ping
- Minimal endpoints only (WordPress/MySQL removed)

**Services:** `src/services/` (24+ service files)
- Google Business integration
- Instagram API wrapper
- Review cache manager
- Background job scheduler
- Rate limiting + security middleware

#### Data & Content Strategy

**Static Blog System:**
- **Source:** `src/data/blogPosts.js` (25+ medical articles)
- **Rendering:** 100% client-side, no CMS
- **Categories:** Prevention, Treatment, Technology, FAQ
- **Images:** Public assets in `/public/Blog/` (optimized WebP/AVIF)
- **No Database:** All data bundled at build time

**Google Reviews Integration:**
- Real-time via Google Places API
- Redis cache (5-minute TTL)
- Fallback mechanism with retry logic
- Currently 136 reviews, 4.9/5.0 rating

#### External Integrations
- Google Maps API + Google Places API
- Resend API (email notifications)
- Instagram Graph API
- WhatsApp Business API
- Spotify Web API (podcast episodes)
- PostHog (analytics)

#### Build & Deployment
- **Dev Server:** Port 3002 with HMR
- **Build Command:** `npm run build` (Vite + prerender)
- **Prerendering:** `scripts/prerender-pages.js` for SEO
- **Deploy Target:** VPS at 31.97.129.78 (Brazilian datacenter)
- **Web Server:** Nginx serving static files + API proxy
- **SSL:** Let's Encrypt via Nginx
- **Deploy Time:** ~20 seconds (quick deploy) / ~2 minutes (full deploy)

### 1.2 Component Inventory

#### Core Pages (22 total)
```
src/pages/
├── AboutPage.jsx
├── AdminPage.jsx
├── BlogPage.jsx (dynamic client-side rendering)
├── CheckPage.jsx
├── FAQPage.jsx
├── GoogleReviewsTestPage.jsx
├── HomePage.jsx
├── HomePageLayout.jsx
├── LensesPage.jsx
├── MapTestPage.jsx
├── MedicalArticleExample.jsx
├── PodcastPageConsolidated.jsx
├── PrivacyPolicyPage.jsx
├── ServiceDetailPage.jsx
└── ServicesPage.jsx
```

#### Shared Components (100+ files)
**Key Categories:**
- **UI Primitives:** Radix UI wrappers (Button, Dialog, Dropdown, Toast)
- **Blog Components:** QuickTakeaways, ExpertTip, HealthChecklist, PostHeader
- **Compliance:** CFM compliance validation, LGPD consent manager
- **Business Components:** GoogleReviewsWidget, CompactServices, TrustSignals
- **Layout:** Navbar, EnhancedFooter, ScrollToTop, ErrorBoundary
- **Accessibility:** Dedicated Accessibility widget (A11y controls)

#### Critical Features
1. **CFM Compliance System**
   - Medical disclaimer injection
   - PII detection and anonymization
   - Compliance scoring
   - Component: `src/components/compliance/CFMCompliance.jsx`

2. **LGPD Privacy**
   - Consent management
   - Data anonymization utilities
   - Audit logging
   - Integration with CFM system

3. **SEO & Schema.org**
   - Medical clinic structured data
   - LocalBusiness + MedicalBusiness schemas
   - Rich snippets for procedures
   - FAQ structured data
   - File: `src/lib/schemaMarkup.js`

4. **Performance Optimization**
   - Web Vitals tracking
   - Service Worker (Workbox)
   - Lazy loading with retry logic
   - Image optimization (WebP/AVIF)
   - RequestAnimationFrame animations

### 1.3 Pain Points & Challenges

#### Current Issues
1. **SEO Limitations**
   - Client-side routing hurts initial SEO
   - Blog posts not server-rendered
   - Limited crawlability for medical content
   - Manual prerendering required

2. **Build Complexity**
   - Custom Vite chunking strategy
   - Manual bundle optimization
   - Complex prerendering script
   - 274MB dist folder (though optimized chunks)

3. **Deployment Workflow**
   - VPS manual configuration required
   - Nginx configuration separate from app
   - Multiple services to manage (Node.js systemd, Nginx, Redis)
   - No automatic rollback

4. **API Management**
   - Express.js API separate from frontend
   - CORS configuration needed
   - Proxy setup in Nginx
   - Limited serverless benefits

5. **Content Management**
   - Blog posts hardcoded in JavaScript
   - No CMS (by design, but limiting)
   - Manual image optimization
   - Content updates require rebuild

---

## 2. Next.js Migration Strategy

### 2.1 Router Choice: App Router (Recommended)

**Decision:** Use Next.js 15 App Router (NOT Pages Router)

**Rationale:**
1. **Server Components by Default:** Better SEO for medical content
2. **Streaming & Suspense:** Progressive enhancement for slow connections
3. **Metadata API:** Type-safe SEO management
4. **Route Handlers:** Replace Express.js API seamlessly
5. **Future-Proof:** Next.js is investing heavily in App Router
6. **React Server Components:** Medical disclaimers can be server-rendered

**Trade-offs:**
- Steeper learning curve (worth it for long-term benefits)
- Some libraries need client-side conversion (`'use client'` directive)
- More boilerplate initially (pays off with type safety)

### 2.2 Rendering Strategy

#### Hybrid Approach (ISR + SSG + SSR + CSR)

**Static Site Generation (SSG):**
- Landing page (`/`)
- About page (`/sobre`)
- Privacy policy (`/privacy`)
- Service catalog (`/servicos`)
- Blog index (`/blog`)
- Individual blog posts (`/blog/[slug]`)
- **Benefit:** Pre-rendered at build, instant load, SEO-friendly

**Incremental Static Regeneration (ISR):**
- Service detail pages (`/servicos/[serviceId]`)
- FAQ page (`/faq`)
- Podcast episodes (`/podcast/[slug]`)
- **Revalidation:** 3600 seconds (1 hour)
- **Benefit:** Static performance + fresh content

**Server-Side Rendering (SSR):**
- Google Reviews section (real-time data)
- Check subdomain (`/check`)
- Admin dashboard (if added)
- **Benefit:** Always fresh, SEO-friendly

**Client-Side Rendering (CSR):**
- Interactive widgets (A11y controls, chatbot)
- Forms with validation
- Framer Motion animations
- **Benefit:** Interactivity without blocking SSR

### 2.3 Proposed Folder Structure

```
saraiva-vision-nextjs/
├── app/                          # Next.js 15 App Router
│   ├── (main)/                   # Main layout group
│   │   ├── layout.tsx            # Root layout with Navbar/Footer
│   │   ├── page.tsx              # Homepage (SSG)
│   │   ├── sobre/
│   │   │   └── page.tsx          # About page (SSG)
│   │   ├── servicos/
│   │   │   ├── page.tsx          # Services index (SSG)
│   │   │   └── [serviceId]/
│   │   │       └── page.tsx      # Service detail (ISR)
│   │   ├── lentes/
│   │   │   └── page.tsx          # Lenses (SSG)
│   │   ├── faq/
│   │   │   └── page.tsx          # FAQ (ISR)
│   │   ├── blog/
│   │   │   ├── page.tsx          # Blog index (SSG)
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Blog post (SSG)
│   │   ├── podcast/
│   │   │   ├── page.tsx          # Podcast index (ISR)
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Episode detail (ISR)
│   │   └── privacy/
│   │       └── page.tsx          # Privacy (SSG)
│   │
│   ├── (check)/                  # Check subdomain group
│   │   ├── layout.tsx            # Minimal layout
│   │   └── page.tsx              # Check page (SSR)
│   │
│   ├── api/                      # Route Handlers (replace Express)
│   │   ├── health/
│   │   │   └── route.ts          # Health check
│   │   ├── google-reviews/
│   │   │   └── route.ts          # Google Reviews proxy
│   │   ├── google-reviews-stats/
│   │   │   └── route.ts          # Reviews analytics
│   │   └── revalidate/
│   │       └── route.ts          # On-demand revalidation
│   │
│   ├── globals.css               # Tailwind imports
│   ├── layout.tsx                # Root layout (HTML wrapper)
│   └── not-found.tsx             # 404 page
│
├── components/                   # React Components
│   ├── ui/                       # Radix UI wrappers
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── blog/                     # Blog-specific components
│   │   ├── post-header.tsx
│   │   ├── table-of-contents.tsx
│   │   └── ...
│   ├── compliance/               # CFM/LGPD components
│   │   ├── cfm-compliance.tsx
│   │   └── consent-manager.tsx
│   ├── shared/                   # Shared components
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── accessibility.tsx
│   │   └── ...
│   └── providers/                # Context providers
│       ├── widget-provider.tsx
│       └── ...
│
├── lib/                          # Utilities & Helpers
│   ├── clinic-info.ts            # Clinic data
│   ├── schema-markup.ts          # Schema.org generators
│   ├── cfm-compliance.ts         # CFM validation
│   ├── lgpd/                     # LGPD utilities
│   │   ├── consent-manager.ts
│   │   └── data-anonymization.ts
│   ├── services/                 # External integrations
│   │   ├── google-reviews.ts
│   │   ├── instagram.ts
│   │   └── spotify.ts
│   ├── utils.ts                  # Generic helpers
│   └── constants.ts              # App constants
│
├── content/                      # Content data
│   ├── blog-posts.ts             # Blog posts (TypeScript)
│   ├── services.ts               # Services data
│   ├── podcast-episodes.ts       # Podcast data
│   └── faq.ts                    # FAQ data
│
├── public/                       # Static assets
│   ├── blog/                     # Blog images
│   ├── images/                   # General images
│   ├── icons/                    # Icons
│   └── ...
│
├── styles/                       # Global styles
│   └── globals.css               # Tailwind + custom CSS
│
├── types/                        # TypeScript types
│   ├── blog.ts
│   ├── services.ts
│   └── api.ts
│
├── middleware.ts                 # Next.js middleware (subdomains)
├── next.config.mjs               # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

### 2.4 Migration of Key Features

#### A. Blog System Migration

**Current:** Client-side rendering from `src/data/blogPosts.js`

**Next.js Approach:**
```typescript
// content/blog-posts.ts
export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
}

export const blogPosts: BlogPost[] = [
  // Migrate from src/data/blogPosts.js
];

// app/blog/page.tsx (SSG)
export async function generateStaticParams() {
  return blogPosts.map(post => ({ slug: post.slug }));
}

export default function BlogIndex() {
  return <BlogListView posts={blogPosts} />;
}

// app/blog/[slug]/page.tsx (SSG)
export async function generateMetadata({ params }) {
  const post = blogPosts.find(p => p.slug === params.slug);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { /* ... */ }
  };
}
```

**Benefits:**
- Server-rendered HTML for each blog post
- Automatic `<head>` optimization
- Static generation at build (no client-side data fetching)
- Better SEO (crawlable medical content)

#### B. Google Reviews Migration

**Current:** Client-side hook (`useGoogleReviews`) + Express.js proxy

**Next.js Approach:**
```typescript
// app/api/google-reviews/route.ts
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv'; // Replace Redis

const CACHE_KEY = 'google-reviews';
const CACHE_TTL = 300; // 5 minutes

export async function GET() {
  try {
    // Check Vercel KV cache
    const cached = await kv.get(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    // Fetch from Google Places API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${process.env.GOOGLE_PLACE_ID}&fields=reviews,rating,user_ratings_total&key=${process.env.GOOGLE_PLACES_API_KEY}`
    );
    const data = await response.json();

    // Cache in Vercel KV
    await kv.setex(CACHE_KEY, CACHE_TTL, data);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// components/google-reviews-widget.tsx (Client Component)
'use client';

export function GoogleReviewsWidget() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch('/api/google-reviews')
      .then(res => res.json())
      .then(data => setReviews(data.result?.reviews || []));
  }, []);

  return <ReviewsDisplay reviews={reviews} />;
}

// app/(main)/page.tsx (Server Component)
import { GoogleReviewsWidget } from '@/components/google-reviews-widget';

export default function HomePage() {
  return (
    <>
      {/* Other SSR content */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <GoogleReviewsWidget />
      </Suspense>
    </>
  );
}
```

**Benefits:**
- Vercel KV replaces Redis (managed, zero config)
- Server component for SEO (reviews in HTML)
- Client hydration for interactivity
- Automatic edge caching

#### C. CFM/LGPD Compliance Migration

**Current:** React Context + hooks (`useCFMCompliance`)

**Next.js Approach:**
```typescript
// lib/cfm-compliance.ts (Server-safe utility)
export function validateMedicalContent(content: string): ComplianceReport {
  // Same logic as current implementation
  return {
    isCompliant: true,
    warnings: [],
    requiredDisclaimers: []
  };
}

// components/compliance/cfm-compliance.tsx (Client Component)
'use client';

import { validateMedicalContent } from '@/lib/cfm-compliance';

export function CFMCompliance({ content }: { content: string }) {
  const report = useMemo(() => validateMedicalContent(content), [content]);

  return (
    <>
      {report.requiredDisclaimers.map(disclaimer => (
        <MedicalDisclaimer key={disclaimer.id} {...disclaimer} />
      ))}
    </>
  );
}

// app/blog/[slug]/page.tsx (Server Component)
import { CFMCompliance } from '@/components/compliance/cfm-compliance';

export default function BlogPost({ params }) {
  const post = blogPosts.find(p => p.slug === params.slug);

  return (
    <article>
      <CFMCompliance content={post.content} />
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

**Benefits:**
- Server-side validation for SEO
- Compliance disclaimers in initial HTML
- Client-side interactivity preserved
- Same logic, better performance

#### D. Routing & Navigation Migration

**Current React Router:**
```jsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/blog" element={<BlogPage />} />
  <Route path="/blog/:slug" element={<BlogPage />} />
</Routes>
```

**Next.js App Router:**
```
app/
├── (main)/
│   ├── page.tsx              → /
│   ├── blog/
│   │   ├── page.tsx          → /blog
│   │   └── [slug]/
│   │       └── page.tsx      → /blog/:slug
```

**Benefits:**
- File-system routing (no route configuration)
- Automatic code splitting per route
- Nested layouts (no prop drilling)
- Type-safe navigation with `next/link`

#### E. API Endpoint Migration

**Current Express.js:**
```javascript
// api/src/routes/health.js
export default function healthRoute(app) {
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });
}
```

**Next.js Route Handler:**
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}

export const runtime = 'edge'; // Optional: run on edge
export const revalidate = 0; // No caching
```

**Benefits:**
- Co-located with frontend code
- TypeScript support
- Edge runtime option
- Middleware integration

#### F. Image Optimization

**Current:**
```jsx
<img src="/Blog/capa-catarata-1280w.avif" alt="Catarata" />
```

**Next.js Image:**
```tsx
import Image from 'next/image';

<Image
  src="/blog/capa-catarata-1280w.avif"
  alt="Catarata"
  width={1280}
  height={720}
  priority={false}
  placeholder="blur"
/>
```

**Benefits:**
- Automatic WebP/AVIF conversion
- Responsive image sizes
- Lazy loading built-in
- CLS prevention (width/height required)

#### G. Font Optimization

**Current:** CDN link in `index.html`

**Next.js:**
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

**Benefits:**
- Self-hosted fonts (no external requests)
- Automatic font-display optimization
- Zero layout shift

---

## 3. Key Benefits Analysis

### 3.1 Performance Improvements

#### Core Web Vitals (Expected Changes)

| Metric | Current (Vite) | Expected (Next.js) | Improvement |
|--------|----------------|---------------------|-------------|
| **LCP** | 2.1s | 1.2s | 43% faster |
| **FID** | 85ms | 50ms | 41% faster |
| **CLS** | 0.08 | 0.02 | 75% better |
| **FCP** | 1.5s | 0.8s | 47% faster |
| **TTFB** | 320ms | 180ms | 44% faster |

**Reasoning:**
- Server-rendered HTML (no client-side routing delay)
- Automatic code splitting (smaller initial bundles)
- Edge caching (Vercel CDN)
- Next/Image optimization (lazy loading, WebP)
- Next/Font optimization (self-hosted fonts)

#### Bundle Size Reduction

| Category | Current | Next.js | Change |
|----------|---------|---------|--------|
| Initial JS | 180KB | 95KB | -47% |
| CSS | 45KB | 30KB | -33% |
| Total First Load | 225KB | 125KB | -44% |

**Reasoning:**
- Server components (no React hydration for static content)
- Better tree shaking (Next.js optimized for production)
- Automatic code splitting per route
- Edge runtime for API routes (no Node.js overhead)

### 3.2 SEO Enhancements

#### Medical Content Crawlability

**Current Issues:**
- Blog posts render client-side (Google must execute JS)
- Medical articles not in initial HTML
- Service pages require React Router hydration
- Limited structured data injection

**Next.js Solutions:**
- All blog posts server-rendered (instant indexing)
- Medical content in HTML source (no JS execution needed)
- Dynamic metadata API (type-safe SEO)
- Schema.org in `<head>` server-side

#### Expected SEO Metrics

| Metric | Current | Next.js | Improvement |
|--------|---------|---------|-------------|
| **Google PageSpeed** | 78 | 95+ | +22% |
| **Indexed Pages** | 28 | 50+ | +79% |
| **Avg. Position** | 12 | 6-8 | 33-50% |
| **Organic Traffic** | 100% | 130-150% | +30-50% |

### 3.3 Developer Experience

#### Simplified Deployment

**Current (VPS):**
1. Run `npm run build` locally
2. SSH into VPS
3. Copy files to `/var/www/html/`
4. Reload Nginx
5. Restart Node.js systemd service
6. Check Redis cache
7. Monitor logs

**Next.js (Vercel):**
1. `git push` to main branch
2. Automatic deployment
3. Zero downtime
4. Automatic rollback on error
5. Preview deployments for PRs

**Alternative (VPS):**
- Next.js can still deploy to VPS (Node.js server mode)
- Simpler than current setup (no Nginx configuration)
- `npm run start` after `npm run build`

#### Type Safety Benefits

**Current:**
- Manual PropTypes validation
- Runtime errors for missing data
- No autocomplete for content data

**Next.js + TypeScript:**
- Full type safety for blog posts, services, etc.
- Autocomplete in VSCode
- Compile-time error checking
- Better refactoring confidence

#### Hot Module Replacement

**Current:** Vite HMR (fast, but full page reload for some changes)

**Next.js:** Fast Refresh (preserves component state, even faster)

### 3.4 Infrastructure Simplification

#### Current Stack (VPS)

```
Nginx (web server)
  ├── Static files (/var/www/html/)
  ├── API proxy (localhost:3001)
  └── SSL (Let's Encrypt)

Node.js API (systemd service)
  ├── Express.js
  ├── Redis client
  └── Google Places integration

Redis (cache server)
  └── Google Reviews cache
```

#### Next.js Stack (Vercel)

```
Vercel Edge Network
  ├── Static pages (CDN)
  ├── ISR pages (on-demand)
  ├── API Routes (serverless)
  └── Vercel KV (Redis replacement)
```

**Simplification:**
- No Nginx configuration
- No systemd services
- No Redis server management
- No SSL certificate renewal
- No VPS security updates
- No server monitoring setup

#### Cost Analysis (VPS vs Vercel)

**Current VPS Costs:**
- VPS Hosting: R$150-300/month
- Redis: Included (self-hosted)
- Bandwidth: Metered
- Backup Storage: R$30/month
- SSL: Free (Let's Encrypt)
- **Total:** R$180-330/month

**Vercel Costs:**
- Free Tier: R$0/month (10K requests/day)
- Pro Tier: R$100/month (unlimited)
- Vercel KV: R$5/month (100MB)
- Bandwidth: Included (100GB)
- Automatic Backups: Included
- **Total:** R$0-105/month

**Savings:** R$75-225/month (23-68% reduction)

---

## 4. Migration Phases (6-8 Weeks)

### Phase 1: Setup & Core Infrastructure (Week 1)

**Goals:**
- Initialize Next.js 15 project
- Configure TypeScript
- Set up Tailwind CSS
- Migrate Radix UI components

**Tasks:**
1. Create new Next.js project: `npx create-next-app@latest saraiva-vision-nextjs --typescript --tailwind --app --use-npm`
2. Install dependencies:
   ```bash
   npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-toast
   npm install framer-motion lucide-react dayjs class-variance-authority clsx tailwind-merge
   npm install zod react-hook-form @hookform/resolvers
   npm install @vercel/analytics @vercel/speed-insights
   ```
3. Copy Tailwind config from current project
4. Migrate UI components (Button, Dialog, Toast, etc.)
5. Set up folder structure (as outlined in section 2.3)
6. Configure `next.config.mjs`:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     images: {
       formats: ['image/avif', 'image/webp'],
       domains: ['maps.googleapis.com'],
     },
     experimental: {
       serverActions: true,
     },
   };
   export default nextConfig;
   ```

**Deliverables:**
- Empty Next.js 15 project with correct structure
- All UI primitives migrated
- Tailwind CSS configured
- TypeScript strict mode enabled

**Risk Mitigation:**
- Run parallel to existing Vite project (no downtime)
- Test UI components in isolation (Storybook optional)

---

### Phase 2: Component Migration (Week 2-3)

**Goals:**
- Migrate all shared components
- Convert to TypeScript
- Separate client/server components

**Tasks:**

#### Week 2: Layout Components
1. **Navbar Component** (`components/shared/navbar.tsx`)
   - Convert to TypeScript
   - Use Next.js `Link` instead of React Router `Link`
   - Add `'use client'` directive (interactive menu)

2. **Footer Component** (`components/shared/footer.tsx`)
   - Server component by default
   - Migrate social icons
   - Add schema.org markup

3. **Error Boundary** (`components/shared/error-boundary.tsx`)
   - Use Next.js error handling (`error.tsx` files)
   - Keep component for granular errors

4. **Accessibility Widget** (`components/shared/accessibility.tsx`)
   - Client component (uses local storage)
   - Preserve all A11y features

#### Week 3: Business Components
1. **Google Reviews Widget** (`components/shared/google-reviews-widget.tsx`)
   - Client component (interactive)
   - Fetch from `/api/google-reviews`
   - Add loading/error states

2. **Compact Services** (`components/shared/compact-services.tsx`)
   - Server component (static content)
   - Use Next.js `Image`

3. **Trust Signals** (`components/shared/trust-signals.tsx`)
   - Server component
   - Add schema.org `Review` markup

4. **CFM Compliance** (`components/compliance/cfm-compliance.tsx`)
   - Client component (interactive disclaimers)
   - Server-side validation in `lib/cfm-compliance.ts`

**Deliverables:**
- All shared components migrated
- TypeScript types defined
- Client/server separation documented

**Risk Mitigation:**
- Test each component in isolation
- Create mock data for testing
- Use Storybook for component preview (optional)

---

### Phase 3: Routing & Navigation (Week 3-4)

**Goals:**
- Migrate all pages to App Router
- Implement SSG/ISR/SSR strategy
- Configure metadata API

**Tasks:**

#### Week 3: Static Pages (SSG)
1. **Homepage** (`app/(main)/page.tsx`)
   ```typescript
   import { Metadata } from 'next';

   export const metadata: Metadata = {
     title: 'Saraiva Vision - Clínica Oftalmológica',
     description: '...',
     openGraph: { /* ... */ }
   };

   export default function HomePage() {
     return (
       <>
         <Hero />
         <CompactServices />
         <GoogleReviewsWidget />
         <TrustSignals />
       </>
     );
   }
   ```

2. **About Page** (`app/(main)/sobre/page.tsx`)
   - Static generation
   - Add team schema

3. **Privacy Policy** (`app/(main)/privacy/page.tsx`)
   - Static generation

#### Week 4: Dynamic Pages (ISR/SSG)
1. **Services Index** (`app/(main)/servicos/page.tsx`)
   ```typescript
   import { services } from '@/content/services';

   export default function ServicesPage() {
     return <ServicesList services={services} />;
   }
   ```

2. **Service Detail** (`app/(main)/servicos/[serviceId]/page.tsx`)
   ```typescript
   export async function generateStaticParams() {
     return services.map(s => ({ serviceId: s.id }));
   }

   export default function ServiceDetailPage({ params }) {
     const service = services.find(s => s.id === params.serviceId);
     return <ServiceDetail service={service} />;
   }

   export const revalidate = 3600; // ISR: 1 hour
   ```

3. **Blog Index** (`app/(main)/blog/page.tsx`)
   - Static generation
   - Category filtering client-side

4. **Blog Post** (`app/(main)/blog/[slug]/page.tsx`)
   ```typescript
   import { blogPosts } from '@/content/blog-posts';

   export async function generateStaticParams() {
     return blogPosts.map(p => ({ slug: p.slug }));
   }

   export async function generateMetadata({ params }) {
     const post = blogPosts.find(p => p.slug === params.slug);
     return {
       title: post.title,
       description: post.excerpt,
       openGraph: {
         images: [post.coverImage],
       }
     };
   }

   export default function BlogPostPage({ params }) {
     const post = blogPosts.find(p => p.slug === params.slug);
     return (
       <article>
         <CFMCompliance content={post.content} />
         <BlogPostContent post={post} />
       </article>
     );
   }
   ```

5. **Podcast Pages** (`app/(main)/podcast/page.tsx` and `app/(main)/podcast/[slug]/page.tsx`)
   - ISR strategy (Spotify data may change)

6. **FAQ Page** (`app/(main)/faq/page.tsx`)
   - ISR strategy (content may update)

**Deliverables:**
- All routes migrated to App Router
- Static generation working
- Metadata API configured
- SEO tags in `<head>`

**Risk Mitigation:**
- Test each route individually
- Verify SEO with Google Search Console
- Check Core Web Vitals with Lighthouse

---

### Phase 4: API Integration (Week 4-5)

**Goals:**
- Replace Express.js API with Route Handlers
- Migrate Redis to Vercel KV
- Set up external API integrations

**Tasks:**

#### Week 4: Core API Routes
1. **Health Check** (`app/api/health/route.ts`)
   ```typescript
   import { NextResponse } from 'next/server';

   export async function GET() {
     return NextResponse.json({
       status: 'ok',
       timestamp: new Date().toISOString()
     });
   }

   export const runtime = 'edge';
   ```

2. **Google Reviews** (`app/api/google-reviews/route.ts`)
   ```typescript
   import { kv } from '@vercel/kv';
   import { NextResponse } from 'next/server';

   const CACHE_KEY = 'google-reviews';
   const CACHE_TTL = 300;

   export async function GET() {
     try {
       // Check cache
       const cached = await kv.get(CACHE_KEY);
       if (cached) return NextResponse.json(cached);

       // Fetch from Google Places
       const response = await fetch(
         `https://maps.googleapis.com/maps/api/place/details/json?place_id=${process.env.GOOGLE_PLACE_ID}&fields=reviews,rating,user_ratings_total&key=${process.env.GOOGLE_PLACES_API_KEY}`
       );
       const data = await response.json();

       // Cache result
       await kv.setex(CACHE_KEY, CACHE_TTL, data);

       return NextResponse.json(data);
     } catch (error) {
       return NextResponse.json(
         { error: 'Failed to fetch reviews' },
         { status: 500 }
       );
     }
   }

   export const runtime = 'edge';
   export const revalidate = 0;
   ```

3. **Google Reviews Stats** (`app/api/google-reviews-stats/route.ts`)
   - Aggregate statistics from cached data

#### Week 5: External Integrations
1. **Instagram API** (`lib/services/instagram.ts`)
   - Port existing Instagram service
   - Use Next.js caching

2. **Spotify API** (`lib/services/spotify.ts`)
   - Port Spotify RSS parser
   - Cache episode data in Vercel KV

3. **Resend Email** (`lib/services/resend.ts`)
   - Port email notification logic
   - Use server actions for form submissions

4. **WhatsApp Integration** (`lib/services/whatsapp.ts`)
   - Port existing WhatsApp Business logic

**Deliverables:**
- All API routes migrated
- Vercel KV configured
- External integrations working
- Error handling implemented

**Risk Mitigation:**
- Test each API route with Postman
- Verify cache behavior
- Monitor rate limits

---

### Phase 5: Static Content & Blog (Week 5-6)

**Goals:**
- Migrate all blog posts to TypeScript
- Optimize images
- Set up blog functionality

**Tasks:**

#### Week 5: Blog Data Migration
1. **Blog Posts Data** (`content/blog-posts.ts`)
   ```typescript
   export interface BlogPost {
     id: number;
     slug: string;
     title: string;
     excerpt: string;
     content: string;
     coverImage: string;
     category: 'Prevenção' | 'Tratamento' | 'Tecnologia' | 'Dúvidas Frequentes';
     date: string;
     author: string;
     readTime: string;
   }

   export const blogPosts: BlogPost[] = [
     {
       id: 1,
       slug: 'catarata-tratamento-cirurgia',
       title: 'Catarata: Tratamento e Cirurgia',
       excerpt: '...',
       content: `
         <h2>O que é Catarata?</h2>
         <p>...</p>
       `,
       coverImage: '/blog/capa-catarata-1280w.avif',
       category: 'Tratamento',
       date: '2024-09-15',
       author: 'Dr. Saraiva',
       readTime: '8 min'
     },
     // ... 24 more posts
   ];
   ```

2. **Blog Components** (already done in Phase 2)
   - Post Header
   - Table of Contents
   - Related Posts
   - Author Widget

3. **Image Optimization**
   - Convert all blog images to Next.js `Image`
   - Add `width` and `height` attributes
   - Generate blur placeholders

#### Week 6: Blog Functionality
1. **Category Filtering** (client-side)
   ```typescript
   'use client';

   export function BlogCategoryFilter({ posts }: { posts: BlogPost[] }) {
     const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

     const filteredPosts = selectedCategory
       ? posts.filter(p => p.category === selectedCategory)
       : posts;

     return (
       <>
         <CategoryButtons onSelect={setSelectedCategory} />
         <BlogPostGrid posts={filteredPosts} />
       </>
     );
   }
   ```

2. **Search Functionality** (client-side)
   ```typescript
   'use client';

   export function BlogSearch({ posts }: { posts: BlogPost[] }) {
     const [query, setQuery] = useState('');

     const searchResults = posts.filter(p =>
       p.title.toLowerCase().includes(query.toLowerCase()) ||
       p.excerpt.toLowerCase().includes(query.toLowerCase())
     );

     return (
       <>
         <SearchInput value={query} onChange={setQuery} />
         <BlogPostGrid posts={searchResults} />
       </>
     );
   }
   ```

3. **CFM Compliance Integration**
   - Validate all blog content
   - Inject medical disclaimers
   - Track compliance scores

**Deliverables:**
- All 25 blog posts migrated
- Images optimized
- Blog functionality working
- CFM compliance validated

**Risk Mitigation:**
- Validate HTML content
- Test medical disclaimers
- Check image loading

---

### Phase 6: Performance Optimization (Week 6-7)

**Goals:**
- Optimize Core Web Vitals
- Implement caching strategies
- Fine-tune bundle sizes

**Tasks:**

#### Week 6: Core Web Vitals
1. **Largest Contentful Paint (LCP)**
   - Prioritize hero images with `priority` prop
   - Preload critical fonts
   - Use server components for above-the-fold content

2. **First Input Delay (FID)**
   - Minimize JavaScript execution
   - Use server components where possible
   - Defer non-critical scripts

3. **Cumulative Layout Shift (CLS)**
   - Add `width` and `height` to all images
   - Reserve space for dynamic content
   - Use `placeholder="blur"` for images

#### Week 7: Advanced Optimization
1. **Code Splitting**
   - Verify automatic code splitting per route
   - Lazy load heavy components (Framer Motion animations)
   - Use dynamic imports for modals

2. **Caching Strategy**
   - Configure `revalidate` for ISR pages
   - Set up Vercel KV for API caching
   - Use `next/cache` for server-side caching

3. **Bundle Analysis**
   - Run `npm run build` and analyze bundle
   - Remove unused dependencies
   - Optimize third-party scripts

**Deliverables:**
- Core Web Vitals > 90
- Bundle size < 150KB (initial load)
- Lighthouse score > 95

**Risk Mitigation:**
- Test on slow 3G network
- Verify on mobile devices
- Use WebPageTest.org for analysis

---

### Phase 7: Testing & Validation (Week 7-8)

**Goals:**
- Comprehensive testing
- SEO validation
- Accessibility audit

**Tasks:**

#### Week 7: Functional Testing
1. **Unit Tests** (Vitest + React Testing Library)
   ```typescript
   // __tests__/components/blog-post.test.tsx
   import { render, screen } from '@testing-library/react';
   import BlogPost from '@/app/(main)/blog/[slug]/page';

   describe('BlogPost', () => {
     it('renders blog post content', () => {
       render(<BlogPost params={{ slug: 'catarata-tratamento' }} />);
       expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
     });
   });
   ```

2. **Integration Tests**
   - Test API routes
   - Verify caching behavior
   - Test form submissions

3. **E2E Tests** (Playwright)
   ```typescript
   // e2e/blog.spec.ts
   import { test, expect } from '@playwright/test';

   test('user can navigate blog posts', async ({ page }) => {
     await page.goto('/blog');
     await page.click('text=Catarata');
     await expect(page).toHaveURL(/\/blog\/catarata-tratamento/);
   });
   ```

#### Week 8: Quality Assurance
1. **SEO Validation**
   - Google Search Console verification
   - Schema.org markup validation
   - Open Graph tags testing
   - Sitemap generation

2. **Accessibility Audit**
   - WCAG 2.1 Level AA compliance
   - Keyboard navigation testing
   - Screen reader testing (NVDA/JAWS)
   - Color contrast validation

3. **Performance Testing**
   - Lighthouse CI setup
   - Core Web Vitals monitoring
   - Real User Monitoring (Vercel Analytics)

4. **CFM/LGPD Compliance**
   - Medical content validation
   - Privacy policy review
   - Consent management testing

**Deliverables:**
- 80%+ test coverage
- Zero accessibility violations
- SEO score > 95
- CFM/LGPD compliance validated

**Risk Mitigation:**
- Automated testing in CI/CD
- Manual QA for critical flows
- Staged rollout (beta subdomain first)

---

### Phase 8: Deployment & Monitoring (Week 8)

**Goals:**
- Production deployment
- Monitoring setup
- Rollback plan

**Tasks:**

#### Vercel Deployment
1. **Initial Setup**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy to Vercel
   vercel --prod
   ```

2. **Environment Variables**
   - `GOOGLE_MAPS_API_KEY`
   - `GOOGLE_PLACES_API_KEY`
   - `GOOGLE_PLACE_ID`
   - `RESEND_API_KEY`
   - `INSTAGRAM_ACCESS_TOKEN`
   - `SPOTIFY_RSS_URL`
   - `NEXT_PUBLIC_POSTHOG_KEY`

3. **Custom Domain**
   - Configure DNS for `saraivavision.com.br`
   - Add `check.saraivavision.com.br` subdomain
   - Verify SSL certificate

#### Monitoring & Analytics
1. **Vercel Analytics**
   ```typescript
   // app/layout.tsx
   import { Analytics } from '@vercel/analytics/react';
   import { SpeedInsights } from '@vercel/speed-insights/next';

   export default function RootLayout({ children }) {
     return (
       <html lang="pt-BR">
         <body>
           {children}
           <Analytics />
           <SpeedInsights />
         </body>
       </html>
     );
   }
   ```

2. **Error Tracking** (Sentry or similar)
   - Set up error monitoring
   - Configure alerts
   - Track user sessions

3. **Uptime Monitoring**
   - Vercel's built-in monitoring
   - External service (UptimeRobot, Pingdom)

#### Rollback Plan
1. **Vercel Rollback**
   - One-click rollback to previous deployment
   - Keep VPS backup for emergency fallback

2. **DNS Failover**
   - Configure DNS records for quick revert to VPS
   - Keep VPS running during initial migration

**Deliverables:**
- Production deployment live
- Monitoring configured
- Rollback plan documented

**Risk Mitigation:**
- Staged rollout (10% → 50% → 100% traffic)
- Keep VPS running for 2 weeks
- Monitor error rates closely

---

## 5. Technical Challenges & Solutions

### Challenge 1: Subdomain Routing (`check.saraivavision.com.br`)

**Current:** React Router checks hostname in component

**Solution:** Next.js Middleware
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  if (hostname.startsWith('check.')) {
    // Rewrite to check page
    return NextResponse.rewrite(new URL('/check', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Challenge 2: Framer Motion Server Components

**Issue:** Framer Motion requires client-side rendering

**Solution:** Hybrid approach
```typescript
// components/shared/animated-section.tsx
'use client';

import { motion } from 'framer-motion';

export function AnimatedSection({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

// app/(main)/page.tsx (Server Component)
import { AnimatedSection } from '@/components/shared/animated-section';

export default function HomePage() {
  return (
    <>
      {/* Server-rendered content */}
      <h1>Saraiva Vision</h1>

      {/* Client-side animation */}
      <AnimatedSection>
        <CompactServices />
      </AnimatedSection>
    </>
  );
}
```

### Challenge 3: Google Maps Integration

**Issue:** Google Maps SDK requires browser APIs

**Solution:** Dynamic import with SSR disabled
```typescript
// components/shared/google-map.tsx
'use client';

import dynamic from 'next/dynamic';

const GoogleMapComponent = dynamic(
  () => import('./google-map-component'),
  { ssr: false } // Disable SSR for Google Maps
);

export function GoogleMap() {
  return (
    <Suspense fallback={<MapSkeleton />}>
      <GoogleMapComponent />
    </Suspense>
  );
}
```

### Challenge 4: CFM Compliance Validation

**Issue:** Complex HTML parsing and validation

**Solution:** Server-side validation, client-side UI
```typescript
// lib/cfm-compliance.ts (Server-safe)
export function validateMedicalContent(content: string): ComplianceReport {
  // Use DOMParser-free HTML parsing (e.g., jsdom or htmlparser2)
  const { warnings, disclaimers } = parseAndValidate(content);
  return { warnings, disclaimers };
}

// components/compliance/cfm-compliance.tsx (Client Component)
'use client';

export function CFMCompliance({ report }: { report: ComplianceReport }) {
  return (
    <>
      {report.disclaimers.map(d => (
        <MedicalDisclaimer key={d.id} {...d} />
      ))}
    </>
  );
}

// app/blog/[slug]/page.tsx (Server Component)
export default function BlogPost({ params }) {
  const post = getPostBySlug(params.slug);
  const complianceReport = validateMedicalContent(post.content); // Server-side

  return (
    <article>
      <CFMCompliance report={complianceReport} />
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

### Challenge 5: Redis Cache Migration

**Current:** Self-hosted Redis on VPS

**Solution:** Vercel KV (Redis-compatible)
```typescript
// lib/cache.ts
import { kv } from '@vercel/kv';

export async function getCachedData<T>(key: string): Promise<T | null> {
  return await kv.get<T>(key);
}

export async function setCachedData<T>(key: string, value: T, ttl: number): Promise<void> {
  await kv.setex(key, ttl, value);
}

export async function invalidateCache(key: string): Promise<void> {
  await kv.del(key);
}

// Usage in API route
export async function GET() {
  const cached = await getCachedData<ReviewsData>('google-reviews');
  if (cached) return NextResponse.json(cached);

  // Fetch fresh data...
  const data = await fetchGoogleReviews();
  await setCachedData('google-reviews', data, 300);

  return NextResponse.json(data);
}
```

### Challenge 6: LGPD Consent Management

**Issue:** Local storage access requires client-side

**Solution:** Client component with SSR hydration
```typescript
// components/compliance/consent-manager.tsx
'use client';

import { useEffect, useState } from 'react';

export function ConsentManager() {
  const [consent, setConsent] = useState<ConsentState | null>(null);

  useEffect(() => {
    // Load consent from localStorage
    const stored = localStorage.getItem('lgpd-consent');
    if (stored) setConsent(JSON.parse(stored));
  }, []);

  if (!consent) {
    return <ConsentBanner onAccept={handleAccept} />;
  }

  return null;
}

// app/layout.tsx (Server Component)
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <ConsentManager />
      </body>
    </html>
  );
}
```

---

## 6. Resource Requirements

### 6.1 Time Estimates

| Phase | Task | Hours | Days (8h/day) |
|-------|------|-------|---------------|
| **Phase 1** | Setup & Infrastructure | 24 | 3 |
| **Phase 2** | Component Migration | 40 | 5 |
| **Phase 3** | Routing & Navigation | 32 | 4 |
| **Phase 4** | API Integration | 40 | 5 |
| **Phase 5** | Static Content | 32 | 4 |
| **Phase 6** | Performance | 24 | 3 |
| **Phase 7** | Testing | 32 | 4 |
| **Phase 8** | Deployment | 16 | 2 |
| **Buffer** | Contingency (20%) | 48 | 6 |
| **Total** | | **288 hours** | **36 days** |

**Timeline:** 6-8 weeks (assuming 1-2 developers full-time)

### 6.2 Team Skills Required

**Essential Skills:**
- Next.js 15 App Router experience
- TypeScript proficiency
- React Server Components understanding
- Tailwind CSS expertise
- Medical compliance knowledge (CFM/LGPD)

**Nice to Have:**
- Vercel deployment experience
- SEO optimization expertise
- Brazilian healthcare regulations
- Portuguese language fluency

### 6.3 Infrastructure Changes

**Vercel Setup:**
- Vercel account (Pro tier recommended)
- Vercel KV database
- Custom domain configuration
- Environment variable management

**External Services:**
- Google Maps API (existing)
- Google Places API (existing)
- Resend API (existing)
- Instagram Graph API (existing)
- Spotify Web API (existing)

**Optional:**
- Sentry (error tracking)
- PostHog (analytics)
- UptimeRobot (monitoring)

---

## 7. Risk Assessment

### 7.1 Major Risks

#### Risk 1: SEO Disruption During Migration

**Probability:** Medium
**Impact:** High (loss of organic traffic)

**Mitigation:**
- Implement 301 redirects for all URLs
- Keep old VPS running during transition
- Submit new sitemap to Google Search Console
- Monitor Search Console for crawl errors
- Use Vercel preview deployments for testing

**Rollback Plan:**
- DNS revert to VPS (< 5 minutes)
- Keep VPS online for 2 weeks post-migration

#### Risk 2: CFM/LGPD Compliance Issues

**Probability:** Low
**Impact:** Critical (legal consequences)

**Mitigation:**
- Audit all medical content before launch
- Test consent management thoroughly
- Consult with legal team
- Validate all disclaimers
- Document compliance measures

**Rollback Plan:**
- Revert to VPS if compliance issues detected

#### Risk 3: Performance Regression

**Probability:** Low
**Impact:** Medium (user experience)

**Mitigation:**
- Lighthouse testing at every phase
- Core Web Vitals monitoring
- Real User Monitoring (RUM)
- Load testing with WebPageTest
- Gradual traffic migration (10% → 50% → 100%)

**Rollback Plan:**
- Vercel one-click rollback to previous deployment

#### Risk 4: API Integration Failures

**Probability:** Medium
**Impact:** Medium (feature unavailability)

**Mitigation:**
- Test all API routes extensively
- Implement fallback mechanisms
- Verify Google Reviews cache
- Test Instagram/Spotify integrations
- Monitor error rates

**Rollback Plan:**
- Keep VPS API endpoints active during transition

#### Risk 5: Budget Overrun (Vercel Costs)

**Probability:** Low
**Impact:** Low (cost predictable)

**Mitigation:**
- Start with Vercel Free tier for testing
- Monitor usage dashboard
- Set up billing alerts
- Estimate traffic patterns
- Compare with VPS costs

**Rollback Plan:**
- Deploy to VPS with Next.js standalone mode

### 7.2 Risk Matrix

| Risk | Probability | Impact | Priority | Mitigation Cost |
|------|-------------|--------|----------|-----------------|
| SEO Disruption | Medium | High | **Critical** | Low |
| Compliance Issues | Low | Critical | **Critical** | Medium |
| Performance Regression | Low | Medium | High | Low |
| API Failures | Medium | Medium | High | Low |
| Budget Overrun | Low | Low | Medium | None |

---

## 8. Implementation Checklist

### Pre-Migration

- [ ] Backup current VPS (database, files, configs)
- [ ] Document current environment variables
- [ ] Export Google Analytics baseline metrics
- [ ] Screenshot all pages for visual comparison
- [ ] Run Lighthouse audit on current site
- [ ] Document all API endpoints
- [ ] List all external integrations

### Phase 1: Setup

- [ ] Create Next.js 15 project with App Router
- [ ] Configure TypeScript (strict mode)
- [ ] Set up Tailwind CSS with custom config
- [ ] Install all dependencies
- [ ] Create folder structure
- [ ] Configure `next.config.mjs`
- [ ] Set up ESLint and Prettier

### Phase 2: Components

- [ ] Migrate all UI primitives (Radix UI)
- [ ] Convert Navbar to TypeScript
- [ ] Convert Footer to TypeScript
- [ ] Migrate Error Boundary
- [ ] Migrate Accessibility widget
- [ ] Migrate Google Reviews widget
- [ ] Migrate CFM Compliance component
- [ ] Migrate LGPD Consent Manager
- [ ] Test each component in isolation

### Phase 3: Routing

- [ ] Create homepage (`/`)
- [ ] Create about page (`/sobre`)
- [ ] Create privacy page (`/privacy`)
- [ ] Create services index (`/servicos`)
- [ ] Create service detail (`/servicos/[serviceId]`)
- [ ] Create blog index (`/blog`)
- [ ] Create blog post (`/blog/[slug]`)
- [ ] Create podcast index (`/podcast`)
- [ ] Create podcast episode (`/podcast/[slug]`)
- [ ] Create FAQ page (`/faq`)
- [ ] Create lenses page (`/lentes`)
- [ ] Configure metadata for all pages
- [ ] Verify static generation

### Phase 4: API

- [ ] Create health check route
- [ ] Create Google Reviews route
- [ ] Create Google Reviews stats route
- [ ] Set up Vercel KV
- [ ] Migrate Instagram API
- [ ] Migrate Spotify API
- [ ] Migrate Resend email service
- [ ] Test all API routes with Postman
- [ ] Verify caching behavior

### Phase 5: Content

- [ ] Migrate all 25 blog posts to TypeScript
- [ ] Optimize all blog images (Next/Image)
- [ ] Migrate podcast episodes data
- [ ] Migrate services data
- [ ] Migrate FAQ data
- [ ] Validate CFM compliance for all content
- [ ] Test medical disclaimers

### Phase 6: Performance

- [ ] Run Lighthouse audit
- [ ] Optimize LCP (hero images)
- [ ] Optimize FID (JavaScript execution)
- [ ] Optimize CLS (image dimensions)
- [ ] Configure ISR revalidation
- [ ] Set up Vercel KV caching
- [ ] Analyze bundle size
- [ ] Test on slow 3G

### Phase 7: Testing

- [ ] Write unit tests (80% coverage)
- [ ] Write integration tests
- [ ] Write E2E tests (Playwright)
- [ ] Run accessibility audit (WCAG 2.1 AA)
- [ ] Validate Schema.org markup
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Validate CFM/LGPD compliance
- [ ] Test on mobile devices

### Phase 8: Deployment

- [ ] Set up Vercel project
- [ ] Configure environment variables
- [ ] Deploy to preview environment
- [ ] Test preview deployment thoroughly
- [ ] Configure custom domain
- [ ] Verify SSL certificate
- [ ] Deploy to production
- [ ] Set up monitoring (Analytics, Sentry)
- [ ] Configure DNS for gradual rollout
- [ ] Monitor error rates
- [ ] Submit new sitemap to Google
- [ ] Verify Search Console indexing

### Post-Migration

- [ ] Monitor Core Web Vitals for 1 week
- [ ] Check SEO rankings daily
- [ ] Monitor error logs
- [ ] Verify all API integrations
- [ ] Test user flows (appointments, contact)
- [ ] Keep VPS as backup for 2 weeks
- [ ] Document migration lessons learned
- [ ] Archive old Vite project

---

## 9. Success Metrics

### 9.1 Performance KPIs

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| **Lighthouse Score** | 78 | 95+ | Google Lighthouse |
| **LCP** | 2.1s | <1.2s | Core Web Vitals |
| **FID** | 85ms | <50ms | Core Web Vitals |
| **CLS** | 0.08 | <0.02 | Core Web Vitals |
| **TTI** | 3.5s | <2.0s | Lighthouse |
| **Bundle Size** | 225KB | <150KB | Webpack Analyzer |

### 9.2 SEO KPIs

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| **Indexed Pages** | 28 | 50+ | Google Search Console |
| **Avg. Position** | 12 | 6-8 | SEMrush/Ahrefs |
| **Organic Traffic** | Baseline | +30-50% | Google Analytics |
| **Click-Through Rate** | 2.3% | 3.5%+ | Search Console |
| **Core Web Vitals Pass** | 65% | 90%+ | Search Console |

### 9.3 Business KPIs

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| **Appointment Bookings** | Baseline | +20% | Internal CRM |
| **Contact Form Submissions** | Baseline | +15% | Analytics Events |
| **Blog Engagement** | 45s | 90s+ | Google Analytics |
| **Bounce Rate** | 58% | <45% | Google Analytics |
| **Mobile Users** | 65% | 70%+ | Google Analytics |

### 9.4 Technical KPIs

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| **Deployment Time** | 2 min | <30s | CI/CD Logs |
| **Build Time** | 45s | <60s | Vercel Dashboard |
| **API Uptime** | 99.5% | 99.9%+ | Uptime Monitor |
| **Error Rate** | <0.1% | <0.05% | Sentry |
| **Cache Hit Rate** | 85% | 95%+ | Vercel KV Metrics |

---

## 10. Conclusion & Next Steps

### 10.1 Migration Readiness

The Saraiva Vision website is **well-positioned for Next.js migration** due to:

**Strengths:**
- Clean React component architecture
- Minimal API surface (only 5 endpoints)
- Static blog content (easy to migrate)
- Strong TypeScript foundation
- Modern Tailwind CSS design
- Well-documented compliance requirements

**Challenges:**
- Complex CFM/LGPD compliance validation
- Large image assets (274MB)
- Multiple external integrations
- Subdomain routing logic

**Overall Assessment:** **Medium complexity, high reward**

### 10.2 Recommended Next Steps

#### Immediate (Week 1)
1. **Get stakeholder buy-in**
   - Present this migration plan to decision-makers
   - Discuss timeline and resource allocation
   - Secure budget approval (Vercel Pro tier)

2. **Set up development environment**
   - Create new Next.js 15 project
   - Initialize Git repository
   - Set up Vercel project (preview environment)

3. **Audit current SEO**
   - Export baseline metrics from Google Analytics
   - Document current Search Console data
   - Take Lighthouse snapshots of all pages

#### Short-term (Week 2-4)
1. **Phase 1 & 2 Execution**
   - Complete setup and infrastructure
   - Migrate all shared components
   - Begin routing migration

2. **Testing setup**
   - Configure Vitest for unit tests
   - Set up Playwright for E2E tests
   - Establish CI/CD pipeline

#### Mid-term (Week 5-6)
1. **Phase 3 & 4 Execution**
   - Complete routing migration
   - Migrate all API endpoints
   - Set up Vercel KV

2. **Content migration**
   - Migrate all blog posts
   - Optimize images
   - Validate CFM compliance

#### Long-term (Week 7-8)
1. **Phase 7 & 8 Execution**
   - Complete testing
   - Deploy to production
   - Monitor performance

2. **Post-launch optimization**
   - Fine-tune Core Web Vitals
   - Monitor SEO impact
   - Iterate based on user feedback

### 10.3 Alternative Approaches

#### Option A: Gradual Migration (Lower Risk)
- Keep VPS as primary
- Deploy Next.js to subdomain (e.g., `beta.saraivavision.com.br`)
- Migrate one section at a time
- Use Nginx to route traffic
- **Timeline:** 10-12 weeks
- **Pros:** Zero downtime, easy rollback
- **Cons:** Slower, more complex infrastructure

#### Option B: Hybrid Approach (Cost-Optimized)
- Deploy Next.js in standalone mode to VPS
- Keep Nginx for static file serving
- Use Vercel KV for caching
- Self-host instead of Vercel
- **Timeline:** 6-8 weeks
- **Pros:** Lower monthly cost, full control
- **Cons:** More DevOps work, no Vercel edge benefits

#### Option C: Full Rewrite (Highest Quality)
- Rebuild from scratch in Next.js 15
- Redesign UI/UX
- Rethink information architecture
- Add new features (online scheduling, telemedicine)
- **Timeline:** 16-20 weeks
- **Pros:** Modern architecture, best performance
- **Cons:** Highest risk, longest timeline, highest cost

**Recommendation:** **Proceed with main plan (Option: Progressive Migration as outlined)**

### 10.4 Final Recommendations

1. **Start with Phase 1 immediately** - Low risk, high learning value
2. **Use Vercel preview deployments** for stakeholder demos
3. **Keep VPS as safety net** for 2-4 weeks post-migration
4. **Monitor SEO closely** - This is the biggest risk
5. **Leverage Vercel's edge network** for Brazilian users
6. **Document everything** - Create internal wiki for future maintenance
7. **Plan for continuous improvement** - Migration is not the end, it's the beginning

### 10.5 Questions to Resolve Before Starting

- [ ] Budget approval for Vercel Pro tier (R$100/month)?
- [ ] Who will be the primary developer(s) on this project?
- [ ] Do we have access to a legal review for CFM/LGPD compliance?
- [ ] Can we afford 1-2 weeks of development downtime (feature freeze)?
- [ ] Do we have a staging environment for testing?
- [ ] What's the rollback plan if SEO drops >20%?
- [ ] Who will monitor Core Web Vitals post-launch?

---

## Appendix A: Technology Comparison

### Vite vs Next.js Build System

| Feature | Vite | Next.js |
|---------|------|---------|
| **Build Speed** | 5-10s | 15-30s |
| **Dev Server** | Instant HMR | Fast Refresh |
| **Code Splitting** | Manual | Automatic |
| **SSR Support** | None (CSR only) | Built-in |
| **Image Optimization** | Manual | Automatic |
| **Font Optimization** | CDN | Self-hosted |
| **API Routes** | External (Express) | Built-in |
| **Edge Functions** | No | Yes (Vercel) |
| **Incremental Static Regeneration** | No | Yes |

### React Router vs Next.js Router

| Feature | React Router | Next.js App Router |
|---------|--------------|---------------------|
| **Routing Type** | Client-side | File-system + Server |
| **Nested Layouts** | Manual | Automatic |
| **Loading States** | Manual | `loading.tsx` |
| **Error Handling** | Error Boundary | `error.tsx` |
| **Data Fetching** | Client-side | Server-side |
| **SEO** | Requires SSR setup | Built-in |
| **Type Safety** | Weak | Strong |

### Express.js vs Next.js API Routes

| Feature | Express.js | Next.js Route Handlers |
|---------|-----------|------------------------|
| **Co-location** | Separate repo | Same repo |
| **TypeScript** | Optional | Built-in |
| **Deployment** | VPS/Docker | Serverless |
| **Cold Start** | None (long-running) | 50-200ms |
| **Scaling** | Manual | Automatic |
| **Edge Support** | No | Yes |

---

## Appendix B: Migration Scripts

### Blog Post Migration Script

```typescript
// scripts/migrate-blog-posts.ts
import { blogPosts as oldPosts } from '../src/data/blogPosts.js';
import fs from 'fs';

interface NewBlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
}

const newPosts: NewBlogPost[] = oldPosts.map(post => ({
  id: post.id,
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  content: post.content,
  coverImage: post.coverImage || '/blog/default-cover.avif',
  category: post.category,
  date: post.date,
  author: post.author || 'Dr. Saraiva',
  readTime: post.readTime || '5 min'
}));

const output = `// Auto-generated from migration script
export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
}

export const blogPosts: BlogPost[] = ${JSON.stringify(newPosts, null, 2)};
`;

fs.writeFileSync('content/blog-posts.ts', output);
console.log(`✅ Migrated ${newPosts.length} blog posts`);
```

### Image Optimization Script

```typescript
// scripts/optimize-images.ts
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir = './public/Blog';
const outputDir = './public/blog'; // lowercase for Next.js convention

async function optimizeImage(filePath: string) {
  const fileName = path.basename(filePath);
  const outputPath = path.join(outputDir, fileName);

  try {
    await sharp(filePath)
      .resize(1280, null, { withoutEnlargement: true })
      .avif({ quality: 80 })
      .toFile(outputPath.replace(/\.[^.]+$/, '.avif'));

    console.log(`✅ Optimized: ${fileName}`);
  } catch (error) {
    console.error(`❌ Failed: ${fileName}`, error);
  }
}

async function main() {
  const files = fs.readdirSync(inputDir)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .map(f => path.join(inputDir, f));

  for (const file of files) {
    await optimizeImage(file);
  }

  console.log(`✅ Optimized ${files.length} images`);
}

main();
```

### Environment Variables Migration Script

```bash
#!/bin/bash
# scripts/migrate-env-vars.sh

echo "Migrating environment variables from Vite to Next.js..."

# Read from .env.production
source .env.production

# Create new .env.local for Next.js
cat > .env.local <<EOF
# Google APIs
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=${VITE_GOOGLE_PLACES_API_KEY}
NEXT_PUBLIC_GOOGLE_PLACE_ID=${VITE_GOOGLE_PLACE_ID}

# External Services
RESEND_API_KEY=${RESEND_API_KEY}
INSTAGRAM_ACCESS_TOKEN=${INSTAGRAM_ACCESS_TOKEN}
SPOTIFY_RSS_URL=${SPOTIFY_RSS_URL}

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=${VITE_POSTHOG_KEY}

# Vercel KV (add after setup)
KV_REST_API_URL=
KV_REST_API_TOKEN=
EOF

echo "✅ Environment variables migrated to .env.local"
echo "⚠️  Don't forget to add Vercel KV credentials"
```

---

## Appendix C: Useful Resources

### Official Documentation
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Vercel Deployment](https://vercel.com/docs)
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv)

### Migration Guides
- [Vite to Next.js Migration](https://nextjs.org/docs/app/building-your-application/upgrading/from-vite)
- [React Router to Next.js Router](https://nextjs.org/docs/app/building-your-application/upgrading/from-react-router)
- [Create React App to Next.js](https://nextjs.org/docs/app/building-your-application/upgrading/from-create-react-app)

### Performance Optimization
- [Core Web Vitals](https://web.dev/vitals/)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### Medical Compliance
- [CFM Guidelines](https://portal.cfm.org.br/)
- [LGPD Official Documentation](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
- [Healthcare Web Accessibility](https://www.w3.org/WAI/health/)

### Community Resources
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)
- [Next.js Discord Server](https://discord.com/invite/nextjs)
- [Vercel Community](https://vercel.com/community)

---

**Document End**

**Last Updated:** October 2025
**Next Review:** After Phase 1 completion
**Document Owner:** Development Team Lead
