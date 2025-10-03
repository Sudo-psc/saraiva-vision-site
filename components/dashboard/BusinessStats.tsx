/**
 * BusinessStats Component
 * Modern Next.js dashboard for business metrics and analytics
 * Features: Real-time stats, animated counters, Google Reviews integration
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  MessageSquare,
  Clock,
  Users,
  TrendingUp,
  Award,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { StatCard, StatsGrid } from './StatCard';
import type { BusinessStats as BusinessStatsType, MetricConfig } from '@/types/stats';
import { cn } from '@/lib/utils';

export interface BusinessStatsProps {
  /** Initial stats data */
  stats?: BusinessStatsType | null;
  /** Show trend indicators */
  showTrends?: boolean;
  /** Show rating distribution */
  showDistribution?: boolean;
  /** Enable auto-refresh */
  autoRefresh?: boolean;
  /** Refresh interval in ms (default: 5 minutes) */
  refreshInterval?: number;
  /** Custom CSS class */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string | null;
  /** Last update timestamp */
  lastUpdated?: Date | null;
  /** Refresh callback */
  onRefresh?: () => void | Promise<void>;
}

/**
 * BusinessStats Dashboard Component
 */
export function BusinessStats({
  stats,
  showTrends = true,
  showDistribution = true,
  autoRefresh = false,
  refreshInterval = 300000,
  className,
  isLoading = false,
  error = null,
  lastUpdated = null,
  onRefresh,
}: BusinessStatsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle manual refresh
  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing || isLoading) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh effect
  React.useEffect(() => {
    if (!autoRefresh || !onRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshInterval, onRefresh]);

  // Prepare metrics for StatCards
  const metrics: MetricConfig[] = stats
    ? [
        {
          id: 'average-rating',
          label: 'Avaliação Média',
          value: stats.averageRating,
          icon: Star,
          color: 'blue',
          format: 'rating',
          decimals: 1,
          trend: stats.trends?.averageRating,
          description: 'Nota média das avaliações',
        },
        {
          id: 'total-reviews',
          label: 'Total de Avaliações',
          value: stats.totalReviews,
          icon: MessageSquare,
          color: 'green',
          format: 'number',
          trend: stats.trends?.totalReviews,
          description: 'Número total de avaliações',
        },
        {
          id: 'recent-reviews',
          label: 'Avaliações Recentes',
          value: stats.recentReviews || 0,
          icon: Clock,
          color: 'purple',
          format: 'number',
          description: 'Últimos 30 dias',
        },
        {
          id: 'response-rate',
          label: 'Taxa de Resposta',
          value: Math.round(stats.responseRate || 0),
          icon: Users,
          color: 'orange',
          format: 'percentage',
          suffix: '%',
          trend: stats.trends?.responseRate,
          description: 'Avaliações respondidas',
        },
      ]
    : [];

  // Loading skeleton
  if (isLoading && !stats) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-between">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse" />
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-24 animate-pulse" />
        </div>
        <StatsGrid columns={4}>
          {[...Array(4)].map((_, i) => (
            <StatCard key={i} metric={{} as MetricConfig} isLoading />
          ))}
        </StatsGrid>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Estatísticas do Negócio
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Métricas em tempo real do Google Business
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Atualizado: {lastUpdated.toLocaleTimeString('pt-BR')}
            </div>
          )}
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Atualizar estatísticas"
            >
              <RefreshCw
                size={16}
                className={cn(isRefreshing && 'animate-spin')}
              />
              Atualizar
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Erro ao carregar estatísticas
            </p>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      {stats && (
        <StatsGrid columns={4}>
          {metrics.map((metric, index) => (
            <StatCard
              key={metric.id}
              metric={metric}
              variant="gradient"
              size="md"
              showTrend={showTrends}
              animated
              animationDelay={index * 0.1}
            />
          ))}
        </StatsGrid>
      )}

      {/* Rating Distribution */}
      {showDistribution && stats && stats.ratingDistribution && (
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
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating as 1 | 2 | 3 | 4 | 5] || 0;
              const percentage =
                stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              const isHighlighted = rating >= 4;

              return (
                <div key={rating}>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-2 w-20">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        ({count})
                      </span>
                    </div>

                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.1 * (6 - rating) }}
                        className={cn(
                          'h-full rounded-full',
                          isHighlighted
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                            : 'bg-gradient-to-r from-slate-400 to-slate-500'
                        )}
                      />
                    </div>

                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200 w-12 text-right">
                      {Math.round(percentage)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {stats.ratingDistribution[5] || 0}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  5 estrelas
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {stats.ratingDistribution[4] || 0}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  4 estrelas
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {(stats.ratingDistribution[5] || 0) +
                    (stats.ratingDistribution[4] || 0)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Positivas
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {Math.round(
                    (((stats.ratingDistribution[5] || 0) +
                      (stats.ratingDistribution[4] || 0)) /
                      stats.totalReviews) *
                      100
                  ) || 0}
                  %
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Satisfação
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default BusinessStats;
