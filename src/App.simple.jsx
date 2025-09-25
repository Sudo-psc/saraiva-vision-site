import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Import direto sem lazy loading para teste
import HomePageLayout from './pages/HomePageLayout.jsx';
import ContactPage from './pages/ContactPage.jsx';

import ScrollToTop from './components/ScrollToTop.jsx';
import { Toaster } from './components/ui/toaster.jsx';

function App() {
  const isCheckSubdomain =
    typeof window !== 'undefined' && window.location.hostname?.toLowerCase().startsWith('check.');

  useEffect(() => {
    document.documentElement.lang = 'pt-BR';
  }, []);

  return (
    <HelmetProvider>
      <div className="App">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePageLayout />} />
          <Route path="/contato" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </HelmetProvider>
  );
}

export default App;