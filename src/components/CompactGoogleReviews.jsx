import React, { useState, useEffect } from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { googleReviewUrl, CLINIC_PLACE_ID } from '@/lib/clinicInfo';
import { useTranslation } from 'react-i18next';
import { useGoogleReviews } from '@/hooks/useGoogleReviews';

// Fallback reviews data with real profile photos
const fallbackReviews = [
    {
        id: 'fallback-5',
        reviewer: {
            displayName: 'Carlos M.',
            profilePhotoUrl: '/images/avatar-male-brown-640w.webp',
            isAnonymous: false
        },
        starRating: 5,
        comment: 'Excelente profissional! Muito atencioso e competente. A clínica é moderna e o atendimento é impecável. Recomendo a todos!',
        relativeTimeDescription: 'há 2 semanas'
    },
    {
        id: 'fallback-4',
        reviewer: {
            displayName: 'Ana L.',
            profilePhotoUrl: '/images/avatar-female-redhead-640w.webp',
            isAnonymous: false
        },
        starRating: 5,
        comment: 'Fui muito bem atendida! O ambiente é acolhedor e os profissionais são extremamente gentis e capacitados.',
        relativeTimeDescription: 'há 3 semanas'
    },
    {
        id: 'fallback-3',
        reviewer: {
            displayName: 'Elis R.',
            profilePhotoUrl: '/images/avatar-female-blonde-640w.webp',
            isAnonymous: false
        },
        starRating: 5,
        comment: 'Que atendimento maravilhoso! Tem pessoa que realmente nasce para exalar gentileza... Minha avó foi extremamente bem atendida, da chegada a saída da clínica.',
        relativeTimeDescription: 'há uma semana'
    },
    {
        id: 'fallback-2',
        reviewer: {
            displayName: 'Lais S.',
            profilePhotoUrl: '/images/avatar-female-brunette-640w.webp',
            isAnonymous: false
        },
        starRating: 5,
        comment: 'Ótimo atendimento, excelente espaço. Obrigada',
        relativeTimeDescription: 'há uma semana'
    },
    {
        id: 'fallback-1',
        reviewer: {
            displayName: 'Junia B.',
            profilePhotoUrl: '/img/avatar-female-black.webp',
            isAnonymous: false
        },
        starRating: 5,
        comment: 'Profissional extremamente competente e atencioso. Recomendo!',
        relativeTimeDescription: 'há uma semana'
    }
];

const fallbackStats = {
    overview: {
        averageRating: 4.9,
        totalReviews: 102
    }
};

const CompactGoogleReviews = React.memo(() => {
    const [mounted, setMounted] = useState(false);
    const { t } = useTranslation();

    const {
        reviews: apiReviews,
        stats: apiStats
    } = useGoogleReviews({
        placeId: CLINIC_PLACE_ID,
        limit: 5,
        autoFetch: true
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Use API data if available, otherwise fallback
    const reviews = apiReviews && apiReviews.length > 0 ? apiReviews : fallbackReviews;
    const stats = apiStats || fallbackStats;
    const averageRating = stats.overview?.averageRating || stats.averageRating || 4.9;
    const totalReviews = stats.overview?.totalReviews || stats.totalReviews || 102;

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
        <section className="py-12 bg-white compact-google-reviews scroll-section-fix">
            <div className="max-w-7xl mx-auto px-4 md:px-6 reviews-container">
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
                        <span className="text-2xl font-bold text-slate-900">{averageRating}</span>
                    </div>
                    <p className="text-slate-600">
                        <span className="font-semibold">{totalReviews}+ avaliações</span> no Google
                    </p>
                </motion.div>

                {/* Featured Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {reviews.map((review, index) => {
                        // Handle both API format and fallback format
                        const displayName = review.reviewer?.displayName || review.author || 'Anônimo';
                        const profilePhoto = review.reviewer?.profilePhotoUrl || review.avatar || '/images/avatar-female-blonde-640w.webp';
                        const rating = review.starRating || review.rating || 5;
                        const text = review.comment || review.text || '';
                        const timeDescription = review.relativeTimeDescription || review.relativeTime || 'recentemente';

                        return (
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
                                    {renderStars(rating)}
                                </div>

                                {/* Review Text */}
                                <p className="text-slate-700 text-sm leading-relaxed mb-4 line-clamp-4">
                                    "{text}"
                                </p>

                                {/* Author Info */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{displayName}</p>
                                        <p className="text-slate-500 text-xs">{timeDescription}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                                        <img
                                            src={profilePhoto}
                                            alt={`Foto de ${displayName}`}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            decoding="async"
                                            onError={(e) => {
                                                // Fallback to default avatar on error
                                                e.target.src = '/images/avatar-female-blonde-640w.webp';
                                            }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
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
                        className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
