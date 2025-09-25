import React from 'react';
import SEOHead from '@/components/SEOHead';
import Contact from '@/components/Contact';
import GoogleLocalSection from '@/components/GoogleLocalSection';
import { useTranslation } from 'react-i18next';

const ContactPage = () => {
  const { t } = useTranslation();
  const seo = {
    title: t('contact.title') + ' | Saraiva Vision',
    description: t('contact.subtitle'),
    keywords: 'contato, agendar, oftalmologista, Caratinga',
  };

  return (
    <>
      <SEOHead {...seo} />
      <main className="flex-1 pt-28 mx-[2%] md:mx-[3%] lg:mx-[3%] xl:mx-[3.5%]">
        <Contact />
      </main>
      {/* Encontre-nos Section */}
      <GoogleLocalSection />
    </>
  );
};

export default ContactPage;
