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
      {/* 3D Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-cyan-50/40 to-teal-50/20"></div>
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-blue-100/30 via-transparent to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-indigo-100/20 via-transparent to-transparent rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-gradient-conic from-blue-50/10 via-cyan-50/10 to-teal-50/10 rounded-full blur-2xl"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-blue-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Sparkles className="h-4 w-4" />
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

          {/* Hero Image with Enhanced Design */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mb-10 flex justify-center relative"
          >
            <div className="relative group">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300"></div>

              {/* Custom SVG Hero Image */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-4 border border-slate-200/80 shadow-2xl">
                <ContactLensesHeroImage
                  alt={t('contactLenses.main_title')}
                  className="rounded-2xl w-full max-w-2xl h-auto shadow-lg"
                />

                {/* Floating decorative elements */}
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center animate-float">
                  <Eye className="w-6 h-6 text-cyan-600" aria-hidden="true" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center animate-float-delayed">
                  <Sparkles className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="absolute top-1/2 -right-8 w-8 h-8 bg-green-500/20 rounded-full animate-pulse"></div>
              </div>

              {/* Trust indicators */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-lg">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-600" aria-hidden="true" />
                  <span className="font-medium">Seguro</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Award className="w-4 h-4 text-cyan-600" aria-hidden="true" />
                  <span className="font-medium">Qualidade</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-cyan-600" aria-hidden="true" />
                  <span className="font-medium">1000+ clientes</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Primary CTAs - Destacados e Acessíveis */}
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
              onClick={() => window.open(agendamentoUrl, '_blank')}
              aria-label="Assinar plano de lentes de contato - Abre em nova aba"
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" />
              Assinar Plano
            </Button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {Object.entries(trustBadges).map(([key, value]) => {
              const icons = {
                experience: Clock,
                patients: Users,
                safety: Shield,
                brands: Award
              };
              const Icon = icons[key] || Shield;

              return (
                <div key={key} className="text-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <Icon className="h-8 w-8 text-cyan-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-900">{value}</p>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Brands Section */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t('contactLenses.brands_section.title')}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t('contactLenses.brands_section.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {brands.map((brand, index) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100"
              >
                <div className="relative h-48 overflow-hidden bg-white">
                  <img loading="lazy" decoding="async"
                    src={brand.image}
                    alt={t('contactLenses.brand_logo_alt', 'Logo da marca {{brandName}} - Lentes de contato de qualidade', { brandName: brand.name })}
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-slate-800">{brand.name}</span>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-slate-600 mb-4 leading-relaxed">{brand.description}</p>

                  <div className="mb-4">
                    <h4 className="font-semibold text-slate-900 mb-2">Especialidade:</h4>
                    <p className="text-sm text-cyan-600 font-medium">{brand.specialty}</p>
                  </div>

                  <div className="space-y-2">
                    {brand.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" aria-hidden="true" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Process Steps */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t('contactLenses.process_title')}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t('contactLenses.process_subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center relative"
              >
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-300 to-transparent transform translate-x-8 z-0" />
                )}

                <div className="relative z-10 w-16 h-16 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lens Types */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t('contactLenses.types_section.title')}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t('contactLenses.types_section.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {lensTypes.map((lens, index) => {
              const Icon = lens.icon;
              return (
                <motion.div
                  key={lens.type}
                  className={`p-8 h-full rounded-3xl border-2 ${lens.color} backdrop-blur-sm hover:shadow-xl hover:shadow-${lens.color.split('shadow-')[1]} hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* 3D Card Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/5 pointer-events-none"></div>

                  <div className="relative z-10">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-slate-300/80">
                        <Icon className="h-6 w-6 text-cyan-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {lens.title}
                      </h3>
                      <p className="text-sm text-slate-600 font-medium">
                        {lens.subtitle}
                      </p>
                    </div>

                    <ul className="space-y-3">
                      {Array.isArray(lens.features) && lens.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                          <span className="text-sm text-slate-700 leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Depoimentos de Pacientes */}
        <div className="mb-24">
          <CompactGoogleReviews />
        </div>

        {/* Safety Protocol */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 md:p-12 rounded-3xl border border-blue-100"
          >
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                  {t('contactLenses.safety_title')}
                </h2>
              </div>
              <p className="text-slate-700 text-lg leading-relaxed mb-6">
                {t('contactLenses.safety_desc')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {(t('contactLenses.safety_features', { returnObjects: true }) || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-left">
                    <Check className="h-5 w-5 text-green-600" aria-hidden="true" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>        {/* FAQ Section */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t('contactLenses.faq_title')}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Respostas para as dúvidas mais comuns sobre lentes de contato
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {expandedFaqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="font-semibold text-slate-900 pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-500 transition-transform flex-shrink-0 ${openFaq === index ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                {openFaq === index && (
                  <div 
                    id={`faq-answer-${index}`}
                    className="px-6 py-4 bg-slate-50 border-t border-slate-200"
                  >
                    <p className="text-slate-700 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA para contato direto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-12 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl border border-cyan-100"
          >
            <p className="text-lg text-slate-700 mb-4 font-medium">
              Não encontrou a resposta que procurava?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                variant="medical"
                className="gap-2"
                onClick={() => window.open(whatsappUrl, '_blank')}
                aria-label="Falar com especialista no WhatsApp - Abre em nova aba"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                Falar com Especialista
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => window.open(`tel:${NAP_CANONICAL.phone.primary.e164}`, '_self')}
                aria-label={`Ligar para ${NAP_CANONICAL.phone.primary.display}`}
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
                {NAP_CANONICAL.phone.primary.displayShort}
              </Button>
            </div>
          </motion.div>
        </div>



        {/* Medical Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xs text-slate-500 max-w-2xl mx-auto">
            {t('cfm.disclaimer')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactLenses;
