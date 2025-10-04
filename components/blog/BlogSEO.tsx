/**
 * BlogSEO Component - Next.js 15 Migration
 *
 * Optimized SEO component for blog posts with Article schema
 *
 * @features
 * - Complete meta tags (title, description, keywords)
 * - Open Graph for social media sharing
 * - Twitter Cards optimization
 * - Schema.org BlogPosting with medical author
 * - Breadcrumbs Schema integration
 * - Canonical URLs and image optimization
 * - Server component support with Next.js Metadata API
 *
 * @usage
 * ```tsx
 * // Server Component with Metadata API (recommended)
 * import { generateBlogMetadata } from '@/components/blog/BlogSEO';
 *
 * export async function generateMetadata({ params }) {
 *   const post = await getPost(params.slug);
 *   return generateBlogMetadata(post);
 * }
 *
 * // Client Component with BlogSEO
 * import BlogSEO from '@/components/blog/BlogSEO';
 * <BlogSEO post={post} />
 * ```
 */

import React from 'react';
import Script from 'next/script';
import type { Metadata } from 'next';
import type { BlogSEOProps, BlogPostSEO, SchemaOrgBlogPosting, SchemaOrgBreadcrumbList } from '@/types/seo';

const BASE_URL = 'https://saraivavision.com.br';

/**
 * Generate optimized meta description
 */
function generateMetaDescription(post: BlogPostSEO): string {
  if (post.seo?.metaDescription) {
    return post.seo.metaDescription;
  }

  if (post.excerpt) {
    const truncated = post.excerpt.substring(0, 155);
    return truncated.length < post.excerpt.length ? `${truncated}...` : truncated;
  }

  return `Artigo sobre ${post.title} por Dr. Philipe Saraiva - Saraiva Vision, Caratinga MG.`;
}

/**
 * Generate optimized meta title
 */
function generateMetaTitle(post: BlogPostSEO): string {
  if (post.seo?.metaTitle) {
    return post.seo.metaTitle;
  }

  const maxLength = 50;
  if (post.title.length <= maxLength) {
    return `${post.title} | Saraiva Vision`;
  }

  return `${post.title.substring(0, maxLength)}... | Saraiva Vision`;
}

/**
 * Generate BlogPosting Schema
 */
function generateBlogPostingSchema(post: BlogPostSEO): SchemaOrgBlogPosting {
  const postUrl = `${BASE_URL}/blog/${post.slug}`;
  const metaDescription = generateMetaDescription(post);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || metaDescription,
    image: {
      '@type': 'ImageObject',
      url: post.coverImage,
      width: 1920,
      height: 1080
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'Dr. Philipe Saraiva',
      url: `${BASE_URL}/sobre`,
      jobTitle: post.author?.title || 'Oftalmologista',
      worksFor: {
        '@type': 'Organization',
        name: 'Saraiva Vision',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Rua Coronel Celestino, 07',
          postalCode: '35300-000',
          addressLocality: 'Caratinga',
          addressRegion: 'MG',
          addressCountry: 'BR'
        }
      }
    },
    publisher: {
      '@type': 'Organization',
      name: 'Saraiva Vision',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
        width: 600,
        height: 60
      },
      url: BASE_URL,
      // @ts-ignore - contactPoint not in strict type but valid
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+55-33-99860-1427',
        contactType: 'customer service',
        areaServed: 'BR',
        availableLanguage: 'Portuguese'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl
    },
    articleSection: post.category,
    keywords: post.tags?.join(', ') || post.category,
    wordCount: post.wordCount || 1000,
    timeRequired: `PT${post.readTime || 5}M`,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true
  };
}

/**
 * Generate Breadcrumbs Schema
 */
function generateBreadcrumbsSchema(post: BlogPostSEO): SchemaOrgBreadcrumbList {
  const postUrl = `${BASE_URL}/blog/${post.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Início',
        item: BASE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${BASE_URL}/blog`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.category,
        item: `${BASE_URL}/blog?category=${encodeURIComponent(post.category)}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: post.title,
        item: postUrl
      }
    ]
  };
}

/**
 * Generate optimized OG image URL
 */
function generateOgImage(post: BlogPostSEO): string {
  if (!post.coverImage) {
    return `${BASE_URL}/og-default.jpg`;
  }

  // If already has query params, append to them
  if (post.coverImage.includes('?')) {
    return `${post.coverImage}&w=1200&h=630&fit=crop`;
  }

  return `${post.coverImage}?w=1200&h=630&fit=crop`;
}

/**
 * Server Component (Default)
 * Use this for client-side rendered blog posts
 */
export default function BlogSEO({ post }: BlogSEOProps) {
  const postUrl = `${BASE_URL}/blog/${post.slug}`;
  const metaTitle = generateMetaTitle(post);
  const metaDescription = generateMetaDescription(post);
  const ogImage = generateOgImage(post);
  const blogPostingSchema = generateBlogPostingSchema(post);
  const breadcrumbsSchema = generateBreadcrumbsSchema(post);

  return (
    <>
      {/* BlogPosting Schema */}
      <Script
        id={`blog-posting-schema-${post.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostingSchema, null, 0)
        }}
        strategy="beforeInteractive"
      />

      {/* Breadcrumbs Schema */}
      <Script
        id={`breadcrumbs-schema-${post.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbsSchema, null, 0)
        }}
        strategy="beforeInteractive"
      />
    </>
  );
}

/**
 * Generate Next.js Metadata for Server Components
 * Use this in page.tsx with generateMetadata function
 */
export function generateBlogMetadata(post: BlogPostSEO): Metadata {
  const postUrl = `${BASE_URL}/blog/${post.slug}`;
  const metaTitle = generateMetaTitle(post);
  const metaDescription = generateMetaDescription(post);
  const ogImage = generateOgImage(post);

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: post.tags?.join(', '),
    authors: [{ name: post.author?.name || 'Dr. Philipe Saraiva' }],
    openGraph: {
      type: 'article',
      url: postUrl,
      title: metaTitle,
      description: metaDescription,
      siteName: 'Saraiva Vision - Oftalmologia Caratinga MG',
      locale: 'pt_BR',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: metaTitle
        }
      ],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author?.name || 'Dr. Philipe Saraiva'],
      section: post.category,
      tags: post.tags
    },
    twitter: {
      card: 'summary_large_image',
      site: '@saraivavision',
      creator: '@saraivavision',
      title: metaTitle,
      description: metaDescription,
      images: [ogImage]
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    },
    alternates: {
      canonical: postUrl
    },
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': 'Saraiva Vision'
    }
  };
}

/**
 * Generate schemas as JSON strings
 * Useful for API routes or custom implementations
 */
export function generateBlogSchemas(post: BlogPostSEO): {
  blogPosting: string;
  breadcrumbs: string;
} {
  return {
    blogPosting: JSON.stringify(generateBlogPostingSchema(post), null, 0),
    breadcrumbs: JSON.stringify(generateBreadcrumbsSchema(post), null, 0)
  };
}

/**
 * Get schema objects for programmatic use
 */
export function getBlogSchemaObjects(post: BlogPostSEO): {
  blogPosting: SchemaOrgBlogPosting;
  breadcrumbs: SchemaOrgBreadcrumbList;
} {
  return {
    blogPosting: generateBlogPostingSchema(post),
    breadcrumbs: generateBreadcrumbsSchema(post)
  };
}

/**
 * Export named component for compatibility
 */
export { BlogSEO };
