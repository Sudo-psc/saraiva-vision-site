/**
 * StatCard Component
 * Individual metric card for dashboard displays
 * Features: animated counters, trends, multiple variants
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { cn } from '@/lib/utils';
import type {
  MetricConfig,
  GenericMetric,
  StatCardVariant,
  StatCardSize,
} from '@/types/stats';

export interface StatCardProps {
  /** Metric data to display */
  metric: MetricConfig | GenericMetric;
  /** Visual variant */
  variant?: StatCardVariant;
  /** Card size */
  size?: StatCardSize;
  /** Show trend indicator */
  showTrend?: boolean;
  /** Enable number animation */
  animated?: boolean;
  /** Animation delay in ms */
  animationDelay?: number;
  /** Click handler */
  onClick?: () => void;
  /** Custom CSS class */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
}

const colorSchemes = {
  blue: {
    gradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30',
    border: 'border-blue-100 dark:border-blue-800/30',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-600 dark:text-blue-400',
    trendUp: 'text-green-500',
    trendDown: 'text-red-500',
  },
  green: {
    gradient: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30',
    border: 'border-green-100 dark:border-green-800/30',
    iconBg: 'bg-green-500/20',
    iconColor: 'text-green-600 dark:text-green-400',
    textColor: 'text-green-600 dark:text-green-400',
    trendUp: 'text-green-500',
    trendDown: 'text-red-500',
  },
  purple: {
    gradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30',
    border: 'border-purple-100 dark:border-purple-800/30',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    textColor: 'text-purple-600 dark:text-purple-400',
    trendUp: 'text-green-500',
    trendDown: 'text-red-500',
  },
  orange: {
    gradient: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/30',
    border: 'border-orange-100 dark:border-orange-800/30',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-600 dark:text-orange-400',
    textColor: 'text-orange-600 dark:text-orange-400',
    trendUp: 'text-green-500',
    trendDown: 'text-red-500',
  },
  red: {
    gradient: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30',
    border: 'border-red-100 dark:border-red-800/30',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-600 dark:text-red-400',
    textColor: 'text-red-600 dark:text-red-400',
    trendUp: 'text-green-500',
    trendDown: 'text-red-500',
  },
  yellow: {
    gradient: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/30',
    border: 'border-yellow-100 dark:border-yellow-800/30',
    iconBg: 'bg-yellow-500/20',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    trendUp: 'text-green-500',
    trendDown: 'text-red-500',
  },
};

const sizeClasses = {
  sm: {
    container: 'p-3',
    icon: 'w-8 h-8',
    iconSize: 16,
    valueSize: 'text-xl' as const,
    labelSize: 'text-xs',
  },
  md: {
    container: 'p-4',
    icon: 'w-10 h-10',
    iconSize: 20,
    valueSize: '2xl' as const,
    labelSize: 'text-xs',
  },
  lg: {
    container: 'p-5',
    icon: 'w-12 h-12',
    iconSize: 24,
    valueSize: '3xl' as const,
    labelSize: 'text-sm',
  },
};

/**
 * StatCard Component
 */
export function StatCard({
  metric,
  variant = 'gradient',
  size = 'md',
  showTrend = true,
  animated = true,
  animationDelay = 0,
  onClick,
  className,
  isLoading = false,
}: StatCardProps) {
  const colorKey = (metric as MetricConfig).color || 'blue';
  const colors = colorSchemes[colorKey];
  const sizes = sizeClasses[size];

  const Icon = (metric as MetricConfig).icon;
  const trend = metric.trend;

  // Determine if value is numeric for animation
  const numericValue =
    typeof metric.value === 'number' ? metric.value : parseFloat(String(metric.value));
  const isNumeric = !isNaN(numericValue);

  // Format configuration
  const format = (metric as MetricConfig).format || 'number';
  const suffix = (metric as MetricConfig).suffix || '';
  const prefix = (metric as MetricConfig).prefix || '';
  const decimals = (metric as MetricConfig).decimals || 0;

  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return cn(
          'bg-gradient-to-br',
          colors.gradient,
          'border',
          colors.border,
          'rounded-xl'
        );
      case 'outlined':
        return cn(
          'bg-white dark:bg-slate-800/40',
          'border-2',
          colors.border,
          'rounded-xl'
        );
      case 'glass':
        return cn(
          'bg-white/50 dark:bg-slate-800/20',
          'backdrop-blur-sm',
          'border',
          colors.border,
          'rounded-xl'
        );
      default:
        return cn('bg-white dark:bg-slate-800', 'border border-slate-200 dark:border-slate-700', 'rounded-xl');
    }
  };

  if (isLoading) {
    return (
      <div
        className={cn(getVariantClasses(), sizes.container, 'animate-pulse', className)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className={cn(sizes.icon, 'bg-slate-200 dark:bg-slate-700 rounded-lg')} />
        </div>
        <div className="space-y-1">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.5 }}
      className={cn(
        getVariantClasses(),
        sizes.container,
        onClick && 'cursor-pointer hover:shadow-lg transition-shadow',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header: Icon and Trend */}
      <div className="flex items-center justify-between mb-3">
        {Icon && (
          <div className={cn(sizes.icon, colors.iconBg, 'rounded-lg flex items-center justify-center')}>
            <Icon size={sizes.iconSize} className={colors.iconColor} />
          </div>
        )}

        {showTrend && trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend.direction === 'up' ? colors.trendUp : trend.direction === 'down' ? colors.trendDown : 'text-slate-400'
            )}
          >
            {trend.direction === 'up' && <TrendingUp size={14} />}
            {trend.direction === 'down' && <TrendingDown size={14} />}
            {trend.percentage !== undefined && (
              <span>
                {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
                {Math.abs(trend.percentage).toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="space-y-1">
        {animated && isNumeric ? (
          <AnimatedCounter
            end={numericValue}
            duration={2000}
            decimals={decimals}
            separator="."
            prefix={prefix}
            suffix={suffix}
            size={sizes.valueSize}
            weight="bold"
            color={colors.textColor}
            delay={animationDelay}
          />
        ) : (
          <div className={cn('text-2xl font-bold', colors.textColor)}>
            {prefix}
            {metric.value}
            {suffix}
          </div>
        )}

        {/* Label */}
        <div className={cn(sizes.labelSize, colors.textColor, 'font-medium')}>
          {metric.label}
        </div>

        {/* Description */}
        {metric.description && (
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {metric.description}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Stats Grid Container
 */
export interface StatsGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatsGrid({
  children,
  columns = 4,
  gap = 'md',
  className,
}: StatsGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid', columnClasses[columns], gapClasses[gap], className)}>
      {children}
    </div>
  );
}

export default StatCard;
