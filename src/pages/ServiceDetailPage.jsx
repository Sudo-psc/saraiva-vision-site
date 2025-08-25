import React, { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calendar, ArrowLeft, CheckCircle, Clock, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getServiceIcon } from '@/components/icons/ServiceIcons';
import SEOHead from '@/components/SEOHead';
const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const { t } = useTranslation();

  // Service configuration with detailed information
  const serviceConfig = useMemo(() => ({
    'consultas-oftalmologicas': {
      id: 'consultas-oftalmologicas',
      title: t('services.items.consultations.title'),
      description: t('services.items.consultations.description'),
      fullDescription: t('services.items.consultations.fullDescription'),
      benefits: [
        'Exame completo da saúde ocular',
        'Diagnóstico precoce de doenças',
        'Acompanhamento personalizado',
        'Equipamentos de última geração',
        'Orientação preventiva detalhada'
      ],
      duration: '45-60 minutos',
      preparation: 'Traga seus óculos atuais e exames anteriores',
      included: [
        'Anamnese detalhada',
        'Teste de acuidade visual',
        'Biomicroscopia',
        'Tonometria (pressão ocular)',
        'Mapeamento de retina',
        'Orientações e prescrições'
      ]
    },
    'exames-de-refracao': {
      id: 'exames-de-refracao',
      title: t('services.items.refraction.title'),
      description: t('services.items.refraction.description'),
      fullDescription: t('services.items.refraction.fullDescription'),
      benefits: [
        'Determinação precisa do grau',
        'Adaptação completa de lentes de contato',
        'Teste de diferentes tipos de lentes',
        'Acompanhamento especializado',
        'Orientação sobre uso e cuidados'
      ],
      duration: '30-45 minutos',
      preparation: 'Evite usar lentes de contato 24h antes do exame',
      included: [
        'Refração computadorizada',
        'Refração subjetiva',
        'Teste de lentes de contato',
        'Adaptação personalizada',
        'Treinamento de uso',
        'Kit inicial de limpeza'
      ]
    },
    'tratamentos-especializados': {
      id: 'tratamentos-especializados',
      title: t('services.items.specialized.title'),
      description: t('services.items.specialized.description'),
      fullDescription: t('services.items.specialized.fullDescription'),
      benefits: [
        'Tratamento de glaucoma avançado',
        'Controle de diabetes ocular',
        'Terapia para olho seco',
        'Acompanhamento de degeneração macular',
        'Protocolo individualizado'
      ],
      duration: '60-90 minutos',
      preparation: 'Traga todos os exames e medicamentos em uso',
      included: [
        'Avaliação especializada',
        'Exames complementares',
        'Plano terapêutico',
        'Prescrição medicamentosa',
        'Agendamento de retornos',
        'Orientação familiar'
      ]
    },
    'cirurgias-oftalmologicas': {
      id: 'cirurgias-oftalmologicas',
      title: t('services.items.surgeries.title'),
      description: t('services.items.surgeries.description'),
      fullDescription: t('services.items.surgeries.fullDescription'),
      benefits: [
        'Técnicas microinvasivas',
        'Recuperação rápida',
        'Centro cirúrgico equipado',
        'Anestesia local segura',
        'Acompanhamento pós-operatório'
      ],
      duration: '45-90 minutos',
      preparation: 'Jejum de 8 horas e acompanhante obrigatório',
      included: [
        'Consulta pré-operatória',
        'Exames pré-cirúrgicos',
        'Procedimento cirúrgico',
        'Medicação pós-operatória',
        'Retornos inclusos',
        'Suporte 24h emergencial'
      ]
    },
    'acompanhamento-pediatrico': {
      id: 'acompanhamento-pediatrico',
      title: t('services.items.pediatric.title'),
      description: t('services.items.pediatric.description'),
      fullDescription: t('services.items.pediatric.fullDescription'),
      benefits: [
        'Ambiente lúdico e acolhedor',
        'Detecção precoce de problemas',
        'Técnicas adaptadas para crianças',
        'Orientação aos pais',
        'Acompanhamento do desenvolvimento'
      ],
      duration: '30-45 minutos',
      preparation: 'Criança descansada e alimentada',
      included: [
        'Teste do olhinho',
        'Avaliação do desenvolvimento visual',
        'Teste de estrabismo',
        'Refração infantil',
        'Orientação familiar',
        'Cronograma de retornos'
      ]
    },
    'laudos-especializados': {
      id: 'laudos-especializados',
      title: t('services.items.reports.title'),
      description: t('services.items.reports.description'),
      fullDescription: t('services.items.reports.fullDescription'),
      benefits: [
        'Laudos para CNH todas as categorias',
        'Concursos públicos e militares',
        'Avaliações ocupacionais',
        'Assinatura digital',
        'Entrega rápida e segura'
      ],
      duration: '20-30 minutos',
      preparation: 'Traga documento de identidade e requisição',
      included: [
        'Exame oftalmológico completo',
        'Avaliação específica solicitada',
        'Laudo técnico detalhado',
        'Assinatura digital',
        'Envio por e-mail',
        'Via impressa quando necessário'
      ]
    }
  }), [t]);

  const service = serviceConfig[serviceId];

  // Handle invalid service ID
  if (!service) {
    return <Navigate to="/404" replace />;
  }


  const handleScheduleClick = () => {
    window.dispatchEvent(new Event('open-floating-cta'));
  };

  const seoData = {
    title: `${service.title} | Dr. Philipe Saraiva - Caratinga/MG`,
    description: service.description,
    keywords: `${service.title}, Dr. Philipe Saraiva, Oftalmologista Caratinga, ${serviceId.replace('-', ' ')}`
  };

  return (
    <>
      <SEOHead {...seoData} />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        {/* Header Section */}
        <section className="py-12 bg-white shadow-sm">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8"
              >
                <div className="flex justify-center mb-6">
                  <div className="icon-container-large">
                    {getServiceIcon(service.id, { className: "h-16 w-16 text-blue-600" })}
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                  {service.title}
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  {service.description}
                </p>
              </motion.div>

              {/* CTA Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center"
              >
                <Button
                  onClick={handleScheduleClick}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Agendar Consulta
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Full Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-white rounded-2xl p-8 shadow-soft-light"
                  >
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Sobre o Serviço</h2>
                    <p className="text-slate-600 leading-relaxed">
                      {service.fullDescription}
                    </p>
                  </motion.div>

                  {/* Benefits */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-white rounded-2xl p-8 shadow-soft-light"
                  >
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Principais Benefícios</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {service.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-600">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* What's Included */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-white rounded-2xl p-8 shadow-soft-light"
                  >
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">O que está incluído</h2>
                    <div className="space-y-3">
                      {service.included.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 flex-shrink-0"></div>
                          <span className="text-slate-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  
                  {/* Quick Info */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 shadow-soft-light"
                  >
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Informações Rápidas</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-slate-800">Duração</div>
                          <div className="text-sm text-slate-600">{service.duration}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-slate-800">Local</div>
                          <div className="text-sm text-slate-600">Clínica Saraiva Vision<br />Caratinga/MG</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Preparation */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-blue-50 rounded-2xl p-6 border border-blue-200"
                  >
                    <h3 className="text-xl font-bold text-slate-800 mb-3">Preparação</h3>
                    <p className="text-slate-600 text-sm">{service.preparation}</p>
                  </motion.div>

                  {/* Contact Info */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-white rounded-2xl p-6 shadow-soft-light"
                  >
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Contato Direto</h3>
                    <div className="space-y-3">
                      <a
                        href="tel:+5533998601427"
                        className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                        <span className="font-medium">+55 33 99860-1427</span>
                      </a>
                    </div>
                    <Button
                      onClick={handleScheduleClick}
                      className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar Agora
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Back Button */}
        <div className="container mx-auto px-4 md:px-6 pb-8">
          <div className="max-w-4xl mx-auto">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="flex items-center gap-2 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar aos Serviços
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceDetailPage;
