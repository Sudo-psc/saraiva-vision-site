import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, TrendingDown, Users, MessageSquare, Clock, Award, AlertCircle } from 'lucide-react';
import CachedGoogleBusinessService from '../services/cachedGoogleBusinessService';
import GoogleBusinessConfig from '../services/googleBusinessConfig';

/**
 * BusinessStats Component
 * Displays comprehensive business statistics and analytics from Google Business
 */
const BusinessStats = ({
    locationId,
    showTrends = false,
    showDistribution = true,
    showRecentActivity = true,
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes
    className = '',
    onError
}) => {
    // State management
    const [stats, setStats] = useState(null);
    const [businessInfo, setBusinessInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

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

                // Load configuration
                const mockConfig = {
                    locationId: locationId || 'accounts/123456789/locations/987654321',
                    isActive: true
                };

                if (mockConfig.locationId) {
                    await fetchBusinessData(mockConfig.locationId);
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
                await refreshBusinessData(config.locationId);
            }
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, config?.locationId]);

    // Fetch business data
    const fetchBusinessData = async (locId) => {
        if (!service) return;

        try {
            setLoading(true);
            setError(null);

            // Fetch statistics
            const statsResponse = await service.getReviewStats(locId);
            if (statsResponse.success) {
                setStats(statsResponse.stats);
            }

            // Fetch business info
            const businessResponse = await service.fetchBusinessInfo(locId);
            if (businessResponse.success) {
                setBusinessInfo(businessResponse.businessInfo);
            }

            setLastUpdated(new Date());

        } catch (error) {
            console.error('Error fetching business data:', error);
            setError(error.message || 'Erro ao carregar dados do negócio');

            if (onError) {
                onError(error);
            }
        } finally {
            setLoading(false);
        }
    };

    // Refresh business data
    const refreshBusinessData = async (locId) => {
        if (!service) return;

        try {
            setIsRefreshing(true);

            // Fetch statistics
            const statsResponse = await service.getReviewStats(locId);
            if (statsResponse.success) {
                setStats(statsResponse.stats);
            }

            // Fetch business info
            const businessResponse = await service.fetchBusinessInfo(locId);
            if (businessResponse.success) {
                setBusinessInfo(businessResponse.businessInfo);
            }

            setLastUpdated(new Date());

        } catch (error) {
            console.error('Error refreshing business data:', error);
            setError(error.message || 'Erro ao atualizar dados do negócio');
        } finally {
            setIsRefreshing(false);
        }
    };

    // Calculate rating trend (mock implementation)
    const getRatingTrend = () => {
        if (!stats || !stats.trends || stats.trends.length < 2) {
            return { direction: 'stable', value: 0 };
        }

        const current = stats.trends[0];
        const previous = stats.trends[1];
        const difference = current.averageRating - previous.averageRating;

        return {
            direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'stable',
            value: Math.abs(difference)
        };
    };

    // Calculate review growth (mock implementation)
    const getReviewGrowth = () => {
        if (!stats || !stats.trends || stats.trends.length < 2) {
            return { direction: 'stable', percentage: 0 };
        }

        const current = stats.trends[0];
        const previous = stats.trends[1];
        const growth = current.reviewCount - previous.reviewCount;
        const percentage = previous.reviewCount > 0 ? (growth / previous.reviewCount) * 100 : 0;

        return {
            direction: growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable',
            percentage: Math.abs(percentage)
        };
    };

    // Loading skeleton component
    const StatsSkeleton = () => (
        <div className="animate-pulse space-y-6">
            {/* Main stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                        <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-1/2"></div>
                    </div>
                ))}
            </div>

            {/* Rating distribution skeleton */}
            {showDistribution && (
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                    <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-4 bg-slate-300 dark:bg-slate-600 rounded"></div>
                                <div className="flex-1 h-3 bg-slate-300 dark:bg-slate-600 rounded"></div>
                                <div className="w-8 h-4 bg-slate-300 dark:bg-slate-600 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // Render star rating
    const renderStarRating = (rating, size = 'medium') => {
        const starSize = size === 'small' ? 14 : size === 'large' ? 20 : 16;

        return (
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={starSize}
                        className={i < Math.floor(rating)
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

    // Get trend icon
    const getTrendIcon = (direction) => {
        switch (direction) {
            case 'up':
                return <TrendingUp size={16} className="text-green-500" />;
            case 'down':
                return <TrendingDown size={16} className="text-red-500" />;
            default:
                return <div className="w-4 h-0.5 bg-gray-400"></div>;
        }
    };

    const ratingTrend = getRatingTrend();
    const reviewGrowth = getReviewGrowth();

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        Estatísticas do Negócio
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Dados em tempo real do Google Business
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {lastUpdated && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            Atualizado: {lastUpdated.toLocaleTimeString('pt-BR')}
                        </div>
                    )}
                    <button
                        onClick={() => config?.locationId && refreshBusinessData(config.locationId)}
                        disabled={isRefreshing || loading}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className={`w-4 h-4 border-2 border-slate-400 rounded-full ${isRefreshing ? 'border-t-transparent animate-spin' : ''}`}></div>
                        Atualizar
                    </button>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                            Erro ao carregar estatísticas
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {/* Loading state */}
            {loading && <StatsSkeleton />}

            {/* Stats content */}
            {!loading && stats && (
                <div className="space-y-6">
                    {/* Main statistics grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Average Rating */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-cyan-800/30 rounded-xl p-5 border border-blue-100 dark:border-blue-800/30"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                    <Star size={20} className="text-cyan-600 dark:text-blue-400" />
                                </div>
                                {showTrends && getTrendIcon(ratingTrend.direction)}
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl font-bold text-cyan-600 dark:text-blue-400">
                                    {stats.averageRating}
                                </div>
                                <div className="text-xs text-cyan-600 dark:text-blue-400 font-medium">
                                    Avaliação Média
                                </div>
                                {showTrends && ratingTrend.value > 0 && (
                                    <div className="text-xs text-blue-500 dark:text-blue-400">
                                        {ratingTrend.direction === 'up' ? '+' : '-'}{ratingTrend.value.toFixed(1)}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Total Reviews */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 rounded-xl p-5 border border-green-100 dark:border-green-800/30"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <MessageSquare size={20} className="text-green-600 dark:text-green-400" />
                                </div>
                                {showTrends && getTrendIcon(reviewGrowth.direction)}
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {stats.totalReviews}
                                </div>
                                <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                    Total de Avaliações
                                </div>
                                {showTrends && reviewGrowth.percentage > 0 && (
                                    <div className="text-xs text-green-500 dark:text-green-400">
                                        {reviewGrowth.direction === 'up' ? '+' : '-'}{reviewGrowth.percentage.toFixed(1)}%
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Recent Reviews */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 rounded-xl p-5 border border-purple-100 dark:border-purple-800/30"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <Clock size={20} className="text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {stats.recentReviews || 0}
                                </div>
                                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                    Avaliações Recentes
                                </div>
                                <div className="text-xs text-purple-500 dark:text-purple-400">
                                    Últimos 30 dias
                                </div>
                            </div>
                        </motion.div>

                        {/* Response Rate */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/30 rounded-xl p-5 border border-orange-100 dark:border-orange-800/30"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                    <Users size={20} className="text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {Math.round(stats.responseRate || 0)}%
                                </div>
                                <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                    Taxa de Resposta
                                </div>
                                <div className="text-xs text-orange-500 dark:text-orange-400">
                                    Avaliações respondidas
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Rating Distribution */}
                    {showDistribution && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                    <Award size={20} className="text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                        Distribuição das Avaliações
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Análise detalhada por classificação
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[5, 4, 3, 2, 1].map(rating => {
                                    const count = stats.ratingDistribution?.[rating] || 0;
                                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                                    const isHighlighted = rating >= 4;

                                    return (
                                        <div key={rating} className="group">
                                            <div className="flex items-center gap-4 mb-2">
                                                <div className="flex items-center gap-2 w-20">
                                                    {renderStarRating(rating, 'small')}
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                        ({count})
                                                    </span>
                                                </div>
                                                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ duration: 1, delay: 0.1 * rating }}
                                                        className={`
                              h-full rounded-full transition-all duration-500
                              ${isHighlighted
                                                                ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                                                                : 'bg-gradient-to-r from-slate-400 to-slate-500'
                                                            }
                            `}
                                                    ></motion.div>
                                                </div>
                                                <div className="text-sm font-medium text-slate-700 dark:text-slate-200 w-12 text-right">
                                                    {Math.round(percentage)}%
                                                </div>
                                            </div>

                                            {/* Progress bar background effect */}
                                            <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 1.5, delay: 0.2 * rating }}
                                                    className={`
                            h-full rounded-full opacity-20
                            ${isHighlighted
                                                            ? 'bg-yellow-400'
                                                            : 'bg-slate-400'
                                                        }
                          `}
                                                ></motion.div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Summary stats */}
                            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div>
                                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                            {stats.ratingDistribution?.[5] || 0}
                                        </div>
                                        <div className="text-xs text-slate-600 dark:text-slate-400">5 estrelas</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-cyan-600 dark:text-blue-400">
                                            {stats.ratingDistribution?.[4] || 0}
                                        </div>
                                        <div className="text-xs text-slate-600 dark:text-slate-400">4 estrelas</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                                            {(stats.ratingDistribution?.[5] || 0) + (stats.ratingDistribution?.[4] || 0)}
                                        </div>
                                        <div className="text-xs text-slate-600 dark:text-slate-400">Positivas</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                            {Math.round(((stats.ratingDistribution?.[5] || 0) + (stats.ratingDistribution?.[4] || 0)) / stats.totalReviews * 100) || 0}%
                                        </div>
                                        <div className="text-xs text-slate-600 dark:text-slate-400">Satisfação</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Business Info */}
                    {businessInfo && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                    <Award size={20} className="text-cyan-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                        Informações do Negócio
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Dados cadastrais do Google Business
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Nome do Negócio
                                        </label>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">
                                            {businessInfo.displayName || 'Não disponível'}
                                        </p>
                                    </div>

                                    {businessInfo.phoneNumbers && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Telefone
                                            </label>
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">
                                                {businessInfo.phoneNumbers.primaryPhone || 'Não disponível'}
                                            </p>
                                        </div>
                                    )}

                                    {businessInfo.websiteUri && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Website
                                            </label>
                                            <a
                                                href={businessInfo.websiteUri}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-medium text-cyan-600 dark:text-blue-400 hover:underline mt-1 block"
                                            >
                                                {businessInfo.websiteUri}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {businessInfo.categories && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Categorias
                                            </label>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {businessInfo.categories.map((category, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-cyan-700 dark:text-blue-300 text-xs rounded-full"
                                                    >
                                                        {category.displayName}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {businessInfo.openInfo && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Status
                                            </label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className={`w-2 h-2 rounded-full ${businessInfo.openInfo.openNow ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                    {businessInfo.openInfo.openNow ? 'Aberto agora' : 'Fechado'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Recent Activity */}
                    {showRecentActivity && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                        Atividade Recente
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Métricas de engajamento e tendências
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                                        {stats.recentReviews || 0}
                                    </div>
                                    <div className="text-xs text-green-700 dark:text-green-300">
                                        Novas avaliações este mês
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-cyan-600 dark:text-blue-400 mb-1">
                                        {Math.round(stats.responseRate || 0)}%
                                    </div>
                                    <div className="text-xs text-cyan-700 dark:text-blue-300">
                                        Taxa de resposta
                                    </div>
                                </div>

                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                                        {stats.averageRating}
                                    </div>
                                    <div className="text-xs text-purple-700 dark:text-purple-300">
                                        Média de satisfação
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BusinessStats;
