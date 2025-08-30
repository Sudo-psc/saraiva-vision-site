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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/20 relative overflow-hidden">
      {/* Enhanced decorative background with modern gradients and shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Main background orbs */}
        <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] rounded-full bg-gradient-to-br from-blue-200/20 via-indigo-200/15 to-sky-200/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[35rem] h-[35rem] rounded-full bg-gradient-to-tr from-purple-200/15 via-blue-200/10 to-indigo-200/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Geometric decoration elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-indigo-100/20 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-to-tr from-green-100/25 to-emerald-100/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        
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

        {/* Enhanced section divider with modern design */}
        <div className="py-12 relative">
          <div className="container mx-auto px-4">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center border border-slate-200/50">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
              </div>
              <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent -z-10"></div>
            </div>
          </div>
        </div>

        <About />

        {/* Enhanced section divider with modern design */}
        <div className="py-12 relative">
          <div className="container mx-auto px-4">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center border border-slate-200/50">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
              </div>
              <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent -z-10"></div>
            </div>
          </div>
        </div>

        <CompactGoogleReviews />

        {/* Geometric section divider */}
        <div className="py-12 relative">
          <div className="container mx-auto px-4">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg rotate-45 flex items-center justify-center border border-green-200/50">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full -rotate-45"></div>
              </div>
              <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-300 to-transparent -z-10"></div>
            </div>
          </div>
        </div>

        {/* Local / Mapa (Google Places) */}
        <GoogleLocalSection />

        {/* Enhanced section divider with modern design */}
        <div className="py-12 relative">
          <div className="container mx-auto px-4">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center border border-slate-200/50">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
              </div>
              <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent -z-10"></div>
            </div>
          </div>
        </div>

        <Contact />

        {/* Wave-like section divider */}
        <div className="py-12 relative">
          <div className="container mx-auto px-4">
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-8 bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 rounded-full flex items-center justify-center border border-purple-200/50">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                </div>
              </div>
              <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent -z-10"></div>
            </div>
          </div>
        </div>

        <FAQ />

        {/* Final section divider with gradient bars */}
        <div className="py-12 relative">
          <div className="container mx-auto px-4">
            <div className="relative flex items-center justify-center">
              <div className="flex gap-2">
                <div className="w-4 h-12 bg-gradient-to-b from-orange-400 to-red-400 rounded-full"></div>
                <div className="w-4 h-8 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full mt-2"></div>
                <div className="w-4 h-12 bg-gradient-to-b from-orange-400 to-red-400 rounded-full"></div>
              </div>
              <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent -z-10"></div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;
