import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import SchemaMarkup from '@/components/SchemaMarkup';
import { useHomeSEO } from '@/hooks/useSEO';
import { initScrollSystem, scrollToHash, cleanupScrollSystem } from '@/utils/scrollUtils';
import createLazyComponent from '@/utils/lazyLoading.jsx';
import DeferredSection from '@/components/DeferredSection';

import Hero from '@/components/Hero';
const Services = createLazyComponent(() => import('@/components/Services'));
const About = createLazyComponent(() => import('@/components/About'));
const TrustBanner = React.lazy(() => import('@/components/TrustBanner'));

const DryEyeCenterSection = createLazyComponent(() => import('@/components/DryEyeCenterSection'));
const GoogleReviewsEnhanced = createLazyComponent(() => import('@/components/GoogleReviewsEnhanced'));
const GoogleLocalSection = createLazyComponent(() => import('@/components/GoogleLocalSection'));
const FAQ = createLazyComponent(() => import('@/components/FAQ'));
const LatestEpisodes = createLazyComponent(() => import('@/components/LatestEpisodes'));
const LatestBlogPosts = createLazyComponent(() => import('@/components/LatestBlogPosts'));
const Contact = createLazyComponent(() => import('@/components/Contact'));
const EnhancedFooter = createLazyComponent(() => import('@/components/EnhancedFooter'));

function HomePage() {
  const location = useLocation();
  const seoData = useHomeSEO();
  const isInitialized = useRef(false);
  const [showTrustBanner, setShowTrustBanner] = useState(false);

  // Analytics tracking - runs only when pathname changes
  useEffect(() => {
    let cancelled = false;
    let idleId;
    let timeoutId;

    const run = () => {
      import('@/utils/analytics')
        .then(({ trackPageView }) => {
          if (!cancelled) {
            trackPageView(location.pathname);
          }
        })
        .catch(() => {});
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(run, { timeout: 2000 });
      } else {
        timeoutId = window.setTimeout(run, 2000);
      }
    } else {
      run();
    }

    return () => {
      cancelled = true;
      if (idleId && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [location.pathname]);

  useEffect(() => {
    let idleId;
    let timeoutId;

    const run = () => {
      setShowTrustBanner(true);
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(run, { timeout: 2000 });
      } else {
        timeoutId = window.setTimeout(run, 2000);
      }
    } else {
      run();
    }

    return () => {
      if (idleId && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

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
        {showTrustBanner && (
          <React.Suspense fallback={null}>
            <TrustBanner />
          </React.Suspense>
        )}

        <main>
          <Hero />
          <DeferredSection className="min-h-[640px] sm:min-h-[520px]" rootMargin="0px">
            <Services autoplay full={false} />
          </DeferredSection>
          <DeferredSection className="min-h-[480px] sm:min-h-[360px]">
            <DryEyeCenterSection />
          </DeferredSection>
          <DeferredSection className="min-h-[680px] sm:min-h-[520px]">
            <About />
          </DeferredSection>
          <DeferredSection className="min-h-[540px] sm:min-h-[420px]">
            <GoogleReviewsEnhanced
              maxReviews={3}
              showWidget={true}
              className="mb-16"
            />
          </DeferredSection>
          <DeferredSection className="min-h-[540px] sm:min-h-[420px]">
            <GoogleLocalSection />
          </DeferredSection>
          <DeferredSection className="min-h-[480px] sm:min-h-[360px]">
            <FAQ />
          </DeferredSection>
          <DeferredSection className="min-h-[680px] sm:min-h-[520px]">
            <LatestEpisodes />
          </DeferredSection>
          <DeferredSection className="min-h-[600px] sm:min-h-[480px]">
            <LatestBlogPosts />
          </DeferredSection>
          <DeferredSection className="min-h-[560px] sm:min-h-[420px]">
            <Contact />
          </DeferredSection>
        </main>

        <DeferredSection className="min-h-[480px] sm:min-h-[360px]">
          <EnhancedFooter />
        </DeferredSection>
      </div>
    </>
  );
}

export default HomePage;
