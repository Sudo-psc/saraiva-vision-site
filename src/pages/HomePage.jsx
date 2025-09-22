import { useEffect, useRef } from 'react';
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
import InstagramFeed from '@/components/InstagramFeed';

function HomePage() {
  const location = useLocation();
  const seoData = useHomeSEO();
  const isInitialized = useRef(false);

  useEffect(() => {
    let timer = null;

    try {
      // Only initialize once to prevent infinite loops
      if (!isInitialized.current) {
        initScrollSystem();
        isInitialized.current = true;
      }

      // Handle hash scrolling after component mount
      if (location.hash) {
        timer = setTimeout(() => {
          scrollToHash(location.hash);
        }, 100);
      }
    } catch (error) {
      console.warn('Failed to initialize scroll system:', error);
    }

    // Single cleanup function that handles both cases
    return () => {
      try {
        if (timer) {
          clearTimeout(timer);
        }
        // Only cleanup on unmount, not on hash changes
        if (!location.hash) {
          cleanupScrollSystem();
          isInitialized.current = false;
        }
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
          <InstagramFeed 
            limit={4}
            className="bg-gray-50"
            autoRefresh={true}
            pollingInterval={5 * 60 * 1000}
            gridCols={{ default: 2, md: 4 }}
          />
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