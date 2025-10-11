import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Star, Users, Calendar, Award, MapPin, Clock } from 'lucide-react';

/**
 * Componente de prova social com métricas e números
 * Exibe estatísticas da clínica para construir confiança
 */
const SocialProof = ({ variant = 'default', className = '' }) => {
  const [animatedNumbers, setAnimatedNumbers] = useState({
    patients: 0,
    years: 0,
    rating: 0,
    reviews: 0,
    procedures: 0
  });

  // Valores reais das métricas
  const metrics = {
    patients: 5000,
    years: 15,
    rating: 4.9,
    reviews: 136,
    procedures: 12000
  };

  // Animação de contagem
  useEffect(() => {
    const duration = 2000; // 2 segundos
    const steps = 60;
    const interval = duration / steps;

    const timer = setInterval(() => {
      setAnimatedNumbers((prev) => {
        const progress = Math.min(prev.progress + 1/steps, 1);

        return {
          progress,
          patients: Math.floor(metrics.patients * progress),
          years: Math.floor(metrics.years * progress),
          rating: (metrics.rating * progress).toFixed(1),
          reviews: Math.floor(metrics.reviews * progress),
          procedures: Math.floor(metrics.procedures * progress)
        };
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      icon: Users,
      value: animatedNumbers.patients.toLocaleString('pt-BR'),
      label: 'Pacientes Atendidos',
      description: 'Confiança e satisfação',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Star,
      value: animatedNumbers.rating,
      label: 'Avaliação Média',
      description: `${animatedNumbers.reviews} avaliações`,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Calendar,
      value: `${animatedNumbers.years}+`,
      label: 'Anos de Experiência',
      description: 'CRM-MG 69.870',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Award,
      value: animatedNumbers.procedures.toLocaleString('pt-BR'),
      label: 'Procedimentos Realizados',
      description: 'Alta taxa de sucesso',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const variants = {
    default: 'bg-white border border-gray-200 shadow-lg',
    minimal: 'bg-gray-50 border border-gray-100',
    gradient: 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100'
  };

  const containerClasses = `rounded-2xl p-8 ${variants[variant]} ${className}`;

  return (
    <section className={`social-proof-section ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={containerClasses}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl font-bold text-slate-900 mb-4"
          >
            Números que demonstram confiança
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-600 max-w-2xl mx-auto"
          >
            Em mais de uma década de atendimento em Caratinga, MG, construímos uma reputação baseada em
            excelência médica, tecnologia avançada e cuidado humanizado.
          </motion.p>
        </div>

        {/* Grid de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                className="text-center group"
              >
                <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4 mx-auto">
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-full opacity-20 group-hover:opacity-30 transition-opacity`} />
                  <div className={`relative bg-gradient-to-r ${stat.color} p-0.5 rounded-full`}>
                    <div className="bg-white rounded-full p-3">
                      <Icon className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-slate-900">
                    {stat.label}
                  </div>
                  <div className="text-sm text-slate-600">
                    {stat.description}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Selos e Credenciais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="pt-8 border-t border-gray-200"
        >
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>CRM-MG 69.870</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              <span>Caratinga, MG</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <span>15+ anos de experiência</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span>Parceiro Amor e Saúde</span>
            </div>
          </div>
        </motion.div>

        {/* Testemunho Rápido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <div className="flex-1">
              <blockquote className="text-slate-700 italic">
                "Atendimento excepcional! Dr. Philipe é um profissional extremamente competente
                e atencioso. A clínica possui equipamentos modernos e a equipe é muito qualificada."
              </blockquote>
              <div className="mt-3 text-sm font-semibold text-slate-900">
                — Maria S., Paciente
              </div>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SocialProof;