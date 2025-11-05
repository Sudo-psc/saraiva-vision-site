import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check, Shield, Users, Award, Eye, ChevronDown, MessageCircle, Star, Clock, Heart, Zap, Sparkles, Calendar, Phone } from 'lucide-react';
import { NAP_CANONICAL, generateWhatsAppURL } from '../lib/napCanonical';
import { Button } from '@/components/ui/button';
import ContactLensesHeroImage from './ContactLensesHeroImage';
import CompactGoogleReviews from './CompactGoogleReviews';

const ContactLenses = () => {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);

  const lensTypes = [
    {
      type: 'soft',
      title: t('contactLenses.types.soft.title'),
      subtitle: t('contactLenses.types.soft.subtitle'),
      features: t('contactLenses.types.soft.features', { returnObjects: true }) || [],
      icon: Heart,
      color: 'bg-green-50/80 border-green-400/60 shadow-green-100/50'
    },
    {
      type: 'rigid',
      title: t('contactLenses.types.rigid.title'),
      subtitle: t('contactLenses.types.rigid.subtitle'),
      features: t('contactLenses.types.rigid.features', { returnObjects: true }) || [],
      icon: Shield,
      color: 'bg-blue-50/80 border-blue-400/60 shadow-blue-100/50'
    },
    {
      type: 'multifocal',
      title: t('contactLenses.types.multifocal.title'),
      subtitle: t('contactLenses.types.multifocal.subtitle'),
      features: t('contactLenses.types.multifocal.features', { returnObjects: true }) || [],
      icon: Zap,
      color: 'bg-cyan-50/80 border-cyan-400/60 shadow-cyan-100/50'
    }
  ];

  const brands = [
    {
      name: 'Acuvue',
      description: t('contactLenses.brand_details.acuvue.description'),
      image: '/img/acuvue2.jpeg',
      features: t('contactLenses.brand_details.acuvue.features', { returnObjects: true }) || [],
      specialty: t('contactLenses.brand_details.acuvue.specialty')
    },
    {
      name: 'Sólotica',
      description: t('contactLenses.brand_details.solotica.description'),
      image: '/img/solflex-toric.png',
      features: t('contactLenses.brand_details.solotica.features', { returnObjects: true }) || [],
      specialty: t('contactLenses.brand_details.solotica.specialty')
    },
    {
      name: 'Bioview',
      description: t('contactLenses.brand_details.bioview.description'),
      image: '/img/bivoview.png',
      features: t('contactLenses.brand_details.bioview.features', { returnObjects: true }) || [],
      specialty: t('contactLenses.brand_details.bioview.specialty')
    }
  ];

  const processSteps = t('contactLenses.process_steps', { returnObjects: true }) || [];
  const faqItems = t('contactLenses.faq_items', { returnObjects: true }) || [];
  const trustBadges = t('contactLenses.trust_badges', { returnObjects: true }) || [];

  const whatsappMessage = 'Olá! Gostaria de agendar uma consulta para adaptação de lentes de contato.';
  const whatsappUrl = generateWhatsAppURL(whatsappMessage);
  const agendamentoUrl = 'https://www.saraivavision.com.br/agendamento';
  const planosUrl = '/planos';

  const expandedFaqItems = [
    ...faqItems,
    {
      question: 'Quanto tempo dura uma lente de contato?',
      answer: 'A durabilidade depende do tipo de lente. Lentes descartáveis diárias duram um dia, lentes quinzenais duram 15 dias, mensais duram 30 dias, e lentes rígidas podem durar de 1 a 2 anos com os cuidados adequados.'
    },
    {
      question: 'Posso dormir com lentes de contato?',
      answer: 'Não é recomendado dormir com lentes de contato, exceto se forem especificamente projetadas para uso contínuo. Dormir com lentes comuns pode causar infecções e danos à córnea devido à falta de oxigenação.'
    },
    {
      question: 'Como limpar corretamente as lentes de contato?',
      answer: 'Use sempre solução específica para lentes de contato, nunca água. Lave as mãos antes de manusear, esfregue suavemente cada lente com a solução, enxágue e guarde no estojo com solução nova. Troque o estojo a cada 3 meses.'
    },
    {
      question: 'Posso usar lentes de contato se tenho astigmatismo?',
      answer: 'Sim! Existem lentes tóricas especialmente desenvolvidas para corrigir astigmatismo. Na Saraiva Vision, fazemos a adaptação completa e orientamos sobre o uso correto dessas lentes.'
    },
    {
      question: 'Qual a diferença entre lentes gelatinosas e rígidas?',
      answer: 'Lentes gelatinosas são mais confortáveis inicialmente e mais fáceis de adaptar. Lentes rígidas oferecem melhor qualidade visual, maior durabilidade e são ideais para correções complexas como alto grau de astigmatismo ou ceratocone.'
    },
    {
      question: 'Preciso de prescrição médica para comprar lentes de contato?',
      answer: 'Sim, é obrigatório por lei. As lentes de contato são dispositivos médicos que requerem prescrição oftalmológica com avaliação completa da saúde ocular, medidas específicas e orientação sobre uso correto.'
    }
  ];

  return (
    <section id="lentes-de-contato" className="relative bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 py-16 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-cyan-50/40 to-teal-50/20" aria-hidden="true"></div>
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-blue-100/30 via-transparent to-transparent rounded-full blur-3xl" aria-hidden="true"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-indigo-100/20 via-transparent to-transparent rounded-full blur-3xl" aria-hidden="true"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-gradient-conic from-blue-50/10 via-cyan-50/10 to-teal-50/10 rounded-full blur-2xl" aria-hidden="true"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-blue-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {t('contactLenses.hero_badge')}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight"
          >
            {t('contactLenses.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            {t('contactLenses.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mb-10 flex justify-center relative"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300" aria-hidden="true"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-4 border border-slate-200/80 shadow-2xl">
                <ContactLensesHeroImage
                  alt="Lentes de contato de alta qualidade - Saraiva Vision"
                  className="rounded-2xl w-full max-w-2xl h-auto shadow-lg"
                />
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center animate-float" aria-hidden="true">
                  <Eye className="w-6 h-6 text-cyan-600" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center animate-float-delayed" aria-hidden="true">
                  <Sparkles className="w-5 h-5 text-cyan-600" />
                </div>
              </div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-lg">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-600" aria-hidden="true" />
                  <span className="font-medium">Seguro</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full" aria-hidden="true"></div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Award className="w-4 h-4 text-cyan-600" aria-hidden="true" />
                  <span className="font-medium">Qualidade</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full" aria-hidden="true"></div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-cyan-600" aria-hidden="true" />
                  <span className="font-medium">1000+ clientes</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button 
              size="xl" 
              variant="medical" 
              className="w-full sm:w-auto gap-2 text-lg font-semibold shadow-lg hover:shadow-xl transition-all" 
              onClick={() => window.open(agendamentoUrl, '_blank')}
              aria-label="Agendar consulta para adaptação de lentes de contato - Abre em nova aba"
            >
              <Calendar className="h-5 w-5" aria-hidden="true" />
              Agendar Consulta
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="w-full sm:w-auto gap-2 text-lg font-semibold border-2 border-green-600 text-green-700 hover:bg-green-50 shadow-md hover:shadow-lg transition-all"
              onClick={() => window.open(whatsappUrl, '_blank')}
              aria-label="Falar no WhatsApp sobre lentes de contato - Abre em nova aba"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              WhatsApp
            </Button>
            <Button
              size="xl"
              variant="default"
              className="w-full sm:w-auto gap-2 text-lg font-semibold bg-cyan-600 hover:bg-cyan-700 shadow-md hover:shadow-lg transition-all"
              onClick={() => window.location.href = planosUrl}
              aria-label="Ver planos de assinatura - Navega para página de planos"
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" />
              Ver Planos
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {Object.entries(trustBadges).map(([key, value]) => {
              const icons = { experience: Clock, patients: Users, safety: Shield, brands: Award };
              const Icon = icons[key] || Shield;
              return (
                <div key={key} className="text-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <Icon className="h-8 w-8 text-cyan-600 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-sm font-semibold text-slate-900">{value}</p>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Restante do componente continua... */}
      </div>
    </section>
  );
};

export default ContactLenses;
