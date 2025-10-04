/**
 * Original Homepage Component - Next.js 15 Version
 * Classic Saraiva Vision homepage with all standard sections
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import SchemaMarkup from '@/components/seo/SchemaMarkup';
import { initScrollSystem, scrollToHash, cleanupScrollSystem } from '@/lib/scrollUtils';

import Hero from '@/components/Hero';
import Services from '@/components/Services';
import About from '@/components/About';
import Contact from '@/components/Contact';
import EnhancedFooter from '@/components/EnhancedFooter';
import GoogleReviewsIntegration from '@/components/GoogleReviewsIntegration';
import GoogleLocalSection from '@/components/GoogleLocalSection';
import FAQ from '@/components/FAQ';
import LatestEpisodes from '@/components/LatestEpisodes';
import LatestBlogPosts from '@/components/LatestBlogPosts';

function OriginalHomepage() {
  const pathname = usePathname();
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
      if (pathname.includes('#')) {
        timer = setTimeout(() => {
          scrollToHash(pathname.split('#')[1]);
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
        if (!pathname.includes('#')) {
          cleanupScrollSystem();
          isInitialized.current = false;
        }
      } catch (error) {
        console.warn('Failed to cleanup scroll system:', error);
      }
    };
  }, [pathname]);

  return (
    <>
      <SchemaMarkup type="organization" />

       <div className="min-h-screen bg-white">
         <main>
          <Hero />
          <Services autoplay full={false} />
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

export default OriginalHomepage;