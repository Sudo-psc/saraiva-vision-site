import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactLenses from '@/components/ContactLenses';
import FloatingCTA from '@/components/FloatingCTA';

const LensesPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-28">
        <ContactLenses />
      </main>
      <Footer />
      <FloatingCTA />
    </div>
  );
};

export default LensesPage;
