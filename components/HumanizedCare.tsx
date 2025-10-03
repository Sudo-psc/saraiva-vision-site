/**
 * HumanizedCare Component
 * Next.js 15 - Server Component with client interactivity
 *
 * Displays emotional connection points, patient stories, and trust-building elements
 * for the homepage. Focuses on humanizing the medical experience.
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Award, Clock, Shield, Star } from 'lucide-react';
import type { HumanizedCareProps, CareStory, CareValue } from '@/types/homepage';

const defaultValues: CareValue[] = [
  {
    icon: Heart,
    title: 'Cuidado Personalizado',
    description: 'Cada paciente recebe atenção individual e um plano de tratamento adaptado às suas necessidades específicas.',
    highlight: true,
  },
  {
    icon: Users,
    title: 'Equipe Experiente',
    description: 'Profissionais qualificados e dedicados, com anos de experiência em oftalmologia.',
    highlight: false,
  },
  {
    icon: Clock,
    title: 'Atendimento Ágil',
    description: 'Respeitamos seu tempo com consultas pontuais e processos eficientes.',
    highlight: false,
  },
  {
    icon: Award,
    title: 'Excelência Comprovada',
    description: 'Reconhecidos pela qualidade do atendimento e satisfação dos pacientes.',
    highlight: false,
  },
];

const defaultStories: CareStory[] = [
  {
    id: '1',
    patientInitials: 'M.S.',
    story: 'Recuperei minha visão após a cirurgia de catarata. O Dr. Saraiva me acompanhou em cada etapa, explicando tudo com paciência e cuidado.',
    condition: 'Catarata',
    outcome: 'Visão 100% recuperada',
    rating: 5,
  },
  {
    id: '2',
    patientInitials: 'J.P.',
    story: 'O atendimento foi excepcional desde a primeira consulta. Me senti acolhido e seguro durante todo o tratamento.',
    condition: 'Glaucoma',
    outcome: 'Tratamento bem-sucedido',
    rating: 5,
  },
  {
    id: '3',
    patientInitials: 'A.L.',
    story: 'Profissionalismo e empatia em todos os momentos. A equipe fez toda a diferença na minha recuperação.',
    condition: 'Cirurgia Refrativa',
    outcome: 'Sem óculos há 2 anos',
    rating: 5,
  },
];

export default function HumanizedCare({
  className = '',
  stories = defaultStories,
  values = defaultValues,
  showTestimonials = true,
}: HumanizedCareProps) {
  const getColorClasses = (highlight: boolean = false) => {
    if (highlight) {
      return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg';
    }
    return 'bg-white text-slate-900 border border-slate-200 hover:border-blue-300';
  };

  return (
    <section className={`py-16 md:py-24 bg-gradient-to-b from-white via-blue-50/30 to-white ${className}`}>
      <div className="container mx-auto px-[7%]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <Heart size={16} className="mr-2" />
            Cuidado Humanizado
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
            Mais do que Tratamento,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Cuidado com Pessoas
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Acreditamos que a saúde ocular vai além da medicina — é sobre conexão humana,
            empatia e dedicação a cada paciente.
          </p>
        </motion.div>

        {/* Care Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${getColorClasses(value.highlight)}`}
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                    value.highlight ? 'bg-white/20' : 'bg-blue-100'
                  }`}
                >
                  <Icon
                    size={28}
                    className={value.highlight ? 'text-white' : 'text-blue-600'}
                  />
                </div>
                <h3
                  className={`text-lg font-bold mb-2 ${
                    value.highlight ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {value.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    value.highlight ? 'text-blue-50' : 'text-slate-600'
                  }`}
                >
                  {value.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Patient Stories / Testimonials */}
        {showTestimonials && stories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
          >
            <div className="flex items-center justify-center mb-10">
              <Shield className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                Histórias de Transformação
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 hover:shadow-lg transition-shadow"
                >
                  {/* Rating Stars */}
                  {story.rating && (
                    <div className="flex mb-3">
                      {Array.from({ length: story.rating }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className="text-yellow-400 fill-current"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  )}

                  {/* Story Text */}
                  <p className="text-slate-700 mb-4 italic leading-relaxed">
                    "{story.story}"
                  </p>

                  {/* Patient & Outcome */}
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {story.patientInitials || 'Paciente'}
                      </p>
                      <p className="text-slate-500">{story.condition}</p>
                    </div>
                    {story.outcome && (
                      <div className="text-right">
                        <p className="text-green-600 font-medium">{story.outcome}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
              className="mt-10 pt-8 border-t border-slate-200 text-center"
            >
              <p className="text-slate-600 text-lg">
                Junte-se a milhares de pacientes satisfeitos que confiaram sua visão aos nossos
                cuidados
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
