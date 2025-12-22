import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import SchemaMarkup from '../components/SchemaMarkup';
import { useHomeSEO } from '../hooks/useSEO';
import { initScrollSystem, scrollToHash, cleanupScrollSystem } from '../utils/scrollUtils';
import { trackPageView } from '../utils/analytics';

import Hero from '../components/Hero';
import Services from '../components/Services';
import About from '../components/About';
import Contact from '../components/Contact';
import EnhancedFooter from '../components/EnhancedFooter';
import GoogleReviewsEnhanced from '../components/GoogleReviewsEnhanced';
import TrustBanner from '../components/TrustBanner';
import GoogleLocalSection from '../components/GoogleLocalSection';
import FAQ from '../components/FAQ';
import LatestEpisodes from '../components/LatestEpisodes';
import LatestBlogPosts from '../components/LatestBlogPosts';

function HomePage() {
  const location = useLocation();
  const seoData = useHomeSEO();
  const isInitialized = useRef(false);

  // Analytics tracking - runs only when pathname changes
  useEffect(() => {
    try {
      trackPageView(location.pathname);
    } catch (error) {
      console.warn('Failed to track page view:', error);
    }
  }, [location.pathname]);

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
        {/* Trust Banner no topo */}
        <TrustBanner />

        <main>
          <Hero />
          <Services autoplay full={false} />
          <About />

          {/* Google Reviews Enhanced - Substituindo o componente antigo */}
          <GoogleReviewsEnhanced
            maxReviews={3}
            showWidget={true}
            className="mb-16"
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
