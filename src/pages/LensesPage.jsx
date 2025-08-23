import React from 'react';
import { useTranslation } from 'react-i18next';
import SEOHead from '@/components/SEOHead';
import { useLensesSEO } from '@/hooks/useSEO';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactLenses from '@/components/ContactLenses';
import FloatingCTA from '@/components/FloatingCTA';

const LensesPage = () => {
  const { t } = useTranslation();
  const seoData = useLensesSEO();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead {...seoData} />
      <Navbar />
      <main className="flex-1 pt-28">
        <ContactLenses />
      </main>
      <Footer />
      <FloatingCTA />
    </div>
  );
};

export default LensesPage;
