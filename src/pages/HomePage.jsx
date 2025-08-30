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
    <div className="min-h-screen bg-page-gradient relative overflow-hidden">
      {/* Decorative global background accents (more blue) */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-blue-400/15 via-sky-400/10 to-cyan-400/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-[26rem] h-[26rem] rounded-full bg-gradient-to-br from-blue-300/15 via-sky-300/10 to-indigo-300/10 blur-3xl" aria-hidden="true" />
      <SEOHead {...seoData} />
      <SchemaMarkup type="clinic" />
      {/* Toaster e Accessibility removidos aqui para evitar duplicação; já presentes em App.jsx */}
      {/* <Toaster /> */}
      <Navbar />

      <main>
        <Hero />


        <CompactServices />

        {/* Section Divider */}
        <div className="py-8">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto"></div>
        </div>

        <About />

        {/* Section Divider */}
        <div className="py-8">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto"></div>
        </div>

        <CompactGoogleReviews />

        {/* Section Divider */}
        <div className="py-8">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto"></div>
        </div>

        {/* Local / Mapa (Google Places) */}
        <GoogleLocalSection />

        {/* Section Divider */}
        <div className="py-8">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto"></div>
        </div>

        <Contact />

        {/* Section Divider */}
        <div className="py-8">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto"></div>
        </div>

        <FAQ />

        {/* Section Divider */}
        <div className="py-8">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto"></div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;
