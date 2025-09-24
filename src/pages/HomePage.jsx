import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import SchemaMarkup from '../components/SchemaMarkup';
import { useHomeSEO } from '../hooks/useSEO';
import { initScrollSystem, scrollToHash, cleanupScrollSystem } from '../utils/scrollUtils';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import About from '../components/About';
import Contact from '../components/Contact';
import EnhancedFooter from '../components/EnhancedFooter';
import GoogleReviewsIntegration from '../components/GoogleReviewsIntegration';
import GoogleLocalSection from '../components/GoogleLocalSection';
import FAQ from '../components/FAQ';
import LatestEpisodes from '../components/LatestEpisodes';
import LatestBlogPosts from '../components/LatestBlogPosts';

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
          <GoogleReviewsIntegration
            maxReviews={3}
            showViewAllButton={true}
          />
          <GoogleLocalSection />
          <FAQ />
          <LatestEpisodes />
          <LatestBlogPosts />
          <Contact />
        </main>

        <EnhancedFooter />
      </div>
    </>
  );
}

export default HomePage;
