import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

const About = () => {
  const { t } = useTranslation();
  const features = t('about.features', { returnObjects: true });

  const imageUrls = [
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Modern ophthalmology equipment
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Eye examination equipment
    "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Medical consultation room
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"  // Advanced diagnostic equipment
  ];

  const imageAlts = [
    t('about.alt1') || 'Equipamento moderno de oftalmologia para diagnósticos precisos',
    t('about.alt2') || 'Consulta oftalmológica com equipamento de última geração',
    t('about.alt3') || 'Sala de consulta médica moderna e acolhedora',
    t('about.alt4') || 'Equipamentos avançados para diagnóstico ocular'
  ];

  return (
    <section
      id="about"
      className="relative no-scrollbar-x bg-white"
    >
      {/* 3D background accents (non-intrusive) */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        {/* Soft radial glow */}
        <div
          className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-60"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(59,130,246,0.12), rgba(147,51,234,0.10), rgba(236,72,153,0.08), transparent 60%)'
          }}
        />
        <div
          className="absolute -bottom-28 -right-24 w-[26rem] h-[26rem] rounded-full blur-3xl opacity-60"
          style={{
            background: 'radial-gradient(circle at 70% 70%, rgba(59,130,246,0.10), rgba(99,102,241,0.10), rgba(14,165,233,0.08), transparent 60%)'
          }}
        />

        {/* Tilted 3D plates */}
        <div
          className="absolute -top-10 right-[-4rem] w-[34rem] h-[18rem] rounded-[2rem] opacity-30 shadow-3d animate-float"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(241,245,249,0.85))',
            border: '1px solid rgba(226,232,240,0.8)',
            transform: 'perspective(1200px) rotateX(18deg) rotateY(-24deg) rotateZ(-6deg)',
            boxShadow: '0 40px 120px rgba(2,6,23,0.10), inset 0 1px 0 rgba(255,255,255,0.5)'
          }}
        />
        <div
          className="absolute bottom-[-3rem] left-[-4rem] w-[28rem] h-[16rem] rounded-[2rem] opacity-30 shadow-3d animate-float-delayed"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))',
            border: '1px solid rgba(226,232,240,0.8)',
            transform: 'perspective(1200px) rotateX(16deg) rotateY(22deg) rotateZ(4deg)',
            boxShadow: '0 36px 100px rgba(2,6,23,0.08), inset 0 1px 0 rgba(255,255,255,0.5)'
          }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 no-scrollbar-x">
        <div
          className="relative bg-white rounded-3xl shadow-3d p-6 md:p-10 border-2 border-slate-200/80"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >


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

              <h2 className="text-heading-xl md:text-display-sm lg:text-display-md font-bold leading-tight tracking-tight">
                {t('about.title')}
              </h2>

              <p className="text-body-xl leading-loose max-w-prose text-wrap">
                {t('about.p1')}
              </p>

              <p className="text-body-xl leading-loose max-w-prose text-wrap">
                {t('about.p2')}
              </p>

              {/* Clinic facade image */}
              <div className="w-full">
                <div className="rounded-2xl overflow-hidden shadow-soft-medium h-48 md:h-64 mb-4">
                  <img
                    src="/img/clinic_facade.png"
                    alt={t('about.facade_alt') || 'Fachada da clínica'}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Dr. Philipe Profile Section (photo removed) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-soft-medium border-2 border-slate-300 hover:border-blue-300 transition-colors"
              >
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
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ring-4 ring-blue-100">
                      <img src="/img/drphilipe_perfil.png" alt={t('about.doctor.alt')} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{t('about.doctor.name')}</div>
                      <div className="text-blue-600 text-sm font-medium">{t('about.doctor.title')}</div>
                    </div>
                  </div>

                  {/* Nurse Card */}
                  <div className="group flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl border-2 border-slate-300 hover:border-blue-300 transition-all shadow-soft-medium hover:shadow-3d-hover">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ring-4 ring-blue-100">
                      <img src="/img/eng.ana.jpeg" alt={t('about.nurse.alt')} className="w-full h-full object-cover" loading="lazy" decoding="async" width="96" height="96" />
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
