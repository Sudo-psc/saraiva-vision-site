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
    <section id="about" className="py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/8 to-purple-400/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/8 to-pink-400/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-10 right-20 w-32 h-32 bg-gradient-to-br from-cyan-300/6 to-blue-400/6 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '8s' }} />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -top-12 -left-12 w-72 h-72 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full filter blur-3xl"></div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-soft-medium h-64">
                  <img loading="lazy" decoding="async" className="w-full h-full object-cover" alt={imageAlts[0]} src={imageUrls[0]} sizes="(min-width: 1024px) 33vw, 50vw" />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-soft-medium h-40">
                  <img loading="lazy" decoding="async" className="w-full h-full object-cover" alt={imageAlts[1]} src={imageUrls[1]} sizes="(min-width: 1024px) 33vw, 50vw" />
                </div>
              </div>

              <div className="space-y-4 mt-8">
                <div className="rounded-2xl overflow-hidden shadow-soft-medium h-40">
                  <img loading="lazy" decoding="async" className="w-full h-full object-cover" alt={imageAlts[2]} src={imageUrls[2]} sizes="(min-width: 1024px) 33vw, 50vw" />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-soft-medium h-64">
                  <img loading="lazy" decoding="async" className="w-full h-full object-cover" alt={imageAlts[3]} src={imageUrls[3]} sizes="(min-width: 1024px) 33vw, 50vw" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100 text-blue-700 mb-4 w-fit shadow-md border border-blue-200/50">
              <span className="text-xl">✦</span>
              <span className="font-bold text-sm tracking-wide uppercase">{t('about.tag')}</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black leading-tight text-slate-900">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {t('about.title')}
              </span>
            </h2>

            <div className="space-y-6 text-slate-700 leading-relaxed">
              <p className="text-lg font-medium">
                {t('about.p1')}
              </p>

              <p className="text-lg">
                {t('about.p2')}
              </p>

              <p className="text-slate-600 leading-relaxed">
                {t('about.p3')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
              {Array.isArray(features) && features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-slate-800 font-semibold">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Enhanced Doctor Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 md:p-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            {/* Doctor Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1 flex justify-center"
            >
              <div className="relative w-full max-w-xs">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-indigo-400/20 rounded-3xl blur-lg" />
                <div className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-b from-blue-50 to-white">
                  <img
                    src="/img/drphilipe_perfil.png"
                    alt={t('about.doctor.alt')}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 768px) 80vw, (max-width: 1024px) 40vw, 300px"
                  />
                </div>

                {/* Enhanced decorative elements */}
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-70 animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-60 animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
            </motion.div>

            {/* Doctor Info */}
            <div className="lg:col-span-2 space-y-6 text-center lg:text-left">
              <div>
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{t('about.doctor.heading')}</h3>
                <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                  {t('about.doctor.name')} – {t('about.doctor.title')}
                </p>
              </div>

              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed whitespace-pre-line text-lg">
                  {t('about.doctor.description')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Removed section: Doctor specialization/experience block */}
      </div>
    </section>
  );
};

export default About;
