import React, { useEffect } from 'react';
import { useParams, useNavigate } from '@/utils/router';
import Navbar from '@/components/Navbar';
import EnhancedFooter from '@/components/EnhancedFooter';
import SEOHead from '@/components/SEOHead';
import ServiceDetailedContent from '@/components/ServiceDetailedContent';
import { useTranslation } from 'react-i18next';
import { createServiceConfig } from '@/data/serviceConfig';
import { generateServiceFAQSchema } from '@/lib/serviceFAQSchema';
import { ArrowLeft, Clock, CheckCircle, Star, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Busca o serviço específico
  const serviceConfig = createServiceConfig(t);
  const service = serviceConfig[serviceId];

  // Se o serviço não for encontrado, mostra página de erro
  if (!service) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <SEOHead title="Serviço não encontrado | Saraiva Vision" />
        <Navbar />
        <main className="flex-1 pt-28 scroll-block-internal mx-[5%] lg:mx-[10%]">
          <div className="container mx-auto px-4 md:px-6 py-12 text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Serviço não encontrado</h1>
            <p className="text-slate-600 mb-8">O serviço que você está procurando não existe ou foi movido.</p>
            <button
              onClick={() => navigate('/servicos')}
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Serviços
            </button>
          </div>
        </main>
        <EnhancedFooter />
      </div>
    );
  }

  // Generate FAQ schema for SEO
  useEffect(() => {
    if (service) {
      // Get FAQ data from ServiceDetailedContent component data
      const serviceContentData = {
        'consultas-oftalmologicas': {
          faqs: [
            {
              question: "Com que frequência devo fazer consultas oftalmológicas?",
              answer: "Recomendamos consultas anuais para adultos até 40 anos, semestrais após os 40 anos devido ao aumento do risco de glaucoma e presbiopia, e conforme orientação médica para portadores de doenças oculares crônicas."
            },
            {
              question: "Preciso dilatar a pupila em todas as consultas?",
              answer: "A dilatação pupilar é necessária para exame completo da retina e diagnóstico de várias condições. Geralmente é realizada na primeira consulta e posteriormente conforme indicação clínica específica."
            },
            {
              question: "Posso dirigir após a consulta com dilatação?",
              answer: "Não é recomendado dirigir por 4-6 horas após a dilatação devido ao embaçamento visual e fotofobia. Sugerimos vir acompanhado ou utilizar transporte alternativo."
            }
          ]
        }
      };

      const contentData = serviceContentData[serviceId];
      if (contentData?.faqs) {
        const faqSchema = generateServiceFAQSchema(serviceId, contentData.faqs, service.title);
        if (faqSchema) {
          // Remove existing FAQ schema
          const existingSchema = document.querySelector('script[type="application/ld+json"][data-faq-schema]');
          if (existingSchema) {
            existingSchema.remove();
          }

          // Add new FAQ schema
          const script = document.createElement('script');
          script.type = 'application/ld+json';
          script.setAttribute('data-faq-schema', 'true');
          script.textContent = JSON.stringify(faqSchema);
          document.head.appendChild(script);
        }
      }
    }

    return () => {
      // Cleanup: remove FAQ schema when component unmounts
      const existingSchema = document.querySelector('script[type="application/ld+json"][data-faq-schema]');
      if (existingSchema) {
        existingSchema.remove();
      }
    };
  }, [serviceId, service]);

  const seo = {
    title: service.title + ' | Saraiva Vision',
    description: service.fullDescription || service.description,
    keywords: 'oftalmologia, serviços, consultas, exames, cirurgias, ' + service.title.toLowerCase(),
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead {...seo} />
      <Navbar />

      <main className="flex-1 pt-28 scroll-block-internal mx-[5%] lg:mx-[10%]">
        <div className="container mx-auto px-4 md:px-6 py-12">
          {/* Breadcrumb e voltar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/servicos')}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4 font-medium group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Voltar para Serviços
            </button>

            <nav className="text-sm text-slate-500">
              <span>Serviços</span> / <span className="text-slate-900">{service.title}</span>
            </nav>
          </motion.div>

          {/* Header da página */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 drop-shadow-sm">
              {service.title}
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">
              {service.fullDescription || service.description}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Conteúdo principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Benefícios */}
              {service.benefits && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-6 shadow-soft-light border border-slate-200/50"
                >
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                    <Star className="w-6 h-6 mr-3 text-yellow-500" />
                    Benefícios
                  </h2>
                  <ul className="space-y-3">
                    {service.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </motion.section>
              )}

              {/* O que está incluído */}
              {service.included && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-6 shadow-soft-light border border-slate-200/50"
                >
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    O que está incluído
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {service.included.map((item, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                        <span className="text-slate-700 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}
            </div>

            {/* Sidebar com informações */}
            <div className="space-y-6">
              {/* Duração */}
              {service.duration && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 shadow-sm"
                >
                  <div className="flex items-center mb-3">
                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-slate-900">Duração</h3>
                  </div>
                  <p className="text-slate-700">{service.duration}</p>
                </motion.div>
              )}

              {/* Preparação */}
              {service.preparation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100 shadow-sm"
                >
                  <h3 className="font-semibold text-slate-900 mb-3">Como se preparar</h3>
                  <p className="text-slate-700">{service.preparation}</p>
                </motion.div>
              )}

              {/* CTA para agendamento */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white"
              >
                <h3 className="font-bold text-lg mb-3">Agende sua consulta</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Entre em contato conosco para agendar seu {service.title.toLowerCase()}.
                </p>
                <button
                  onClick={() => navigate('/contato')}
                  className="w-full bg-white text-blue-600 font-semibold py-3 px-6 rounded-xl hover:bg-blue-50 hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-blue-100"
                >
                  <span className="flex items-center justify-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Agora
                  </span>
                </button>
              </motion.div>
            </div>
          </div>

          {/* Conteúdo detalhado com FAQs, interlinks e referências */}
          <div className="mt-12">
            <ServiceDetailedContent serviceId={serviceId} />
          </div>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
};

export default ServiceDetailPage;
