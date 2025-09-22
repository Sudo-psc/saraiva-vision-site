# Next.js Features Implementation Plan

## Overview

This document outlines the implementation of Next.js specific features for the Saraiva Vision migration, focusing on Server-Side Rendering (SSR), API Routes, and file-based routing.

## 1. Server-Side Rendering (SSR) Strategy

### 1.1 Data Fetching Patterns

#### Server Components for Static Content
```tsx
// app/servicos/page.tsx
import { Metadata } from 'next';
import ServicesPageClient from './ServicesPageClient';

export const metadata: Metadata = {
  title: 'Serviços Oftalmológicos | Saraiva Vision',
  description: 'Conheça nossos serviços especializados em oftalmologia: catarata, glaucoma, retina e cirurgia refrativa.',
};

export default async function ServicesPage() {
  // Fetch services data at build time
  const services = await getServicesData();

  return <ServicesPageClient initialData={services} />;
}
```

#### Client Components for Interactive Features
```tsx
// app/servicos/ServicesPageClient.tsx
'use client';

import { useState } from 'react';

export default function ServicesPageClient({ initialData }) {
  const [services, setServices] = useState(initialData);
  const [filter, setFilter] = useState('');

  // Client-side filtering logic
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Filtrar serviços..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      {/* Render filtered services */}
    </div>
  );
}
```

### 1.2 SEO and Metadata Strategy

#### Dynamic Metadata Generation
```tsx
// app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: 'Post não encontrado',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return <BlogPostContent post={post} />;
}
```

#### Structured Data (JSON-LD)
```tsx
// app/components/StructuredData.tsx
import { Organization, MedicalBusiness } from 'schema-dts';

export default function StructuredData() {
  const organizationData: Organization = {
    '@type': 'Organization',
    name: 'Saraiva Vision',
    url: 'https://saraivavision.com.br',
    logo: 'https://saraivavision.com.br/images/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+55-11-99999-9999',
      contactType: 'customer service',
    },
  };

  const medicalBusinessData: MedicalBusiness = {
    '@type': 'MedicalBusiness',
    name: 'Saraiva Vision',
    medicalSpecialty: ['Ophthalmology'],
    availableService: [
      {
        '@type': 'MedicalProcedure',
        name: 'Catarata',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Glaucoma',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(medicalBusinessData),
        }}
      />
    </>
  );
}
```

## 2. API Routes Migration

### 2.1 Route Structure Conversion

#### Current Vercel API Structure → Next.js API Routes
```
api/contact/index.js → app/api/contact/route.ts
api/appointments/availability.js → app/api/appointments/availability/route.ts
api/podcast/episodes.js → app/api/podcast/episodes/route.ts
```

#### Handler Conversion Example
```typescript
// Current: api/contact/index.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { name, email, message } = req.body;

      // Process contact form
      await sendContactEmail({ name, email, message });

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Next.js: app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // Process contact form
    await sendContactEmail({ name, email, message });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 2.2 Middleware Implementation

#### Authentication Middleware
```typescript
// app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin-token');

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // API rate limiting
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Implement rate limiting logic
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
```

#### CORS and Security Headers
```typescript
// app/middleware.ts (continued)
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', 'https://saraivavision.com.br');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}
```

## 3. File-Based Routing Implementation

### 3.1 Static Routes
```tsx
// app/sobre/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Nós | Saraiva Vision',
  description: 'Conheça a história da Saraiva Vision e nossa equipe especializada em oftalmologia.',
};

export default function AboutPage() {
  return (
    <div>
      <h1>Sobre a Saraiva Vision</h1>
      {/* About content */}
    </div>
  );
}
```

### 3.2 Dynamic Routes
```tsx
// app/servicos/[serviceId]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: { serviceId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getServiceById(params.serviceId);

  if (!service) {
    return {
      title: 'Serviço não encontrado',
    };
  }

  return {
    title: `${service.name} | Saraiva Vision`,
    description: service.description,
  };
}

export async function generateStaticParams() {
  const services = await getAllServices();

  return services.map((service) => ({
    serviceId: service.id,
  }));
}

export default async function ServiceDetailPage({ params }: Props) {
  const service = await getServiceById(params.serviceId);

  if (!service) {
    notFound();
  }

  return <ServiceDetailContent service={service} />;
}
```

### 3.3 Catch-All Routes
```tsx
// app/admin/[[...slug]]/page.tsx
'use client';

import { usePathname } from 'next/navigation';
import AdminDashboard from '@/components/admin/Dashboard';
import AdminSettings from '@/components/admin/Settings';

export default function AdminPage() {
  const pathname = usePathname();

  // Extract slug from pathname
  const slug = pathname.replace('/admin', '').split('/').filter(Boolean);

  if (slug.length === 0) {
    return <AdminDashboard />;
  }

  if (slug[0] === 'settings') {
    return <AdminSettings />;
  }

  return <div>Admin page not found</div>;
}
```

### 3.4 Parallel Routes
```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  sidebar,
  content,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  content: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      {sidebar}
      <main>{content}</main>
      {children}
    </div>
  );
}

// app/dashboard/@sidebar/page.tsx
export default function Sidebar() {
  return (
    <aside>
      <nav>
        <ul>
          <li><a href="/dashboard">Overview</a></li>
          <li><a href="/dashboard/analytics">Analytics</a></li>
          <li><a href="/dashboard/settings">Settings</a></li>
        </ul>
      </nav>
    </aside>
  );
}

// app/dashboard/@content/page.tsx
export default function Content() {
  return (
    <div>
      <h1>Dashboard Content</h1>
      {/* Dashboard widgets */}
    </div>
  );
}
```

## 4. Performance Optimization Strategies

### 4.1 Image Optimization
```tsx
// app/components/OptimizedImage.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    />
  );
}
```

### 4.2 Streaming and Suspense
```tsx
// app/blog/page.tsx
import { Suspense } from 'react';
import BlogPostSkeleton from '@/components/BlogPostSkeleton';
import BlogPosts from '@/components/BlogPosts';

export default function BlogPage() {
  return (
    <div>
      <h1>Blog</h1>

      <Suspense fallback={<BlogPostSkeleton />}>
        <BlogPosts />
      </Suspense>
    </div>
  );
}

// app/components/BlogPosts.tsx
async function getBlogPosts() {
  const res = await fetch('https://api.example.com/posts');
  return res.json();
}

export default async function BlogPosts() {
  const posts = await getBlogPosts();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

### 4.3 Incremental Static Regeneration (ISR)
```tsx
// app/blog/[slug]/page.tsx
export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }) {
  const post = await getBlogPost(params.slug);

  return <BlogPostContent post={post} />;
}
```

## 5. Error Handling and Loading States

### 5.1 Error Boundaries
```tsx
// app/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="error-page">
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### 5.2 Loading States
```tsx
// app/loading.tsx
export default function Loading() {
  return (
    <div className="loading-page">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
}
```

### 5.3 404 Pages
```tsx
// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link href="/">Go back home</Link>
    </div>
  );
}
```

## 6. Deployment and Environment Configuration

### 6.1 Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.saraivavision.com.br
NEXT_PUBLIC_SITE_URL=https://saraivavision.com.br
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

### 6.2 Build Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment-specific configuration
  ...(process.env.NODE_ENV === 'production' && {
    // Production optimizations
    compress: true,
    poweredByHeader: false,
  }),

  // Image domains
  images: {
    domains: ['saraivavision.com.br', 'api.saraivavision.com.br'],
  },

  // Redirects and rewrites
  async redirects() {
    return [
      {
        source: '/old-route',
        destination: '/new-route',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
```

### 6.3 Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  },
  "regions": ["gru1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://saraivavision.com.br"
        }
      ]
    }
  ]
}
```

## 7. Migration Checklist

### Pre-Migration
- [ ] Analyze all current routes and components
- [ ] Identify client-side only code
- [ ] Plan data fetching strategies
- [ ] Set up Next.js project structure

### Migration Execution
- [ ] Convert static pages to App Router
- [ ] Migrate dynamic routes with proper params
- [ ] Convert API routes to new format
- [ ] Implement proper loading and error states
- [ ] Set up metadata and SEO

### Post-Migration
- [ ] Test all routes and functionality
- [ ] Verify SEO and performance
- [ ] Set up monitoring and analytics
- [ ] Plan rollback strategy if needed

## 8. Success Metrics

### Performance Targets
- **First Contentful Paint (FCP)**: < 1.5 seconds
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100 milliseconds

### SEO Targets
- Maintain or improve search rankings
- Proper structured data implementation
- Valid HTML and accessibility compliance

### User Experience Targets
- Zero downtime during migration
- Improved loading performance
- Better mobile experience
- Enhanced accessibility

This implementation plan provides a comprehensive roadmap for migrating to Next.js while maintaining all existing functionality and improving performance, SEO, and developer experience.