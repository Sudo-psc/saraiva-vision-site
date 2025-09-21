import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import SchemaMarkup from '@/components/SchemaMarkup';
import { useHomeSEO } from '@/hooks/useSEO';
import { initScrollSystem, scrollToHash, cleanupScrollSystem } from '@/utils/scrollUtils';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import CompactGoogleReviews from '@/components/CompactGoogleReviews';
import GoogleLocalSection from '@/components/GoogleLocalSection';
import FAQ from '@/components/FAQ';
import LatestEpisodes from '@/components/LatestEpisodes';
import LatestBlogPosts from '@/components/LatestBlogPosts';

function HomePage() {
  const location = useLocation();
  const seoData = useHomeSEO();

  useEffect(() => {
    try {
      initScrollSystem();

      // Handle hash scrolling after component mount
      if (location.hash) {
        const timer = setTimeout(() => {
          scrollToHash(location.hash);
        }, 100);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.warn('Failed to initialize scroll system:', error);
    }

    return () => {
      try {
        cleanupScrollSystem();
      } catch (error) {
        console.warn('Failed to cleanup scroll system:', error);
      }
    };
  }, [location.hash]);

  return (
    <>
      <SEOHead {...seoData} />
      <SchemaMarkup type="organization" />

      <div className="min-h-screen bg-white">
        <Navbar />

        <main>
          <Hero />
          <Services />
          <About />
          <CompactGoogleReviews />
          <GoogleLocalSection />
          <FAQ />
          <LatestEpisodes />
          <LatestBlogPosts />
          <Contact />
        </main>

        <Footer />
      </div>
    </>
  );
}

export default HomePage;