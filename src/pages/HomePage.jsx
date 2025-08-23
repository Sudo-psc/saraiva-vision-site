import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { useHomeSEO } from '@/hooks/useSEO';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import ContactLenses from '@/components/ContactLenses';
import About from '@/components/About';
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
  const seoData = useHomeSEO();

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
    <div className="min-h-screen bg-white">
      <SEOHead {...seoData} />
      <Toaster />
      <Navbar />
      
      <main>
        <Hero />
        <Services />
        {/* Testimonials moved up to build trust early */}
        <Testimonials limit={3} />
        <About />
        {/* Teaser: move detailed lenses to /lentes to reduce scroll depth */}
        <section id="lentes-teaser" className="bg-white py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">Lentes de Contato</h2>
            <p className="text-slate-600 max-w-2xl mx-auto mb-8">Descubra os tipos ideais para seu conforto e saúde ocular.</p>
            <a href="/lentes" className="text-blue-600 font-medium hover:underline text-lg">Ver detalhes</a>
          </div>
        </section>
        <FAQ />
        <Contact />
        <GoogleLocalSection />
        <BlogSection />
      </main>
      
  <Footer />
  <FloatingCTA />
      <Accessibility />
    </div>
  );
}

export default HomePage;