import React, { useEffect, useRef } from 'react';
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
import EnhancedFooter from '@/components/EnhancedFooter';
import CompactGoogleReviews from '@/components/CompactGoogleReviews';
import GoogleLocalSection from '@/components/GoogleLocalSection';
import FAQ from '@/components/FAQ';
import LatestEpisodes from '@/components/LatestEpisodes';
import LatestBlogPosts from '@/components/LatestBlogPosts';
import InstagramEmbedWidget from '@/components/InstagramEmbedWidget';
import { InstagramEmbedProvider } from '@/hooks/useInstagramEmbed.jsx';

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
          
          {/* Instagram Feed sem API */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  📸 Siga-nos no Instagram
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Acompanhe os bastidores da Saraiva Vision e fique por dentro das novidades em saúde ocular
                </p>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <InstagramEmbedProvider maxPosts={6} enableAutoRefresh={false}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Widget principal */}
                    <div className="lg:col-span-1">
                      <InstagramEmbedWidget
                        maxPosts={4}
                        showHeader={true}
                        showCaption={true}
                        className="h-full"
                        height="500px"
                      />
                    </div>
                    
                    {/* Grid de posts adicionais */}
                    <div className="lg:col-span-1">
                      <InstagramEmbedWidget
                        maxPosts={4}
                        showHeader={false}
                        showCaption={false}
                        className="instagram-grid"
                        height="500px"
                      />
                    </div>
                  </div>
                </InstagramEmbedProvider>
              </div>
            </div>
          </section>
          
          <CompactGoogleReviews />
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