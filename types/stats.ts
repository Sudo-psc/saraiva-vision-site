/**
 * Statistics and Analytics Type Definitions
 * Used for dashboard, metrics, and business analytics components
 */

import { LucideIcon } from 'lucide-react';

/**
 * Base metric configuration
 */
export interface MetricConfig {
  id: string;
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
  format?: 'number' | 'percentage' | 'currency' | 'rating' | 'custom';
  suffix?: string;
  prefix?: string;
  decimals?: number;
  trend?: MetricTrend;
  description?: string;
}

/**
 * Metric trend information
 */
export interface MetricTrend {
  direction: 'up' | 'down' | 'stable';
  value: number;
  percentage?: number;
  label?: string;
  isPositive?: boolean; // Whether trend direction is positive (some metrics are inverse)
}

/**
 * Business statistics data structure
 */
export interface BusinessStats {
  averageRating: number;
  totalReviews: number;
  recentReviews: number;
  responseRate: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  trends?: {
    averageRating: MetricTrend;
    totalReviews: MetricTrend;
    responseRate: MetricTrend;
  };
  lastUpdated?: Date | string;
}

/**
 * Google Business information
 */
export interface GoogleBusinessInfo {
  displayName: string;
  phoneNumbers?: {
    primaryPhone: string;
  };
  websiteUri?: string;
  categories?: Array<{
    displayName: string;
  }>;
  openInfo?: {
    openNow: boolean;
  };
}

/**
 * Complete dashboard data
 */
export interface DashboardData {
  stats: BusinessStats;
  businessInfo?: GoogleBusinessInfo;
  isLoading?: boolean;
  error?: string | null;
  lastRefresh?: Date | string;
}

/**
 * Stat card variant types
 */
export type StatCardVariant = 'default' | 'gradient' | 'outlined' | 'glass';

/**
 * Stat card size options
 */
export type StatCardSize = 'sm' | 'md' | 'lg';

/**
 * Generic metric data for flexible stat displays
 */
export interface GenericMetric {
  id: string;
  label: string;
  value: number | string;
  icon?: LucideIcon;
  trend?: MetricTrend;
  color?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Counter animation configuration
 */
export interface CounterConfig {
  start?: number;
  end: number;
  duration?: number;
  decimals?: number;
  separator?: string;
  prefix?: string;
  suffix?: string;
  delay?: number;
  easingFn?: (t: number) => number;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  timestamp?: Date | string;
  metadata?: Record<string, unknown>;
}

/**
 * Time series data
 */
export interface TimeSeriesData {
  dataPoints: ChartDataPoint[];
  startDate: Date | string;
  endDate: Date | string;
  interval: 'hour' | 'day' | 'week' | 'month' | 'year';
}

/**
 * Health metrics for clinic dashboard
 */
export interface ClinicHealthMetrics {
  totalAppointments: number;
  completedProcedures: number;
  patientSatisfaction: number;
  yearsOfExperience: number;
  specializations: number;
  successRate: number;
  totalPatients?: number;
  averageWaitTime?: number;
}

/**
 * Instagram statistics (from existing component)
 */
export interface InstagramStats {
  likes: number;
  comments: number;
  engagement_rate: number;
  reach?: number;
  impressions?: number;
}

/**
 * Stat card props interface
 */
export interface StatCardProps {
  metric: MetricConfig | GenericMetric;
  variant?: StatCardVariant;
  size?: StatCardSize;
  showTrend?: boolean;
  animated?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Stats grid layout configuration
 */
export interface StatsGridConfig {
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
}

/**
 * Number formatting options
 */
export interface NumberFormatOptions {
  locale?: string;
  notation?: 'standard' | 'compact' | 'scientific' | 'engineering';
  compactDisplay?: 'short' | 'long';
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  minimumIntegerDigits?: number;
  useGrouping?: boolean;
  signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero';
}

/**
 * Dashboard filter options
 */
export interface DashboardFilters {
  timeRange?: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';
  startDate?: Date | string;
  endDate?: Date | string;
  metricType?: string[];
  minValue?: number;
  maxValue?: number;
}

/**
 * Export types
 */
export type { LucideIcon } from 'lucide-react';
