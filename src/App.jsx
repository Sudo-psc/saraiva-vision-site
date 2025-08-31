import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HelmetProvider } from 'react-helmet-async';
// Code splitting das rotas para melhorar TTI inicial da Home.
const HomePage = lazy(() => import('@/pages/HomePage'));
const ServicesPage = lazy(() => import('@/pages/ServicesPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const TestimonialsPage = lazy(() => import('@/pages/TestimonialsPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'));
const ServiceDetailPage = lazy(() => import('@/pages/ServiceDetailPage'));
const LensesPage = lazy(() => import('@/pages/LensesPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const MedicalArticleExample = lazy(() => import('@/pages/MedicalArticleExample'));
const PodcastPage = lazy(() => import('@/pages/PodcastPage'));
import ScrollToTop from '@/components/ScrollToTop';
import { Toaster } from '@/components/ui/toaster';
import ConsentManager from '@/components/ConsentManager';
import CTAModal from '@/components/CTAModal';
import WhatsappWidget from '@/components/WhatsappWidget';
import { clinicInfo } from '@/lib/clinicInfo';
import { safePhoneFormat } from '@/utils/phoneFormatter';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <HelmetProvider>
      <ScrollToTop />
      <Suspense fallback={<div className="w-full py-20 text-center text-sm text-slate-700">Carregando...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/servicos" element={<ServicesPage />} />
          <Route path="/servico/:serviceId" element={<ServiceDetailPage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/depoimentos" element={<TestimonialsPage />} />
          <Route path="/contato" element={<ContactPage />} />
          <Route path="/lentes" element={<LensesPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/artigos/catarata" element={<MedicalArticleExample />} />
          <Route path="/podcast" element={<PodcastPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
        </Routes>
      </Suspense>
      <Toaster />
      <ConsentManager />
      <CTAModal />
      <WhatsappWidget phoneNumber={safePhoneFormat(clinicInfo.whatsapp || clinicInfo.phone)} />
    </HelmetProvider>
  );
}

export default App;
