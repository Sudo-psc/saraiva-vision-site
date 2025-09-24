import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, RefreshCw, AlertCircle, Info, Loader2 } from 'lucide-react';
import ReviewCard from './ReviewCard';
import ReviewsContainer from './ReviewsContainer';
import BusinessStats from './BusinessStats';
import CachedGoogleBusinessService from '../services/cachedGoogleBusinessService';
import GoogleBusinessConfig from '../services/googleBusinessConfig';

/**
 * GoogleReviewsWidget Component
 * Main widget for displaying Google Business reviews with real-time data
 * Refactored to use actual services and advanced components
 */
const GoogleReviewsWidget = ({
  locationId,
  variant = 'full', // 'full', 'compact', 'stats', 'reviews'
  displayCount = 5,
  showStats = true,
  showFilters = true,
  autoRefresh = false,
  refreshInterval = 300000, // 5 minutes
  showHeader = true,
  showActions = true,
  className = '',
  onReviewShare,
  onReviewLike,
  onError
}) => {
  // State management
  const [config, setConfig] = useState(null);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews', 'stats', 'all'

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
        const mockConfig = {
          locationId: locationId || 'accounts/123456789/locations/987654321',
          isActive: true
        };

        if (mockConfig.locationId) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to initialize services:', error);
        setError('Falha ao inicializar serviços');
        setLoading(false);
      }
    };

    initializeServices();
  }, [locationId]);

  // Handle review share
  const handleReviewShare = (review) => {
    if (onReviewShare) {
      onReviewShare(review);
    } else {
      // Default share behavior
      if (navigator.share) {
        try {
          navigator.share({
            title: `Avaliação de ${review.reviewer.displayName}`,
            text: review.comment,
            url: window.location.href
          });
        } catch (error) {
          // Fallback to copying to clipboard
          navigator.clipboard.writeText(review.comment);
        }
      } else {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(review.comment);
      }
    }
  };

  // Handle review like
  const handleReviewLike = (review, isLiked) => {
    if (onReviewLike) {
      onReviewLike(review, isLiked);
    }
  };

  // Handle errors
  const handleError = (error) => {
    console.error('Google Reviews Widget Error:', error);
    setError(error.message || 'Erro ao carregar avaliações');

    if (onError) {
      onError(error);
    }
  };

  // Loading skeleton
  const WidgetSkeleton = () => (
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-48"></div>
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-64"></div>
          </div>
          <div className="h-10 bg-slate-300 dark:bg-slate-600 rounded w-24"></div>
        </div>
      )}

      {/* Tabs skeleton */}
      {variant === 'full' && (
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
          <div className="h-10 bg-slate-300 dark:bg-slate-600 rounded w-24"></div>
          <div className="h-10 bg-slate-300 dark:bg-slate-600 rounded w-20"></div>
          <div className="h-10 bg-slate-300 dark:bg-slate-600 rounded w-16"></div>
        </div>
      )}

      {/* Content skeleton */}
      <div className="space-y-4">
        {[...Array(displayCount)].map((_, i) => (
          <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-1/3 mb-2"></div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded"></div>
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
        ))}
      </div>
    </div>
  );

  // Render compact variant
  const renderCompact = () => (
    <div className="space-y-4">
      <ReviewsContainer
        locationId={locationId}
        displayCount={Math.min(displayCount, 3)}
        showStats={false}
        enableFiltering={false}
        enableSorting={false}
        autoRefresh={autoRefresh}
        refreshInterval={refreshInterval}
        onReviewShare={handleReviewShare}
        onReviewLike={handleReviewLike}
        onError={handleError}
      />
    </div>
  );

  // Render stats variant
  const renderStats = () => (
    <BusinessStats
      locationId={locationId}
      showTrends={true}
      showDistribution={true}
      showRecentActivity={true}
      autoRefresh={autoRefresh}
      refreshInterval={refreshInterval}
      onError={handleError}
    />
  );

  // Render reviews variant
  const renderReviews = () => (
    <ReviewsContainer
      locationId={locationId}
      displayCount={displayCount}
      showStats={showStats}
      enableFiltering={showFilters}
      enableSorting={true}
      autoRefresh={autoRefresh}
      refreshInterval={refreshInterval}
      onReviewShare={handleReviewShare}
      onReviewLike={handleReviewLike}
      onError={handleError}
    />
  );

  // Render full variant with tabs
  const renderFull = () => (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'all', label: 'Tudo', icon: Star },
          { id: 'reviews', label: 'Avaliações', icon: Star },
          { id: 'stats', label: 'Estatísticas', icon: TrendingUp }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
              ${activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }
            `}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {activeTab === 'all' && (
          <div className="space-y-6">
            <BusinessStats
              locationId={locationId}
              showTrends={true}
              showDistribution={true}
              showRecentActivity={false}
              autoRefresh={autoRefresh}
              refreshInterval={refreshInterval}
              onError={handleError}
            />
            <ReviewsContainer
              locationId={locationId}
              displayCount={displayCount}
              showStats={false}
              enableFiltering={showFilters}
              enableSorting={true}
              autoRefresh={autoRefresh}
              refreshInterval={refreshInterval}
              onReviewShare={handleReviewShare}
              onReviewLike={handleReviewLike}
              onError={handleError}
            />
          </div>
        )}

        {activeTab === 'reviews' && renderReviews()}
        {activeTab === 'stats' && renderStats()}
      </div>
    </div>
  );

  return (
    <div className={`bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Star size={24} className="text-yellow-400 fill-yellow-400" />
                Avaliações Google Business
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Avaliações autênticas e estatísticas em tempo real
              </p>
            </div>

            {showActions && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => config?.locationId && service && service.refreshReviews(config.locationId)}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <RefreshCw size={16} />
                  )}
                  Atualizar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Erro ao carregar avaliações
              </p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && <WidgetSkeleton />}

        {/* Content based on variant */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {variant === 'compact' && renderCompact()}
            {variant === 'stats' && renderStats()}
            {variant === 'reviews' && renderReviews()}
            {variant === 'full' && renderFull()}
          </motion.div>
        )}

        {/* Info message when no data */}
        {!loading && !error && !config?.locationId && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
              Configuração Necessária
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Por favor, configure o ID do local do Google Business para exibir as avaliações.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span>Dados fornecidos pelo Google Business</span>
          </div>
          <div>
            Atualizado em {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleReviewsWidget;
