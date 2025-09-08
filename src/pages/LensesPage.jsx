import React from 'react';
import { useTranslation } from 'react-i18next';
import SEOHead from '@/components/SEOHead';
import { useLensesSEO } from '@/hooks/useSEO';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactLenses from '@/components/ContactLenses';

const LensesPage = () => {
  const { t } = useTranslation();
  const seoData = useLensesSEO();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead {...seoData} />
      <Navbar />
      <main className="flex-1 pt-28 mx-[4%] md:mx-[6%] lg:mx-[8%]">
        <ContactLenses />
      </main>
      <Footer />
    </div>
  );
};

export default LensesPage;
