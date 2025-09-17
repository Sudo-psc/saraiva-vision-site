import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Certificates = () => {
  const { t } = useTranslation();
  const items = [
    {
      img: '/img/certificate-iso9001.svg',
      title: t('certificates.items.iso9001.title'),
      description: t('certificates.items.iso9001.description')
    },
    {
      img: '/img/certificate-abo.svg',
      title: t('certificates.items.abo.title'),
      description: t('certificates.items.abo.description')
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            {t('certificates.badge')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            {t('certificates.title')}
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-soft-medium"
            >
              <img src={item.img} alt={item.title} className="w-24 h-24 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-slate-900">{item.title}</h3>
              <p className="text-slate-600">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certificates;
