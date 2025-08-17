import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import ContactLenses from '@/components/ContactLenses';
import About from '@/components/About';
import TrustSignals from '@/components/TrustSignals';
import Testimonials from '@/components/Testimonials';
import BlogSection from '@/components/BlogSection';
import FAQ from '@/components/FAQ';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
// Removed WhatsappWidget in favor of unified FloatingCTA modal
import FloatingCTA from '@/components/FloatingCTA';
import Accessibility from '@/components/Accessibility';
import GoogleLocalSection from '@/components/GoogleLocalSection';

function HomePage() {
  const location = useLocation();
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

  const pageTitle = t('homeMeta.title');
  const metaDescription = t('homeMeta.description');
  const metaKeywords = t('homeMeta.keywords');

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={metaKeywords} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={metaDescription} />
      </Helmet>
      <Toaster />
      <Navbar />
      
      <main>
        <Hero />
        <Services />
        {/* Teaser: move detailed lenses to /lentes to reduce scroll depth */}
        <section id="lentes-teaser" className="bg-white py-12">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Lentes de Contato</h2>
            <p className="text-slate-600 max-w-2xl mx-auto mb-6">Descubra os tipos ideais para seu conforto e saúde ocular.</p>
            <a href="/lentes" className="text-blue-600 font-medium hover:underline">Ver detalhes</a>
          </div>
        </section>
        <About />
        <TrustSignals />
        {/* Testimonials limited to 3 on homepage */}
        <Testimonials limit={3} />
        <BlogSection />
        <FAQ />
  <Contact />
  <GoogleLocalSection />
      </main>
      
  <Footer />
  <FloatingCTA />
      <Accessibility />
    </div>
  );
}

export default HomePage;