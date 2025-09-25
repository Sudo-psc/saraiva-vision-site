import React from 'react';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import About from '@/components/About';
import GoogleReviewsIntegration from '@/components/GoogleReviewsIntegration';
import GoogleLocalSection from '@/components/GoogleLocalSection';
import FAQ from '@/components/FAQ';
import LatestEpisodes from '@/components/LatestEpisodes';
import LatestBlogPosts from '@/components/LatestBlogPosts';
import Contact from '@/components/Contact';

function HomeContent() {
  return (
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
  );
}

export default HomeContent;