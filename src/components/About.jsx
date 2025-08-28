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
    <section id="about" className="bg-transparent no-scrollbar-x relative">
      {/* Ambient gradient accents */}
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
        <div className="absolute -top-24 -right-16 w-80 h-80 bg-gradient-to-br from-blue-400/12 to-sky-400/10 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 md:px-6 no-scrollbar-x">
        <div className="relative glass-blue bg-[#FFFAFA] backdrop-blur-2xl rounded-3xl gradient-border shimmer shadow-3d p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -top-6 -left-6 md:-top-10 md:-left-10 w-32 h-32 md:w-64 md:h-64 bg-blue-200 rounded-full filter blur-3xl opacity-30"></div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 relative z-10">
                <div className="space-y-4">
                  <div className="group rounded-2xl overflow-hidden shadow-soft-medium h-64 transition-all duration-300 hover:shadow-3d-hover">
                    <img loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu transition-transform duration-500 ease-out group-hover:scale-105" alt={imageAlts[0]} src={imageUrls[0]} sizes="(min-width: 1024px) 33vw, 50vw" />
                  </div>
                  <div className="group rounded-2xl overflow-hidden shadow-soft-medium h-40 transition-all duration-300 hover:shadow-3d-hover">
                    <img loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu transition-transform duration-500 ease-out group-hover:scale-105" alt={imageAlts[1]} src={imageUrls[1]} sizes="(min-width: 1024px) 33vw, 50vw" />
                  </div>
                </div>

                <div className="space-y-4 mt-8">
                  <div className="group rounded-2xl overflow-hidden shadow-soft-medium h-40 transition-all duration-300 hover:shadow-3d-hover">
                    <img loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu transition-transform duration-500 ease-out group-hover:scale-105" alt={imageAlts[2]} src={imageUrls[2]} sizes="(min-width: 1024px) 33vw, 50vw" />
                  </div>
                  <div className="group rounded-2xl overflow-hidden shadow-soft-medium h-64 transition-all duration-300 hover:shadow-3d-hover">
                    <img loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu transition-transform duration-500 ease-out group-hover:scale-105" alt={imageAlts[3]} src={imageUrls[3]} sizes="(min-width: 1024px) 33vw, 50vw" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col space-y-6 md:space-y-8"
            >
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-2 w-fit">
                {t('about.tag')}
              </div>

              <h2 className="text-heading-lg md:text-heading-xl font-semibold leading-tight">
                {t('about.title')}
              </h2>

              <p className="text-body-xl leading-loose max-w-prose text-wrap">
                {t('about.p1')}
              </p>

              <p className="text-body-xl leading-loose max-w-prose text-wrap">
                {t('about.p2')}
              </p>

              {/* Dr. Philipe Profile Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-soft-medium border-2 border-slate-300 hover:border-blue-300 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ring-4 ring-blue-100 shadow-soft-medium">
                    <img
                      src="/img/drphilipe_perfil.png"
                      alt={t('about.doctor.alt')}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-1">
                    {t('about.doctor.name')}
                  </h3>
                  <p className="text-blue-600 font-medium mb-2">
                    {t('about.doctor.title')}
                  </p>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                    {t('about.doctor.description')}
                  </p>
                </div>
              </motion.div>

              {/* Team Section */}
              <div className="pt-4">
                <h3 className="text-xl md:text-2xl font-semibold mb-4">
                  {t('about.team_title')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Doctor Card */}
                  <div className="group flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl border-2 border-slate-300 hover:border-blue-300 transition-all shadow-soft-medium hover:shadow-3d-hover">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-blue-100">
                      <img src="/img/drphilipe_perfil.png" alt={t('about.doctor.alt')} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{t('about.doctor.name')}</div>
                      <div className="text-blue-600 text-sm font-medium">{t('about.doctor.title')}</div>
                    </div>
                  </div>

                  {/* Nurse Card */}
                  <div className="group flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl border-2 border-slate-300 hover:border-blue-300 transition-all shadow-soft-medium hover:shadow-3d-hover">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-blue-100">
                      <img src="/img/nurse_ana_lucia.png" alt={t('about.nurse.alt')} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{t('about.nurse.name')}</div>
                      <div className="text-blue-600 text-sm font-medium">{t('about.nurse.title')}</div>
                      <div className="text-slate-600 text-sm">{t('about.nurse.description')}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {Array.isArray(features) && features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-sm border-2 border-slate-300 shadow-soft-sm hover:border-blue-300 transition-colors"
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
      </div>
    </section>
  );
};

export default About;
