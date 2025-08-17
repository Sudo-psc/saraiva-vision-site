import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Testimonials from '@/components/Testimonials';
import FloatingCTA from '@/components/FloatingCTA';

const TestimonialsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-28">
        <Testimonials />
      </main>
      <Footer />
      <FloatingCTA />
    </div>
  );
};

export default TestimonialsPage;
