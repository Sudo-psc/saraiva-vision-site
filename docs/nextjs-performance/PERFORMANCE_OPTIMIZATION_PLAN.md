# Performance Optimization Plan - Multi-Profile Next.js Application

**Versão**: 1.0.0 | **Data**: Outubro 2025 | **Status**: Planejamento

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Requisitos de Performance](#requisitos-de-performance)
3. [Análise de Bundle Atual](#análise-de-bundle-atual)
4. [Estratégia de Code Splitting por Perfil](#estratégia-de-code-splitting-por-perfil)
5. [Otimizações de Performance](#otimizações-de-performance)
6. [Lazy Loading e Prefetching](#lazy-loading-e-prefetching)
7. [Monitoramento e Métricas](#monitoramento-e-métricas)
8. [Checklist de Implementação](#checklist-de-implementação)

---

## 🎯 Visão Geral

Este documento detalha a estratégia de otimização de performance para a aplicação Next.js multi-perfil do **Saraiva Vision**, com foco em três perfis de usuário distintos:

- **Familiar (Padrão)**: Experiência equilibrada para usuários gerais
- **Jovem**: Interface moderna, animações dinâmicas
- **Sênior**: Acessibilidade máxima, contraste alto, fontes grandes

### Objetivos Principais

1. **Bundle Size**: < 200KB (gzipped) por perfil
2. **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
3. **Route Transitions**: < 200ms entre páginas
4. **Lighthouse Score**: ≥ 90 em todas as categorias

---

## 📊 Requisitos de Performance

### Core Web Vitals Targets

| Métrica | Atual (Vite) | Meta (Next.js) | Estratégia |
|---------|--------------|----------------|------------|
| **LCP (Largest Contentful Paint)** | 2.8s | < 2.5s | Image optimization, SSR, Preload fonts |
| **FID (First Input Delay)** | 120ms | < 100ms | Code splitting, defer non-critical JS |
| **CLS (Cumulative Layout Shift)** | 0.15 | < 0.1 | Size reservations, font loading optimization |
| **TTI (Time to Interactive)** | 4.5s | < 3.0s | Critical CSS inline, lazy load components |
| **TBT (Total Blocking Time)** | 450ms | < 300ms | Worker threads, reduce main thread work |
| **FCP (First Contentful Paint)** | 1.8s | < 1.5s | Critical CSS, SSR, resource hints |

### Bundle Size Targets (Gzipped)

```
Profile-Specific:
├── Familiar (Default)     → 180KB max (base + familiar theme)
├── Jovem                  → 195KB max (base + animations + motion)
└── Sênior                 → 165KB max (base + accessibility features)

Shared Resources:
├── React Core             → 45KB
├── React Router/Next.js   → 30KB
├── Radix UI               → 25KB
├── Common Components      → 35KB
└── Profile-Specific       → 45-65KB (varies by profile)

Total First Load:
├── Familiar               → 180KB (baseline)
├── Jovem                  → 195KB (+15KB for framer-motion)
└── Sênior                 → 165KB (-15KB, no animations)
```

### Route Transition Performance

```
Target: < 200ms for all route transitions

Breakdown:
├── Route matching         → < 10ms
├── Component hydration    → < 80ms
├── Data fetching          → < 60ms (from cache)
├── Animation/transition   → < 50ms
└── Total                  → < 200ms
```

---

## 📦 Análise de Bundle Atual

### Current Build Analysis (Vite)

**Total Dist Size**: 311MB (uncompressed, includes all assets)

**JavaScript Bundles** (from vite.config.js):

```javascript
Manual Chunks Configuration:
├── react-core      → ~130KB (react + react-dom + jsx-runtime)
├── router          → ~85KB (react-router-dom)
├── radix-ui        → ~95KB (@radix-ui/*)
├── motion          → ~120KB (framer-motion)
├── helmet          → ~15KB (react-helmet-async)
├── date-utils      → ~45KB (dayjs)
├── style-utils     → ~12KB (clsx, class-variance-authority, tailwind-merge)
├── utils           → ~35KB (dompurify, zod)
├── icons           → ~60KB (lucide-react)
├── maps            → ~75KB (@googlemaps/js-api-loader)
├── i18n            → ~55KB (i18next, react-i18next)
├── analytics       → ~65KB (posthog-js)
├── sw              → ~40KB (workbox-*)
└── vendor-misc     → ~45KB (other libraries)

Total Vendor Code: ~877KB (uncompressed)
Gzipped Estimate:  ~310KB (compression ratio ~35%)
```

### Problem Areas Identified

1. **Framer Motion**: 120KB for animations (not needed for Sênior profile)
2. **Radix UI**: 95KB (could be split by component usage)
3. **React Router**: 85KB (will be replaced by Next.js routing, ~30KB savings)
4. **Icons**: 60KB (tree-shaking not optimal, many unused icons)
5. **Multiple Date Libraries**: Currently dayjs (45KB) - good choice
6. **Analytics**: 65KB (should be lazy loaded)

---

## 🎨 Estratégia de Code Splitting por Perfil

### Profile-Based Architecture

```typescript
// src/app/layout.tsx - Root Layout with Profile Detection

import { cookies } from 'next/headers';
import { ProfileProvider } from '@/contexts/ProfileContext';

export type UserProfile = 'familiar' | 'jovem' | 'senior';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Detect profile from cookie or default to 'familiar'
  const cookieStore = cookies();
  const profileCookie = cookieStore.get('user-profile');
  const profile: UserProfile = (profileCookie?.value as UserProfile) || 'familiar';

  return (
    <html lang="pt-BR">
      <head>
        {/* Critical CSS inlined based on profile */}
        <style dangerouslySetInnerHTML={{ __html: getCriticalCSS(profile) }} />

        {/* Preload profile-specific resources */}
        {profile === 'jovem' && (
          <link rel="preload" href="/js/motion-core.js" as="script" />
        )}

        {profile === 'senior' && (
          <>
            <link rel="preload" href="/fonts/OpenDyslexic-Bold.woff2" as="font" crossOrigin="" />
            <link rel="preload" href="/css/high-contrast.css" as="style" />
          </>
        )}
      </head>
      <body className={`profile-${profile}`}>
        <ProfileProvider initialProfile={profile}>
          {children}
        </ProfileProvider>
      </body>
    </html>
  );
}
```

### Dynamic Component Loading Strategy

```typescript
// src/components/ProfileAwareComponent.tsx

import dynamic from 'next/dynamic';
import { useProfile } from '@/contexts/ProfileContext';

// Lazy load profile-specific components
const FamiliarHeader = dynamic(() => import('@/components/headers/FamiliarHeader'));
const JovemHeader = dynamic(() => import('@/components/headers/JovemHeader'));
const SeniorHeader = dynamic(() => import('@/components/headers/SeniorHeader'));

export function ProfileAwareHeader() {
  const { profile } = useProfile();

  // Only load the component for the active profile
  switch (profile) {
    case 'jovem':
      return <JovemHeader />;
    case 'senior':
      return <SeniorHeader />;
    default:
      return <FamiliarHeader />;
  }
}
```

### Next.js Config for Profile-Based Splitting

```javascript
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better code splitting
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      'lucide-react',
    ],
  },

  webpack: (config, { dev, isServer }) => {
    if (!isServer && !dev) {
      // Advanced chunking strategy for profiles
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // React Core (shared)
          reactCore: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            name: 'react-core',
            priority: 100,
            reuseExistingChunk: true,
          },

          // Next.js Framework
          nextFramework: {
            test: /[\\/]node_modules[\\/]next[\\/]/,
            name: 'next-framework',
            priority: 90,
            reuseExistingChunk: true,
          },

          // Radix UI (split by component)
          radixDialog: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]react-dialog[\\/]/,
            name: 'radix-dialog',
            priority: 80,
          },
          radixDropdown: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]react-dropdown-menu[\\/]/,
            name: 'radix-dropdown',
            priority: 80,
          },

          // Framer Motion (Jovem profile only)
          motion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'profile-motion',
            priority: 70,
            reuseExistingChunk: true,
          },

          // Icons (tree-shake aggressively)
          icons: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'icons',
            priority: 60,
            minChunks: 2,
          },

          // Accessibility Libraries (Sênior profile)
          a11y: {
            test: /[\\/]node_modules[\\/](react-aria|@react-aria|@react-stately)[\\/]/,
            name: 'profile-a11y',
            priority: 70,
          },

          // Date utilities
          dateUtils: {
            test: /[\\/]node_modules[\\/]dayjs[\\/]/,
            name: 'date-utils',
            priority: 60,
          },

          // Common vendors
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor-common',
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },

  // Compress output
  compress: true,
  productionBrowserSourceMaps: false,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },
};

module.exports = nextConfig;
```

### Bundle Analysis Script

```bash
# Add to package.json scripts

"analyze": "ANALYZE=true next build",
"analyze:familiar": "PROFILE=familiar npm run analyze",
"analyze:jovem": "PROFILE=jovem npm run analyze",
"analyze:senior": "PROFILE=senior npm run analyze"
```

```javascript
// scripts/analyze-bundles.js

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = function withBundleAnalyzer(nextConfig = {}) {
  return {
    ...nextConfig,
    webpack(config, options) {
      if (process.env.ANALYZE === 'true') {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: options.isServer
              ? `../analyze/server-${process.env.PROFILE || 'all'}.html`
              : `../analyze/client-${process.env.PROFILE || 'all'}.html`,
            openAnalyzer: false,
            generateStatsFile: true,
            statsFilename: options.isServer
              ? `../analyze/server-stats-${process.env.PROFILE || 'all'}.json`
              : `../analyze/client-stats-${process.env.PROFILE || 'all'}.json`,
          })
        );
      }

      return typeof nextConfig.webpack === 'function'
        ? nextConfig.webpack(config, options)
        : config;
    },
  };
};
```

---

## ⚡ Otimizações de Performance

### 1. Image Optimization

```typescript
// src/components/OptimizedImage.tsx

import Image from 'next/image';
import { useProfile } from '@/contexts/ProfileContext';

interface OptimizedImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

export function OptimizedImage({
  src,
  alt,
  priority = false,
  width = 1200,
  height = 800,
}: OptimizedImageProps) {
  const { profile } = useProfile();

  // Sênior profile: Reduce image quality for faster loading
  const quality = profile === 'senior' ? 60 : 85;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      quality={quality}
      priority={priority}
      placeholder="blur"
      blurDataURL={getBlurDataURL(src)}
      loading={priority ? 'eager' : 'lazy'}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      style={{
        maxWidth: '100%',
        height: 'auto',
      }}
    />
  );
}

// Generate blur placeholder
function getBlurDataURL(src: string): string {
  // Use a service or generate at build time
  return `data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`;
}

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="#f0f0f0"/>
</svg>
`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);
```

### 2. Font Optimization

```typescript
// src/app/layout.tsx - Font Loading Strategy

import { Inter, Open_Sans } from 'next/font/google';
import localFont from 'next/font/local';

// Standard font (Familiar + Jovem)
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

// Accessible font (Sênior profile)
const openDyslexic = localFont({
  src: [
    {
      path: '../fonts/OpenDyslexic-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/OpenDyslexic-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-accessible',
  display: 'swap',
  preload: false, // Only load when Sênior profile is active
});

export default function RootLayout({ children, profile }: Props) {
  const fontClass = profile === 'senior'
    ? openDyslexic.variable
    : inter.variable;

  return (
    <html lang="pt-BR" className={fontClass}>
      <body>{children}</body>
    </html>
  );
}
```

### 3. Critical CSS Extraction

```typescript
// src/lib/critical-css.ts

export function getCriticalCSS(profile: UserProfile): string {
  const base = `
    /* Reset & Base Styles */
    *,::before,::after{box-sizing:border-box;border:0 solid}
    html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:var(--font-inter)}
    body{margin:0;line-height:inherit}

    /* Profile-specific critical styles */
  `;

  const profileStyles = {
    familiar: `
      .hero-section{min-height:60vh;display:flex;align-items:center}
      .cta-button{background:#1E4D4C;color:#fff;padding:1rem 2rem}
    `,
    jovem: `
      .hero-section{min-height:80vh;display:grid;place-items:center}
      .animated-gradient{background:linear-gradient(45deg,#1E4D4C,#2C5F5B)}
      .glassmorphism{backdrop-filter:blur(10px);background:rgba(255,255,255,0.7)}
    `,
    senior: `
      :root{font-size:20px}
      body{line-height:1.8}
      .high-contrast{background:#000;color:#FFFF00}
      button{min-height:48px;min-width:48px;font-size:1.2rem}
      a{text-decoration:underline;font-weight:700}
    `,
  };

  return base + (profileStyles[profile] || profileStyles.familiar);
}
```

### 4. Component-Level Optimizations

```typescript
// src/components/PerformantCard.tsx

import { memo, useMemo } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import dynamic from 'next/dynamic';

// Lazy load animations for Jovem profile
const MotionDiv = dynamic(() =>
  import('framer-motion').then(mod => mod.motion.div),
  { ssr: false }
);

interface CardProps {
  title: string;
  description: string;
  image?: string;
}

export const PerformantCard = memo(function PerformantCard({
  title,
  description,
  image,
}: CardProps) {
  const { profile } = useProfile();

  // Memoize expensive calculations
  const cardStyles = useMemo(() => ({
    padding: profile === 'senior' ? '2rem' : '1.5rem',
    fontSize: profile === 'senior' ? '1.2rem' : '1rem',
  }), [profile]);

  // Conditional rendering based on profile
  if (profile === 'jovem') {
    return (
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={cardStyles}
        className="card-jovem"
      >
        <h3>{title}</h3>
        <p>{description}</p>
        {image && <img src={image} alt={title} loading="lazy" />}
      </MotionDiv>
    );
  }

  // Static rendering for Familiar and Sênior
  return (
    <div style={cardStyles} className={`card-${profile}`}>
      <h3>{title}</h3>
      <p>{description}</p>
      {image && <img src={image} alt={title} loading="lazy" />}
    </div>
  );
});
```

### 5. Prefetching Strategy

```typescript
// src/components/NavigationWithPrefetch.tsx

'use client';

import Link from 'next/link';
import { useProfile } from '@/contexts/ProfileContext';

export function NavigationWithPrefetch() {
  const { profile } = useProfile();

  return (
    <nav>
      {/* Critical routes: Always prefetch */}
      <Link href="/" prefetch={true}>Home</Link>
      <Link href="/servicos" prefetch={true}>Serviços</Link>

      {/* Secondary routes: Prefetch on hover (default) */}
      <Link href="/sobre">Sobre</Link>
      <Link href="/blog">Blog</Link>

      {/* Heavy routes: Disable prefetch for Sênior profile */}
      <Link
        href="/podcast"
        prefetch={profile !== 'senior'}
      >
        Podcast
      </Link>
    </nav>
  );
}
```

---

## 🔄 Lazy Loading e Prefetching

### Route-Level Code Splitting

```typescript
// src/app/page.tsx - Home Page

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Above-fold components (critical)
import Hero from '@/components/Hero';
import ServicesPreview from '@/components/ServicesPreview';

// Below-fold components (lazy loaded)
const GoogleReviews = dynamic(() => import('@/components/GoogleReviews'), {
  loading: () => <div className="skeleton-reviews" />,
  ssr: false, // Client-side only
});

const BlogLatest = dynamic(() => import('@/components/BlogLatest'), {
  loading: () => <div className="skeleton-blog" />,
});

const Footer = dynamic(() => import('@/components/Footer'), {
  loading: () => null,
});

export default function HomePage() {
  return (
    <>
      {/* Critical, rendered immediately */}
      <Hero />
      <ServicesPreview />

      {/* Below fold, lazy loaded */}
      <Suspense fallback={<div className="skeleton-reviews" />}>
        <GoogleReviews />
      </Suspense>

      <Suspense fallback={<div className="skeleton-blog" />}>
        <BlogLatest />
      </Suspense>

      <Footer />
    </>
  );
}
```

### Component-Level Lazy Loading

```typescript
// src/components/ProfileAwareModal.tsx

import dynamic from 'next/dynamic';
import { useProfile } from '@/contexts/ProfileContext';

// Lazy load different modal implementations
const FamiliarModal = dynamic(() => import('./modals/FamiliarModal'));
const JovemModal = dynamic(() => import('./modals/JovemModal'));
const SeniorModal = dynamic(() => import('./modals/SeniorModal'));

export function ProfileAwareModal({ isOpen, onClose, children }: Props) {
  const { profile } = useProfile();

  if (!isOpen) return null;

  const ModalComponent = {
    familiar: FamiliarModal,
    jovem: JovemModal,
    senior: SeniorModal,
  }[profile];

  return <ModalComponent onClose={onClose}>{children}</ModalComponent>;
}
```

### Intersection Observer for Lazy Rendering

```typescript
// src/hooks/useIntersectionObserver.ts

import { useEffect, useRef, useState } from 'react';

export function useIntersectionObserver(options?: IntersectionObserverInit) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          // Once loaded, stop observing
          if (targetRef.current) {
            observer.unobserve(targetRef.current);
          }
        }
      },
      { threshold: 0.1, ...options }
    );

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return { targetRef, isIntersecting };
}

// Usage
export function LazySection({ children }: { children: React.ReactNode }) {
  const { targetRef, isIntersecting } = useIntersectionObserver();

  return (
    <div ref={targetRef}>
      {isIntersecting ? children : <div className="skeleton" />}
    </div>
  );
}
```

---

## 📈 Monitoramento e Métricas

### Web Vitals Tracking

```typescript
// src/app/web-vitals.tsx

'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { useProfile } from '@/contexts/ProfileContext';

export function WebVitals() {
  const { profile } = useProfile();

  useReportWebVitals((metric) => {
    // Send to analytics with profile context
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(
          metric.name === 'CLS' ? metric.value * 1000 : metric.value
        ),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
        profile, // Track by user profile
      });
    }

    // Also send to PostHog
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('web_vitals', {
        metric_name: metric.name,
        value: metric.value,
        profile,
        url: window.location.pathname,
      });
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${profile}] ${metric.name}:`, metric.value);
    }
  });

  return null;
}
```

### Performance Monitoring Dashboard

```typescript
// src/lib/performance-monitor.ts

export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  measure(name: string, fn: () => void | Promise<void>) {
    const start = performance.now();
    const result = fn();

    if (result instanceof Promise) {
      return result.finally(() => {
        this.recordMetric(name, performance.now() - start);
      });
    }

    this.recordMetric(name, performance.now() - start);
    return result;
  }

  private recordMetric(name: string, duration: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
  }

  getMetrics() {
    const summary: Record<string, any> = {};

    this.metrics.forEach((values, name) => {
      summary[name] = {
        count: values.length,
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        p50: this.percentile(values, 50),
        p95: this.percentile(values, 95),
        p99: this.percentile(values, 99),
      };
    });

    return summary;
  }

  private percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((sorted.length * p) / 100) - 1;
    return sorted[index];
  }

  reset() {
    this.metrics.clear();
  }
}

export const perfMonitor = new PerformanceMonitor();
```

### Real User Monitoring (RUM)

```typescript
// src/app/layout.tsx - Add RUM script

export default function RootLayout({ children }: Props) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Real User Monitoring */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.RUM_CONFIG = {
                sampleRate: 0.1, // Sample 10% of users
                trackWebVitals: true,
                trackNavigation: true,
                trackResources: true,
              };
            `,
          }}
        />
      </head>
      <body>
        {children}
        <WebVitals />
      </body>
    </html>
  );
}
```

---

## ✅ Checklist de Implementação

### Bundle Optimization

- [ ] Implement profile-based code splitting in next.config.js
- [ ] Configure webpack optimizations for each profile
- [ ] Set up bundle analyzer for all three profiles
- [ ] Analyze and optimize each chunk to meet size targets
- [ ] Remove unused dependencies and tree-shake libraries
- [ ] Optimize icon imports (use direct imports from lucide-react)
- [ ] Configure proper lazy loading for framer-motion (Jovem only)
- [ ] Test bundle sizes: Familiar < 180KB, Jovem < 195KB, Sênior < 165KB

### Image Optimization

- [ ] Migrate all img tags to Next.js Image component
- [ ] Generate blur placeholders for all images
- [ ] Configure AVIF/WebP formats in next.config.js
- [ ] Set up proper sizing and responsive images
- [ ] Add priority loading for LCP images
- [ ] Implement lazy loading for below-fold images
- [ ] Optimize quality settings per profile
- [ ] Test image loading performance

### Font Optimization

- [ ] Configure next/font/google for standard fonts
- [ ] Set up custom font loading for Sênior profile
- [ ] Implement font-display: swap for all fonts
- [ ] Preload critical fonts in layout
- [ ] Test font loading performance (no FOIT/FOUT)
- [ ] Measure CLS impact of font loading

### Code Splitting

- [ ] Implement dynamic imports for below-fold components
- [ ] Set up Suspense boundaries for async components
- [ ] Configure prefetching strategy per profile
- [ ] Lazy load analytics and third-party scripts
- [ ] Split profile-specific components
- [ ] Test route transitions performance (< 200ms)

### Performance Monitoring

- [ ] Set up Web Vitals tracking
- [ ] Configure Real User Monitoring (RUM)
- [ ] Implement performance monitoring dashboard
- [ ] Set up alerts for performance regressions
- [ ] Create Lighthouse CI workflow
- [ ] Test in production with real users (A/B test if possible)

### Testing

- [ ] Run Lighthouse audits for all three profiles
- [ ] Test on slow 3G network (DevTools throttling)
- [ ] Test on low-end devices (mobile emulation)
- [ ] Verify Core Web Vitals targets are met
- [ ] Test route transitions timing
- [ ] Measure bundle sizes after build
- [ ] Verify no performance regressions vs current Vite app

---

**Próximo Documento**: [Accessibility Optimization Plan](./ACCESSIBILITY_OPTIMIZATION_PLAN.md)

**Última Atualização**: Outubro 2025
**Autor**: Equipe Saraiva Vision
**Status**: Em Planejamento
