import React from 'react';
import SEOHead from '@/components/SEOHead';
import About from '@/components/About';
import { useTranslation } from 'react-i18next';

const AboutPage = () => {
  const { t } = useTranslation();
  const seo = {
    title: t('homeMeta.title'),
    description: t('homeMeta.description'),
    keywords: t('homeMeta.keywords'),
  };

  return (
    <>
      <SEOHead {...seo} />
      <main className="flex-1 pt-28 mx-[4%] md:mx-[6%] lg:mx-[8%]">
        <About />
      </main>
    </>
  );
};

export default AboutPage;
