import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star, CheckCircle } from 'lucide-react';

/**
 * PatientTestimonials - Real patient testimonials for blog posts
 * Builds trust and social proof
 */
const PatientTestimonials = ({ testimonials = [], className = '' }) => {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`my-12 ${className}`}
      aria-labelledby="testimonials-title"
    >
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 shadow-xl border border-blue-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-full p-3 shadow-md">
            <Quote className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 id="testimonials-title" className="text-2xl font-bold text-gray-900">
              Experiências de Pacientes
            </h2>
            <p className="text-sm text-gray-600">Depoimentos reais de quem já passou por aqui</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < (testimonial.rating || 5)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <blockquote className="text-gray-700 leading-relaxed mb-4 italic">
                "{testimonial.text}"
              </blockquote>

              <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  {testimonial.treatment && (
                    <p className="text-xs text-gray-600 mt-1">
                      {testimonial.treatment}
                    </p>
                  )}
                </div>
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" aria-label="Verificado" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-cyan-200 text-center">
          <p className="text-sm text-gray-600 mb-4">
            ⭐ Mais de 136 avaliações com média 4.9/5.0
          </p>
          <a
            href="https://g.page/r/CR7vjH0qGo18EB0/review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <Star className="w-5 h-5" />
            <span>Ver Todas as Avaliações</span>
          </a>
        </div>
      </div>
    </motion.section>
  );
};

export default PatientTestimonials;
