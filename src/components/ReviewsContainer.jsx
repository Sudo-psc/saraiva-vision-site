import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, RefreshCw, Filter, TrendingUp, AlertTriangle, Info, Loader2 } from 'lucide-react';
import ReviewCard from './ReviewCard';
import CachedGoogleBusinessService from '../services/cachedGoogleBusinessService';
import GoogleBusinessConfig from '../services/googleBusinessConfig';

/**
 * ReviewsContainer Component
 * Main container for displaying Google Business reviews with advanced features
 */
const ReviewsContainer = ({
    locationId,
    displayCount = 5,
    showStats = true,
    enableFiltering = true,
    enableSorting = true,
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes
    className = '',
    onReviewShare,
    onReviewLike,
    onError
}) => {
    // State management
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [info, setInfo] = useState(null);
    const [visibleCount, setVisibleCount] = useState(displayCount);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filtering and sorting state
    const [filters, setFilters] = useState({
        minRating: 1,
        maxRating: 5,
        hasResponse: null,
        isRecent: null,
        keywords: '',
        sortBy: 'newest' // newest, oldest, highest, lowest
    });

    const [showFilters, setShowFilters] = useState(false);

    // Service instances
    const [service, setService] = useState(null);
    const [config, setConfig] = useState(null);

    // Initialize services
    useEffect(() => {
        const initializeServices = async () => {
            try {
                // Initialize configuration
                const googleConfig = new GoogleBusinessConfig();
                setConfig(googleConfig);

                // Initialize cached service
                const cachedService = new CachedGoogleBusinessService();
                setService(cachedService);

                // Load configuration (in real app, this would come from secure storage)
                // For now, we'll use mock configuration
                const mockConfig = {
                    locationId: locationId || 'accounts/123456789/locations/987654321',
                    isActive: true
                };

                if (mockConfig.locationId) {
                    await fetchReviewsAndStats(mockConfig.locationId);
                }
            } catch (error) {
                console.error('Failed to initialize services:', error);
                setError('Falha ao inicializar serviços');
                setLoading(false);
            }
        };

        initializeServices();
    }, [locationId]);

    // Auto-refresh functionality
    useEffect(() => {
        if (!autoRefresh || !config?.locationId) return;

        const interval = setInterval(async () => {
            if (config.locationId) {
                await refreshReviews(config.locationId);
            }
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, config?.locationId]);

    // Fetch reviews and statistics
    const fetchReviewsAndStats = useCallback(async (locId) => {
        if (!service) return;

        try {
            setLoading(true);
            setError(null);

            // Fetch reviews with caching
            const reviewsResponse = await service.fetchReviews(locId, {
                useCache: true,
                forceRefresh: false
            });

            if (reviewsResponse.success) {
                setReviews(reviewsResponse.reviews || []);

                if (reviewsResponse.fromCache && reviewsResponse.isStale) {
                    setInfo('Exibindo dados em cache. Atualizando em segundo plano...');
                }
            } else {
                setError(reviewsResponse.error || 'Falha ao buscar avaliações');
            }

            // Fetch statistics if enabled
            if (showStats) {
                const statsResponse = await service.getReviewStats(locId);
                if (statsResponse.success) {
                    setStats(statsResponse.stats);
                }
            }

        } catch (error) {
            console.error('Error fetching reviews:', error);
            setError(error.message || 'Erro ao carregar avaliações');

            if (onError) {
                onError(error);
            }
        } finally {
            setLoading(false);
        }
    }, [service, showStats, onError]);

    // Refresh reviews manually
    const refreshReviews = useCallback(async (locId) => {
        if (!service) return;

        try {
            setIsRefreshing(true);

            const reviewsResponse = await service.fetchReviews(locId, {
                useCache: true,
                forceRefresh: true
            });

            if (reviewsResponse.success) {
                setReviews(reviewsResponse.reviews || []);
                setInfo('Avaliações atualizadas com sucesso!');

                // Clear info message after 3 seconds
                setTimeout(() => setInfo(null), 3000);
            } else {
                setError(reviewsResponse.error || 'Falha ao atualizar avaliações');
            }

            // Refresh stats if enabled
            if (showStats) {
                const statsResponse = await service.getReviewStats(locId);
                if (statsResponse.success) {
                    setStats(statsResponse.stats);
                }
            }

        } catch (error) {
            console.error('Error refreshing reviews:', error);
            setError(error.message || 'Erro ao atualizar avaliações');
        } finally {
            setIsRefreshing(false);
        }
    }, [service, showStats]);

    // Apply filters and sorting to reviews
    const getFilteredAndSortedReviews = useCallback(() => {
        let filtered = [...reviews];

        // Apply rating filter
        if (filters.minRating > 1 || filters.maxRating < 5) {
            filtered = filtered.filter(review =>
                review.starRating >= filters.minRating &&
                review.starRating <= filters.maxRating
            );
        }

        // Apply response filter
        if (filters.hasResponse !== null) {
            filtered = filtered.filter(review =>
                review.hasResponse === filters.hasResponse
            );
        }

        // Apply recent filter
        if (filters.isRecent !== null) {
            filtered = filtered.filter(review =>
                review.isRecent === filters.isRecent
            );
        }

        // Apply keyword filter
        if (filters.keywords.trim()) {
            const keywords = filters.keywords.toLowerCase().split(' ').filter(k => k.trim());
            filtered = filtered.filter(review => {
                const searchText = (review.comment || '').toLowerCase();
                return keywords.every(keyword => searchText.includes(keyword));
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'newest':
                    return new Date(b.createTime) - new Date(a.createTime);
                case 'oldest':
                    return new Date(a.createTime) - new Date(b.createTime);
                case 'highest':
                    return b.starRating - a.starRating;
                case 'lowest':
                    return a.starRating - b.starRating;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [reviews, filters]);

    // Handle filter changes
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    // Reset all filters
    const resetFilters = () => {
        setFilters({
            minRating: 1,
            maxRating: 5,
            hasResponse: null,
            isRecent: null,
            keywords: '',
            sortBy: 'newest'
        });
    };

    // Get filtered and sorted reviews
    const filteredReviews = getFilteredAndSortedReviews();
    const displayedReviews = filteredReviews.slice(0, visibleCount);
    const hasMore = filteredReviews.length > visibleCount;

    // Loading skeleton component
    const ReviewSkeleton = () => (
        <div className="animate-pulse border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-slate-50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                <div className="flex-1">
                    <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-1/3 mb-2"></div>
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-full"></div>
                <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-4/5"></div>
                <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-3/5"></div>
            </div>
        </div>
    );

    // Render star rating display
    const renderStarRating = (rating, count = 5) => {
        return (
            <div className="flex items-center gap-1">
                {[...Array(count)].map((_, i) => (
                    <Star
                        key={i}
                        size={16}
                        className={i < rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }
                    />
                ))}
                <span className="ml-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                    {rating.toFixed(1)}
                </span>
            </div>
        );
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header with controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        Avaliações dos Clientes
                        {stats && (
                            <span className="text-sm font-normal text-slate-500">
                                ({stats.totalReviews} avaliações)
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Avaliações autênticas do Google Business
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Filter button */}
                    {enableFiltering && (
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Filter size={16} />
                            Filtros
                            {showFilters && (
                                <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                            )}
                        </button>
                    )}

                    {/* Refresh button */}
                    <button
                        onClick={() => config?.locationId && refreshReviews(config.locationId)}
                        disabled={isRefreshing || loading}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRefreshing ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <RefreshCw size={16} />
                        )}
                        Atualizar
                    </button>
                </div>
            </div>

            {/* Statistics section */}
            {showStats && stats && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/30">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-cyan-600 dark:text-blue-400 mb-1">
                                {stats.averageRating}
                            </div>
                            <div className="flex items-center justify-center gap-1 mb-1">
                                {renderStarRating(stats.averageRating, 5)}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Média</p>
                        </div>

                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                                {stats.totalReviews}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
                        </div>

                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                                {stats.recentReviews || 0}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Recentes</p>
                        </div>

                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                                {Math.round(stats.responseRate || 0)}%
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Respostas</p>
                        </div>
                    </div>

                    {/* Rating distribution */}
                    <div className="mt-6 pt-6 border-t border-blue-100 dark:border-blue-800/30">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                            Distribuição das Avaliações
                        </h4>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map(rating => {
                                const count = stats.ratingDistribution?.[rating] || 0;
                                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

                                return (
                                    <div key={rating} className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 w-16">
                                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-sm text-slate-600 dark:text-slate-400">{rating}</span>
                                        </div>
                                        <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400 w-12 text-right">
                                            {count}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Filters panel */}
            {showFilters && enableFiltering && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Rating filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                Classificação Mínima
                            </label>
                            <select
                                value={filters.minRating}
                                onChange={(e) => handleFilterChange('minRating', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                            >
                                {[1, 2, 3, 4, 5].map(rating => (
                                    <option key={rating} value={rating}>{rating}+ estrelas</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort by */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                Ordenar por
                            </label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                            >
                                <option value="newest">Mais recentes</option>
                                <option value="oldest">Mais antigos</option>
                                <option value="highest">Melhor avaliados</option>
                                <option value="lowest">Pior avaliados</option>
                            </select>
                        </div>

                        {/* Keywords */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                Palavras-chave
                            </label>
                            <input
                                type="text"
                                value={filters.keywords}
                                onChange={(e) => handleFilterChange('keywords', e.target.value)}
                                placeholder="Buscar por palavras..."
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            {filteredReviews.length} avaliações encontradas
                        </div>
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 text-sm font-medium text-cyan-600 dark:text-blue-400 hover:text-cyan-700 dark:hover:text-blue-300"
                        >
                            Limpar filtros
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Error and info messages */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-4 flex items-start gap-3"
                    >
                        <AlertTriangle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                Erro ao carregar avaliações
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                                {error}
                            </p>
                        </div>
                    </motion.div>
                )}

                {info && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-blue-50 dark:bg-blue-900/20 border border-cyan-200 dark:border-blue-800/30 rounded-lg p-4 flex items-start gap-3"
                    >
                        <Info size={20} className="text-cyan-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-cyan-800 dark:text-blue-200">
                            {info}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reviews list */}
            <div className="space-y-4">
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(displayCount)].map((_, i) => (
                            <ReviewSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                            Nenhuma avaliação encontrada
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            {filters.keywords || filters.minRating > 1 || filters.hasResponse !== null || filters.isRecent !== null
                                ? 'Tente ajustar seus filtros para ver mais avaliações.'
                                : 'Seja o primeiro a avaliar nosso serviço!'
                            }
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {displayedReviews.map((review, index) => {
                                // Mark 5-star reviews as featured
                                const isFeatured = review.starRating === 5 && index < 3;

                                return (
                                    <ReviewCard
                                        key={review.id || index}
                                        review={review}
                                        isFeatured={isFeatured}
                                        onShare={onReviewShare}
                                        onLike={onReviewLike}
                                    />
                                );
                            })}
                        </div>

                        {/* Load more button */}
                        {hasMore && (
                            <div className="text-center pt-4">
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 5)}
                                    className="px-6 py-3 bg-cyan-600 dark:bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-700 dark:hover:bg-blue-400 transition-colors"
                                >
                                    Carregar mais avaliações
                                </button>
                            </div>
                        )}

                        {/* Show total count */}
                        {visibleCount >= filteredReviews.length && (
                            <div className="text-center pt-4">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Exibindo {filteredReviews.length} de {filteredReviews.length} avaliações
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ReviewsContainer;
