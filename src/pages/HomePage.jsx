import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '@/components/SEOHead';
import SchemaMarkup from '@/components/SchemaMarkup';
import { useHomeSEO } from '@/hooks/useSEO';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CompactServices from '@/components/CompactServices';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import CompactGoogleReviews from '@/components/CompactGoogleReviews';
import GoogleLocalSection from '@/components/GoogleLocalSection';
import FAQ from '@/components/FAQ';
import LatestEpisodes from '@/components/LatestEpisodes';

function HomePage() {
  const location = useLocation();
  const seoData = useHomeSEO();
  const { t } = useTranslation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/20 relative overflow-x-hidden">
      {/* Enhanced decorative background with contained gradients and shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Main background orbs - contained within viewport */}
        <div className="absolute -top-20 -right-20 w-80 h-80 max-w-[50vw] max-h-[50vh] rounded-full bg-gradient-to-br from-blue-200/20 via-indigo-200/15 to-sky-200/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 max-w-[45vw] max-h-[45vh] rounded-full bg-gradient-to-tr from-purple-200/15 via-blue-200/10 to-indigo-200/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Geometric decoration elements - properly contained */}
        <div className="absolute top-1/4 right-1/4 w-48 h-48 max-w-[30vw] max-h-[30vh] bg-gradient-to-br from-blue-100/30 to-indigo-100/20 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-36 h-36 max-w-[25vw] max-h-[25vh] bg-gradient-to-tr from-green-100/25 to-emerald-100/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/30 to-transparent opacity-50"></div>
      </div>
      <SEOHead {...seoData} />
      <SchemaMarkup type="clinic" />
      {/* Toaster e Accessibility removidos aqui para evitar duplicação; já presentes em App.jsx */}
      {/* <Toaster /> */}
      <Navbar />

      <main>
        <Hero />


        <CompactServices />

        <About />

        <LatestEpisodes />

        <CompactGoogleReviews />

        {/* Local / Mapa (Google Places) */}
        <GoogleLocalSection />

        <Contact />

        <FAQ />
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;
