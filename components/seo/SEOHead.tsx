/**
 * SEOHead Component - Next.js 15 Migration
 *
 * Enhanced SEO component for comprehensive meta tags management
 * Supports Next.js 15 Metadata API with backwards compatibility for client components
 *
 * @features
 * - Complete meta tags (title, description, keywords)
 * - Open Graph protocol for social media
 * - Twitter Cards
 * - Hreflang for i18n
 * - Canonical URLs
 * - Medical practice specific meta tags
 * - Structured data injection
 * - Performance optimizations (preconnect, dns-prefetch)
 */

'use client';

import React, { useMemo } from 'react';
import Head from 'next/head';
import { clinicInfo } from '@/lib/clinicInfo';
import type { SEOHeadProps, HreflangTag, SchemaOrgType } from '@/types/seo';

const DEFAULT_BASE_URL = 'https://saraivavision.com.br';

/**
 * Resolve base URL from environment or browser
 */
const resolveBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/?$/, '');
  }

  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/?$/, '');
  }

  return DEFAULT_BASE_URL;
};

/**
 * Generate hreflang tags for multilingual support
 */
const generateHreflangs = (currentPath: string, baseUrl: string, currentLang: string): HreflangTag[] => {
  const hreflangs: HreflangTag[] = [];

  // Portuguese (default)
  const ptPath = currentPath.startsWith('/en')
    ? currentPath.replace('/en', '') || '/'
    : currentPath;

  hreflangs.push(
    { hreflang: 'pt-BR', href: `${baseUrl}${ptPath}` },
    { hreflang: 'pt', href: `${baseUrl}${ptPath}` }
  );

  // English
  const enPath = currentPath.startsWith('/en')
    ? currentPath
    : `/en${currentPath}`;

  hreflangs.push({ hreflang: 'en', href: `${baseUrl}${enPath}` });

  // Default hreflang
  hreflangs.push({ hreflang: 'x-default', href: `${baseUrl}${ptPath}` });

  return hreflangs;
};

/**
 * SEOHead Component
 * Use this for client components or pages that need dynamic SEO
 * For static pages, prefer using Next.js 15 Metadata API in page.tsx
 */
export default function SEOHead({
  title,
  description,
  image,
  keywords,
  ogType = 'website',
  noindex = false,
  canonicalPath = null,
  structuredData = null,
  alternateLanguages
}: SEOHeadProps) {
  const baseUrl = useMemo(() => resolveBaseUrl(), []);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const currentLang = 'pt'; // TODO: Get from i18n context when implemented

  // Validate and truncate title for SEO best practices (≤60 chars)
  const validatedTitle = useMemo(() => {
    if (!title) {
      return 'Oftalmologista Caratinga/MG | Dr. Philipe Saraiva CRM 69.870';
    }
    return title.length > 60 ? title.substring(0, 57) + '...' : title;
  }, [title]);

  // Validate and truncate description for SEO best practices (≤155 chars)
  const validatedDescription = useMemo(() => {
    const defaultDesc =
      'Clínica oftalmológica em Caratinga/MG: catarata, glaucoma, retina, lentes. Dr. Philipe Saraiva CRM-MG 69.870. Agende online ou WhatsApp!';
    const desc = description || defaultDesc;
    return desc.length > 155 ? desc.substring(0, 152) + '...' : desc;
  }, [description]);

  // Generate optimized image URL for social sharing (1200x630 for OpenGraph)
  const ogImage = useMemo(() => {
    if (image) return image;
    return `${baseUrl}/og-image-1200x630-optimized.jpg`;
  }, [image, baseUrl]);

  // Generate site name based on language
  const siteName = currentLang === 'pt'
    ? 'Saraiva Vision - Oftalmologia'
    : 'Saraiva Vision - Ophthalmology';

  // Generate hreflang URLs
  const hreflangs = useMemo(() =>
    alternateLanguages || generateHreflangs(currentPath, baseUrl, currentLang),
    [currentPath, baseUrl, currentLang, alternateLanguages]
  );

  // Normalize canonical URL
  const normalizedCanonicalPath = canonicalPath && canonicalPath.startsWith('/')
    ? canonicalPath
    : canonicalPath
      ? `/${canonicalPath}`
      : null;

  const canonicalUrl = normalizedCanonicalPath
    ? `${baseUrl}${normalizedCanonicalPath}`
    : `${baseUrl}${currentPath}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{validatedTitle}</title>
      <meta name="description" content={validatedDescription} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Viewport and Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="format-detection" content="telephone=yes" />
      <meta name="theme-color" content="#3B82F6" />

      {/* Medical Clinic Specific Meta Tags */}
      <meta name="geo.region" content="BR-MG" />
      <meta name="geo.placename" content="Caratinga" />
      <meta name="geo.position" content="-19.7944,-42.1375" />
      <meta name="ICBM" content="-19.7944,-42.1375" />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Hreflang Tags for i18n */}
      {hreflangs.map(({ hreflang, href }) => (
        <link
          key={hreflang}
          rel="alternate"
          hrefLang={hreflang}
          href={href}
        />
      ))}

      {/* Open Graph - Enhanced for Medical Clinics */}
      <meta property="og:title" content={validatedTitle} />
      <meta property="og:description" content={validatedDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={currentLang === 'pt' ? 'pt_BR' : 'en_US'} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={`${validatedTitle} - Clínica Saraiva Vision`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />

      {/* Medical Business Specific Open Graph */}
      <meta property="business:contact_data:street_address" content={clinicInfo.streetAddress} />
      <meta property="business:contact_data:locality" content={clinicInfo.city} />
      <meta property="business:contact_data:region" content={clinicInfo.state} />
      <meta property="business:contact_data:postal_code" content={clinicInfo.postalCode} />
      <meta property="business:contact_data:country_name" content="Brazil" />
      <meta property="business:contact_data:phone_number" content={clinicInfo.phone} />

      {/* Twitter Card - Enhanced */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@saraivavisao" />
      <meta name="twitter:creator" content="@saraivavisao" />
      <meta name="twitter:title" content={validatedTitle} />
      <meta name="twitter:description" content={validatedDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={`${validatedTitle} - Clínica Saraiva Vision`} />

      {/* LinkedIn and Business Social Media */}
      <meta property="linkedin:owner" content="saraiva-vision" />
      <meta property="linkedin:company" content="saraiva-vision" />

      {/* WhatsApp Business */}
      <meta property="whatsapp:url" content={canonicalUrl} />
      <meta property="whatsapp:title" content={validatedTitle} />
      <meta property="whatsapp:description" content={validatedDescription} />
      <meta property="whatsapp:image" content={ogImage} />

      {/* Instagram Preview */}
      <meta property="og:article:author" content="Dr. Philipe Saraiva" />
      <meta property="og:article:section" content="Medicina Oftalmológica" />

      {/* Medical Practice Enhancement */}
      <meta name="medical-category" content="Oftalmologia" />
      <meta name="specialty" content="Clínica Oftalmológica" />
      <meta name="doctor-name" content="Dr. Philipe Saraiva" />
      <meta name="crm" content="CRM-MG 69.870" />

      {/* Additional Social Media Meta Tags */}
      <meta property="fb:app_id" content="1134006230864956" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="application-name" content={siteName} />

      {/* Robots and Search Engine Directives */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <>
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        </>
      )}

      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://connect.facebook.net" />

      {/* Hero Image Preload (Dr. Philipe) */}
      <link
        rel="preload"
        as="image"
        href="/images/drphilipe_jaleco Medium.jpeg"
        // @ts-ignore - next/head doesn't have types for imagesrcset
        imagesrcset="/images/drphilipe_jaleco Medium.jpeg 800w, /images/drphilipe_jaleco2 Medium.jpeg 800w"
        // @ts-ignore - next/head doesn't have types for imagesizes
        imagesizes="(min-width:1024px) 800px, 100vw"
      />
      {/* AVIF/WebP variants for modern browsers */}
      <link rel="preload" as="image" href="/images/drphilipe_perfil-1280w.avif" type="image/avif" />
      <link rel="preload" as="image" href="/images/drphilipe_perfil-1280w.webp" type="image/webp" />

      {/* DNS Prefetch for External Resources */}
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//images.unsplash.com" />

      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              Array.isArray(structuredData)
                ? { '@context': 'https://schema.org', '@graph': structuredData }
                : structuredData
            )
          }}
        />
      )}
    </Head>
  );
}

/**
 * Export utility function for server components to generate metadata
 * Use this in page.tsx files with Next.js 15 Metadata API
 */
export function generateSEOMetadata(props: SEOHeadProps) {
  const baseUrl = DEFAULT_BASE_URL;

  const title = props.title || 'Oftalmologista Caratinga/MG | Dr. Philipe Saraiva CRM 69.870';
  const description = props.description ||
    'Clínica oftalmológica em Caratinga/MG: catarata, glaucoma, retina, lentes. Dr. Philipe Saraiva CRM-MG 69.870. Agende online ou WhatsApp!';
  const image = props.image || `${baseUrl}/og-image-1200x630-optimized.jpg`;

  return {
    title,
    description,
    keywords: props.keywords,
    openGraph: {
      title,
      description,
      url: props.canonicalPath ? `${baseUrl}${props.canonicalPath}` : baseUrl,
      siteName: 'Saraiva Vision - Oftalmologia',
      locale: 'pt_BR',
      type: props.ogType || 'website',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${title} - Clínica Saraiva Vision`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      site: '@saraivavisao',
      creator: '@saraivavisao',
      title,
      description,
      images: [image]
    },
    robots: props.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: {
      canonical: props.canonicalPath ? `${baseUrl}${props.canonicalPath}` : undefined
    }
  };
}
