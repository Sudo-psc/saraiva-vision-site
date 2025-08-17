import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Shield, Award, Users, Clock, Heart, Star } from 'lucide-react';

const TrustSignals = () => {
  const { t } = useTranslation();

  const trustItems = [
    {
      icon: Shield,
      title: t('trust.certifications.title'),
      description: t('trust.certifications.description'),
      color: 'blue'
    },
    {
      icon: Award,
      title: t('trust.awards.title'),
      description: t('trust.awards.description'),
      color: 'amber'
    },
    {
      icon: Users,
      title: t('trust.patients.title'),
      description: t('trust.patients.description'),
      color: 'green'
    },
    {
      icon: Clock,
      title: t('trust.experience.title'),
      description: t('trust.experience.description'),
      color: 'purple'
    }
  ];

  const certifications = [
    {
      name: 'CRM',
      logo: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=120&h=80&fit=crop&q=80',
      description: t('trust.crm.description')
    },
    {
      name: 'CBO',
      logo: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=120&h=80&fit=crop&q=80',
      description: t('trust.cbo.description')
    },
    {
      name: 'ISO 9001',
      logo: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=120&h=80&fit=crop&q=80',
      description: t('trust.iso.description')
    },
    {
      name: 'ANVISA',
      logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=120&h=80&fit=crop&q=80',
      description: t('trust.anvisa.description')
    }
  ];

  const partnerships = [
    {
      name: 'Zeiss',
      logo: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=120&h=80&fit=crop&q=80'
    },
    {
      name: 'Alcon',
      logo: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=120&h=80&fit=crop&q=80'
    },
    {
      name: 'Johnson & Johnson',
      logo: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=120&h=80&fit=crop&q=80'
    },
    {
      name: 'Bausch + Lomb',
      logo: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=120&h=80&fit=crop&q=80'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      amber: 'bg-amber-100 text-amber-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">
            <Shield size={16} className="mr-2" />
            {t('trust.badge')}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('trust.title')}
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            {t('trust.subtitle')}
          </p>
        </motion.div>

        {/* Trust Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className={`w-16 h-16 rounded-xl ${getColorClasses(item.color)} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900">
                  {item.title}
                </h3>
                <p className="text-slate-600">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-2xl font-bold text-center mb-12 text-slate-900">
            {t('trust.certifications.sectionTitle')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-soft-light border border-slate-100 hover:shadow-soft-medium transition-all duration-300 group"
              >
                <div className="aspect-video bg-slate-100 rounded-lg mb-4 overflow-hidden">
                  <img
                    src={cert.logo}
                    alt={`Logo ${cert.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">{cert.name}</h4>
                <p className="text-sm text-slate-600">{cert.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Partnerships */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-center mb-12 text-slate-900">
            {t('trust.partnerships.sectionTitle')}
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {partnerships.map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="w-32 h-20 bg-slate-100 rounded-lg overflow-hidden opacity-70 hover:opacity-100 transition-opacity duration-300">
                  <img
                    src={partner.logo}
                    alt={`Logo ${partner.name}`}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 md:p-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <p className="text-slate-600">{t('trust.stats.satisfaction')}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">5000+</div>
              <p className="text-slate-600">{t('trust.stats.patients')}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">15+</div>
              <p className="text-slate-600">{t('trust.stats.years')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSignals;
