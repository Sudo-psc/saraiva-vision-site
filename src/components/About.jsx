import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import ImageWithMultipleFallbacks from './ui/ImageWithMultipleFallbacks.jsx';

const About = () => {
  const { t } = useTranslation();
  const features = t('about.features', { returnObjects: true }) || [];

  const imageUrls = [
    "/fachada.webp",
    "/autorrefrator.png",
    "/consultorio.jpg",
    "/topografo.png"
  ];

  const imageAlts = [
    t('about.alt1'),
    t('about.alt2'),
    t('about.alt3'),
    t('about.alt4')
  ];

  return (
    <section id="about" className="section-padding bg-section-gradient relative overflow-hidden scroll-block-internal">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/8 to-cyan-400/8 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-400/8 to-teal-400/8 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1000ms' }} />
        <div className="absolute top-10 right-20 w-32 h-32 bg-gradient-to-br from-cyan-300/6 to-blue-400/6 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-10 left-20 w-24 h-24 bg-gradient-to-br from-green-300/6 to-emerald-400/6 rounded-full blur-2xl animate-float-delayed" />
      </div>

      <div className="container mx-auto px-[7%] relative z-10 scroll-block-internal">
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
                <div className="rounded-2xl overflow-hidden shadow-3d hover:shadow-3d-hover card-hover h-64">
                  <ImageWithMultipleFallbacks
                    sources={[imageUrls[0]]}
                    alt={imageAlts[0]}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-3d hover:shadow-3d-hover card-hover h-40">
                  <ImageWithMultipleFallbacks
                    sources={[imageUrls[1]]}
                    alt={imageAlts[1]}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>

              <div className="space-y-4 mt-8">
                <div className="rounded-2xl overflow-hidden shadow-3d hover:shadow-3d-hover card-hover h-40">
                  <ImageWithMultipleFallbacks
                    sources={[imageUrls[2]]}
                    alt={imageAlts[2]}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-3d hover:shadow-3d-hover card-hover h-64">
                  <ImageWithMultipleFallbacks
                    sources={[imageUrls[3]]}
                    alt={imageAlts[3]}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    loading="lazy"
                    decoding="async"
                  />
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
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 text-white mb-4 w-fit shadow-md border border-gray-700/50">
              <span className="text-xl">✦</span>
              <span className="font-bold text-sm tracking-wide uppercase">{t('about.tag')}</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              <span className="bg-gradient-to-r from-cyan-500 via-cyan-600 to-teal-500 bg-clip-text text-transparent">
                {t('about.title')}
              </span>
            </h2>

            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-lg font-medium">
                {t('about.p1')}
              </p>

              <p className="text-lg">
                {t('about.p2')}
              </p>

              <p className="text-gray-600 leading-relaxed">
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
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center shadow-md">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-semibold">{feature}</span>
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
          transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
          className="max-w-6xl mx-auto group"
          style={{ perspective: "1500px" }}
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className="relative bg-gradient-to-br from-gray-50/80 via-gray-100/60 to-white backdrop-blur-xl rounded-3xl shadow-2xl border-t border-l border-gray-200/50"
          >
            <div className="absolute -inset-px rounded-3xl border border-transparent bg-gradient-to-br from-gray-400/20 via-gray-500/20 to-gray-600/20 blur-lg group-hover:blur-xl transition-all duration-500" />

            <div className="relative p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                {/* 3D Doctor Image */}
                <motion.div
                  className="lg:col-span-1 flex justify-center"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <motion.div
                    className="relative w-full max-w-xs"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/30 via-teal-400/30 to-cyan-500/30 rounded-3xl blur-xl" style={{ transform: "translateZ(-50px)" }} />
                    <div className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-b from-gray-50 to-white" style={{ transform: "translateZ(0)" }}>
                      <ImageWithMultipleFallbacks
                        sources={["/img/drphilipe_jaleco Medium.jpeg", "/img/drphilipe_jaleco2 Medium.jpeg", "/img/drphilipe_novo.jpg", "/img/drphilipe_terno.jpeg"]}
                        alt={t('about.doctor.alt')}
                        width={300}
                        height={400}
                        className="w-full h-full object-cover object-top transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full opacity-80 animate-pulse" style={{ transform: "translateZ(20px)" }} />
                    <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full opacity-70 animate-bounce" style={{ animationDuration: '3s', transform: "translateZ(-20px)" }} />
                  </motion.div>
                </motion.div>

                {/* Doctor Info */}
                <div className="lg:col-span-2 space-y-6 text-center lg:text-left">
                  <div>
                    <h3 className="text-3xl md:text-4xl font-black text-gray-800 mb-2">{t('about.doctor.heading')}</h3>
                    <p className="text-xl font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-700 bg-clip-text text-transparent mb-4">
                      {t('about.doctor.name')} – {t('about.doctor.title')}
                    </p>
                  </div>

                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                      {t('about.doctor.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Removed section: Doctor specialization/experience block */}
      </div>
    </section>
  );
};

export default About;
