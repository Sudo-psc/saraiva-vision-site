import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import createLazyComponent from '@/utils/lazyLoading.jsx';

// Code splitting das rotas para melhorar TTI inicial da Home com retry logic
const HomePageLayout = createLazyComponent(() => import('./views/HomePageLayout.jsx'));
const ServicesPage = createLazyComponent(() => import('./views/ServicesPage.jsx'));
const AboutPage = createLazyComponent(() => import('./views/AboutPage.jsx'));
const PrivacyPolicyPage = createLazyComponent(() => import('./views/PrivacyPolicyPage.jsx'));
const ServiceDetailPage = createLazyComponent(() => import('./views/ServiceDetailPage.jsx'));
const LensesPage = createLazyComponent(() => import('./views/LensesPage.jsx'));
const FAQPage = createLazyComponent(() => import('./views/FAQPage.jsx'));
const MedicalArticleExample = createLazyComponent(() => import('./views/MedicalArticleExample.jsx'));
const PodcastPageConsolidated = createLazyComponent(() => import('./views/PodcastPageConsolidated.jsx'));

const BlogPage = createLazyComponent(() => import('@/modules/blog/pages/BlogPage.jsx'));
const CheckPage = createLazyComponent(() => import('./views/CheckPage.jsx'));
const PlansPage = createLazyComponent(() => import('@/modules/payments/pages/PlansPage.jsx'));
const PlanBasicoPage = createLazyComponent(() => import('@/modules/payments/pages/PlanBasicoPage.jsx'));
const PlanPadraoPage = createLazyComponent(() => import('@/modules/payments/pages/PlanPadraoPage.jsx'));
const PlanPremiumPage = createLazyComponent(() => import('@/modules/payments/pages/PlanPremiumPage.jsx'));
const PlanosOnlinePage = createLazyComponent(() => import('@/modules/payments/pages/PlanosOnlinePage.jsx'));
const PlanosFlexPage = createLazyComponent(() => import('@/modules/payments/pages/PlanosFlexPage.jsx'));
const PagamentoBasicoPage = createLazyComponent(() => import('@/modules/payments/pages/PagamentoBasicoPage.jsx'));
const PagamentoPadraoPage = createLazyComponent(() => import('@/modules/payments/pages/PagamentoPadraoPage.jsx'));
const PagamentoPremiumPage = createLazyComponent(() => import('@/modules/payments/pages/PagamentoPremiumPage.jsx'));
const PagamentoBasicoOnlinePage = createLazyComponent(() => import('@/modules/payments/pages/PagamentoBasicoOnlinePage.jsx'));
const PagamentoPadraoOnlinePage = createLazyComponent(() => import('@/modules/payments/pages/PagamentoPadraoOnlinePage.jsx'));
const PagamentoPremiumOnlinePage = createLazyComponent(() => import('@/modules/payments/pages/PagamentoPremiumOnlinePage.jsx'));
const GoogleReviewsTestPage = createLazyComponent(() => import('./views/GoogleReviewsTestPage.jsx'));
const MapTestPage = createLazyComponent(() => import('./views/MapTestPage.jsx'));
const AgendamentoPage = createLazyComponent(() => import('./views/AgendamentoPage.jsx'));
const AssinePage = createLazyComponent(() => import('./views/AssinePage.jsx'));
const WaitlistPage = createLazyComponent(() => import('./views/WaitlistPage.jsx'));
const QuestionarioOlhoSecoPage = createLazyComponent(() => import('./views/QuestionarioOlhoSecoPage.jsx'));
const CampanhaOutubroOlhoSecoPage = createLazyComponent(() => import('./views/CampanhaOutubroOlhoSecoPage.jsx'));
const AppointmentThankYouPage = createLazyComponent(() => import('./views/AppointmentThankYouPage.jsx'));
const AgendamentoOtimizadoPage = createLazyComponent(() => import('./views/AgendamentoOtimizadoPage.jsx'));
const NotFoundPage = createLazyComponent(() => import('./views/NotFoundPage.jsx'));
import ScrollToTop from './components/ScrollToTop.jsx';
import ServiceRedirect from './components/ServiceRedirect.jsx';
import Navbar from './components/Navbar.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { WidgetProvider } from '@/utils/widgetManager.jsx';
import LocalBusinessSchema from './components/LocalBusinessSchema.jsx';
import AnalyticsFallback from '@/components/AnalyticsFallback.jsx';
import AnalyticsProxy from '@/components/AnalyticsProxy.jsx';
import DeferredWidgets from '@/modules/core/components/DeferredWidgets.jsx';
import SkipLinks from '@/components/SkipLinks.jsx';
import { useFocusOnRouteChange } from '@/hooks/useFocusOnRouteChange.js';

function App() {
  const isCheckSubdomain =
    typeof window !== 'undefined' && window.location.hostname?.toLowerCase().startsWith('check.');

  useFocusOnRouteChange();

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
          <SkipLinks />
          <Navbar />
          <ScrollToTop />
          <ErrorBoundary>
            <main
              id="main-content"
              tabIndex={-1}
              role="main"
              className="min-h-screen focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
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
              <Route path="/planosflex" element={<PlanosFlexPage />} />
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
              <Route path="/agendamento-otimizado" element={<AgendamentoOtimizadoPage />} />
              <Route path="/agendamento/obrigado" element={<AppointmentThankYouPage />} />
              <Route path="/questionario-olho-seco" element={<QuestionarioOlhoSecoPage />} />
              <Route path="/campanha/outubro-olho-seco" element={<CampanhaOutubroOlhoSecoPage />} />
              <Route path="/assine" element={<AssinePage />} />
              <Route path="/waitlist" element={<WaitlistPage />} />
              <Route path="/google-reviews-test" element={<GoogleReviewsTestPage />} />
              <Route path="/map-test" element={<MapTestPage />} />
              <Route path="/wp-admin" element={<Navigate to="/blog" replace />} />

              {isCheckSubdomain ? (
                <Route path="*" element={<Navigate to="/" replace />} />
              ) : (
                <Route path="*" element={<NotFoundPage />} />
              )}
              </Routes>
            </main>
          </ErrorBoundary>
        </div>
        <DeferredWidgets />
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
