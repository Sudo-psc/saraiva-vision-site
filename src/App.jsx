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
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const BlogPage = lazy(() => import('@/pages/BlogPage'));
const PostPage = lazy(() => import('@/pages/PostPage'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const AdminLoginPage = lazy(() => import('@/pages/AdminLoginPage'));
import ScrollToTop from '@/components/ScrollToTop';
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
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;

    // Inicializa telemetria de scroll para monitorar preventDefault
    initScrollTelemetry();
  }, [i18n.language]);

  return (
    <HelmetProvider>
      <WidgetProvider>
        {/*
          Envolvemos apenas o conteúdo da aplicação em um wrapper dedicado.
          SCROLL NORMALIZADO: Container sem bloqueios que permite scroll fluido.
          Isso permite aplicar zoom/transform no conteúdo sem afetar widgets
          fixos (WhatsApp, Acessibilidade, toasts, modais), que permanecem
          fora desse container e não sofrem com o bug de fixed + transform.
        */}
        <div id="app-content">
          <ScrollToTop />
          <Suspense fallback={<div className="w-full py-20 text-center text-sm text-slate-700">Carregando...</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/servicos" element={<ServicesPage />} />
              <Route path="/servicos/:serviceId" element={<ServiceDetailPage />} />
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
