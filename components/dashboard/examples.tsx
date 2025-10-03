/**
 * Dashboard Components - Usage Examples
 * Demonstrates how to use the dashboard stats components
 * This file is for reference only - copy patterns to your actual pages
 */

'use client';

import React from 'react';
import { BusinessStats } from './BusinessStats';
import { StatCard, StatsGrid } from './StatCard';
import { AnimatedCounter, PercentageCounter, CurrencyCounter } from './AnimatedCounter';
import {
  Star,
  Users,
  Activity,
  Heart,
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
} from 'lucide-react';
import type { BusinessStats as BusinessStatsType } from '@/types/stats';

/**
 * Example 1: BusinessStats with Google Reviews
 */
export function Example1_GoogleReviews() {
  const stats: BusinessStatsType = {
    averageRating: 4.9,
    totalReviews: 136,
    recentReviews: 12,
    responseRate: 85,
    ratingDistribution: {
      5: 120,
      4: 10,
      3: 4,
      2: 1,
      1: 1,
    },
    trends: {
      averageRating: {
        direction: 'up',
        value: 0.2,
        percentage: 4.3,
      },
      totalReviews: {
        direction: 'up',
        value: 12,
        percentage: 9.7,
      },
      responseRate: {
        direction: 'up',
        value: 5,
        percentage: 6.3,
      },
    },
  };

  return (
    <BusinessStats
      stats={stats}
      showTrends
      showDistribution
      lastUpdated={new Date()}
    />
  );
}

/**
 * Example 2: Custom Clinic Metrics
 */
export function Example2_ClinicMetrics() {
  const metrics = [
    {
      id: 'total-patients',
      label: 'Pacientes Atendidos',
      value: 1250,
      icon: Users,
      color: 'blue' as const,
      trend: {
        direction: 'up' as const,
        percentage: 15.2,
      },
      description: 'Total acumulado em 2025',
    },
    {
      id: 'appointments-month',
      label: 'Consultas Este Mês',
      value: 89,
      icon: Calendar,
      color: 'green' as const,
      description: 'Outubro 2025',
    },
    {
      id: 'procedures',
      label: 'Procedimentos Realizados',
      value: 342,
      icon: Activity,
      color: 'purple' as const,
      trend: {
        direction: 'up' as const,
        percentage: 8.5,
      },
    },
    {
      id: 'satisfaction',
      label: 'Satisfação dos Pacientes',
      value: 95,
      icon: Heart,
      color: 'orange' as const,
      suffix: '%',
      trend: {
        direction: 'up' as const,
        percentage: 2.1,
      },
      description: 'Baseado em feedback',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Métricas da Clínica
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Visão geral do desempenho
        </p>
      </div>

      <StatsGrid columns={4}>
        {metrics.map((metric, index) => (
          <StatCard
            key={metric.id}
            metric={metric}
            variant="gradient"
            showTrend
            animated
            animationDelay={index * 0.1}
          />
        ))}
      </StatsGrid>
    </div>
  );
}

/**
 * Example 3: Financial Dashboard
 */
export function Example3_FinancialDashboard() {
  const financialMetrics = [
    {
      id: 'revenue',
      label: 'Receita Mensal',
      value: 125000,
      icon: DollarSign,
      color: 'green' as const,
      prefix: 'R$ ',
      trend: {
        direction: 'up' as const,
        percentage: 12.5,
      },
    },
    {
      id: 'average-ticket',
      label: 'Ticket Médio',
      value: 850,
      icon: TrendingUp,
      color: 'blue' as const,
      prefix: 'R$ ',
      decimals: 2,
    },
    {
      id: 'conversion-rate',
      label: 'Taxa de Conversão',
      value: 68,
      icon: Activity,
      color: 'purple' as const,
      suffix: '%',
      decimals: 1,
    },
    {
      id: 'avg-wait-time',
      label: 'Tempo Médio de Espera',
      value: 12,
      icon: Clock,
      color: 'orange' as const,
      suffix: ' min',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
        Dashboard Financeiro
      </h2>

      <StatsGrid columns={4} gap="lg">
        {financialMetrics.map((metric) => (
          <StatCard
            key={metric.id}
            metric={metric}
            variant="glass"
            animated
          />
        ))}
      </StatsGrid>
    </div>
  );
}

/**
 * Example 4: Standalone Animated Counters
 */
export function Example4_AnimatedCounters() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
      {/* Basic Counter */}
      <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <AnimatedCounter
          end={1250}
          duration={2500}
          separator="."
          size="3xl"
          color="text-blue-600 dark:text-blue-400"
        />
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Pacientes Atendidos
        </p>
      </div>

      {/* Percentage Counter */}
      <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <PercentageCounter
          end={95.5}
          duration={2000}
          size="3xl"
          color="text-green-600 dark:text-green-400"
        />
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Taxa de Satisfação
        </p>
      </div>

      {/* Currency Counter */}
      <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <CurrencyCounter
          end={125000}
          duration={3000}
          size="3xl"
          color="text-purple-600 dark:text-purple-400"
        />
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Receita Mensal
        </p>
      </div>
    </div>
  );
}

/**
 * Example 5: Different Card Variants
 */
export function Example5_CardVariants() {
  const metric = {
    id: 'sample',
    label: 'Sample Metric',
    value: 1234,
    icon: Star,
    color: 'blue' as const,
    trend: {
      direction: 'up' as const,
      percentage: 12.5,
    },
  };

  return (
    <div className="space-y-6 p-8">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
        Card Variants
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard metric={metric} variant="default" showTrend animated />
        <StatCard metric={metric} variant="gradient" showTrend animated />
        <StatCard metric={metric} variant="outlined" showTrend animated />
        <StatCard metric={metric} variant="glass" showTrend animated />
      </div>
    </div>
  );
}

/**
 * Example 6: Different Sizes
 */
export function Example6_CardSizes() {
  const metric = {
    id: 'sample',
    label: 'Sample Metric',
    value: 999,
    icon: Users,
    color: 'purple' as const,
  };

  return (
    <div className="space-y-6 p-8">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
        Card Sizes
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard metric={metric} size="sm" animated />
        <StatCard metric={metric} size="md" animated />
        <StatCard metric={metric} size="lg" animated />
      </div>
    </div>
  );
}

/**
 * Example 7: Loading States
 */
export function Example7_LoadingStates() {
  return (
    <div className="space-y-6 p-8">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
        Loading States
      </h3>

      <StatsGrid columns={4}>
        {[...Array(4)].map((_, i) => (
          <StatCard
            key={i}
            metric={{} as any}
            isLoading
          />
        ))}
      </StatsGrid>
    </div>
  );
}

/**
 * Example 8: Complete Dashboard Page
 */
export function Example8_CompleteDashboard() {
  const [stats, setStats] = React.useState<BusinessStatsType | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        averageRating: 4.9,
        totalReviews: 136,
        recentReviews: 12,
        responseRate: 85,
        ratingDistribution: {
          5: 120,
          4: 10,
          3: 4,
          2: 1,
          1: 1,
        },
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <BusinessStats
        stats={stats}
        isLoading={isLoading}
        lastUpdated={new Date()}
        onRefresh={handleRefresh}
        showTrends
        showDistribution
      />
    </div>
  );
}

/**
 * Export all examples
 */
export const DashboardExamples = {
  Example1_GoogleReviews,
  Example2_ClinicMetrics,
  Example3_FinancialDashboard,
  Example4_AnimatedCounters,
  Example5_CardVariants,
  Example6_CardSizes,
  Example7_LoadingStates,
  Example8_CompleteDashboard,
};

export default DashboardExamples;
