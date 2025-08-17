import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

const About = () => {
  const { t } = useTranslation();
  const features = t('about.features', { returnObjects: true });

  const imageUrls = [
    "https://storage.googleapis.com/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/40e4988427ac137c3d141857468774d6.jpg",
    "https://storage.googleapis.com/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/b8f2dd956e713d7bae5d7fb1e55e4f4f.png",
    "https://storage.googleapis.com/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/741591d60d9f0ced10bd2364aee36a66.jpg",
    "https://storage.googleapis.com/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/368a0fa9cfaf91a0bad44aca45721439.png"
  ];

  const imageAlts = [
    t('about.alt1'),
    t('about.alt2'),
    t('about.alt3'),
    t('about.alt4')
  ];

  return (
    <section id="about" className="bg-subtle-gradient">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl opacity-30"></div>
            
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-soft-medium h-64">
                  <img  className="w-full h-full object-cover" alt={imageAlts[0]} src={imageUrls[0]} />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-soft-medium h-40">
                  <img  className="w-full h-full object-cover" alt={imageAlts[1]} src={imageUrls[1]} />
                </div>
              </div>
              
              <div className="space-y-4 mt-8">
                <div className="rounded-2xl overflow-hidden shadow-soft-medium h-40">
                  <img  className="w-full h-full object-cover" alt={imageAlts[2]} src={imageUrls[2]} />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-soft-medium h-64">
                  <img  className="w-full h-full object-cover" alt={imageAlts[3]} src={imageUrls[3]} />
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col space-y-6"
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-2 w-fit">
              <span className="mr-2">✦</span> {t('about.tag')}
            </div>
            
            <h2 className="leading-tight">
              {t('about.title')}
            </h2>
            
            <p>
              {t('about.p1')}
            </p>
            
            <p>
              {t('about.p2')}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {Array.isArray(features) && features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-slate-700 font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;