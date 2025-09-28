import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import createLazyComponent from './utils/lazyLoading.jsx';

// Code splitting das rotas para melhorar TTI inicial da Home com retry logic
const HomePageLayout = createLazyComponent(() => import('./pages/HomePageLayout.jsx'));
const ServicesPage = createLazyComponent(() => import('./pages/ServicesPage.jsx'));
const AboutPage = createLazyComponent(() => import('./pages/AboutPage.jsx'));
const PrivacyPolicyPage = createLazyComponent(() => import('./pages/PrivacyPolicyPage.jsx'));
const ServiceDetailPage = createLazyComponent(() => import('./pages/ServiceDetailPage.jsx'));
const LensesPage = createLazyComponent(() => import('./pages/LensesPage.jsx'));
const FAQPage = createLazyComponent(() => import('./pages/FAQPage.jsx'));
const MedicalArticleExample = createLazyComponent(() => import('./pages/MedicalArticleExample.jsx'));
const PodcastPage = createLazyComponent(() => import('./pages/PodcastPage.jsx'));

const BlogPage = createLazyComponent(() => import('./pages/BlogPage.jsx'));
const PostPage = createLazyComponent(() => import('./pages/PostPage.jsx'));
const CategoryPage = createLazyComponent(() => import('./pages/CategoryPage.jsx'));
const AdminLoginPage = createLazyComponent(() => import('./pages/AdminLoginPage.jsx'));
const WordPressAdminRedirect = createLazyComponent(() => import('./components/WordPressAdminRedirect.jsx'));
const CheckPage = createLazyComponent(() => import('./pages/CheckPage.jsx'));
const DashboardPage = createLazyComponent(() => import('./pages/DashboardPage.jsx'));
const GoogleReviewsTestPage = createLazyComponent(() => import('./pages/GoogleReviewsTestPage.jsx'));
const MapTestPage = createLazyComponent(() => import('./pages/MapTestPage.jsx'));
import ScrollToTop from './components/ScrollToTop.jsx';
import ServiceRedirect from './components/ServiceRedirect.jsx';
import { Toaster } from './components/ui/toaster.jsx';
import CTAModal from './components/CTAModal.jsx';
import ServiceWorkerUpdateNotification from './components/ServiceWorkerUpdateNotification.jsx';
import Navbar from './components/Navbar.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { clinicInfo } from './lib/clinicInfo.js';
import Accessibility from './components/Accessibility.jsx';
import { WidgetProvider } from './utils/widgetManager.jsx';

import { initErrorTracking } from './utils/errorTracking.js';

function App() {
  const isCheckSubdomain =
    typeof window !== 'undefined' && window.location.hostname?.toLowerCase().startsWith('check.');

  useEffect(() => {
    document.documentElement.lang = 'pt-BR';

    // Initialize error tracking for production
    initErrorTracking();
  }, []);

  return (
    <HelmetProvider>
          <WidgetProvider>
            {/*
          Envolvemos apenas o conteúdo da aplicação em um wrapper dedicado.
          SCROLL NORMALIZADO: Container sem bloqueios que permite scroll fluido.
          Isso permite aplicar zoom/transform no conteúdo sem afetar widgets
          fixos (Chatbot IA, Acessibilidade, toasts, modais), que permanecem
          fora desse container e não sofrem com o bug de fixed + transform.
        */}
             <div id="app-content">
               <Navbar />
               <ScrollToTop />
               <ErrorBoundary>
                  <Routes>
                  <Route path="/" element={isCheckSubdomain ? <CheckPage /> : <HomePageLayout />} />
                  <Route path="/check" element={<CheckPage />} />
                  <Route path="/servicos" element={<ServicesPage />} />
                  <Route path="/servicos/:serviceId" element={<ServiceDetailPage />} />
                  {/* Redirecionamentos 301 para padronização de URLs */}
                  <Route path="/servico/:serviceId" element={<ServiceRedirect />} />
                  <Route path="/sobre" element={<AboutPage />} />
                  <Route path="/lentes" element={<LensesPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/artigos/catarata" element={<MedicalArticleExample />} />
                  <Route path="/podcast" element={<PodcastPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<PostPage />} />
                  <Route path="/categoria/:slug" element={<CategoryPage />} />
                   <Route path="/admin/login" element={<AdminLoginPage />} />
                   <Route path="/admin" element={<AdminLoginPage />} />
                   <Route path="/admin/*" element={<DashboardPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/google-reviews-test" element={<GoogleReviewsTestPage />} />
                  <Route path="/map-test" element={<MapTestPage />} />
                  <Route path="/wp-admin" element={<WordPressAdminRedirect />} />

                  {isCheckSubdomain ? (
                    <Route path="*" element={<Navigate to="/" replace />} />
                  ) : (
                    <Route path="*" element={<Navigate to="/" replace />} />
                  )}
                  </Routes>
               </ErrorBoundary>
            </div>
            <Toaster />
            <CTAModal />
            <ServiceWorkerUpdateNotification />
              <Accessibility />
          </WidgetProvider>
    </HelmetProvider>
  );
}

export default App;
