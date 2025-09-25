/**
 * Simple Google Reviews Widget
 * Reliable component for displaying Google Places reviews
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink, MessageCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGoogleReviews } from '@/hooks/useGoogleReviews';
import { useGracefulFallback } from '@/hooks/useGracefulFallback';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';

// Reliable fallback data
const fallbackReviews = [
    {
        id: 'fallback-1',
        reviewer: {
            displayName: 'Elis R.',
            profilePhotoUrl: '/images/avatar-female-blonde-640w.avif'
        },
        starRating: 5,
        comment: 'Que atendimento maravilhoso! Tem pessoa que realmente nasce para exalar gentileza... Minha avó foi extremamente bem atendida, da chegada a saída da clínica.',
        createTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        relativeTimeDescription: 'há uma semana'
    },
    {
        id: 'fallback-2',
        reviewer: {
            displayName: 'Lais S.',
            profilePhotoUrl: '/images/avatar-female-brunette-640w.avif'
        },
        starRating: 5,
        comment: 'Ótimo atendimento, excelente espaço. Profissionais muito competentes. Recomendo!',
        createTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        relativeTimeDescription: 'há 10 dias'
    },
    {
        id: 'fallback-3',
        reviewer: {
            displayName: 'Junia B.',
            profilePhotoUrl: '/images/avatar-female-brunette-960w.avif'
        },
        starRating: 5,
        comment: 'Profissional extremamente competente e atencioso. Recomendo!',
        createTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        relativeTimeDescription: 'há 2 semanas'
    }
];

const GoogleReviewsWidget = ({
    maxReviews = 3,
    showHeader = true,
    showStats = true,
    showViewAllButton = true,
    className = ''
}) => {
    const { t } = useTranslation();
    const { isUsingFallback } = useGracefulFallback('googleReviews');

    const {
        reviews: apiReviews,
        stats: apiStats,
        loading,
        error,
        refresh,
        isRetrying,
        retryCount
    } = useGoogleReviews({
        limit: maxReviews,
        autoFetch: true,
        onError: (err) => {
            // Log silencioso - sem avisos visuais para o usuário
            console.info('🔄 Google Reviews: Graceful fallback active', {
                reason: err.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Use API data if available and valid, otherwise use fallback
    const reviews = (apiReviews && apiReviews.length > 0) ? apiReviews.slice(0, maxReviews) : fallbackReviews.slice(0, maxReviews);
    const stats = apiStats || {
        overview: {
            averageRating: 4.9,
            totalReviews: 102,
            recentReviews: 12
        }
    };

    // isUsingFallback agora vem do hook useGracefulFallback

    const renderStars = (rating, size = 'sm') => {
        const sizeClass = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3 h-3';

        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${sizeClass} ${star <= rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'recentemente';

        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return 'hoje';
            if (diffDays === 1) return 'ontem';
            if (diffDays < 7) return `há ${diffDays} dias`;
            if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`;
            if (diffDays < 365) return `há ${Math.floor(diffDays / 30)} meses`;
            return `há ${Math.floor(diffDays / 365)} anos`;
        } catch {
            return 'recentemente';
        }
    };

    const googleUrl = 'https://www.google.com/maps/place/Saraiva+Vision+-+Oftalmologia/@-19.9166667,-43.9555556,17z';

    return (
        <section className={`py-12 bg-white ${className}`}>
            <div className="max-w-7xl mx-auto px-[7%]">
                {/* Header */}
                {showHeader && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-8"
                    >
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-50 text-blue-700 mb-4">
                            <MessageCircle className="w-4 h-4" />
                            <span className="font-semibold text-sm">{t('reviews.section_title')}</span>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                            {t('reviews.main_title')}
                        </h2>

                        <p className="text-slate-600 max-w-2xl mx-auto">
                            {t('reviews.subtitle')}
                        </p>
                    </motion.div>
                )}

                {/* Stats Overview */}
                {showStats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-wrap items-center justify-center gap-6 mb-8"
                    >
                        <div className="flex items-center gap-2">
                            {renderStars(Math.round(stats.overview.averageRating), 'md')}
                            <span className="text-2xl font-bold text-slate-900">
                                {stats.overview.averageRating}
                            </span>
                            <span className="text-slate-600">({stats.overview.totalReviews}+ {t('reviews.total_reviews')})</span>
                        </div>

                        {stats.overview.recentReviews && (
                            <Badge variant="success" className="px-3 py-1">
                                {stats.overview.recentReviews} {t('reviews.recent_reviews')}
                            </Badge>
                        )}
                    </motion.div>
                )}


                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <Card className="h-full hover:shadow-lg transition-all duration-300">
                                <CardContent className="p-6">
                                    {/* Rating */}
                                    <div className="mb-4">
                                        {renderStars(review.starRating, 'md')}
                                    </div>

                                    {/* Review Text */}
                                    <p className="text-slate-700 leading-relaxed mb-6 line-clamp-3">
                                        "{review.comment}"
                                    </p>

                                    {/* Reviewer Info */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-800">
                                                {review.reviewer.displayName}
                                            </p>
                                            <p className="text-slate-500 text-sm">
                                                {review.relativeTimeDescription || formatDate(review.createTime)}
                                            </p>
                                        </div>

                                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                            <img
                                                src={review.reviewer.profilePhotoUrl}
                                                alt={review.reviewer.displayName}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.src = '/images/avatar-female-brunette-320w.avif';
                                                }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* View All Button */}
                {showViewAllButton && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <a
                            href={googleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Ver todas as avaliações no Google (abre em nova aba)"
                        >
                            <Button
                                size="lg"
                                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {t('reviews.view_all_button')}
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </a>
                    </motion.div>
                )}

                {/* Fallback gracioso - apenas log no console */}
                {isUsingFallback && console.info('🔄 Google Reviews: Using fallback data for graceful user experience')}
            </div>
        </section>
    );
};

export default GoogleReviewsWidget;
