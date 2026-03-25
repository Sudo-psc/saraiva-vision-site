import React from 'react';

import EnhancedFooter from '../components/EnhancedFooter.jsx';
import SEOHead from '../components/SEOHead.jsx';
import ServicesEnhanced from '../components/ServicesEnhanced.jsx';

const ServicesPage = () => {
  // Service Schema for rich results
  const servicesSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: 'Saraiva Vision - Serviços Oftalmológicos',
    url: 'https://saraivavision.com.br/servicos',
    medicalSpecialty: 'Ophthalmology',
    availableService: [
      {
        '@type': 'MedicalProcedure',
        name: 'Tratamento de Olho Seco',
        description: 'Diagnóstico completo e tratamento personalizado de olho seco com meibografia e protocolo TFOS DEWS III.',
        url: 'https://saraivavision.com.br/olho-seco',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'IRPL E-Eye',
        description: 'Tratamento com luz pulsada regulada para Disfunção das Glândulas de Meibômio. Tecnologia aprovada pela ANVISA.',
        url: 'https://saraivavision.com.br/irpl',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Meibografia',
        description: 'Exame não invasivo para visualização das glândulas de Meibômio em alta definição.',
        url: 'https://saraivavision.com.br/meibografia',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Blefaroplastia com Jato de Plasma',
        description: 'Procedimento minimamente invasivo para rejuvenescimento palpebral sem cortes.',
        url: 'https://saraivavision.com.br/blefaroplastia-jato-plasma',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Cirurgia de Catarata',
        description: 'Cirurgia de catarata com lentes intraoculares premium, monofocais, multifocais e trifocais.',
      },
      {
        '@type': 'MedicalTest',
        name: 'Exames Oftalmológicos',
        description: 'Exames completos incluindo mapeamento de retina, campo visual, OCT e tonometria.',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Caratinga',
      addressRegion: 'MG',
      addressCountry: 'BR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '136',
      bestRating: '5',
    },
  };

  const seo = {
    title: 'Serviços Oftalmológicos em Caratinga | Olho Seco, IRPL, Cirurgias | Saraiva Vision',
    description: 'Serviços oftalmológicos completos em Caratinga, MG. Tratamento de olho seco, IRPL E-Eye, meibografia, blefaroplastia e cirurgias. Tecnologia avançada e atendimento especializado.',
    keywords: 'oftalmologista Caratinga MG, serviços oftalmológicos Caratinga, tratamento olho seco, IRPL Caratinga, meibografia, cirurgia catarata Caratinga, exame oftalmológico Caratinga',
    structuredData: servicesSchema,
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <SEOHead {...seo} />
      <main className="flex-1 pt-16 sm:pt-20">
        <ServicesEnhanced full grid />
      </main>
      <EnhancedFooter />
    </div>
  );
};

export default ServicesPage;
