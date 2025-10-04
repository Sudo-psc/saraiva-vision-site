'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink, MessageCircle } from 'lucide-react';
// Temporarily removing i18n dependency for build
import { CLINIC_PLACE_ID, clinicInfo } from '@/lib/clinicInfo';
import { Card, CardContent } from '@/components/ui/Card';
import SafeInteractiveCarousel from '@/components/ui/SafeInteractiveCarousel';
import { createLogger } from '@/utils/structuredLogger';
import type { NormalizedReview, PlaceDetails } from '@/types/google-reviews';

const REVIEW_REFRESH_INTERVAL = 30 * 60 * 1000;

const logger = createLogger('GoogleReviewsWidget');

interface Stats {
  averageRating: number;
  totalReviews: number;
}

interface GoogleReviewsWidgetProps {
  maxReviews?: number;
  showHeader?: boolean;
  showStats?: boolean;
  showViewAllButton?: boolean;
  className?: string;
}

const fallbackReviews: NormalizedReview[] = [
  {
    id: 'fallback-1',
    author: 'Elis R.',
    avatar: '/images/avatar-female-blonde-640w.avif',
    rating: 5,
    text: 'Que atendimento maravilhoso! Tem pessoa que realmente nasce para exalar gentileza... Minha avó foi extremamente bem atendida, da chegada a saída da clínica.',
    createTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fallback-2',
    author: 'Lais S.',
    avatar: '/images/avatar-female-brunette-640w.avif',
    rating: 5,
    text: 'Ótimo atendimento, excelente espaço. Profissionais muito competentes. Recomendo!',
    createTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fallback-3',
    author: 'Junia B.',
    avatar: '/images/avatar-female-brunette-960w.avif',
    rating: 5,
    text: 'Profissional extremamente competente e atencioso. Recomendo!',
    createTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const GoogleReviewsWidget: React.FC<GoogleReviewsWidgetProps> = ({
  maxReviews = 3,
  showHeader = true,
  showStats = true,
  showViewAllButton = true,
  className = ''
}) => {
  const t = (key: string, fallback?: string) => fallback || key;
  const [placeData, setPlaceData] = useState<PlaceDetails | null>(null);
  const [placeLoading, setPlaceLoading] = useState(true);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const handleError = useCallback((err: Error) => {
    if (err.message.includes('not configured') || err.message.includes('PLACEHOLDER')) {
      logger.info('Google Reviews API not configured, using fallback data', {
        error: err.message,
        component: 'useGoogleReviews',
        hasPlaceId: !!CLINIC_PLACE_ID,
        maxReviews
      });
    } else {
      logger.error('Google Reviews API error', {
        error: err.message,
        stack: err.stack,
        component: 'useGoogleReviews',
        hasPlaceId: !!CLINIC_PLACE_ID,
        maxReviews,
        refreshInterval: REVIEW_REFRESH_INTERVAL
      });
    }
  }, [maxReviews]);

  const [apiReviews, setApiReviews] = useState<any[]>([]);
  const [apiStats, setApiStats] = useState<any>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch reviews from API
  const fetchReviewsFromAPI = useCallback(async () => {
    if (!CLINIC_PLACE_ID) return;

    const startTime = performance.now();
    const operationId = `fetch-api-reviews-${Date.now()}`;

    logger.info('Starting API reviews fetch', {
      operationId,
      placeId: CLINIC_PLACE_ID,
      maxReviews
    });

    try {
      setReviewsLoading(true);
      setApiError(null);

      const response = await fetch(`/api/reviews?limit=${maxReviews}&language=pt-BR`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SaraivaVision/2.0'
        },
        cache: 'no-cache' // Ensure fresh data
      });

      const duration = Math.round(performance.now() - startTime);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setApiReviews(data.data.reviews || []);
        setApiStats(data.data.stats || null);

        logger.info('API reviews fetched successfully', {
          operationId,
          duration,
          reviewCount: data.data.reviews?.length || 0,
          hasStats: !!data.data.stats,
          cached: data.data.metadata?.source === 'cache'
        });
      } else {
        throw new Error(data.error || 'Failed to fetch reviews');
      }

    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      const err = error as Error;

      logger.error('Failed to fetch reviews from API', {
        operationId,
        duration,
        error: err.message,
        placeId: CLINIC_PLACE_ID
      });

      setApiError(err.message);
      handleError(err);
    } finally {
      setReviewsLoading(false);
    }
  }, [maxReviews, handleError]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchReviewsFromAPI();

    const intervalId = setInterval(() => {
      logger.debug('Starting scheduled API reviews refresh', {
        interval: REVIEW_REFRESH_INTERVAL,
        placeId: CLINIC_PLACE_ID
      });
      fetchReviewsFromAPI();
    }, REVIEW_REFRESH_INTERVAL);

    return () => {
      clearInterval(intervalId);
      logger.info('API reviews widget cleanup', {
        placeId: CLINIC_PLACE_ID,
        intervalCleared: true
      });
    };
  }, [fetchReviewsFromAPI]);

  // Since we're using API routes, we don't need client-side Google Places data fetching
  useEffect(() => {
    if (!CLINIC_PLACE_ID) {
      logger.warn('CLINIC_PLACE_ID not configured', {
        component: 'GoogleReviewsWidget',
        hasPlaceId: false,
        maxReviews
      });
      setPlaceLoading(false);
      return;
    }

    // Set loading to false since API handles the data fetching
    setPlaceLoading(false);
  }, [maxReviews]);

  const normalizedReviews = useMemo(() => {
    const startTime = performance.now();
    const operationId = `normalize-reviews-${Date.now()}`;

    logger.info('Starting review normalization', {
      operationId,
      hasApiReviews: !!apiReviews,
      apiReviewsCount: apiReviews.length || 0,
      maxReviews,
      fallbackCount: fallbackReviews.length,
      hasApiError: !!apiError
    });

    let normalizedResult: any[];

    if (Array.isArray(apiReviews) && apiReviews.length > 0) {
      // API reviews are already normalized, just ensure they have the right structure
      normalizedResult = apiReviews.slice(0, maxReviews).map((review: any) => ({
        id: review.id || `api-${Date.now()}-${Math.random()}`,
        author: review.reviewer?.displayName || review.author || 'Anônimo',
        avatar: review.reviewer?.profilePhotoUrl || review.avatar || '/images/avatar-female-brunette-640w.avif',
        rating: review.starRating || review.rating || 0,
        text: review.comment || review.text || '',
        createTime: review.createTime || review.relativeTimeDescription || new Date().toISOString(),
        language: review.language || 'pt-BR'
      }));

      logger.info('API reviews normalized successfully', {
        operationId,
        inputCount: apiReviews.length,
        outputCount: normalizedResult.length,
        maxReviewsApplied: normalizedResult.length === maxReviews,
        duration: Math.round(performance.now() - startTime)
      });
    } else {
      normalizedResult = fallbackReviews;
      logger.info('Using fallback reviews', {
        operationId,
        reason: apiReviews.length === 0 ? 'empty_api_reviews' : 'api_error',
        hasApiError: !!apiError,
        apiError: apiError,
        fallbackCount: fallbackReviews.length,
        duration: Math.round(performance.now() - startTime)
      });
    }

    return normalizedResult;
  }, [apiReviews, maxReviews, apiError]);

  const stats: Stats = useMemo(() => {
    const startTime = performance.now();
    const operationId = `calculate-stats-${Date.now()}`;

    logger.info('Starting statistics calculation', {
      operationId,
      hasApiStats: !!apiStats,
      apiStatsOverview: !!apiStats?.overview,
      apiStatsAverageRating: apiStats?.overview?.averageRating,
      apiStatsTotalReviews: apiStats?.overview?.totalReviews,
      hasApiError: !!apiError
    });

    let result: Stats;
    let dataSource = 'unknown';

    if (apiStats?.overview) {
      const avgRating = typeof apiStats.overview.averageRating === 'number' ? apiStats.overview.averageRating : 0;
      const totalReviews = typeof apiStats.overview.totalReviews === 'number' ? apiStats.overview.totalReviews : 0;
      result = {
        averageRating: avgRating,
        totalReviews: totalReviews,
      };
      dataSource = avgRating > 0 || totalReviews > 0 ? 'apiStats' : 'fallback';
    } else {
      result = { averageRating: 4.9, totalReviews: 102 };
      dataSource = 'fallback';
    }

    const duration = Math.round(performance.now() - startTime);

    logger.info('Statistics calculation completed', {
      operationId,
      dataSource,
      duration,
      result: {
        averageRating: result.averageRating,
        totalReviews: result.totalReviews
      },
      fallbackUsed: dataSource === 'fallback',
      hasApiStatsIssues: !!(apiStats && !apiStats.overview),
      hasApiError: !!apiError
    });

    return result;
  }, [apiStats, apiError]);

  const isLoading = reviewsLoading;

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3 h-3';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'recentemente';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
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

  const renderReviewCard = (review: NormalizedReview) => (
    <Card className="h-full hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="mb-4">
          {renderStars(review.rating, 'md')}
        </div>
        <p className="text-slate-700 leading-relaxed mb-6 line-clamp-3">
          "{review.text}"
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800">{review.author}</p>
            <p className="text-slate-500 text-sm">{formatDate(review.createTime)}</p>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img
              src={review.avatar}
              alt={review.author}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).src = '/images/avatar-female-brunette-320w.avif'; }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const googleUrl = `https://www.google.com/maps/place/?q=place_id:${CLINIC_PLACE_ID}`;
  const whatsappUrl = 'https://wa.me/message/EHTAAAAYH7SHJ1';
  const phoneHref = clinicInfo.phone ? `tel:${clinicInfo.phone.replace(/[^+\d]/g, '')}` : null;
  const clinicAddress = `${clinicInfo.streetAddress}, ${clinicInfo.city} - ${clinicInfo.state}`;
  const clinicHours = 'Segunda a Sexta, 08h às 18h';

  if (isLoading) {
    return (
      <section className={`py-12 bg-white ${className}`}>
        <div className="max-w-7xl mx-auto px-[7%] text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-600">Carregando avaliações...</p>
          </div>
        </div>
      </section>
    );
  }

  if (placeError || apiError || (!apiReviews && !apiStats)) {
    return (
      <section className={`py-12 bg-white ${className}`}>
        <div className="max-w-7xl mx-auto px-[7%] text-center">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-amber-800 mb-2">
              Avaliações Temporariamente Indisponíveis
            </h3>
            <p className="text-amber-700 mb-4">
              Estamos atualizando nossas avaliações. Por favor, tente novamente mais tarde.
            </p>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Recarregar Página
            </button>
            {(placeError || apiError) && (
              <p className="text-amber-600 text-sm mt-2">
                Erro: {placeError || apiError}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-12 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-[7%]">
        {showHeader && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-50 text-blue-700 mb-3">
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-semibold text-sm">{t('reviews.section_title')}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{t('reviews.main_title')}</h2>
                <p className="text-slate-600 max-w-xl">{t('reviews.subtitle')}</p>
              </div>
              <div className="flex flex-col items-stretch gap-3 md:items-end">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 shadow-lg transition-all">
                  Agendar consulta
                </a>
                {phoneHref && <a href={phoneHref} className="text-emerald-600 font-semibold">{clinicInfo.phoneDisplay || clinicInfo.phone}</a>}
                <div className="text-sm text-slate-600 text-left md:text-right">
                  <p className="font-medium">Horário: {clinicHours}</p>
                  <p className="font-medium">Endereço: {clinicAddress}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {showStats && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              {renderStars(Math.round(stats.averageRating), 'md')}
              <span className="text-2xl font-bold text-slate-900">{stats.averageRating.toFixed(1)}</span>
              <span className="text-slate-600">({stats.totalReviews}+ reviews)</span>
            </div>
          </motion.div>
        )}

        <SafeInteractiveCarousel
          className="md:hidden mb-8"
          items={normalizedReviews}
          keyExtractor={(item: any) => item.id}
          renderItem={(item: any) => renderReviewCard(item)}
        />

        <div className="hidden grid-cols-1 gap-6 mb-8 md:grid md:grid-cols-3">
          {normalizedReviews.map((review, index) => (
            <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * index }}>
              {renderReviewCard(review)}
            </motion.div>
          ))}
        </div>

        {showViewAllButton && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <a href={googleUrl} target="_blank" rel="noopener noreferrer" aria-label="Ver todas as avaliações no Google (abre em nova aba)">
              <button className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg font-medium text-lg">
                {t('reviews.view_all_button')}
                <ExternalLink className="w-4 h-4" />
              </button>
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default GoogleReviewsWidget;
