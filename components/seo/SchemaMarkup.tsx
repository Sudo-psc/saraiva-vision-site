/**
 * SchemaMarkup Component - Next.js 15 Migration
 *
 * Generic schema.org markup generator with @graph support
 * Handles multiple schema types and automatic schema composition
 *
 * @features
 * - Multi-schema @graph support
 * - Automatic schema generation based on type
 * - Server and client component compatible
 * - TypeScript strict mode with full type safety
 * - Schema validation support
 *
 * @usage
 * ```tsx
 * // Server Component (recommended)
 * import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
 *
 * export default function Page() {
 *   return (
 *     <>
 *       <SchemaMarkup
 *         type="webpage"
 *         pageInfo={{ title: 'Page Title', description: 'Description', url: '/page' }}
 *         faqItems={[{ question: 'Q?', answer: 'A!' }]}
 *       />
 *     </>
 *   );
 * }
 *
 * // Client Component
 * 'use client';
 * import { ClientSchemaMarkup } from '@/components/seo/SchemaMarkup';
 * ```
 */

import React from 'react';
import Script from 'next/script';
import {
  generateMedicalClinicSchema,
  generatePhysicianSchema,
  generateFAQSchema,
  generateMedicalWebPageSchema,
  generateBreadcrumbSchema,
  generateWebSiteSchema,
  generateOrganizationSchema,
  generatePodcastSchema
} from '@/lib/schemaMarkup';
import type { SchemaMarkupProps, SchemaOrgType, SchemaOrgGraph } from '@/types/seo';

/**
 * Generate schemas based on type and props
 */
function generateSchemas(props: SchemaMarkupProps, language: string = 'pt'): SchemaOrgType[] {
  const { type = 'clinic', pageInfo, faqItems, breadcrumbs, data, additionalSchemas = [] } = props;
  const schemas: SchemaOrgType[] = [];

  // Base schemas (always included)
  schemas.push(generateOrganizationSchema(language, true));
  schemas.push(generateWebSiteSchema(language, true));
  schemas.push(generateMedicalClinicSchema(language, true));
  schemas.push(generatePhysicianSchema(language, true));

  // Type-specific schemas
  if (type === 'webpage' && pageInfo) {
    schemas.push(generateMedicalWebPageSchema(pageInfo, language, true));
  }

  if (type === 'podcast' && data) {
    schemas.push(generatePodcastSchema(data, language, true));
  }

  // Optional schemas
  if (faqItems && faqItems.length > 0) {
    schemas.push(generateFAQSchema(faqItems, language, true));
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push(generateBreadcrumbSchema(breadcrumbs, true));
  }

  // Additional schemas
  schemas.push(...additionalSchemas);

  return schemas;
}

/**
 * Server Component (Default)
 * Use this in server components and pages for optimal performance
 */
export default function SchemaMarkup(props: SchemaMarkupProps) {
  const language = 'pt'; // TODO: Get from i18n context when implemented
  const schemas = generateSchemas(props, language);

  const structuredData: SchemaOrgGraph = {
    '@context': 'https://schema.org',
    '@graph': schemas
  };

  return (
    <Script
      id="schema-markup"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 0) // Minified for production
      }}
      strategy="beforeInteractive"
    />
  );
}

/**
 * Client Component Export
 * Use this when you need schema markup in client components
 */
export function ClientSchemaMarkup(props: SchemaMarkupProps) {
  'use client';

  const language = 'pt'; // TODO: Get from i18n context when implemented
  const schemas = generateSchemas(props, language);

  const structuredData: SchemaOrgGraph = {
    '@context': 'https://schema.org',
    '@graph': schemas
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 0)
      }}
    />
  );
}

/**
 * Utility: Generate schema JSON for server-side rendering
 * Use this in metadata generation or API routes
 */
export function generateSchemaJSON(props: SchemaMarkupProps, language: string = 'pt'): string {
  const schemas = generateSchemas(props, language);

  const structuredData: SchemaOrgGraph = {
    '@context': 'https://schema.org',
    '@graph': schemas
  };

  return JSON.stringify(structuredData, null, 0);
}

/**
 * Utility: Get schema object for programmatic use
 */
export function getSchemaObject(props: SchemaMarkupProps, language: string = 'pt'): SchemaOrgGraph {
  const schemas = generateSchemas(props, language);

  return {
    '@context': 'https://schema.org',
    '@graph': schemas
  };
}

/**
 * Export named component for compatibility
 */
export { SchemaMarkup };
