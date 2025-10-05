/**
 * Next.js 14 App Router Page - Agendamento
 * Route: /agendamento
 *
 * This is a Server Component that:
 * - Exports metadata for SEO
 * - Imports and renders the AgendamentoPage from src/pages
 * - Provides structured data and canonical URLs
 */

import { Metadata } from 'next';
import AgendamentoPage from '@/pages/AgendamentoPage';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Agendar Consulta Online - Clínica Saraiva Vision | Caratinga - MG',
  description: 'Agende sua consulta oftalmológica online de forma rápida e segura. Sistema integrado com horários em tempo real e confirmação imediata via email e WhatsApp.',
  keywords: 'agendamento online, consulta oftalmológica, oftalmologista Caratinga, Saraiva Vision, agendar consulta, Ninsaúde',

  // Open Graph
  openGraph: {
    title: 'Agendar Consulta - Saraiva Vision',
    description: 'Agende sua consulta oftalmológica online de forma rápida e segura na Clínica Saraiva Vision em Caratinga/MG.',
    type: 'website',
    url: 'https://saraivavision.com.br/agendamento',
    siteName: 'Clínica Saraiva Vision',
    locale: 'pt_BR',
    images: [
      {
        url: 'https://saraivavision.com.br/images/og-agendamento.jpg',
        width: 1200,
        height: 630,
        alt: 'Agendamento Online - Saraiva Vision',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Agendar Consulta - Saraiva Vision',
    description: 'Agende sua consulta oftalmológica online de forma rápida e segura.',
    images: ['https://saraivavision.com.br/images/og-agendamento.jpg'],
  },

  // Canonical URL
  alternates: {
    canonical: 'https://saraivavision.com.br/agendamento',
  },

  // Additional metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

/**
 * Server Component
 * This component is rendered on the server and can use async/await
 */
export default function AgendamentoAppRoute() {
  // Structured Data for Medical Web Page
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: 'Agendamento de Consulta Oftalmológica',
    description: 'Sistema de agendamento online para consultas oftalmológicas na Clínica Saraiva Vision',
    url: 'https://saraivavision.com.br/agendamento',
    about: {
      '@type': 'MedicalProcedure',
      name: 'Consulta Oftalmológica',
      procedureType: 'Consulta Médica',
    },
    provider: {
      '@type': 'MedicalClinic',
      name: 'Clínica Saraiva Vision',
      url: 'https://saraivavision.com.br',
      telephone: '+55-33-99877-4890',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rua Santa Cruz, 233 - Centro',
        addressLocality: 'Caratinga',
        addressRegion: 'MG',
        postalCode: '35300-036',
        addressCountry: 'BR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -19.7893,
        longitude: -42.1376,
      },
    },
    mainContentOfPage: {
      '@type': 'WebPageElement',
      description: 'Formulário de agendamento online para consultas oftalmológicas',
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Início',
          item: 'https://saraivavision.com.br',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Agendamento',
          item: 'https://saraivavision.com.br/agendamento',
        },
      ],
    },
  };

  return (
    <>
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Render AgendamentoPage Component */}
      <AgendamentoPage />
    </>
  );
}
