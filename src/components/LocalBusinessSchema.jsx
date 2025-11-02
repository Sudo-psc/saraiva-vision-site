import { Helmet } from 'react-helmet-async';
import { NAP_CANONICAL } from '@/lib/napCanonical';

export default function LocalBusinessSchema() {
  // Main Medical Business Schema
  const medicalBusinessSchema = {
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
    slogan: NAP_CANONICAL.business.slogan,
    foundingDate: NAP_CANONICAL.business.founded,
    
    telephone: NAP_CANONICAL.phone.primary.e164,
    email: NAP_CANONICAL.email.primary,
    
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${NAP_CANONICAL.address.street}, ${NAP_CANONICAL.address.number}`,
      addressLocality: NAP_CANONICAL.address.city,
      addressRegion: NAP_CANONICAL.address.stateCode,
      postalCode: NAP_CANONICAL.address.postalCode,
      addressCountry: NAP_CANONICAL.address.countryCode,
    },
    
    geo: {
      '@type': 'GeoCoordinates',
      latitude: NAP_CANONICAL.address.geo.latitude,
      longitude: NAP_CANONICAL.address.geo.longitude,
    },
    
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: NAP_CANONICAL.hours.weekdays.opens,
        closes: NAP_CANONICAL.hours.weekdays.closes,
      },
    ],
    
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: NAP_CANONICAL.phone.primary.e164,
        contactType: 'customer service',
        areaServed: 'BR',
        availableLanguage: ['Portuguese'],
      },
      {
        '@type': 'ContactPoint',
        telephone: NAP_CANONICAL.phone.whatsapp.e164,
        contactType: 'reservations',
        contactOption: 'WhatsApp',
        areaServed: 'BR',
        availableLanguage: ['Portuguese'],
      },
    ],
    
    sameAs: [
      NAP_CANONICAL.social.instagram.url,
      NAP_CANONICAL.social.facebook.url,
      NAP_CANONICAL.social.youtube.url,
    ],
    
    medicalSpecialty: NAP_CANONICAL.business.medicalSpecialty,
    
    physician: {
      '@type': 'Physician',
      name: NAP_CANONICAL.doctor.name,
      medicalSpecialty: NAP_CANONICAL.doctor.specialty,
      honorificPrefix: 'Dr.',
      jobTitle: NAP_CANONICAL.doctor.title,
      worksFor: {
        '@type': 'MedicalBusiness',
        name: NAP_CANONICAL.business.legalName,
      },
    },
    
    areaServed: {
      '@type': 'City',
      name: NAP_CANONICAL.address.city,
      containedIn: {
        '@type': 'State',
        name: 'Minas Gerais',
      },
    },
    
    hasMap: NAP_CANONICAL.address.geo.mapUrl,
    
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
    
    potentialAction: [
      {
        '@type': 'ReserveAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: NAP_CANONICAL.phone.whatsapp.href,
          actionPlatform: [
            'http://schema.org/DesktopWebPlatform',
            'http://schema.org/MobileWebPlatform',
          ],
        },
        result: {
          '@type': 'Reservation',
          name: 'Agendamento de Consulta',
        },
      },
    ],
  };

  // Person Schema for Dr. Philipe Saraiva Cruz (enhanced visibility for LLMs)
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://saraivavision.com.br/#doctor',
    name: NAP_CANONICAL.doctor.name,
    jobTitle: NAP_CANONICAL.doctor.title,
    worksFor: {
      '@id': NAP_CANONICAL.address.geo.mapUrl,
    },
    identifier: NAP_CANONICAL.doctor.crm,
    description: 'Médico oftalmologista responsável técnico da Clínica Saraiva Vision em Caratinga, MG',
    sameAs: [
      NAP_CANONICAL.social.instagram.url,
      NAP_CANONICAL.social.facebook.url,
      NAP_CANONICAL.social.youtube.url,
    ],
  };

  // WebSite Schema with SearchAction for better discoverability
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://saraivavision.com.br/#website',
    url: 'https://saraivavision.com.br',
    name: NAP_CANONICAL.business.displayName,
    description: NAP_CANONICAL.seo.mediumDescription,
    publisher: {
      '@id': NAP_CANONICAL.address.geo.mapUrl,
    },
    inLanguage: 'pt-BR',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://saraivavision.com.br/blog?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // Organization Schema (broader identity for LLMs)
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    '@id': 'https://saraivavision.com.br/#organization',
    name: NAP_CANONICAL.business.legalName,
    alternateName: NAP_CANONICAL.business.displayName,
    url: 'https://saraivavision.com.br',
    logo: 'https://saraivavision.com.br/logo.png',
    description: NAP_CANONICAL.seo.longDescription,
    medicalSpecialty: 'Ophthalmology',
    taxID: '53.864.119/0001-79',
    foundingDate: NAP_CANONICAL.business.founded,
    telephone: NAP_CANONICAL.phone.primary.e164,
    email: NAP_CANONICAL.email.primary,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${NAP_CANONICAL.address.street}, ${NAP_CANONICAL.address.number}`,
      addressLocality: NAP_CANONICAL.address.city,
      addressRegion: NAP_CANONICAL.address.stateCode,
      postalCode: NAP_CANONICAL.address.postalCode,
      addressCountry: NAP_CANONICAL.address.countryCode,
    },
    sameAs: [
      NAP_CANONICAL.social.instagram.url,
      NAP_CANONICAL.social.facebook.url,
      NAP_CANONICAL.social.youtube.url,
    ],
  };

  return (
    <Helmet>
      {/* Main Medical Business Schema (most specific) */}
      <script type="application/ld+json">{JSON.stringify(medicalBusinessSchema)}</script>

      {/* Person Schema (Doctor profile for LLMs) */}
      <script type="application/ld+json">{JSON.stringify(personSchema)}</script>

      {/* Website Schema (search functionality) */}
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>

      {/* Organization Schema (broader identity) */}
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
    </Helmet>
  );
}
