import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
const BlogPage = lazy(() => import('@/pages/BlogPage'));
const PostPage = lazy(() => import('@/pages/PostPage'));
// EpisodePage removido junto com PodcastPage
import ScrollToTop from '@/components/ScrollToTop';
import { Toaster } from '@/components/ui/toaster';
import ConsentManager from '@/components/ConsentManager';
import FloatingCTA from '@/components/FloatingCTA';
// import ExitPopupTester from '@/components/ExitPopupTester';

  function App() {
  const { i18n } = useTranslation();
  const wordpressUrl = import.meta.env.VITE_WORDPRESS_URL;

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<div className="w-full py-20 text-center text-sm text-slate-500">Carregando...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/servicos" element={<ServicesPage />} />
          <Route path="/servico/:serviceId" element={<ServiceDetailPage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/depoimentos" element={<TestimonialsPage />} />
          <Route path="/contato" element={<ContactPage />} />
          <Route path="/lentes" element={<LensesPage />} />
          {/* Rotas de podcast removidas - redirecionamento será feito no componente */}
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/blog" element={<BlogPage wordpressUrl={wordpressUrl} />} />
          <Route path="/blog/:slug" element={<PostPage wordpressUrl={wordpressUrl} />} />
        </Routes>
        </Suspense>
      <Toaster />
      <ConsentManager />
      <FloatingCTA />
    </>
  );
}

export default App;
