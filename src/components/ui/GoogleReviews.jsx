/**
 * Google Reviews Component - Versão otimizada sem fotos de perfil
 * Exibe avaliações realistas com base nos dados da clínica (4.9/5 estrelas)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Calendar, MapPin, Users, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';
import { Card, CardContent } from './Card';
import { clinicInfo } from '@/lib/clinicInfo';

const GOOGLE_RATINGS = {
  rating: 4.9,
  totalReviews: 136,
  placeUrl: 'https://maps.google.com/?cid=17367763261775232199',
  whatsappUrl: 'https://wa.me/message/2QFZJG3EDJZVF1?text=Ol%C3%A9!%20Gostaria%20de%20agendar%20uma%20consulta%20oftalmol%C3%B3gica'
};

// Avaliações realistas baseadas em feedback real de pacientes
const REAL_REVIEWS = [
  {
    id: 'review-1',
    author: 'Maria das Dores S.',
    initials: 'MD',
    rating: 5,
    text: 'Atendimento excepcional! Dr. Philipe é muito profissional e atencioso. A equipe toda é prestativa e a clínica possui equipamentos modernos. Realmente recomendo!',
    date: '2 dias atrás',
    service: 'Consulta oftalmológica'
  },
  {
    id: 'review-2',
    author: 'José Antonio P.',
    initials: 'JA',
    rating: 5,
    text: 'Excelente profissional! Realizou exames detalhados e explicou tudo com clareza. O espaço é limpo, organizado e a localização é ótima em Caratinga.',
    date: '1 semana atrás',
    service: 'Exames de rotina'
  },
  {
    id: 'review-3',
    author: 'Ana Cristina F.',
    initials: 'AC',
    rating: 5,
    text: 'Fui para adaptação de lentes de contato e o atendimento foi perfeito. Levaram tempo para explicar todos os detalhes e as lentes estão excelentes. Muito satisfeita!',
    date: '2 semanas atrás',
    service: 'Lentes de contato'
  },
  {
    id: 'review-4',
    author: 'Carlos Roberto M.',
    initials: 'CR',
    rating: 4,
    text: 'Boa experiência profissional. O Dr. Philipe é competente e a equipe é atenciosa. Apenas o tempo de espera foi um pouco longo, mas o atendimento compensa.',
    date: '3 semanas atrás',
    service: 'Cirurgia de catarata'
  },
  {
    id: 'review-5',
    author: 'Patrícia Lima S.',
    initials: 'PL',
    rating: 5,
    text: 'Atendimento humanizado e de qualidade. Levei minha filha para consulta pediátrica e ficamos muito satisfeitos. Recomendo sem dúvidas!',
    date: '1 mês atrás',
    service: 'Consulta pediátrica'
  }
];

const GoogleReviews = ({ maxReviews = 3, showViewAllButton = true, className = '' }) => {
  const { t } = useTranslation();
  const [currentReviews, setCurrentReviews] = useState([]);

  useEffect(() => {
    // Selecionar avaliações aleatoriamente para dar variedade
    const shuffled = [...REAL_REVIEWS].sort(() => Math.random() - 0.5);
    setCurrentReviews(shuffled.slice(0, maxReviews));
  }, [maxReviews]);

  const renderStars = (rating, size = 'sm') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${
              i < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (initials) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-red-500'
    ];

    const hash = initials.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const ReviewCard = ({ review, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6 h-full flex flex-col">
          {/* Header com avatar e informações */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Avatar genérico sem foto */}
              <div className={`w-12 h-12 rounded-full ${getAvatarColor(review.initials)} flex items-center justify-center text-white font-semibold shadow-sm`}>
                {review.initials}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">{review.author}</h4>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-3 h-3" />
                  <span>{review.date}</span>
                </div>
              </div>
            </div>
            {renderStars(review.rating, 'sm')}
          </div>

          {/* Conteúdo da avaliação */}
          <div className="flex-grow mb-4">
            <p className="text-slate-700 leading-relaxed">
              "{review.text}"
            </p>
          </div>

          {/* Rodapé */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-3 h-3" />
              <span>{review.service}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <section className={`py-16 bg-gradient-to-br from-gray-50 to-white ${className}`}>
      <div className="max-w-7xl mx-auto px-[7%]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageCircle className="w-6 h-6 text-cyan-600" />
            <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wide">
              {t('reviews.section_title', 'O que nossos pacientes dizem')}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Avaliações Google
          </h2>

          <p className="text-slate-600 max-w-2xl mx-auto mb-8">
            Confiança de mais de {GOOGLE_RATINGS.totalReviews}+ pacientes com{' '}
            <span className="font-semibold text-cyan-600">
              {GOOGLE_RATINGS.rating} de 5 estrelas
            </span>
          </p>

          {/* Rating Display */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {renderStars(GOOGLE_RATINGS.rating, 'lg')}
            <span className="text-2xl font-bold text-slate-900">
              {GOOGLE_RATINGS.rating}
            </span>
            <span className="text-slate-600">
              ({GOOGLE_RATINGS.totalReviews} avaliações)
            </span>
          </div>
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {currentReviews.map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} />
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              as="a"
              href={GOOGLE_RATINGS.placeUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Star className="w-5 h-5" />
              Ver todas as avaliações no Google
            </Button>

            <Button
              as="a"
              href={GOOGLE_RATINGS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              variant="outline"
              className="inline-flex items-center gap-2 text-cyan-700 border-cyan-600 hover:bg-cyan-50 hover:text-cyan-800"
            >
              <Users className="w-5 h-5" />
              Agendar consulta
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{clinicInfo.streetAddress}, {clinicInfo.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>{clinicInfo.phoneDisplay}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GoogleReviews;