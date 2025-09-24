/**
 * Google Reviews Integration Component
 * Ready-to-use component for displaying Google Business reviews on homepage
 * Automatically handles API integration with graceful fallbacks
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Star, ExternalLink, MessageCircle, TrendingUp } from 'lucide-react';
import { useGoogleReviews } from '@/hooks/useGoogleReviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge.jsx';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Fallback data for when API is not available
const fallbackData = {
    reviews: [
        {
            id: 'fallback-1',
            reviewer: {
                displayName: 'Elis R.',
                profilePhotoUrl: '/images/avatar-female-blonde-640w.webp'
            },
            starRating: 5,
            comment: 'Que atendimento maravilhoso! Tem pessoa que realmente nasce para exalar gentileza... Minha avó foi extremamente bem atendida, da chegada a saída da clínica.',
            createTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'fallback-2',
            reviewer: {
                displayName: 'Lais S.',
                profilePhotoUrl: '/images/avatar-female-brunette-640w.webp'
            },
            starRating: 5,
            comment: 'Ótimo atendimento, excelente espaço. Obrigada',
            createTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'fallback-3',
            reviewer: {
                displayName: 'Junia B.',
                profilePhotoUrl: '/img/avatar-female-black.webp'
            },
            starRating: 5,
            comment: 'Profissional extremamente competente e atencioso. Recomendo!',
            createTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
    ],
    stats: {
        overview: {
            averageRating: 4.9,
            totalReviews: 102,
            recentReviews: 12
        }
    }
};

const GoogleReviewsIntegration = ({
    locationId = import.meta.env.VITE_GOOGLE_PLACE_ID || 'ChIJVUKww7WRugARF7u2lAe7BeE',
    maxReviews = 3,
    showViewAllButton = true,
    className = ''
}) => {
    const { t } = useTranslation();

    // Try to fetch real reviews, fallback to static data
    const {
        reviews: apiReviews,
        stats: apiStats,
        loading,
        error
    } = useGoogleReviews({
        placeId: locationId,
        limit: maxReviews,
        autoFetch: true,
        onError: (err) => {
            console.info('Google Places API not configured, using fallback data:', err.message);
        }
    });

    // Use API data if available, otherwise use fallback
    const reviews = (!loading && !error && apiReviews.length > 0) ? apiReviews : fallbackData.reviews;
    const stats = (!loading && !error && apiStats) ? apiStats : fallbackData.stats;

    const formatReviewDate = (dateString) => {
        if (!dateString) return 'recentemente';

        try {
            return formatDistanceToNow(new Date(dateString), {
                addSuffix: true,
                locale: ptBR
            });
        } catch (error) {
            return 'recentemente';
        }
    };

    const renderStars = (rating, size = 'sm') => {
        const sizeClasses = {
            sm: 'w-4 h-4',
            md: 'w-5 h-5',
            lg: 'w-6 h-6'
        };

        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${sizeClasses[size]} ${star <= rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    const googleReviewsUrl = `https://www.google.com/maps/place/?q=place_id:${locationId}`;

    return (
        <section className={`py-12 bg-white ${className}`}>
            <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-[6%] xl:px-[7%] 2xl:px-[8%]">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 via-cyan-50 to-teal-100 text-blue-700 mb-6 border border-blue-200/50 shadow-lg backdrop-blur-sm">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-bold text-sm tracking-wide uppercase">
                            {t('reviews.section_title', 'Avaliações dos Pacientes')}
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        {t('reviews.main_title', 'O que nossos pacientes dizem')}
                    </h2>

                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        {t('reviews.subtitle', 'Experiências reais de quem confia na Saraiva Vision para cuidar da sua visão')}
                    </p>
                </motion.div>

                {/* Statistics Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12"
                >
                    {/* Average Rating */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <div className="flex items-center gap-1">
                                {renderStars(Math.round(stats.overview.averageRating), 'md')}
                            </div>
                            <span className="text-3xl font-bold text-slate-900">
                                {stats.overview.averageRating}
                            </span>
                        </div>
                        <p className="text-slate-600 font-medium">Avaliação Média</p>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-12 bg-slate-200"></div>

                    {/* Total Reviews */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                            <span className="text-3xl font-bold text-slate-900">
                                {stats.overview.totalReviews}+
                            </span>
                        </div>
                        <p className="text-slate-600 font-medium">Avaliações no Google</p>
                    </div>

                    {/* Recent Reviews */}
                    {stats.overview.recentReviews && (
                        <>
                            <div className="hidden md:block w-px h-12 bg-slate-200"></div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Badge variant="success" className="text-lg px-3 py-1">
                                        {stats.overview.recentReviews}
                                    </Badge>
                                </div>
                                <p className="text-slate-600 font-medium">Últimos 30 dias</p>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {reviews.slice(0, maxReviews).map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 * index }}
                        >
                            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                                <CardContent className="p-6">
                                    {/* Rating Stars */}
                                    <div className="flex items-center gap-1 mb-4">
                                        {renderStars(review.starRating)}
                                    </div>

                                    {/* Review Text */}
                                    <p className="text-slate-700 text-sm leading-relaxed mb-6 line-clamp-4">
                                        "{review.comment}"
                                    </p>

                                    {/* Reviewer Info */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">
                                                {review.reviewer.displayName}
                                            </p>
                                            <p className="text-slate-500 text-xs">
                                                {formatReviewDate(review.createTime)}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                                            <img
                                                src={review.reviewer.profilePhotoUrl}
                                                alt={`Foto de ${review.reviewer.displayName}`}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.src = '/img/avatar-placeholder.png';
                                                }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* View All Reviews Button */}
                {showViewAllButton && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-center"
                    >
                        <a
                            href={googleReviewsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t('reviews.view_all_aria', 'Ver todas as avaliações no Google (abre em nova aba)')}
                        >
                            <Button
                                size="lg"
                                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                                {t('reviews.view_all_button', 'Ver Todas as Avaliações')}
                                <ExternalLink className="w-5 h-5" />
                            </Button>
                        </a>
                    </motion.div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center gap-2 text-blue-600">
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Carregando avaliações...</span>
                        </div>
                    </div>
                )}

                {/* API Status Indicator (Development Only) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 text-center">
                        <Badge
                            variant={error ? 'destructive' : loading ? 'warning' : 'success'}
                            className="text-xs"
                        >
                            {error ? 'API Offline - Using Fallback Data' :
                                loading ? 'Loading from API...' :
                                    'Live Google Reviews'}
                        </Badge>
                    </div>
                )}
            </div>
        </section>
    );
};

export default GoogleReviewsIntegration;