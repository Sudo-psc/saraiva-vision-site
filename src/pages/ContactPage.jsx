import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead {...seo} />
      <Navbar />
      <main className="flex-1 pt-28 mx-[2%] md:mx-[3%] lg:mx-[3%] xl:mx-[3.5%]">
        <Contact />
      </main>
      {/* Encontre-nos Section */}
      <GoogleLocalSection />
      <Footer />
    </div>
  );
};

export default ContactPage;
