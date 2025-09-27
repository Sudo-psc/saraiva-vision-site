/**
 * Simple Google Reviews Widget
 * Reliable component for displaying Google Places reviews
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink, MessageCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGoogleReviews } from '@/hooks/useGoogleReviews';
import { fetchPlaceDetails } from '@/lib/fetchPlaceDetails';
import { clinicInfo } from '@/lib/clinicInfo';
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
    const [placeData, setPlaceData] = useState(null);
    const [placeLoading, setPlaceLoading] = useState(true);
    const [placeError, setPlaceError] = useState(null);

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
            if (err.message.includes('not configured')) {
                console.info('Google Reviews not configured, using fallback data:', err.message);
            } else {
                console.info('Using fallback reviews due to API error:', err.message);
            }
        }
    });

    // Fetch real place details
    useEffect(() => {
        const fetchRealPlaceData = async () => {
            try {
                setPlaceLoading(true);
                setPlaceError(null);
                
                const data = await fetchPlaceDetails(clinicInfo.CLINIC_PLACE_ID);
                setPlaceData(data);
                
                console.log('✅ [DEBUG] Dados reais do Google Places obtidos:', {
                    name: data.name,
                    rating: data.rating,
                    userRatingCount: data.userRatingCount,
                    reviewsCount: data.reviews?.length || 0
                });
                
            } catch (error) {
                console.error('❌ [ERROR] Erro ao buscar dados do Google Places:', error);
                setPlaceError(error.message);
            } finally {
                setPlaceLoading(false);
            }
        };

        if (clinicInfo.CLINIC_PLACE_ID) {
            fetchRealPlaceData();
        } else {
            console.warn('⚠️ [WARNING] CLINIC_PLACE_ID não configurado');
            setPlaceLoading(false);
        }
    }, []);

    // Determine which data to use
    const hasRealPlaceData = placeData && !placeData.error && placeData.rating > 0;
    const hasRealReviews = placeData && placeData.reviews && placeData.reviews.length > 0;
    
    // Use real reviews if available, otherwise fallback to API reviews, then fallback data
    let reviews;
    if (hasRealReviews) {
        reviews = placeData.reviews.slice(0, maxReviews);
    } else if (apiReviews && apiReviews.length > 0) {
        reviews = apiReviews.slice(0, maxReviews);
    } else {
        reviews = fallbackReviews.slice(0, maxReviews);
    }

    // Use real stats if available, otherwise fallback
    const stats = hasRealPlaceData ? {
        overview: {
            averageRating: placeData.rating,
            totalReviews: placeData.userRatingCount,
            recentReviews: placeData.reviews?.length || 0
        }
    } : (apiStats || {
        overview: {
            averageRating: 4.9,
            totalReviews: 102,
            recentReviews: 12
        }
    });

    const isUsingFallback = !hasRealPlaceData && (!apiReviews || apiReviews.length === 0);
    const dataSource = hasRealPlaceData ? 'Google Places' : (apiReviews?.length > 0 ? 'API Reviews' : 'Fallback Data');

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

    // Use real Google Maps URL if available
    const googleUrl = hasRealPlaceData && placeData.url 
        ? placeData.url 
        : `https://www.google.com/maps/place/?q=place_id:${clinicInfo.CLINIC_PLACE_ID}` || 
          'https://www.google.com/maps/place/Saraiva+Vision+-+Oftalmologia/@-19.9166667,-43.9555556,17z';

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
                            <span className="text-slate-600">({stats.overview.totalReviews}+ reviews)</span>
                        </div>
                        
                        {stats.overview.recentReviews && (
                            <Badge variant="success" className="px-3 py-1">
                                {stats.overview.recentReviews} avaliações recentes
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

                {/* Development Info */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 text-center space-y-2">
                        <div className="flex flex-wrap justify-center gap-2">
                            <Badge
                                variant={hasRealPlaceData ? 'success' : isUsingFallback ? 'warning' : 'info'}
                                className="text-xs"
                            >
                                Data Source: {dataSource}
                            </Badge>
                            
                            {placeLoading && (
                                <Badge variant="info" className="text-xs">
                                    Loading Place Data...
                                </Badge>
                            )}
                            
                            {placeError && (
                                <Badge variant="destructive" className="text-xs">
                                    Place Error: {placeError}
                                </Badge>
                            )}
                            
                            {hasRealPlaceData && (
                                <Badge variant="success" className="text-xs">
                                    ⭐ {placeData.rating} ({placeData.userRatingCount} reviews)
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default GoogleReviewsWidget;
