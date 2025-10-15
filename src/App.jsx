import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import createLazyComponent from '@/utils/lazyLoading.jsx';

// Code splitting das rotas para melhorar TTI inicial da Home com retry logic
const HomePageLayout = createLazyComponent(() => import('./pages/HomePageLayout.jsx'));
const ServicesPage = createLazyComponent(() => import('./pages/ServicesPage.jsx'));
const AboutPage = createLazyComponent(() => import('./pages/AboutPage.jsx'));
const PrivacyPolicyPage = createLazyComponent(() => import('./pages/PrivacyPolicyPage.jsx'));
const ServiceDetailPage = createLazyComponent(() => import('./pages/ServiceDetailPage.jsx'));
const LensesPage = createLazyComponent(() => import('./pages/LensesPage.jsx'));
const FAQPage = createLazyComponent(() => import('./pages/FAQPage.jsx'));
const MedicalArticleExample = createLazyComponent(() => import('./pages/MedicalArticleExample.jsx'));
const PodcastPageConsolidated = createLazyComponent(() => import('./pages/PodcastPageConsolidated.jsx'));

const BlogPage = createLazyComponent(() => import('./pages/BlogPage.jsx'));
const CheckPage = createLazyComponent(() => import('./pages/CheckPage.jsx'));
const PlansPage = createLazyComponent(() => import('./pages/PlansPage.jsx'));
const PlanBasicoPage = createLazyComponent(() => import('./pages/PlanBasicoPage.jsx'));
const PlanPadraoPage = createLazyComponent(() => import('./pages/PlanPadraoPage.jsx'));
const PlanPremiumPage = createLazyComponent(() => import('./pages/PlanPremiumPage.jsx'));
const PlanosOnlinePage = createLazyComponent(() => import('./pages/PlanosOnlinePage.jsx'));
const PagamentoBasicoPage = createLazyComponent(() => import('./pages/PagamentoBasicoPage.jsx'));
const PagamentoPadraoPage = createLazyComponent(() => import('./pages/PagamentoPadraoPage.jsx'));
const PagamentoPremiumPage = createLazyComponent(() => import('./pages/PagamentoPremiumPage.jsx'));
const PagamentoBasicoOnlinePage = createLazyComponent(() => import('./pages/PagamentoBasicoOnlinePage.jsx'));
const PagamentoPadraoOnlinePage = createLazyComponent(() => import('./pages/PagamentoPadraoOnlinePage.jsx'));
const PagamentoPremiumOnlinePage = createLazyComponent(() => import('./pages/PagamentoPremiumOnlinePage.jsx'));
const GoogleReviewsTestPage = createLazyComponent(() => import('./pages/GoogleReviewsTestPage.jsx'));
const MapTestPage = createLazyComponent(() => import('./pages/MapTestPage.jsx'));
const AgendamentoPage = createLazyComponent(() => import('./pages/AgendamentoPage.jsx'));
const AssinePage = createLazyComponent(() => import('./pages/AssinePage.jsx'));
const NotFoundPage = createLazyComponent(() => import('./pages/NotFoundPage.jsx'));
import ScrollToTop from './components/ScrollToTop.jsx';
import ServiceRedirect from './components/ServiceRedirect.jsx';
import { Toaster } from './components/ui/toaster.jsx';
import CTAModal from './components/CTAModal.jsx';
import StickyCTA from './components/StickyCTA.jsx';
import CookieManager from './components/CookieManager.jsx';
import ServiceWorkerUpdateNotification from './components/ServiceWorkerUpdateNotification.jsx';
import Navbar from './components/Navbar.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Accessibility from './components/Accessibility.jsx';
import { WidgetProvider } from '@/utils/widgetManager.jsx';
import LocalBusinessSchema from './components/LocalBusinessSchema.jsx';
import GoogleAnalytics from './components/GoogleAnalytics.jsx';
import AnalyticsFallback from '@/components/AnalyticsFallback.jsx';
import AnalyticsProxy from '@/components/AnalyticsProxy.jsx';

function App() {
  const isCheckSubdomain =
    typeof window !== 'undefined' && window.location.hostname?.toLowerCase().startsWith('check.');

  useEffect(() => {
    document.documentElement.lang = 'pt-BR';
  }, []);

  return (
    <HelmetProvider>
      <LocalBusinessSchema />
      <AnalyticsProxy />
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
              <Route path="/planos" element={<PlansPage />} />
              <Route path="/planobasico" element={<PlanBasicoPage />} />
              <Route path="/planopadrao" element={<PlanPadraoPage />} />
              <Route path="/planopremium" element={<PlanPremiumPage />} />
              <Route path="/planosonline" element={<PlanosOnlinePage />} />
              {/* Páginas de pagamento presencial */}
              <Route path="/pagamentobasico" element={<PagamentoBasicoPage />} />
              <Route path="/pagamentopadrao" element={<PagamentoPadraoPage />} />
              <Route path="/pagamentopremium" element={<PagamentoPremiumPage />} />
              {/* Páginas de pagamento online */}
              <Route path="/pagamentobasicoonline" element={<PagamentoBasicoOnlinePage />} />
              <Route path="/pagamentopadraoonline" element={<PagamentoPadraoOnlinePage />} />
              <Route path="/pagamentopremiumonline" element={<PagamentoPremiumOnlinePage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/artigos/catarata" element={<MedicalArticleExample />} />
              <Route path="/podcast" element={<PodcastPageConsolidated />} />
              <Route path="/podcast/:slug" element={<PodcastPageConsolidated />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/agendamento" element={<AgendamentoPage />} />
              <Route path="/assine" element={<AssinePage />} />
              <Route path="/google-reviews-test" element={<GoogleReviewsTestPage />} />
              <Route path="/map-test" element={<MapTestPage />} />
              <Route path="/wp-admin" element={<Navigate to="/blog" replace />} />

              {isCheckSubdomain ? (
                <Route path="*" element={<Navigate to="/" replace />} />
              ) : (
                <Route path="*" element={<NotFoundPage />} />
              )}
            </Routes>
          </ErrorBoundary>
        </div>
        <Toaster />
        <CTAModal />
        <StickyCTA />
        <CookieManager />
        <ServiceWorkerUpdateNotification />
        <Accessibility />
      </WidgetProvider>

      {/* Analytics Fallback para contornar bloqueadores */}
      <AnalyticsFallback />
    </HelmetProvider>
  );
}

export default App;
// Test deploy optimization Mon Oct  6 00:36:34 UTC 2025
// Another test Mon Oct  6 00:37:43 UTC 2025
// Final test Mon Oct  6 00:38:58 UTC 2025
// Debug deploy Mon Oct  6 00:40:15 UTC 2025
// Test caching Mon Oct  6 00:41:25 UTC 2025
// Performance test Mon Oct  6 00:41:53 UTC 2025
// Analytics active Mon Oct  6 01:26:09 UTC 2025
