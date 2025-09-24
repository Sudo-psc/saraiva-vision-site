import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const GoogleReviewsTestPage = lazy(() => import('@/pages/GoogleReviewsTestPage'));
const ChatbotTestPage = lazy(() => import('@/pages/ChatbotTestPage'));
import ScrollToTop from '@/components/ScrollToTop';
import ServiceRedirect from '@/components/ServiceRedirect';
import { Toaster } from '@/components/ui/toaster';

import CTAModal from '@/components/CTAModal';
import WhatsappWidget from '@/components/WhatsappWidget';
import ChatbotWidget from '@/components/ChatbotWidget';
import AnalyticsProvider from '@/components/AnalyticsProvider';
import ServiceWorkerUpdateNotification from '@/components/ServiceWorkerUpdateNotification';
import { clinicInfo } from '@/lib/clinicInfo';
import { safePhoneFormat } from '@/utils/phoneFormatter';
import Accessibility from '@/components/Accessibility';
import { WidgetProvider } from '@/utils/widgetManager.jsx';


import { initErrorTracking } from '@/utils/errorTracking';
import { PostHogProvider } from '@/contexts/PostHogContext';

function App() {
  const { i18n } = useTranslation();
  const isCheckSubdomain =
    typeof window !== 'undefined' && window.location.hostname?.toLowerCase().startsWith('check.');

  useEffect(() => {
    document.documentElement.lang = i18n.language;



    // Initialize error tracking for production
    initErrorTracking();
  }, [i18n.language]);

  return (
    <HelmetProvider>
      <PostHogProvider>
        <AnalyticsProvider>
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
                  <Route path="/" element={isCheckSubdomain ? <CheckPage /> : <HomePageLayout />} />
                  <Route path="/check" element={<CheckPage />} />
                  <Route path="/servicos" element={<ServicesPage />} />
                  <Route path="/servicos/:serviceId" element={<ServiceDetailPage />} />
                  {/* Redirecionamentos 301 para padronização de URLs */}
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
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/admin/*" element={<DashboardPage />} />
                  <Route path="/admin" element={<AdminLoginPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/google-reviews-test" element={<GoogleReviewsTestPage />} />
                  <Route path="/chatbot-test" element={<ChatbotTestPage />} />
                  <Route path="/wp-admin" element={<AdminPage />} />
                  {isCheckSubdomain ? <Route path="*" element={<Navigate to="/" replace />} /> : null}
                </Routes>
              </Suspense>
            </div>
            <Toaster />
            <CTAModal />
            <ServiceWorkerUpdateNotification />
            <WhatsappWidget phoneNumber={safePhoneFormat(clinicInfo.whatsapp || clinicInfo.phone)} />
            <ChatbotWidget />
            <Accessibility />
          </WidgetProvider>
        </AnalyticsProvider>
      </PostHogProvider>
    </HelmetProvider>
  );
}

export default App;
