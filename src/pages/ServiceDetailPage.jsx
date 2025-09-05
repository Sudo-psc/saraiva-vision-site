import React, { useMemo, useCallback, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import ServiceHeader from '@/components/ServiceDetail/ServiceHeader';
import ServiceMainContent from '@/components/ServiceDetail/ServiceMainContent';
import ServiceSidebar from '@/components/ServiceDetail/ServiceSidebar';
import { createServiceConfig, STYLES } from '@/data/serviceConfig';
import { trackConversion } from '@/utils/analytics';
const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const { t } = useTranslation();

  // Memoize service configuration to prevent unnecessary re-renders
  const serviceConfig = useMemo(() => createServiceConfig(t), [t]);

  const service = serviceConfig[serviceId];

  // Handle invalid service ID
  if (!service) {
    return <Navigate to="/404" replace />;
  }


  // Memoize event handler to prevent unnecessary re-renders
  const handleScheduleClick = useCallback(() => {
    try {
      // Track service CTA click for GTM/GA4
      trackConversion('service_cta_click', {
        service_id: serviceId,
        service_title: service.title,
        cta_type: 'schedule',
        source: 'service_page'
      });
    } catch (error) {
      console.warn('Service CTA tracking error:', error);
    }
    window.dispatchEvent(new Event('open-cta-modal'));
  }, [serviceId, service.title]);

  // Memoize navigation handler
  const handleBackClick = useCallback(() => {
    window.history.back();
  }, []);

  // Memoize SEO data to prevent object recreation on every render
  const seoData = useMemo(() => ({
    title: `${service.title} | Dr. Philipe Saraiva - Caratinga/MG`,
    description: service.description,
    keywords: `${service.title}, Dr. Philipe Saraiva, Oftalmologista Caratinga, ${serviceId.replace('-', ' ')}`
  }), [service.title, service.description, serviceId]);

  // Track service page view for GTM/GA4
  useEffect(() => {
    try {
      trackConversion('service_page_view', {
        service_id: serviceId,
        service_title: service.title,
        service_category: service.category || 'medical_service',
        page_url: window.location.href
      });
    } catch (error) {
      console.warn('Service page tracking error:', error);
    }
  }, [serviceId, service.title, service.category]);

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden touch-scroll">
      <SEOHead {...seoData} />
      <Navbar />
      
      <main className="flex-1 pt-20 sm:pt-24 lg:pt-28 bg-gradient-to-br from-blue-50 to-white">
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 md:px-6">
          <Breadcrumbs
            items={[
              { label: t('navbar.home', 'Início'), href: '/' },
              { label: t('navbar.services', 'Serviços'), href: '/servicos' },
              { label: service.title, current: true },
            ]}
            className="py-3 md:py-4"
          />
        </div>
        <ServiceHeader service={service} onScheduleClick={handleScheduleClick} />

        {/* Main Content */}
        <section className="py-6 sm:py-8 lg:py-12">
          <div className={STYLES.CONTAINER}>
            <div className={STYLES.MAX_WIDTH}>
              <div className={STYLES.GRID_RESPONSIVE}>
                <ServiceMainContent service={service} />
                <ServiceSidebar service={service} onScheduleClick={handleScheduleClick} />
              </div>
            </div>
          </div>
        </section>

        {/* Back Button */}
        <div className={`${STYLES.CONTAINER} pb-6 sm:pb-8`}>
          <div className={STYLES.MAX_WIDTH}>
            <Button
              onClick={handleBackClick}
              variant="outline"
              className="flex items-center gap-2 hover:bg-slate-50 text-sm sm:text-base px-3 sm:px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('navigation.backToServices', 'Voltar aos Serviços')}
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default React.memo(ServiceDetailPage);
