import React, { useMemo, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServiceHeader from '@/components/ServiceDetail/ServiceHeader';
import ServiceMainContent from '@/components/ServiceDetail/ServiceMainContent';
import ServiceSidebar from '@/components/ServiceDetail/ServiceSidebar';
import { createServiceConfig, STYLES } from '@/data/serviceConfig';
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
    window.dispatchEvent(new Event('open-cta-modal'));
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden touch-scroll">
      <SEOHead {...seoData} />
      <Navbar />
      
      <main className="flex-1 pt-20 sm:pt-24 lg:pt-28 bg-gradient-to-br from-blue-50 to-white">
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
