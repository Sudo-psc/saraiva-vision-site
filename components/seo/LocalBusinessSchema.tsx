/**
 * LocalBusinessSchema Component - Next.js 15 Migration
 *
 * Specialized schema.org markup for medical clinic local business
 * Uses NAP (Name, Address, Phone) canonical data for consistency
 *
 * @features
 * - MedicalBusiness schema with complete information
 * - NAP data integration for consistency
 * - Physician schema integration
 * - Opening hours specification
 * - Aggregate rating support
 * - Contact points and service area
 * - Server component optimization
 *
 * @usage
 * ```tsx
 * // Server Component (recommended)
 * import LocalBusinessSchema from '@/components/seo/LocalBusinessSchema';
 *
 * export default function Page() {
 *   return <LocalBusinessSchema />;
 * }
 *
 * // Client Component
 * import { ClientLocalBusinessSchema } from '@/components/seo/LocalBusinessSchema';
 * ```
 */

import React from 'react';
import Script from 'next/script';
import { NAP_CANONICAL } from '@/lib/napCanonical';
import type { SchemaOrgMedicalClinic } from '@/types/seo';

/**
 * Generate Local Business Schema object
 */
function generateLocalBusinessSchemaObject(): SchemaOrgMedicalClinic {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': NAP_CANONICAL.address.geo.mapUrl,
    name: NAP_CANONICAL.business.legalName,
    alternateName: NAP_CANONICAL.business.displayName,
    description: NAP_CANONICAL.seo.longDescription,
    url: 'https://saraivavision.com.br',
    logo: 'https://saraivavision.com.br/logo.png',
    image: 'https://saraivavision.com.br/og-image-1200x630-optimized.jpg',
    priceRange: NAP_CANONICAL.business.priceRange,
    // @ts-ignore - slogan not in strict type but valid for LocalBusiness
    slogan: NAP_CANONICAL.business.slogan,
    // @ts-ignore - foundingDate type mismatch (string vs Date)
    foundingDate: NAP_CANONICAL.business.founded,

    telephone: NAP_CANONICAL.phone.primary.e164,
    email: NAP_CANONICAL.email.primary,

    address: {
      '@type': 'PostalAddress',
      streetAddress: `${NAP_CANONICAL.address.street}, ${NAP_CANONICAL.address.number}`,
      addressLocality: NAP_CANONICAL.address.city,
      addressRegion: NAP_CANONICAL.address.stateCode,
      postalCode: NAP_CANONICAL.address.postalCode,
      addressCountry: NAP_CANONICAL.address.countryCode
    },

    geo: {
      '@type': 'GeoCoordinates',
      latitude: NAP_CANONICAL.address.geo.latitude,
      longitude: NAP_CANONICAL.address.geo.longitude
    },

    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: NAP_CANONICAL.hours.weekdays.opens,
        closes: NAP_CANONICAL.hours.weekdays.closes
      }
    ],

    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: NAP_CANONICAL.phone.primary.e164,
        contactType: 'customer service',
        areaServed: 'BR',
        availableLanguage: ['Portuguese']
      },
      {
        '@type': 'ContactPoint',
        telephone: NAP_CANONICAL.phone.whatsapp.e164,
        contactType: 'reservations',
        // @ts-ignore - contactOption not in strict type but valid
        contactOption: 'WhatsApp',
        areaServed: 'BR',
        availableLanguage: ['Portuguese']
      }
    ],

    sameAs: [
      NAP_CANONICAL.social.instagram.url,
      NAP_CANONICAL.social.facebook.url,
      NAP_CANONICAL.social.youtube.url
    ],

    medicalSpecialty: NAP_CANONICAL.business.medicalSpecialty,

    // @ts-ignore - physician not in strict type but valid for MedicalBusiness
    physician: {
      '@type': 'Physician',
      name: NAP_CANONICAL.doctor.name,
      medicalSpecialty: NAP_CANONICAL.doctor.specialty,
      // @ts-ignore - honorificPrefix not in strict type
      honorificPrefix: 'Dr.',
      jobTitle: NAP_CANONICAL.doctor.title,
      worksFor: {
        '@type': 'MedicalBusiness',
        name: NAP_CANONICAL.business.legalName
      }
    },

    areaServed: {
      '@type': 'City',
      name: NAP_CANONICAL.address.city,
      containedIn: {
        '@type': 'State',
        name: 'Minas Gerais'
      }
    },

    hasMap: NAP_CANONICAL.address.geo.mapUrl,

    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1'
    },

    potentialAction: [
      {
        '@type': 'ReserveAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: NAP_CANONICAL.phone.whatsapp.href,
          actionPlatform: [
            'http://schema.org/DesktopWebPlatform',
            'http://schema.org/MobileWebPlatform'
          ]
        },
        result: {
          '@type': 'Reservation',
          name: 'Agendamento de Consulta'
        }
      }
    ]
  };
}

/**
 * Server Component (Default)
 * Use this in server components and pages for optimal performance
 */
export default function LocalBusinessSchema() {
  const schema = generateLocalBusinessSchemaObject();

  return (
    <Script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0)
      }}
      strategy="beforeInteractive"
    />
  );
}

/**
 * Client Component Export
 * Use this when you need local business schema in client components
 */
export function ClientLocalBusinessSchema() {
  'use client';

  const schema = generateLocalBusinessSchemaObject();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0)
      }}
    />
  );
}

/**
 * Utility: Get schema object for programmatic use
 */
export function getLocalBusinessSchemaObject(): SchemaOrgMedicalClinic {
  return generateLocalBusinessSchemaObject();
}

/**
 * Utility: Generate schema JSON string
 */
export function generateLocalBusinessSchemaJSON(): string {
  return JSON.stringify(generateLocalBusinessSchemaObject(), null, 0);
}

/**
 * Export named component for compatibility
 */
export { LocalBusinessSchema };
