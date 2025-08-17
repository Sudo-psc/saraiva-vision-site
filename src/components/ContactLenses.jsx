import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ContactLenses = () => {
  const { t } = useTranslation();

  const lensTypes = [
    {
      type: 'soft',
      title: t('contactLenses.types.soft.title'),
      features: t('contactLenses.types.soft.features', { returnObjects: true })
    },
    {
      type: 'rigid',
      title: t('contactLenses.types.rigid.title'),
      features: t('contactLenses.types.rigid.features', { returnObjects: true })
    },
    {
      type: 'multifocal',
      title: t('contactLenses.types.multifocal.title'),
      features: t('contactLenses.types.multifocal.features', { returnObjects: true })
    }
  ];

  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2 className="leading-tight">
              {t('contactLenses.title')}
            </h2>
            
            <p>
              {t('contactLenses.description')}
            </p>

            <div className="mb-8">
              <a href="https://lentesdecontato.saraivavision.com.br/" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="gap-2">
                  {t('contactLenses.button')}
                  <ExternalLink className="h-5 w-5" />
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {lensTypes.map((lens, index) => (
                <motion.div 
                  key={lens.type} 
                  className="modern-card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <h3 className="text-lg font-bold mb-4 text-blue-700">{lens.title}</h3>
                  <ul className="space-y-3">
                    {Array.isArray(lens.features) && lens.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl opacity-20"></div>
            <div className="relative z-10">
              <img 
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/448bd0d6286cb176bb1828763b875751.png"
                alt={t('contactLenses.bioview_alt')}
                className="w-full h-auto rounded-3xl shadow-soft-medium"
                loading="lazy" decoding="async"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactLenses;