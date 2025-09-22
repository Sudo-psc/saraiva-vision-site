# Next.js Migration Plan - Saraiva Vision

## Executive Summary

This document outlines the comprehensive migration plan from the current React + Vite SPA architecture to Next.js 14+ with App Router. The migration aims to improve SEO, performance, and maintainability while preserving all existing functionality.

## Current Architecture Analysis

### Technology Stack
- **Frontend**: React 18 + Vite
- **Routing**: React Router DOM (client-side)
- **Backend**: Vercel Serverless Functions (`/api` directory)
- **Styling**: Tailwind CSS
- **State Management**: React Context + Custom Hooks
- **Deployment**: Vercel with custom configuration

### Key Components Identified
- **Pages**: 20+ pages with lazy loading
- **API Routes**: 50+ serverless functions
- **Components**: Extensive component library
- **Hooks**: Custom hooks for SEO, analytics, accessibility
- **Utils**: Performance monitoring, error handling, security

## Migration Strategy

### Phase 1: Foundation Setup

#### 1.1 Project Structure Conversion
```
Current: src/pages/ → Next.js: app/ (App Router)
Current: api/ → Next.js: app/api/
Current: public/ → Next.js: public/ (unchanged)
Current: src/components/ → Next.js: components/ (move to root)
```

#### 1.2 Dependencies Update
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "typescript": "^5.0.0"
}
```
Remove: `react-router-dom`, `@vitejs/plugin-react`

#### 1.3 Configuration Files
- Create `next.config.js` (migrate from `vite.config.js`)
- Update `tsconfig.json` for Next.js
- Create `tailwind.config.js` (migrate from PostCSS)
- Update `package.json` scripts

### Phase 2: Routing Migration

#### 2.1 File-Based Routing Conversion

**Current Routes → Next.js App Router:**

| Current Route | Next.js Location | Strategy |
|---------------|------------------|----------|
| `/` | `app/page.tsx` | Convert HomePage |
| `/servicos` | `app/servicos/page.tsx` | Direct conversion |
| `/servicos/:serviceId` | `app/servicos/[serviceId]/page.tsx` | Dynamic route |
| `/sobre` | `app/sobre/page.tsx` | Direct conversion |
| `/contato` | `app/contato/page.tsx` | Direct conversion |
| `/blog` | `app/blog/page.tsx` | Direct conversion |
| `/blog/:slug` | `app/blog/[slug]/page.tsx` | Dynamic route |
| `/admin/*` | `app/admin/[[...slug]]/page.tsx` | Catch-all route |

#### 2.2 Layout Structure
```
app/
├── layout.tsx (root layout)
├── page.tsx (home page)
├── globals.css
├── servicos/
│   ├── page.tsx
│   └── [serviceId]/
│       └── page.tsx
├── sobre/
│   └── page.tsx
├── contato/
│   └── page.tsx
└── admin/
    └── [[...slug]]/
        └── page.tsx
```

### Phase 3: API Routes Migration

#### 3.1 Serverless Functions → API Routes

**Migration Mapping:**
```
Current: api/contact/index.js → Next.js: app/api/contact/route.ts
Current: api/appointments/availability.js → Next.js: app/api/appointments/availability/route.ts
Current: api/podcast/episodes.js → Next.js: app/api/podcast/episodes/route.ts
```

#### 3.2 Handler Conversion
```typescript
// Current (Vercel function)
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // handle POST
  }
}

// Next.js (App Router)
export async function POST(request: Request) {
  // handle POST
  return Response.json({ success: true });
}
```

### Phase 4: Component Adaptations

#### 4.1 Client Components
Mark components using browser APIs with `'use client'`:

```tsx
'use client';

import { useEffect } from 'react';

export default function ClientComponent() {
  useEffect(() => {
    // browser-specific code
  }, []);

  return <div>Client Component</div>;
}
```

#### 4.2 Server Components
Convert static components to Server Components:

```tsx
// Server Component (default in Next.js)
export default function ServerComponent() {
  return <div>Server Component</div>;
}
```

#### 4.3 SEO and Metadata
Replace `react-helmet-async` with Next.js Metadata API:

```tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
};

export default function Page() {
  return <div>Page content</div>;
}
```

### Phase 5: Data Fetching Strategy

#### 5.1 Server-Side Data Fetching
```tsx
// Server Component with data fetching
async function getData() {
  const res = await fetch('https://api.example.com/data');
  return res.json();
}

export default async function Page() {
  const data = await getData();

  return (
    <div>
      {data.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
}
```

#### 5.2 Client-Side Data Fetching
```tsx
'use client';

import { useEffect, useState } from 'react';

export default function ClientPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  return <div>{/* render data */}</div>;
}
```

### Phase 6: Configuration Migration

#### 6.1 Next.js Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['saraivavision.com.br'],
  },
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://saraivavision.com.br'
          }
        ]
      }
    ];
  },
};

module.exports = nextConfig;
```

#### 6.2 TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Phase 7: Testing Strategy

#### 7.1 Test Migration
- Convert Vitest tests to Jest/Playwright
- Update test configurations
- Migrate component tests to Next.js testing utilities
- Update API route tests for Next.js API structure

#### 7.2 E2E Testing
- Update Playwright configurations
- Modify test selectors for Next.js structure
- Add SSR-specific test cases

### Phase 8: Performance Optimizations

#### 8.1 Image Optimization
```tsx
import Image from 'next/image';

export default function OptimizedImage() {
  return (
    <Image
      src="/hero-image.jpg"
      alt="Hero"
      width={800}
      height={600}
      priority
    />
  );
}
```

#### 8.2 Bundle Analysis
- Implement code splitting strategies
- Optimize bundle sizes
- Use Next.js built-in optimizations

### Phase 9: Deployment Migration

#### 9.1 Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  }
}
```

#### 9.2 Environment Variables
- Migrate environment variables
- Update build scripts
- Configure preview/production environments

## Risk Assessment

### High Risk Items
1. **Complex routing logic** - Admin routes with authentication
2. **Browser-specific code** - Components using window/document
3. **Third-party integrations** - Analytics, chat widgets
4. **SEO-critical pages** - Must maintain search rankings

### Mitigation Strategies
1. **Incremental migration** - Migrate page by page
2. **Feature flags** - Gradual rollout
3. **Comprehensive testing** - Full test coverage before deployment
4. **Performance monitoring** - Track Core Web Vitals

## Success Metrics

### Performance Targets
- **Lighthouse Score**: Maintain >90
- **Core Web Vitals**: All green
- **Bundle Size**: <200KB initial load
- **TTI**: <3 seconds

### Functionality Targets
- **Zero downtime** during migration
- **100% route compatibility**
- **API response times** within 10% of current
- **SEO rankings** maintained or improved

## Implementation Timeline

### Week 1-2: Foundation
- Project structure setup
- Configuration migration
- Basic routing implementation

### Week 3-4: Core Migration
- Page components migration
- API routes conversion
- Component adaptations

### Week 5-6: Advanced Features
- Authentication system
- Admin dashboard
- Performance optimizations

### Week 7-8: Testing & Deployment
- Comprehensive testing
- Performance validation
- Production deployment

## Rollback Plan

### Immediate Rollback
- Keep current Vite build as backup
- DNS-based traffic switching
- Database backup procedures

### Gradual Rollback
- Feature flag system for critical components
- A/B testing capabilities
- Monitoring dashboards for quick issue detection

## Conclusion

This migration plan provides a structured approach to converting the Saraiva Vision website from React + Vite to Next.js 14+ with App Router. The phased approach minimizes risk while maximizing the benefits of Next.js's modern architecture.

Key benefits expected:
- Improved SEO and Core Web Vitals
- Better performance through SSR/SSG
- Enhanced developer experience
- Future-proof architecture

The plan emphasizes thorough testing, gradual rollout, and comprehensive monitoring to ensure a successful migration.