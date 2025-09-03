import React, { useState, useEffect } from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { googleReviewUrl } from '@/lib/clinicInfo';
import { useTranslation } from 'react-i18next';

// Real reviews data from Google Places API
const featuredReviews = [
    {
        id: 3,
        author: 'Elis R.',
        rating: 5,
        text: 'Que atendimento maravilhoso! Tem pessoa que realmente nasce para exalar gentileza... Minha avó foi extremamente bem atendida, da chegada a saída da clínica.',
        relativeTime: 'há uma semana',
        avatar: '/img/avatar-female-blonde.png'
    },
    {
        id: 2,
        author: 'Lais S.',
        rating: 5,
        text: 'Ótimo atendimento, excelente espaço. Obrigada',
        relativeTime: 'há uma semana',
        avatar: '/img/avatar-female-brunette.png'
    },
    {
        id: 1,
        author: 'Junia B.',
        rating: 5,
        text: 'Profissional extremamente competente e atencioso. Recomendo!',
        relativeTime: 'há uma semana',
        avatar: '/img/avatar-female-black.png'
    }
];

const reviewsSummary = {
    rating: 4.9,
    total: 102
};

const CompactGoogleReviews = () => {
    const [mounted, setMounted] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={16}
                className={`${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
            />
        ));
    };

    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                {/* Section Title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-8"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Depoimentos de Pacientes
                    </h2>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                            {renderStars(5)}
                        </div>
                        <span className="text-2xl font-bold text-slate-900">{reviewsSummary.rating}</span>
                    </div>
                    <p className="text-slate-600">
                        <span className="font-semibold">{reviewsSummary.total}+ avaliações</span> no Google
                    </p>
                </motion.div>

                {/* Featured Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {featuredReviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="bg-gradient-to-br from-blue-50 to-slate-50 p-6 rounded-2xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Rating Stars */}
                            <div className="flex items-center gap-1 mb-3">
                                {renderStars(review.rating)}
                            </div>

                            {/* Review Text */}
                            <p className="text-slate-700 text-sm leading-relaxed mb-4 line-clamp-4">
                                "{review.text}"
                            </p>

                            {/* Author Info */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-slate-800 text-sm">{review.author}</p>
                                    <p className="text-slate-500 text-xs">{review.relativeTime}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                                    <img
                                        src={review.avatar}
                                        alt={`Foto de ${review.author}`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* View All Reviews CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <a
                        href={googleReviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        aria-label={t('reviews.view_all_aria', 'Ver todas as avaliações no Google (abre em nova aba)')}
                    >
                        Ver todas no Google
                        <ExternalLink size={18} />
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default CompactGoogleReviews;
