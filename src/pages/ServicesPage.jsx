import React from 'react';
import Navbar from '../components/Navbar.jsx';
import EnhancedFooter from '../components/EnhancedFooter.jsx';
import SEOHead from '../components/SEOHead.jsx';
import ServicesEnhanced from '../components/ServicesEnhanced.jsx';
import { useTranslation } from 'react-i18next';

const ServicesPage = () => {
  const { t } = useTranslation();
  const seo = {
    title: t('services.title') + ' | Saraiva Vision',
    description: t('services.subtitle'),
    keywords: 'oftalmologia, serviços, consultas, exames, cirurgias',
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead {...seo} />
      <Navbar />
      <main className="flex-1 pt-28 scroll-block-internal mx-[5%] lg:mx-[10%]">
        <ServicesEnhanced full grid />
      </main>
      <EnhancedFooter />
    </div>
  );
};

export default ServicesPage;
