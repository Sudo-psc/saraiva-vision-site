# Performance Monitoring Dashboard - Multi-Profile Next.js Application

**Versão**: 1.0.0 | **Data**: Outubro 2025 | **Status**: Planejamento

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Dashboard Architecture](#dashboard-architecture)
3. [Real User Monitoring (RUM)](#real-user-monitoring-rum)
4. [Core Web Vitals Tracking](#core-web-vitals-tracking)
5. [Profile-Specific Metrics](#profile-specific-metrics)
6. [Alert System](#alert-system)
7. [Visualization and Reporting](#visualization-and-reporting)
8. [Implementation Guide](#implementation-guide)

---

## 🎯 Visão Geral

Este documento detalha a implementação de um sistema abrangente de monitoramento de performance em produção, com foco em:

- **Real User Monitoring (RUM)**: Métricas de usuários reais, não simulados
- **Core Web Vitals**: LCP, FID, CLS, FCP, TTFB, INP
- **Profile Segmentation**: Análise separada por perfil (Familiar/Jovem/Sênior)
- **Performance Budgets**: Alertas automáticos quando métricas degradam
- **Trend Analysis**: Identificação de regressões de performance

### Ferramentas Utilizadas

| Ferramenta | Propósito | Custo |
|------------|-----------|-------|
| **PostHog** | Analytics + Session Replay | Gratuito até 1M events |
| **Vercel Analytics** | Core Web Vitals nativo | $10/mês (opcional) |
| **Lighthouse CI** | CI/CD performance testing | Gratuito |
| **Custom Dashboard** | Visualização personalizada | Gratuito (Next.js) |

---

## 🏗 Dashboard Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Website                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Familiar   │  │    Jovem     │  │    Sênior    │      │
│  │   Profile    │  │   Profile    │  │   Profile    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                            ▼                                 │
│                   ┌────────────────┐                         │
│                   │  Web Vitals    │                         │
│                   │   Collector    │                         │
│                   └────────┬───────┘                         │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │    Analytics Layer           │
              │  ┌──────────┐ ┌───────────┐  │
              │  │ PostHog  │ │  Custom   │  │
              │  │   API    │ │  Storage  │  │
              │  └──────────┘ └───────────┘  │
              └──────────────┬───────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │   Monitoring Dashboard       │
              │                              │
              │  ┌─────────────────────────┐ │
              │  │  Core Web Vitals Panel  │ │
              │  ├─────────────────────────┤ │
              │  │  Profile Comparison     │ │
              │  ├─────────────────────────┤ │
              │  │  Performance Trends     │ │
              │  ├─────────────────────────┤ │
              │  │  Bundle Size Tracking   │ │
              │  ├─────────────────────────┤ │
              │  │  Alert Management       │ │
              │  └─────────────────────────┘ │
              └──────────────────────────────┘
```

### Data Flow

```typescript
// 1. Client-side collection
User loads page → Web Vitals API → Custom collector → Analytics

// 2. Data aggregation
PostHog/Custom API → Process metrics → Store with profile tags

// 3. Dashboard query
Dashboard → Query API → Filter by profile/date → Display charts

// 4. Alerting
Scheduled job → Check thresholds → Send alerts if exceeded
```

---

## 📊 Real User Monitoring (RUM)

### Web Vitals Collector Implementation

```typescript
// src/lib/rum/web-vitals-collector.ts

import { getCLS, getFID, getFCP, getLCP, getTTFB, getINP } from 'web-vitals';
import type { Metric } from 'web-vitals';

interface WebVitalsMetric extends Metric {
  profile: 'familiar' | 'jovem' | 'senior';
  page: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  connection: string;
}

class WebVitalsCollector {
  private metrics: WebVitalsMetric[] = [];
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window === 'undefined') return;

    // Initialize metric collectors
    getCLS(this.handleMetric.bind(this));
    getFID(this.handleMetric.bind(this));
    getFCP(this.handleMetric.bind(this));
    getLCP(this.handleMetric.bind(this));
    getTTFB(this.handleMetric.bind(this));
    getINP(this.handleMetric.bind(this));

    // Auto-flush on page unload
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });

    // Periodic flush
    this.startFlushTimer();
  }

  private handleMetric(metric: Metric) {
    const enrichedMetric: WebVitalsMetric = {
      ...metric,
      profile: this.getUserProfile(),
      page: window.location.pathname,
      deviceType: this.getDeviceType(),
      connection: this.getConnectionType(),
    };

    this.metrics.push(enrichedMetric);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${enrichedMetric.profile}] ${metric.name}:`, metric.value);
    }

    // Batch flush
    if (this.metrics.length >= this.batchSize) {
      this.flush();
    }
  }

  private getUserProfile(): 'familiar' | 'jovem' | 'senior' {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user-profile='));

    return (cookie?.split('=')[1] as any) || 'familiar';
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getConnectionType(): string {
    const nav = navigator as any;
    return nav.connection?.effectiveType || 'unknown';
  }

  private startFlushTimer() {
    this.timer = setInterval(() => {
      if (this.metrics.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private async flush() {
    if (this.metrics.length === 0) return;

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    try {
      // Send to PostHog
      if (typeof window !== 'undefined' && window.posthog) {
        metricsToSend.forEach(metric => {
          window.posthog.capture('web_vitals', {
            metric_name: metric.name,
            metric_value: metric.value,
            metric_rating: this.getRating(metric.name, metric.value),
            profile: metric.profile,
            page: metric.page,
            device_type: metric.deviceType,
            connection: metric.connection,
            timestamp: Date.now(),
          });
        });
      }

      // Send to custom API
      await fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metricsToSend),
        keepalive: true, // Important for page unload
      });
    } catch (error) {
      console.error('Failed to send web vitals:', error);
      // Re-add to queue if send fails
      this.metrics.unshift(...metricsToSend);
    }
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, { good: number; poor: number }> = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
      INP: { good: 200, poor: 500 },
    };

    const threshold = thresholds[name];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  public destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush();
  }
}

// Singleton instance
export const webVitalsCollector = new WebVitalsCollector();
```

### Custom API Endpoint for Metrics Storage

```typescript
// src/app/api/analytics/web-vitals/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const WebVitalSchema = z.object({
  name: z.enum(['CLS', 'FID', 'FCP', 'LCP', 'TTFB', 'INP']),
  value: z.number(),
  id: z.string(),
  profile: z.enum(['familiar', 'jovem', 'senior']),
  page: z.string(),
  deviceType: z.enum(['mobile', 'tablet', 'desktop']),
  connection: z.string(),
});

const RequestSchema = z.array(WebVitalSchema);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const metrics = RequestSchema.parse(body);

    // Store in database (example: Supabase, Redis, or file)
    await storeMetrics(metrics);

    // Check for performance regressions
    await checkPerformanceAlerts(metrics);

    return NextResponse.json({ success: true, count: metrics.length });
  } catch (error) {
    console.error('Failed to process web vitals:', error);
    return NextResponse.json(
      { error: 'Invalid metrics data' },
      { status: 400 }
    );
  }
}

async function storeMetrics(metrics: any[]) {
  // Example: Store in Redis with time-series data
  // Or Supabase table with timestamp indexing
  // Or append to JSON file for simple setup

  const timestamp = Date.now();

  // For simple implementation, append to file
  const fs = require('fs');
  const path = require('path');

  const dataDir = path.join(process.cwd(), 'data', 'metrics');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const today = new Date().toISOString().split('T')[0];
  const filename = path.join(dataDir, `web-vitals-${today}.json`);

  const data = {
    timestamp,
    metrics,
  };

  fs.appendFileSync(filename, JSON.stringify(data) + '\n');
}

async function checkPerformanceAlerts(metrics: any[]) {
  // Check if any metric exceeds threshold
  const alerts = metrics.filter(metric => {
    const thresholds: Record<string, number> = {
      LCP: 2500,
      FID: 100,
      CLS: 0.1,
      FCP: 1500,
      TTFB: 800,
      INP: 200,
    };

    return metric.value > thresholds[metric.name];
  });

  if (alerts.length > 0) {
    // Send alert notification
    console.warn('Performance alert:', alerts);

    // TODO: Send to Slack, email, etc.
  }
}

// Edge runtime for fast response
export const runtime = 'edge';
```

---

## 📈 Core Web Vitals Tracking

### Metrics Definition and Targets

```typescript
// src/lib/rum/metrics-config.ts

export interface MetricThresholds {
  good: number;
  needsImprovement: number;
  poor: number;
}

export const CORE_WEB_VITALS_THRESHOLDS: Record<string, MetricThresholds> = {
  LCP: {
    good: 2500,       // < 2.5s
    needsImprovement: 4000, // 2.5s - 4s
    poor: 4000,       // > 4s
  },
  FID: {
    good: 100,        // < 100ms
    needsImprovement: 300,  // 100-300ms
    poor: 300,        // > 300ms
  },
  CLS: {
    good: 0.1,        // < 0.1
    needsImprovement: 0.25, // 0.1-0.25
    poor: 0.25,       // > 0.25
  },
  FCP: {
    good: 1800,       // < 1.8s
    needsImprovement: 3000, // 1.8s-3s
    poor: 3000,       // > 3s
  },
  TTFB: {
    good: 800,        // < 800ms
    needsImprovement: 1800, // 800ms-1.8s
    poor: 1800,       // > 1.8s
  },
  INP: {
    good: 200,        // < 200ms
    needsImprovement: 500,  // 200-500ms
    poor: 500,        // > 500ms
  },
};

export const PROFILE_TARGETS: Record<string, Record<string, number>> = {
  familiar: {
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    FCP: 1500,
    TTFB: 800,
    INP: 200,
  },
  jovem: {
    LCP: 2000, // Faster due to modern devices
    FID: 80,
    CLS: 0.1,
    FCP: 1200,
    TTFB: 600,
    INP: 150,
  },
  senior: {
    LCP: 2500, // Same as familiar
    FID: 100,
    CLS: 0.05, // Lower CLS for stability
    FCP: 1500,
    TTFB: 800,
    INP: 200,
  },
};
```

### Metrics Aggregation

```typescript
// src/lib/rum/metrics-aggregator.ts

interface AggregatedMetrics {
  metric: string;
  profile: string;
  count: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
  avg: number;
  min: number;
  max: number;
  goodCount: number;
  needsImprovementCount: number;
  poorCount: number;
}

export class MetricsAggregator {
  static aggregate(metrics: any[]): AggregatedMetrics[] {
    // Group by metric name and profile
    const grouped = metrics.reduce((acc, metric) => {
      const key = `${metric.name}-${metric.profile}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(grouped).map(([key, values]) => {
      const [metric, profile] = key.split('-');
      const sorted = values.sort((a, b) => a - b);

      // Calculate percentiles
      const p50 = this.percentile(sorted, 50);
      const p75 = this.percentile(sorted, 75);
      const p90 = this.percentile(sorted, 90);
      const p95 = this.percentile(sorted, 95);
      const p99 = this.percentile(sorted, 99);

      // Calculate rating distribution
      const thresholds = CORE_WEB_VITALS_THRESHOLDS[metric];
      const goodCount = values.filter(v => v <= thresholds.good).length;
      const poorCount = values.filter(v => v > thresholds.poor).length;
      const needsImprovementCount = values.length - goodCount - poorCount;

      return {
        metric,
        profile,
        count: values.length,
        p50,
        p75,
        p90,
        p95,
        p99,
        avg: values.reduce((sum, v) => sum + v, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        goodCount,
        needsImprovementCount,
        poorCount,
      };
    });
  }

  private static percentile(sorted: number[], p: number): number {
    const index = Math.ceil((sorted.length * p) / 100) - 1;
    return sorted[Math.max(0, index)];
  }
}
```

---

## 🎨 Profile-Specific Metrics

### Dashboard API Endpoint

```typescript
// src/app/api/analytics/dashboard/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { MetricsAggregator } from '@/lib/rum/metrics-aggregator';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const profile = searchParams.get('profile') || 'all';
  const startDate = searchParams.get('start_date') || getLastWeek();
  const endDate = searchParams.get('end_date') || getToday();

  try {
    // Load metrics from storage
    const metrics = await loadMetrics(startDate, endDate, profile);

    // Aggregate
    const aggregated = MetricsAggregator.aggregate(metrics);

    // Calculate scores
    const scores = calculateScores(aggregated);

    return NextResponse.json({
      metrics: aggregated,
      scores,
      period: { start: startDate, end: endDate },
      profile,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}

function calculateScores(aggregated: any[]) {
  // Calculate Lighthouse-like scores for each profile
  const profiles = ['familiar', 'jovem', 'senior'];

  return profiles.map(profile => {
    const profileMetrics = aggregated.filter(m => m.profile === profile);

    const lcpScore = getMetricScore('LCP', profileMetrics.find(m => m.metric === 'LCP')?.p75 || 0);
    const fidScore = getMetricScore('FID', profileMetrics.find(m => m.metric === 'FID')?.p75 || 0);
    const clsScore = getMetricScore('CLS', profileMetrics.find(m => m.metric === 'CLS')?.p75 || 0);

    // Weighted average (LCP: 25%, FID: 25%, CLS: 25%, FCP: 15%, TTFB: 10%)
    const overallScore = Math.round(
      lcpScore * 0.25 +
      fidScore * 0.25 +
      clsScore * 0.25 +
      getMetricScore('FCP', profileMetrics.find(m => m.metric === 'FCP')?.p75 || 0) * 0.15 +
      getMetricScore('TTFB', profileMetrics.find(m => m.metric === 'TTFB')?.p75 || 0) * 0.10
    );

    return {
      profile,
      overallScore,
      lcpScore,
      fidScore,
      clsScore,
      rating: getRating(overallScore),
    };
  });
}

function getMetricScore(metric: string, value: number): number {
  const thresholds = CORE_WEB_VITALS_THRESHOLDS[metric];
  if (!thresholds) return 0;

  // Map value to 0-100 score
  if (value <= thresholds.good) {
    return 100 - (value / thresholds.good) * 10;
  } else if (value <= thresholds.needsImprovement) {
    const range = thresholds.needsImprovement - thresholds.good;
    const position = value - thresholds.good;
    return 90 - (position / range) * 40;
  } else {
    return Math.max(0, 50 - ((value - thresholds.poor) / thresholds.poor) * 50);
  }
}

function getRating(score: number): 'good' | 'needs-improvement' | 'poor' {
  if (score >= 90) return 'good';
  if (score >= 50) return 'needs-improvement';
  return 'poor';
}

async function loadMetrics(startDate: string, endDate: string, profile: string) {
  // Load from file storage (or database)
  const fs = require('fs');
  const path = require('path');

  const dataDir = path.join(process.cwd(), 'data', 'metrics');
  const files = fs.readdirSync(dataDir);

  const allMetrics: any[] = [];

  files.forEach((file: string) => {
    if (!file.startsWith('web-vitals-')) return;

    const filePath = path.join(dataDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    content.split('\n').filter(Boolean).forEach((line: string) => {
      try {
        const data = JSON.parse(line);
        if (profile === 'all' || data.metrics.some((m: any) => m.profile === profile)) {
          allMetrics.push(...data.metrics);
        }
      } catch (e) {
        // Skip invalid lines
      }
    });
  });

  return allMetrics;
}

function getLastWeek(): string {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().split('T')[0];
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}
```

---

## 🚨 Alert System

### Performance Alert Configuration

```typescript
// src/lib/alerts/performance-alerts.ts

interface AlertRule {
  metric: string;
  profile: string;
  threshold: number;
  comparison: 'greater' | 'less';
  duration: number; // minutes
  severity: 'warning' | 'critical';
}

const ALERT_RULES: AlertRule[] = [
  {
    metric: 'LCP',
    profile: 'familiar',
    threshold: 3000,
    comparison: 'greater',
    duration: 30,
    severity: 'warning',
  },
  {
    metric: 'LCP',
    profile: 'familiar',
    threshold: 4000,
    comparison: 'greater',
    duration: 10,
    severity: 'critical',
  },
  {
    metric: 'FID',
    profile: 'familiar',
    threshold: 150,
    comparison: 'greater',
    duration: 30,
    severity: 'warning',
  },
  {
    metric: 'CLS',
    profile: 'familiar',
    threshold: 0.15,
    comparison: 'greater',
    duration: 30,
    severity: 'warning',
  },
  // Repeat for jovem and senior profiles...
];

export class PerformanceAlerter {
  private violations: Map<string, number> = new Map();

  async checkAlerts(metrics: any[]) {
    const now = Date.now();

    for (const rule of ALERT_RULES) {
      const relevantMetrics = metrics.filter(
        m => m.name === rule.metric && m.profile === rule.profile
      );

      if (relevantMetrics.length === 0) continue;

      // Calculate average over duration
      const recentMetrics = relevantMetrics.filter(
        m => now - m.timestamp < rule.duration * 60 * 1000
      );

      if (recentMetrics.length === 0) continue;

      const avg = recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length;

      const violated = rule.comparison === 'greater'
        ? avg > rule.threshold
        : avg < rule.threshold;

      if (violated) {
        await this.triggerAlert(rule, avg);
      } else {
        // Clear violation if it existed
        this.violations.delete(this.getRuleKey(rule));
      }
    }
  }

  private async triggerAlert(rule: AlertRule, currentValue: number) {
    const key = this.getRuleKey(rule);
    const lastAlert = this.violations.get(key) || 0;
    const now = Date.now();

    // Debounce: Don't send alerts more frequently than every 15 minutes
    if (now - lastAlert < 15 * 60 * 1000) {
      return;
    }

    this.violations.set(key, now);

    // Send notification
    await this.sendNotification({
      severity: rule.severity,
      metric: rule.metric,
      profile: rule.profile,
      threshold: rule.threshold,
      currentValue,
      message: `${rule.metric} for ${rule.profile} profile exceeded ${rule.threshold} (current: ${currentValue.toFixed(2)})`,
    });
  }

  private getRuleKey(rule: AlertRule): string {
    return `${rule.metric}-${rule.profile}-${rule.threshold}`;
  }

  private async sendNotification(alert: any) {
    console.warn('🚨 Performance Alert:', alert);

    // Send to Slack
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Performance Alert: ${alert.message}`,
          attachments: [
            {
              color: alert.severity === 'critical' ? 'danger' : 'warning',
              fields: [
                { title: 'Metric', value: alert.metric, short: true },
                { title: 'Profile', value: alert.profile, short: true },
                { title: 'Threshold', value: alert.threshold.toString(), short: true },
                { title: 'Current Value', value: alert.currentValue.toFixed(2), short: true },
              ],
            },
          ],
        }),
      });
    }

    // Send email (using Resend)
    if (process.env.RESEND_API_KEY && process.env.ALERT_EMAIL) {
      // Implementation using Resend API
    }
  }
}
```

---

## 📊 Visualization and Reporting

### Dashboard UI Component

```typescript
// src/app/dashboard/performance/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardData {
  metrics: any[];
  scores: any[];
  period: { start: string; end: string };
  profile: string;
}

export default function PerformanceDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string>('familiar');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    loadDashboardData();
  }, [selectedProfile, timeRange]);

  async function loadDashboardData() {
    const response = await fetch(
      `/api/analytics/dashboard?profile=${selectedProfile}&range=${timeRange}`
    );
    const data = await response.json();
    setData(data);
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  const profileScore = data.scores.find(s => s.profile === selectedProfile);

  return (
    <div className="dashboard-container p-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Performance Dashboard</h1>

        {/* Profile Selector */}
        <div className="flex gap-4 mb-4">
          {['familiar', 'jovem', 'senior'].map(profile => (
            <button
              key={profile}
              onClick={() => setSelectedProfile(profile)}
              className={`px-4 py-2 rounded ${
                selectedProfile === profile
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {profile.charAt(0).toUpperCase() + profile.slice(1)}
            </button>
          ))}
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-4">
          {[
            { value: '7d', label: 'Last 7 Days' },
            { value: '30d', label: 'Last 30 Days' },
            { value: '90d', label: 'Last 90 Days' },
          ].map(range => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value as any)}
              className={`px-4 py-2 rounded ${
                timeRange === range.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </header>

      {/* Overall Score */}
      <section className="mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Overall Performance Score</h2>
          <div className="flex items-center gap-4">
            <div
              className={`text-6xl font-bold ${
                profileScore.rating === 'good'
                  ? 'text-green-600'
                  : profileScore.rating === 'needs-improvement'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {profileScore.overallScore}
            </div>
            <div>
              <div className="text-2xl font-semibold capitalize">
                {profileScore.rating.replace('-', ' ')}
              </div>
              <div className="text-gray-600">
                {profileScore.rating === 'good'
                  ? 'Excellent performance'
                  : profileScore.rating === 'needs-improvement'
                  ? 'Room for improvement'
                  : 'Critical issues detected'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Web Vitals */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Core Web Vitals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['LCP', 'FID', 'CLS'].map(metric => {
            const metricData = data.metrics.find(
              m => m.metric === metric && m.profile === selectedProfile
            );

            if (!metricData) return null;

            const rating =
              metricData.p75 <= CORE_WEB_VITALS_THRESHOLDS[metric].good
                ? 'good'
                : metricData.p75 <= CORE_WEB_VITALS_THRESHOLDS[metric].poor
                ? 'needs-improvement'
                : 'poor';

            return (
              <div key={metric} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{metric}</h3>
                    <p className="text-sm text-gray-600">
                      {metric === 'LCP' && 'Largest Contentful Paint'}
                      {metric === 'FID' && 'First Input Delay'}
                      {metric === 'CLS' && 'Cumulative Layout Shift'}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      rating === 'good'
                        ? 'bg-green-100 text-green-800'
                        : rating === 'needs-improvement'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {rating === 'good' ? 'Good' : rating === 'needs-improvement' ? 'Needs Work' : 'Poor'}
                  </div>
                </div>

                <div className="text-4xl font-bold mb-4">
                  {formatMetricValue(metric, metricData.p75)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">p50:</span>
                    <span className="font-semibold">{formatMetricValue(metric, metricData.p50)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">p75:</span>
                    <span className="font-semibold">{formatMetricValue(metric, metricData.p75)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">p95:</span>
                    <span className="font-semibold">{formatMetricValue(metric, metricData.p95)}</span>
                  </div>
                </div>

                {/* Distribution */}
                <div className="mt-4 pt-4 border-t">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-sm">Good: {metricData.goodCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span className="text-sm">Needs Work: {metricData.needsImprovementCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-sm">Poor: {metricData.poorCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trend Chart */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Performance Trends</h2>
        <div className="bg-white rounded-lg shadow p-6">
          {/* Implement time-series chart using Chart.js or Recharts */}
          <p className="text-gray-600">Time-series chart implementation here</p>
        </div>
      </section>
    </div>
  );
}

function formatMetricValue(metric: string, value: number): string {
  if (metric === 'CLS') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
}
```

---

## 🛠 Implementation Guide

### Step-by-Step Setup

**1. Install Dependencies**

```bash
npm install web-vitals chart.js react-chartjs-2 posthog-js
```

**2. Add Web Vitals Collector to Layout**

```typescript
// src/app/layout.tsx

import { webVitalsCollector } from '@/lib/rum/web-vitals-collector';

export default function RootLayout({ children }: Props) {
  // Collector is auto-initialized as singleton

  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
```

**3. Create Dashboard Route**

```typescript
// src/app/dashboard/performance/page.tsx
// (Implementation shown above)
```

**4. Set Up Cron Job for Alerts**

```javascript
// scripts/check-performance-alerts.js

const { PerformanceAlerter } = require('../src/lib/alerts/performance-alerts');

async function runAlertCheck() {
  const alerter = new PerformanceAlerter();

  // Load recent metrics
  const metrics = await loadRecentMetrics(30); // Last 30 minutes

  // Check alerts
  await alerter.checkAlerts(metrics);
}

runAlertCheck().catch(console.error);
```

```bash
# Add to crontab (run every 15 minutes)
*/15 * * * * cd /path/to/project && node scripts/check-performance-alerts.js
```

**5. Configure Environment Variables**

```bash
# .env.production

SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
ALERT_EMAIL=alerts@saraivavision.com.br
RESEND_API_KEY=your-resend-api-key
```

---

**Última Atualização**: Outubro 2025
**Autor**: Equipe Saraiva Vision
**Status**: Em Planejamento
