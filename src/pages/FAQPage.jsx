import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import FAQ from '@/components/FAQ';
import { useTranslation } from 'react-i18next';

const FAQPage = () => {
  const { t } = useTranslation();
  const seo = {
    title: t('faqMeta.title'),
    description: t('faqMeta.description'),
    keywords: t('faqMeta.keywords'),
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead {...seo} />
      <Navbar />
      <main className="flex-1 pt-28">
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;
