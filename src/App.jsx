import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
// Code splitting das rotas para melhorar TTI inicial da Home.
const HomePageLayout = lazy(() => import('./pages/HomePageLayout.jsx'));
const ServicesPage = lazy(() => import('./pages/ServicesPage.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage.jsx'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage.jsx'));
const LensesPage = lazy(() => import('./pages/LensesPage.jsx'));
const FAQPage = lazy(() => import('./pages/FAQPage.jsx'));
const MedicalArticleExample = lazy(() => import('./pages/MedicalArticleExample.jsx'));
const PodcastPage = lazy(() => import('./pages/PodcastPage.jsx'));

const BlogPage = lazy(() => import('./pages/BlogPage.jsx'));
const PostPage = lazy(() => import('./pages/PostPage.jsx'));
const CategoryPage = lazy(() => import('./pages/CategoryPage.jsx'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage.jsx'));
const WordPressAdminRedirect = lazy(() => import('./components/WordPressAdminRedirect.jsx'));
const CheckPage = lazy(() => import('./pages/CheckPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const GoogleReviewsTestPage = lazy(() => import('./pages/GoogleReviewsTestPage.jsx'));
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
                 <Suspense fallback={
                   <div className="w-full py-20 text-center">
                     <div className="text-sm text-slate-700 mb-2">Carregando página...</div>
                     <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"></div>
                   </div>
                 }>
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
                  <Route path="/wp-admin" element={<WordPressAdminRedirect />} />

                  {isCheckSubdomain ? (
                    <Route path="*" element={<Navigate to="/" replace />} />
                  ) : (
                    <Route path="*" element={<Navigate to="/" replace />} />
                  )}
                  </Routes>
                 </Suspense>
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
