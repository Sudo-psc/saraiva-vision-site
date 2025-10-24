'use client';

import React, { useEffect } from 'react';

import EnhancedFooter from '../components/EnhancedFooter.jsx';
import SEOHead from '../components/SEOHead.jsx';
import About from '../components/About.jsx';
import Testimonials from '../components/Testimonials.jsx';
import Contact from '../components/Contact.jsx';
import GoogleLocalSection from '../components/GoogleLocalSection.jsx';
import { useTranslation } from 'react-i18next';

const AboutPage = () => {
  const { t } = useTranslation();
  const seo = {
    title: t('homeMeta.title'),
    description: t('homeMeta.description'),
    keywords: t('homeMeta.keywords'),
  };

  // Handle hash navigation for contact section
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash;
      if (hash === '#contact') {
        // Wait for component to render and then scroll to contact section
        setTimeout(() => {
          const contactElement = document.getElementById('contact');
          if (contactElement) {
            contactElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 100);
      }
    };

    // Handle initial load
    handleHashNavigation();

    // Handle hash changes during navigation
    window.addEventListener('hashchange', handleHashNavigation);

    // Cleanup event listener
    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead {...seo} />
      <main className="flex-1 pt-20 sm:pt-24 md:pt-28 lg:pt-32 mx-[4%] md:mx-[6%] lg:mx-[8%]">
        <About />
        <Testimonials />
        <Contact />
      </main>
      <GoogleLocalSection />
      <EnhancedFooter />
    </div>
  );
};

export default AboutPage;
