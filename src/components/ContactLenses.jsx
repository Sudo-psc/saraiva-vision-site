import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check, ExternalLink, Shield, Users, Award, Eye, ChevronDown, MessageCircle, Star, Clock, Heart, Zap, Globe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ContactLenses = () => {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);

  const lensTypes = [
    {
      type: 'soft',
      title: t('contactLenses.types.soft.title'),
      subtitle: t('contactLenses.types.soft.subtitle'),
      features: t('contactLenses.types.soft.features', { returnObjects: true }),
      icon: Heart,
      color: 'bg-green-50 border-green-200'
    },
    {
      type: 'rigid',
      title: t('contactLenses.types.rigid.title'),
      subtitle: t('contactLenses.types.rigid.subtitle'),
      features: t('contactLenses.types.rigid.features', { returnObjects: true }),
      icon: Shield,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      type: 'multifocal',
      title: t('contactLenses.types.multifocal.title'),
      subtitle: t('contactLenses.types.multifocal.subtitle'),
      features: t('contactLenses.types.multifocal.features', { returnObjects: true }),
      icon: Zap,
      color: 'bg-purple-50 border-purple-200'
    }
  ];

  const brands = [
    {
      name: 'Acuvue',
      description: t('contactLenses.brands.acuvue.description'),
      image: '/img/acuvue2.jpeg',
      features: t('contactLenses.brands.acuvue.features', { returnObjects: true }),
      specialty: t('contactLenses.brands.acuvue.specialty')
    },
    {
      name: 'Sólotica',
      description: t('contactLenses.brands.solotica.description'),
      image: '/img/solotica-hidrocor.jpeg',
      features: t('contactLenses.brands.solotica.features', { returnObjects: true }),
      specialty: t('contactLenses.brands.solotica.specialty')
    },
    {
      name: 'Bioview',
      description: t('contactLenses.brands.bioview.description'),
      image: '/img/bivoview.png',
      features: t('contactLenses.brands.bioview.features', { returnObjects: true }),
      specialty: t('contactLenses.brands.bioview.specialty')
    }
  ];

  const processSteps = t('contactLenses.process_steps', { returnObjects: true });
  const faqItems = t('contactLenses.faq_items', { returnObjects: true });
  const trustBadges = t('contactLenses.trust_badges', { returnObjects: true });

  const whatsappMessage = encodeURIComponent('Olá! Gostaria de agendar uma consulta para adaptação de lentes de contato.');
  const whatsappUrl = `https://wa.me/5533999887766?text=${whatsappMessage}`;


  return (
    <section id="lentes-de-contato" className="bg-gradient-to-b from-white via-blue-50/30 to-white py-16 lg:py-24">
      <div className="container mx-auto px-4 md:px-6">
        {/* Título principal da seção */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            {t('contactLenses.main_title')}
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            {t('contactLenses.main_subtitle')}
          </p>
        </motion.div>
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
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

          {/* Primary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button size="xl" variant="medical" className="w-full sm:w-auto gap-2">
              <Eye className="h-5 w-5" />
              {t('contactLenses.schedule_button')}
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="w-full sm:w-auto gap-2"
              onClick={() => window.open(whatsappUrl, '_blank')}
            >
              <MessageCircle className="h-5 w-5" />
              {t('contactLenses.whatsapp_button')}
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
            {Object.entries(trustBadges).map(([key, value], index) => {
              const icons = {
                experience: Clock,
                patients: Users,
                safety: Shield,
                brands: Award
              };
              const Icon = icons[key] || Shield;

              return (
                <div key={key} className="text-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <Icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
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
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              {t('contactLenses.brands_section.title')}
            </h3>
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
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={brand.image}
                    alt={`Lentes ${brand.name}`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-slate-800">{brand.name}</span>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-slate-600 mb-4 leading-relaxed">{brand.description}</p>

                  <div className="mb-4">
                    <h4 className="font-semibold text-slate-900 mb-2">Especialidade:</h4>
                    <p className="text-sm text-blue-600 font-medium">{brand.specialty}</p>
                  </div>

                  <div className="space-y-2">
                    {brand.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
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
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              {t('contactLenses.process_title')}
            </h3>
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

                <div className="relative z-10 w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">
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
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              {t('contactLenses.types_section.title')}
            </h3>
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
                  className={`p-8 h-full rounded-3xl border-2 ${lens.color} hover:shadow-lg transition-all duration-300`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Icon className="h-6 w-6 text-blue-600" />
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
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
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
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {t('contactLenses.safety_title')}
                </h3>
              </div>
              <p className="text-slate-700 text-lg leading-relaxed mb-6">
                {t('contactLenses.safety_desc')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {t('contactLenses.safety_features', { returnObjects: true }).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-left">
                    <Check className="h-5 w-5 text-green-600" />
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
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              {t('contactLenses.faq_title')}
            </h3>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-900">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-500 transition-transform ${openFaq === index ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                    <p className="text-slate-700 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
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