import React from 'react';
import Navbar from '../components/Navbar.jsx';
import EnhancedFooter from '../components/EnhancedFooter.jsx';
import SEOHead from '../components/SEOHead.jsx';
import About from '../components/About.jsx';
import { useTranslation } from 'react-i18next';

const AboutPage = () => {
  const { t } = useTranslation();
  const seo = {
    title: t('homeMeta.title'),
    description: t('homeMeta.description'),
    keywords: t('homeMeta.keywords'),
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead {...seo} />
      <Navbar />
      <main className="flex-1 pt-28 mx-[4%] md:mx-[6%] lg:mx-[8%]">
        <About />
      </main>
      <EnhancedFooter />
    </div>
  );
};

export default AboutPage;
