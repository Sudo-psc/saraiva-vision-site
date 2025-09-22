# Next.js Migration Quick Start Guide

## Prerequisites

Before starting the migration, ensure you have:

- Node.js 18+ installed
- Access to WordPress admin dashboard
- Vercel account for deployment
- Git repository access
- Existing WordPress content exported/backup

## Step 1: Setup Next.js Project

### 1.1 Create Next.js Project
```bash
npx create-next-app@latest saraiva-vision-frontend --typescript --tailwind --app
cd saraiva-vision-frontend
```

### 1.2 Install Additional Dependencies
```bash
npm install next-sitemap schema-dts @heroicons/react
npm install -D @types/node @types/react @types/react-dom
```

### 1.3 Project Structure Setup
```
saraiva-vision-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (pages)/           # Page groups
│   │   ├── api/              # API routes
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── sitemap.ts        # Sitemap generation
│   ├── components/           # React components
│   │   ├── layout/           # Layout components
│   │   ├── ui/              # UI components
│   │   └── seo/             # SEO components
│   ├── lib/                 # Utility functions
│   │   ├── api/             # API helpers
│   │   ├── seo/             # SEO utilities
│   │   └── wordpress/       # WordPress integration
│   ├── types/               # TypeScript types
│   └── styles/              # Style modules
├── public/                  # Static assets
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## Step 2: Basic Configuration

### 2.1 Next.js Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['saraivavision.com.br', 'www.saraivavision.com.br'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://saraivavision.com.br/wp-json/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 2.2 Environment Variables
```bash
# .env.local
WORDPRESS_API_URL=https://saraivavision.com.br/wp-json
WORDPRESS_USERNAME=your_username
WORDPRESS_PASSWORD=your_application_password
SITE_URL=https://saraivavision.com.br
NEXT_PUBLIC_SITE_URL=https://saraivavision.com.br
```

### 2.3 Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

## Step 3: WordPress Integration

### 3.1 WordPress API Client
```typescript
// src/lib/wordpress/client.ts
interface WordPressPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  date: string;
  modified: string;
  _embedded?: {
    author: Array<{ name: string; avatar_urls: { [key: string]: string } }>;
    'wp:featuredmedia': Array<{
      source_url: string;
      media_details: { width: number; height: number };
      alt_text: string;
    }>;
    'wp:term': Array<Array<{ name: string; slug: string }>>;
  };
}

class WordPressClient {
  private baseUrl: string;
  private auth: string;

  constructor(baseUrl: string, username: string, password: string) {
    this.baseUrl = baseUrl;
    this.auth = Buffer.from(`${username}:${password}`).toString('base64');
  }

  private async request(endpoint: string, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getPosts(params = {}) {
    return this.request('/wp/v2/posts', {
      _embed: true,
      ...params,
    });
  }

  async getPost(slug: string) {
    const posts = await this.request('/wp/v2/posts', {
      slug,
      _embed: true,
    });
    return posts[0];
  }

  async getPages() {
    return this.request('/wp/v2/pages', {
      _embed: true,
    });
  }

  async getPage(slug: string) {
    const pages = await this.request('/wp/v2/pages', {
      slug,
      _embed: true,
    });
    return pages[0];
  }
}

export const wordpressClient = new WordPressClient(
  process.env.WORDPRESS_API_URL!,
  process.env.WORDPRESS_USERNAME!,
  process.env.WORDPRESS_PASSWORD!
);
```

## Step 4: SEO Implementation

### 4.1 SEO Metadata Component
```typescript
// src/components/seo/Metadata.tsx
import { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

export function generateSEOMetadata(props: SEOProps): Metadata {
  const {
    title = 'Saraiva Vision - Clínica Oftalmológica',
    description = 'Especializada em cirurgia de catarata, glaucoma e tratamento de retina',
    keywords = ['oftalmologia', 'catarata', 'glaucoma', 'retina'],
    ogImage = `${process.env.NEXT_PUBLIC_SITE_URL}/images/og-default.jpg`,
    canonicalUrl,
    noIndex = false,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
  } = props;

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
      publishedTime,
      modifiedTime,
      authors: author ? [author] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  };

  if (canonicalUrl) {
    metadata.alternates = {
      canonical: canonicalUrl,
    };
  }

  return metadata;
}
```

### 4.2 Structured Data Component
```typescript
// src/components/seo/StructuredData.tsx
interface StructuredDataProps {
  data: Record<string, any>;
  type: string;
}

export function StructuredData({ data, type }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
```

### 4.3 Sitemap Configuration
```typescript
// next-sitemap.config.js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://saraivavision.com.br',
  generateRobotsTxt: true,
  exclude: ['/admin', '/api/*'],
  robotsTxtOptions: {
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
    ],
  },
  // Default transformation function
  transform: async (config, path) => {
    // Custom transformation logic if needed
    return {
      loc: path,
      changefreq: 'weekly',
      priority: path === '/' ? 1.0 : 0.7,
      lastmod: new Date().toISOString(),
    };
  },
};
```

## Step 5: Page Migration

### 5.1 Home Page
```typescript
// src/app/(pages)/page.tsx
import { wordpressClient } from '@/lib/wordpress/client';
import { generateSEOMetadata } from '@/components/seo/Metadata';
import { StructuredData } from '@/components/seo/StructuredData';

export const metadata = generateSEOMetadata({
  title: 'Saraiva Vision - Clínica Oftalmológica',
  description: 'Especializada em cirurgia de catarata, glaucoma e tratamento de retina em Brasília',
});

async function getHomePageData() {
  try {
    const [posts, services, page] = await Promise.all([
      wordpressClient.getPosts({ per_page: 3 }),
      wordpressClient.getPosts({ categories: 'services', per_page: 6 }),
      wordpressClient.getPage('home'),
    ]);

    return { posts, services, page };
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return { posts: [], services: [], page: null };
  }
}

const organizationStructuredData = {
  name: 'Saraiva Vision',
  url: 'https://saraivavision.com.br',
  logo: 'https://saraivavision.com.br/images/logo.png',
  description: 'Clínica oftalmológica especializada em cirurgia de catarata, glaucoma e retina',
  address: {
    streetAddress: 'SCS Qd 02 Bl A Ed Sarah Loja 103',
    addressLocality: 'Brasília',
    addressRegion: 'DF',
    postalCode: '70300-500',
    addressCountry: 'BR',
  },
  contactPoint: {
    telephone: '+55-61-3326-2020',
    contactType: 'customer service',
  },
};

export default async function HomePage() {
  const { posts, services, page } = await getHomePageData();

  return (
    <>
      <StructuredData data={organizationStructuredData} type="MedicalOrganization" />

      <main>
        {/* Hero Section */}
        <section className="bg-primary-600 text-white py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">
              Visão Clara, Vida Melhor
            </h1>
            <p className="text-xl mb-8">
              Especialistas em cirurgia de catarata, glaucoma e tratamento de retina
            </p>
            <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Agende sua Consulta
            </button>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nossos Serviços</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service: any) => (
                <div key={service.id} className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-3">{service.title.rendered}</h3>
                  <p
                    className="text-gray-600 mb-4"
                    dangerouslySetInnerHTML={{ __html: service.excerpt.rendered }}
                  />
                  <a
                    href={`/servicos/${service.slug}`}
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Saiba mais →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Últimas Notícias</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {posts.map((post: any) => (
                <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {post._embedded?.['wp:featuredmedia']?.[0] && (
                    <img
                      src={post._embedded['wp:featuredmedia'][0].source_url}
                      alt={post._embedded['wp:featuredmedia'][0].alt_text}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{post.title.rendered}</h3>
                    <p
                      className="text-gray-600 mb-4"
                      dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                    />
                    <a
                      href={`/blog/${post.slug}`}
                      className="text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      Ler mais →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
```

## Step 6: Testing and Validation

### 6.1 Run Development Server
```bash
npm run dev
```

### 6.2 Build for Production
```bash
npm run build
```

### 6.3 Test SEO Features
1. Check page source for meta tags
2. Validate structured data using Google's tool
3. Test sitemap generation
4. Verify social media sharing

### 6.4 Performance Testing
```bash
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

## Step 7: Deployment

### 7.1 Push to GitHub
```bash
git add .
git commit -m "feat: initial Next.js migration with SEO features"
git push origin main
```

### 7.2 Deploy to Vercel
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically

### 7.3 Post-Deployment Checks
1. Test all pages and functionality
2. Verify SEO metadata is working
3. Check Google Search Console indexing
4. Monitor Core Web Vitals

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure WordPress API is accessible
2. **Build Failures**: Check TypeScript types and imports
3. **Missing Styles**: Verify Tailwind configuration
4. **SEO Metadata**: Check environment variables

### Getting Help
- Next.js Documentation: https://nextjs.org/docs
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- WordPress REST API: https://developer.wordpress.org/rest-api/

## Next Steps

After completing this quick start:
1. Migrate all existing pages
2. Implement contact forms
3. Add appointment booking system
4. Set up analytics and monitoring
5. Optimize performance further

This quick start guide provides the foundation for your Next.js migration with dynamic SEO capabilities.