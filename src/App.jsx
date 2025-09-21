import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Code splitting das rotas para melhorar TTI inicial da Home.
const HomePageLayout = lazy(() => import('@/pages/HomePageLayout'));
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
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const BlogPage = lazy(() => import('@/pages/BlogPage'));
const PostPage = lazy(() => import('@/pages/PostPage'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const AdminLoginPage = lazy(() => import('@/pages/AdminLoginPage'));
const CheckPage = lazy(() => import('@/pages/CheckPage'));

import ScrollToTop from '@/components/ScrollToTop';
import ServiceRedirect from '@/components/ServiceRedirect';
import { Toaster } from '@/components/ui/toaster';
import ConsentManager from '@/components/ConsentManager';
import CTAModal from '@/components/CTAModal';
import WhatsappWidget from '@/components/WhatsappWidget';
import ServiceWorkerUpdateNotification from '@/components/ServiceWorkerUpdateNotification';
import { clinicInfo } from '@/lib/clinicInfo';
import { safePhoneFormat } from '@/utils/phoneFormatter';
import Accessibility from '@/components/Accessibility';
import { WidgetProvider } from '@/utils/widgetManager.jsx';
import { initScrollTelemetry } from '@/utils/scrollTelemetry';
import ScrollDiagnostics from '@/components/ScrollDiagnostics';

function App() {
  const isCheckSubdomain =
    typeof window !== 'undefined' && window.location.hostname?.toLowerCase().startsWith('check.');

  useEffect(() => {
    // Set default language
    document.documentElement.lang = 'pt';

    // Initialize scroll telemetry
    try {
      initScrollTelemetry();
    } catch (error) {
      console.warn('Failed to initialize scroll telemetry:', error);
    }
  }, []);

  return (
    <HelmetProvider>
      <WidgetProvider>
        <div id="app-content">
          <ScrollToTop />
          <Suspense fallback={<div className="w-full py-20 text-center text-sm text-slate-700">Carregando...</div>}>
            <Routes>
              <Route path="/" element={isCheckSubdomain ? <CheckPage /> : <HomePageLayout />} />
              <Route path="/check" element={<CheckPage />} />
              <Route path="/servicos" element={<ServicesPage />} />
              <Route path="/servicos/:serviceId" element={<ServiceDetailPage />} />
              <Route path="/servico/:serviceId" element={<ServiceRedirect />} />
              <Route path="/sobre" element={<AboutPage />} />
              <Route path="/depoimentos" element={<TestimonialsPage />} />
              <Route path="/contato" element={<ContactPage />} />
              <Route path="/lentes" element={<LensesPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/artigos/catarata" element={<MedicalArticleExample />} />
              <Route path="/podcast" element={<PodcastPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<PostPage />} />
              <Route path="/categoria/:slug" element={<CategoryPage />} />
              <Route path="/admin" element={<AdminLoginPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/wp-admin" element={<AdminPage />} />
              {isCheckSubdomain ? <Route path="*" element={<Navigate to="/" replace />} /> : null}
            </Routes>
          </Suspense>
        </div>
        <Toaster />
        <ConsentManager />
        <CTAModal />
        <ServiceWorkerUpdateNotification />
        <WhatsappWidget phoneNumber={safePhoneFormat(clinicInfo.whatsapp || clinicInfo.phone)} />
        <Accessibility />
        <ScrollDiagnostics />
      </WidgetProvider>
    </HelmetProvider>
  );
}

export default App;