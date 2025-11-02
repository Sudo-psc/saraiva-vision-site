/**
 * ClinicSchema Component
 * Author: Dr. Philipe Saraiva Cruz
 *
 * Provides structured data (JSON-LD) for search engines and LLMs.
 * Implements Schema.org MedicalOrganization and LocalBusiness schemas.
 *
 * This component should be added to the layout or main pages to help
 * search engines and AI systems understand the clinic's information.
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { clinicInfo } from '@/lib/clinicInfo';

const ClinicSchema = () => {
  // Schema.org MedicalOrganization structured data
  const medicalOrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    '@id': 'https://saraivavision.com.br/#organization',
    name: clinicInfo.name,
    legalName: clinicInfo.legalName,
    url: 'https://saraivavision.com.br',
    logo: 'https://saraivavision.com.br/logo.png',
    description:
      'Clínica oftalmológica em Caratinga, MG. Consultas, exames e tratamentos com tecnologia de ponta e atendimento humanizado.',
    medicalSpecialty: 'Ophthalmology',
    taxID: clinicInfo.taxId,
    foundingDate: clinicInfo.foundingDate,

    // Address information
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinicInfo.streetAddress,
      addressLocality: clinicInfo.city,
      addressRegion: clinicInfo.state,
      postalCode: clinicInfo.postalCode,
      addressCountry: clinicInfo.country,
    },

    // Geographic coordinates
    geo: {
      '@type': 'GeoCoordinates',
      latitude: clinicInfo.latitude,
      longitude: clinicInfo.longitude,
    },

    // Contact information
    telephone: clinicInfo.phone,
    email: clinicInfo.email,

    // Responsible physician (CFM compliance)
    physician: {
      '@type': 'Physician',
      name: clinicInfo.responsiblePhysician,
      identifier: clinicInfo.responsiblePhysicianCRM,
      medicalSpecialty: 'Ophthalmology',
      jobTitle: clinicInfo.responsiblePhysicianTitle,
    },

    // Services offered
    makesOffer: clinicInfo.servicesKeywords.map((service) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'MedicalProcedure',
        name: service,
      },
    })),

    // Social media profiles
    sameAs: [
      clinicInfo.instagram,
      clinicInfo.facebook,
      clinicInfo.linkedin,
      clinicInfo.x,
      clinicInfo.spotify,
    ].filter(Boolean),

    // Aggregated rating (if available)
    // aggregateRating: {
    //   '@type': 'AggregateRating',
    //   ratingValue: '4.9',
    //   reviewCount: '136',
    // },

    // Payment methods
    paymentAccepted: ['Cartão de crédito', 'Cartão de débito', 'Dinheiro', 'PIX'],

    // Opening hours
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
    ],

    // Available services
    availableService: [
      {
        '@type': 'MedicalProcedure',
        name: 'Consultas oftalmológicas',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Exames de refração',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Tratamentos especializados',
      },
    ],

    // Contact point for appointments
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: clinicInfo.phone,
        contactType: 'customer service',
        availableLanguage: 'Portuguese',
        areaServed: 'BR',
      },
    ],
  };

  // LocalBusiness schema (alternative/complementary)
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://saraivavision.com.br/#localbusiness',
    name: clinicInfo.name,
    image: 'https://saraivavision.com.br/logo.png',
    url: 'https://saraivavision.com.br',
    telephone: clinicInfo.phone,
    email: clinicInfo.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinicInfo.streetAddress,
      addressLocality: clinicInfo.city,
      addressRegion: clinicInfo.state,
      postalCode: clinicInfo.postalCode,
      addressCountry: clinicInfo.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: clinicInfo.latitude,
      longitude: clinicInfo.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
    ],
    priceRange: '$$',
  };

  // Person schema for Dr. Philipe Saraiva Cruz
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://saraivavision.com.br/#doctor',
    name: clinicInfo.responsiblePhysician,
    jobTitle: 'Oftalmologista',
    worksFor: {
      '@id': 'https://saraivavision.com.br/#organization',
    },
    identifier: clinicInfo.responsiblePhysicianCRM,
    description: 'Médico oftalmologista responsável técnico da Clínica Saraiva Vision',
    sameAs: [clinicInfo.linkedin, clinicInfo.x, clinicInfo.facebook].filter(Boolean),
  };

  // WebSite schema for search functionality
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://saraivavision.com.br/#website',
    url: 'https://saraivavision.com.br',
    name: 'Saraiva Vision',
    description: 'Clínica oftalmológica em Caratinga, MG',
    publisher: {
      '@id': 'https://saraivavision.com.br/#organization',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://saraivavision.com.br/blog?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      {/* Medical Organization Schema */}
      <script type="application/ld+json">{JSON.stringify(medicalOrganizationSchema)}</script>

      {/* Local Business Schema */}
      <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>

      {/* Person Schema (Doctor) */}
      <script type="application/ld+json">{JSON.stringify(personSchema)}</script>

      {/* Website Schema */}
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
    </Helmet>
  );
};

export default ClinicSchema;
