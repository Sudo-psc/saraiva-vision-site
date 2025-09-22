# Data Model: Next.js Migration with Dynamic SEO

## Entity Overview

### 1. Page Metadata
```typescript
interface PageMetadata {
  id: string
  title: string
  description: string
  keywords: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  canonicalUrl?: string
  noIndex?: boolean
  locale: 'pt-BR' | 'en-US'
  type: 'website' | 'article' | 'service'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
}
```

### 2. Service Page
```typescript
interface ServicePage {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string
  featuredImage?: {
    url: string
    alt: string
    width: number
    height: number
  }
  metadata: PageMetadata
  structuredData: MedicalServiceSchema
  category: ServiceCategory
  price?: string
  duration?: string
  requirements?: string[]
  relatedServices: string[]
  createdAt: string
  updatedAt: string
}
```

### 3. Blog Post
```typescript
interface BlogPost {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string
  featuredImage?: {
    url: string
    alt: string
    width: number
    height: number
  }
  metadata: PageMetadata
  structuredData: ArticleSchema
  author: {
    name: string
    bio?: string
    avatar?: string
  }
  categories: BlogCategory[]
  tags: string[]
  publishedAt: string
  modifiedAt?: string
  readTime: number
}
```

### 4. SEO Configuration
```typescript
interface SEOConfig {
  siteName: string
  siteUrl: string
  defaultLocale: 'pt-BR' | 'en-US'
  locales: string[]
  defaultMetadata: {
    title: string
    description: string
    ogImage: string
    twitterHandle?: string
  }
  robots: {
    userAgent: string
    allow: string[]
    disallow: string[]
    sitemap: string
  }
  structuredData: {
    organization: OrganizationSchema
    website: WebsiteSchema
  }
}
```

### 5. Structured Data Schemas

#### Medical Service Schema
```typescript
interface MedicalServiceSchema {
  '@context': 'https://schema.org'
  '@type': 'MedicalService'
  name: string
  description: string
  provider: {
    '@type': 'MedicalOrganization'
    name: string
    address: AddressSchema
  }
  availableTest?: string[]
  medicalSpecialty: string
  availableIn: string
  areaServed: string
}
```

#### Article Schema
```typescript
interface ArticleSchema {
  '@context': 'https://schema.org'
  '@type': 'Article'
  headline: string
  description: string
  image: string
  author: {
    '@type': 'Person'
    name: string
  }
  publisher: {
    '@type': 'Organization'
    name: string
    logo: string
  }
  datePublished: string
  dateModified?: string
}
```

#### Organization Schema
```typescript
interface OrganizationSchema {
  '@context': 'https://schema.org'
  '@type': 'MedicalOrganization'
  name: string
  url: string
  logo: string
  description: string
  address: AddressSchema
  contactPoint: {
    '@type': 'ContactPoint'
    telephone: string
    contactType: 'customer service'
  }
  sameAs: string[]
}
```

#### Address Schema
```typescript
interface AddressSchema {
  '@context': 'https://schema.org'
  '@type': 'PostalAddress'
  streetAddress: string
  addressLocality: string
  addressRegion: string
  postalCode: string
  addressCountry: string
}
```

### 6. Sitemap Configuration
```typescript
interface SitemapConfig {
  siteUrl: string
  exclude: string[]
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
  autoLastmod: boolean
  transform: (config: SitemapConfig) => Promise<SitemapConfig>
}
```

### 7. Route Configuration
```typescript
interface RouteConfig {
  [key: string]: {
    component: string
    metadata?: PageMetadata
    staticProps?: boolean
    revalidate?: number
    generateStaticParams?: boolean
  }
}
```

## Data Relationships

### Page Metadata Flow
```
WordPress Post/Page → Content Processing → Metadata Generation → SEO Output
```

### Service Page Flow
```
WordPress Service → ServicePage Entity → Structured Data → SEO Enhancement
```

### Blog Post Flow
```
WordPress Post → BlogPost Entity → Article Schema → Social Sharing
```

## Validation Rules

### Metadata Validation
- Title length: 50-60 characters
- Description length: 150-160 characters
- Image minimum dimensions: 1200x630px
- URL format: lowercase with hyphens
- Required fields: title, description, type

### Structured Data Validation
- Must pass Google Structured Data Testing Tool
- All required fields must be present
- Nested objects must be properly formatted
- Dates must be ISO 8601 format

### Content Validation
- HTML content must be sanitized
- Images must have alt text
- Internal links must be valid
- Headings must follow proper hierarchy (H1 > H2 > H3)

## State Transitions

### Content Publishing
```
Draft → Review → Approved → Published → Archived
```

### SEO Updates
```
Initial → Optimized → Validated → Published → Monitored
```

### Performance Monitoring
```
Baseline → Optimized → Validated → Monitored → Improved
```

## External Integrations

### WordPress REST API
- Posts: `/wp-json/wp/v2/posts`
- Pages: `/wp-json/wp/v2/pages`
- Media: `/wp-json/wp/v2/media`
- Categories: `/wp-json/wp/v2/categories`
- Tags: `/wp-json/wp/v2/tags`

### SEO Tools Integration
- Google Search Console API
- Google PageSpeed Insights API
- Lighthouse CI
- Web Vitals monitoring

## Data Security

### API Security
- All WordPress API calls must use authentication
- Environment variables for sensitive data
- Rate limiting for external API calls
- Input validation and sanitization

### Content Security
- XSS prevention in content rendering
- CSP headers implementation
- Secure image optimization
- Safe handling of user-generated content

## Performance Considerations

### Caching Strategy
- Static pages: Build-time caching
- Dynamic content: ISR with revalidation
- API responses: Redis caching
- Images: CDN optimization

### Data Fetching
- Static generation for SEO-critical pages
- Client-side fetching for dynamic content
- Parallel data fetching where possible
- Optimistic UI updates