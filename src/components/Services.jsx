import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, Glasses, Microscope, Stethoscope, Calendar, Clipboard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Services = () => {
  const { t } = useTranslation();

  const serviceItems = [
    {
      id: 'consultas-oftalmologicas',
      icon: <Eye className="h-8 w-8 text-icon-consultas" />,
      title: t('services.items.consultations.title'),
      description: t('services.items.consultations.description')
    },
    {
      id: 'exames-de-refracao',
      icon: <Glasses className="h-8 w-8 text-icon-refracao" />,
      title: t('services.items.refraction.title'),
      description: t('services.items.refraction.description')
    },
    {
      id: 'tratamentos-especializados',
      icon: <Microscope className="h-8 w-8 text-icon-tratamentos" />,
      title: t('services.items.specialized.title'),
      description: t('services.items.specialized.description')
    },
    {
      id: 'cirurgias-oftalmologicas',
      icon: <Stethoscope className="h-8 w-8 text-icon-cirurgias" />,
      title: t('services.items.surgeries.title'),
      description: t('services.items.surgeries.description')
    },
    {
      id: 'acompanhamento-pediatrico',
      icon: <Calendar className="h-8 w-8 text-icon-pediatrico" />,
      title: t('services.items.pediatric.title'),
      description: t('services.items.pediatric.description')
    },
    {
      id: 'laudos-especializados',
      icon: <Clipboard className="h-8 w-8 text-icon-laudos" />,
      title: t('services.items.reports.title'),
      description: t('services.items.reports.description')
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const handleAgendarClick = () => {
    window.dispatchEvent(new Event('open-floating-cta'));
  };

  return (
    <section id="services" className="bg-subtle-gradient">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            {t('services.title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            {t('services.subtitle')}
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {serviceItems.map((service, index) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              className="modern-card p-6 flex flex-col text-center items-center group"
            >
              <div className={`icon-container icon-container-${index % 6} mb-5`}>
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">{service.title}</h3>
              <p className="mb-6 flex-grow">{service.description}</p>
              <Link to={`/servico/${service.id}`} className="mt-auto">
                <Button variant="link" className="font-semibold group-hover:text-primary transition-colors">
                  {t('services.learn_more')}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Consolidated CTA moved to Navbar/FloatingCTA to reduce repetition */}
      </div>
    </section>
  );
};

export default Services;