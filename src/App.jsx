import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// Code splitting das rotas para melhorar TTI inicial da Home.
const HomePage = lazy(() => import('@/pages/HomePage'));
const ServiceDetailPage = lazy(() => import('@/pages/ServiceDetailPage'));
const TestimonialsPage = lazy(() => import('@/pages/TestimonialsPage'));
const LensesPage = lazy(() => import('@/pages/LensesPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'));
import ScrollToTop from '@/components/ScrollToTop';
import { Toaster } from '@/components/ui/toaster';
import ConsentManager from '@/components/ConsentManager';
import ExitIntentPopup from '@/components/ExitIntentPopup';
// import ExitPopupTester from '@/components/ExitPopupTester';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<div className="w-full py-20 text-center text-sm text-slate-500">Carregando...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/servico/:serviceId" element={<ServiceDetailPage />} />
          <Route path="/depoimentos" element={<TestimonialsPage />} />
          <Route path="/lentes" element={<LensesPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
        </Routes>
      </Suspense>
      <Toaster />
      <ConsentManager />
      <ExitIntentPopup />
    </>
  );
}

export default App;