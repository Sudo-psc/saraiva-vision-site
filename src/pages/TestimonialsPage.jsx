import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Testimonials from '@/components/Testimonials';
import SEOHead from '@/components/SEOHead';
import { useTestimonialsSEO } from '@/hooks/useSEO';

const TestimonialsPage = () => {
  const seoData = useTestimonialsSEO();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead {...seoData} />
      <Navbar />
      <main className="flex-1 pt-28 mx-[4%] md:mx-[6%] lg:mx-[8%]">
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default TestimonialsPage;
