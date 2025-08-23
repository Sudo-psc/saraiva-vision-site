import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Eye, Glasses, Microscope, Stethoscope, Calendar as CalendarIcon, Clipboard, ArrowLeft, CheckCircle, Video, MessageCircle } from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import SchemaMarkup from '@/components/SchemaMarkup';
import { generateMedicalProcedureSchema } from '@/lib/schemaMarkup';

const icons = {
  'consultas-oftalmologicas': <Eye className="h-10 w-10 text-blue-500" />,
  'exames-de-refracao': <Glasses className="h-10 w-10 text-blue-500" />,
  'tratamentos-especializados': <Microscope className="h-10 w-10 text-blue-500" />,
  'cirurgias-oftalmologicas': <Stethoscope className="h-10 w-10 text-blue-500" />,
  'acompanhamento-pediatrico': <CalendarIcon className="h-10 w-10 text-blue-500" />,
  'laudos-especializados': <Clipboard className="h-10 w-10 text-blue-500" />,
};

const videoUrls = {
  'exames-de-refracao': 'https://www.youtube.com/embed/vANzrzF0KAM',
};

const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const { t } = useTranslation();
  
  const serviceData = t(`serviceDetail.services.${serviceId}`, { returnObjects: true });
  const service = {
    ...serviceData,
    icon: icons[serviceId] || icons['consultas-oftalmologicas'],
    videoUrl: videoUrls[serviceId] || null,
  };
  const pageTitle = t('serviceMeta.title', { serviceTitle: service.title });
  const metaDescription = t('serviceMeta.description', { serviceTitleLowercase: service.title.toLowerCase() });
  const metaKeywords = t('serviceMeta.keywords', { serviceTitleLowercase: service.title.toLowerCase() });

  // Schema para procedimento médico específico
  const procedureSchema = generateMedicalProcedureSchema({
    id: serviceId,
    title: service.title,
    description: service.description
  });

  // Schema para breadcrumbs
  const breadcrumbs = [
    { name: 'Início', url: '/' },
    { name: 'Serviços', url: '/#services' },
    { name: service.title, url: `/servico/${serviceId}` }
  ];

  // Schema para página médica
  const pageInfo = {
    title: service.title,
    description: service.description,
    url: `/servico/${serviceId}`
  };


  return (
    <div className="min-h-screen bg-white">
      <SchemaMarkup 
        type="webpage" 
        pageInfo={pageInfo}
        breadcrumbs={breadcrumbs}
        additionalSchemas={[procedureSchema]}
      />
       <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={metaKeywords} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={metaDescription} />
      </Helmet>
      <Navbar />
      <main className="py-32 md:py-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 md:px-6"
        >
          <div className="max-w-5xl mx-auto">
            <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-8 font-semibold group">
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              {t('serviceDetail.back_link')}
            </Link>

            <header className="mb-12">
              <div className="flex items-center mb-4">
                <div className="p-4 bg-blue-100 rounded-2xl mr-6">
                  {service.icon}
                </div>
                <h1>{service.title}</h1>
              </div>
              <p className="mt-4">{service.description}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              <div className="lg:col-span-3">
                <section className="mb-12">
                  <h3 className="mb-6 flex items-center text-xl font-semibold"><CheckCircle className="w-6 h-6 mr-3 text-green-500" /> {t('serviceDetail.advantages_title')}</h3>
                  <ul className="space-y-4">
                    {service.details.map((detail, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="p-5 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        <h4 className="text-lg font-semibold text-slate-800">{detail.title}</h4>
                        <p>{detail.text}</p>
                      </motion.li>
                    ))}
                  </ul>
                </section>
                
                {service.videoUrl && (
                  <section>
                      <h3 className="mb-6 flex items-center text-xl font-semibold"><Video className="w-6 h-6 mr-3 text-red-500" /> {t('serviceDetail.video_title')}</h3>
                      <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                          className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-soft-medium"
                      >
                           <iframe
                              className="w-full h-full"
                              src={service.videoUrl}
                              title="YouTube video player"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                          ></iframe>
                      </motion.div>
                  </section>
                )}
              </div>

              <aside className="lg:col-span-2">
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-blue-50 p-8 rounded-2xl border border-blue-200 sticky top-28"
                >
                  <h4 className="mb-4 flex items-center text-lg font-semibold"><MessageCircle className="w-6 h-6 mr-3 text-blue-600"/>{t('serviceDetail.cta_title')}</h4>
                  <p className="text-slate-700 mb-6">{t('serviceDetail.cta_desc')}</p>
                  <Button size="lg" className="w-full">{t('serviceDetail.schedule_button')}</Button>
                  <Button variant="outline" size="lg" className="w-full mt-3">{t('serviceDetail.whatsapp_button')}</Button>
                </motion.div>
              </aside>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceDetailPage;