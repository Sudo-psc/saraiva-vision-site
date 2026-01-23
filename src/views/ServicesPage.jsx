import React from 'react';

import EnhancedFooter from '../components/EnhancedFooter.jsx';
import SEOHead from '../components/SEOHead.jsx';
import ServicesEnhanced from '../components/ServicesEnhanced.jsx';
import { useTranslation } from 'react-i18next';

const ServicesPage = () => {
  const { t } = useTranslation();
  const seo = {
    title: t('services.title') + ' | Saraiva Vision',
    description: t('services.subtitle'),
    keywords: 'oftalmologia, serviços, consultas, exames, cirurgias, olho seco, IRPL, luz pulsada',
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
