/**
 * Performance Regression Test Suite
 * Detects performance regressions, establishes baselines, and monitors trends
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Performance baseline storage (in real implementation, this would be persisted)
const PERFORMANCE_BASELINES = {
    '2024-01-01': {
        LCP: { value: 1850, rating: 'good' },
        FID: { value: 35, rating: 'good' },
        CLS: { value: 0.08, rating: 'good' },
        FCP: { value: 1400, rating: 'good' },
        TTFB: { value: 400, rating: 'good' },
        bundleSize: { main: 150000, vendor: 300000, total: 555000 },
        imageLoadTime: { average: 850, medical: 1200 },
        memoryUsage: { peak: 45 * 1024 * 1024, average: 35 * 1024 * 1024 }
    },
    '2024-02-01': {
        LCP: { value: 1750, rating: 'good' },
        FID: { value: 32, rating: 'good' },
        CLS: { value: 0.06, rating: 'good' },
        FCP: { value: 1300, rating: 'good' },
        TTFB: { value: 380, rating: 'good' },
        bundleSize: { main: 145000, vendor: 295000, total: 540000 },
        imageLoadTime: { average: 800, medical: 1100 },
        memoryUsage: { peak: 42 * 1024 * 1024, average: 33 * 1024 * 1024 }
    }
};

// Performance thresholds for regression detection
const REGRESSION_THRESHOLDS = {
    // Maximum allowed degradation
    LCP: { maxIncrease: 500, maxPercentIncrease: 0.25 },      // +500ms or +25%
    FID: { maxIncrease: 50, maxPercentIncrease: 0.5 },        // +50ms or +50%
    CLS: { maxIncrease: 0.05, maxPercentIncrease: 1.0 },      // +0.05 or +100%
    FCP: { maxIncrease: 400, maxPercentIncrease: 0.25 },      // +400ms or +25%
    TTFB: { maxIncrease: 200, maxPercentIncrease: 0.3 },      // +200ms or +30%

    // Bundle size regressions
    bundleSize: {
        main: { maxIncrease: 50000, maxPercentIncrease: 0.15 },   // +50KB or +15%
        vendor: { maxIncrease: 75000, maxPercentIncrease: 0.20 },  // +75KB or +20%
        total: { maxIncrease: 100000, maxPercentIncrease: 0.15 }   // +100KB or +15%
    },

    // Image loading regressions
    imageLoadTime: {
        average: { maxIncrease: 300, maxPercentIncrease: 0.3 },   // +300ms or +30%
        medical: { maxIncrease: 500, maxPercentIncrease: 0.4 }     // +500ms or +40%
    },

    // Memory usage regressions
    memoryUsage: {
        peak: { maxIncrease: 10 * 1024 * 1024, maxPercentIncrease: 0.25 },  // +10MB or +25%
        average: { maxIncrease: 8 * 1024 * 1024, maxPercentIncrease: 0.2 }    // +8MB or +20%
    }
};

// Healthcare-specific regression thresholds
const HEALTHCARE_REGRESSION_THRESHOLDS = {
    // Stricter thresholds for medical content
    medicalImageLoad: { maxIncrease: 400, maxPercentIncrease: 0.3 },
    accessibilityLoad: { maxIncrease: 200, maxPercentIncrease: 0.25 },
    criticalContentLoad: { maxIncrease: 300, maxPercentIncrease: 0.2 },

    // Medical compliance metrics
    complianceChecks: { maxRegression: 0.05 }, // 5% regression max
    accessibilityScore: { maxRegression: 0.03 } // 3% regression max
};

class PerformanceRegressionDetector {
    constructor() {
        this.baselines = PERFORMANCE_BASELINES;
        this.thresholds = REGRESSION_THRESHOLDS;
        this.healthcareThresholds = HEALTHCARE_REGRESSION_THRESHOLDS;
        this.currentMetrics = {};
        this.regressions = [];
        this.trends = [];
    }

    // Set current performance metrics
    setCurrentMetrics(metrics) {
        this.currentMetrics = metrics;
        this.detectRegressions();
        this.analyzeTrends();
    }

    // Detect regressions by comparing with baselines
    detectRegressions() {
        this.regressions = [];
        const latestBaseline = this.getLatestBaseline();

        if (!latestBaseline) {
            return;
        }

        // Check Core Web Vitals
        ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].forEach(metric => {
            if (this.currentMetrics[metric] && latestBaseline[metric]) {
                const regression = this.checkMetricRegression(
                    metric,
                    this.currentMetrics[metric].value,
                    latestBaseline[metric].value
                );
                if (regression) {
                    this.regressions.push(regression);
                }
            }
        });

        // Check bundle size
        if (this.currentMetrics.bundleSize && latestBaseline.bundleSize) {
            ['main', 'vendor', 'total'].forEach(bundleType => {
                const regression = this.checkMetricRegression(
                    `bundleSize.${bundleType}`,
                    this.currentMetrics.bundleSize[bundleType],
                    latestBaseline.bundleSize[bundleType]
                );
                if (regression) {
                    this.regressions.push(regression);
                }
            });
        }

        // Check image loading times
        if (this.currentMetrics.imageLoadTime && latestBaseline.imageLoadTime) {
            ['average', 'medical'].forEach(imageType => {
                const regression = this.checkMetricRegression(
                    `imageLoadTime.${imageType}`,
                    this.currentMetrics.imageLoadTime[imageType],
                    latestBaseline.imageLoadTime[imageType]
                );
                if (regression) {
                    this.regressions.push({
                        ...regression,
                        healthcareImpact: imageType === 'medical' ? 'high' : 'medium'
                    });
                }
            });
        }

        // Check memory usage
        if (this.currentMetrics.memoryUsage && latestBaseline.memoryUsage) {
            ['peak', 'average'].forEach(memoryType => {
                const regression = this.checkMetricRegression(
                    `memoryUsage.${memoryType}`,
                    this.currentMetrics.memoryUsage[memoryType],
                    latestBaseline.memoryUsage[memoryType]
                );
                if (regression) {
                    this.regressions.push(regression);
                }
            });
        }
    }

    // Check individual metric for regression
    checkMetricRegression(metricName, currentValue, baselineValue) {
        const threshold = this.getThresholdForMetric(metricName);
        if (!threshold) {
            return null;
        }

        const absoluteIncrease = currentValue - baselineValue;
        const percentIncrease = baselineValue > 0 ? absoluteIncrease / baselineValue : 0;

        let isRegression = false;
        let severity = 'minor';

        if (absoluteIncrease > threshold.maxIncrease) {
            isRegression = true;
            severity = absoluteIncrease > threshold.maxIncrease * 2 ? 'critical' : 'major';
        } else if (percentIncrease > threshold.maxPercentIncrease) {
            isRegression = true;
            severity = percentIncrease > threshold.maxPercentIncrease * 2 ? 'critical' : 'major';
        }

        if (isRegression) {
            return {
                metric: metricName,
                severity,
                baseline: baselineValue,
                current: currentValue,
                absoluteIncrease,
                percentIncrease: Math.round(percentIncrease * 100 * 100) / 100, // 2 decimal places
                threshold,
                healthcareImpact: this.getHealthcareImpact(metricName)
            };
        }

        return null;
    }

    // Get appropriate threshold for a metric
    getThresholdForMetric(metricName) {
        const parts = metricName.split('.');
        let threshold = this.thresholds;

        for (const part of parts) {
            threshold = threshold[part];
            if (!threshold) {
                break;
            }
        }

        return threshold;
    }

    // Get healthcare impact for a metric
    getHealthcareImpact(metricName) {
        const highImpactMetrics = ['LCP', 'CLS', 'medicalImageLoad', 'accessibilityLoad'];
        const mediumImpactMetrics = ['FID', 'FCP', 'TTFB'];

        if (highImpactMetrics.some(m => metricName.includes(m))) {
            return 'high';
        } else if (mediumImpactMetrics.some(m => metricName.includes(m))) {
            return 'medium';
        }
        return 'low';
    }

    // Analyze performance trends over time
    analyzeTrends() {
        this.trends = [];
        const baselineDates = Object.keys(this.baselines).sort();

        // Analyze trend for each metric
        ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].forEach(metric => {
            const trend = this.analyzeMetricTrend(metric);
            if (trend) {
                this.trends.push(trend);
            }
        });

        // Analyze bundle size trends
        const bundleTrend = this.analyzeMetricTrend('bundleSize.total');
        if (bundleTrend) {
            this.trends.push({
                ...bundleTrend,
                metric: 'bundleSize.total',
                healthcareImpact: 'medium'
            });
        }
    }

    // Analyze trend for a specific metric
    analyzeMetricTrend(metricName) {
        const baselineDates = Object.keys(this.baselines).sort();
        const values = [];

        baselineDates.forEach(date => {
            const baseline = this.baselines[date];
            const value = this.getNestedValue(baseline, metricName);
            if (value !== undefined) {
                values.push({ date, value: typeof value === 'object' ? value.value : value });
            }
        });

        if (values.length < 2) {
            return null;
        }

        // Add current value
        if (this.currentMetrics) {
            const currentValue = this.getNestedValue(this.currentMetrics, metricName);
            if (currentValue !== undefined) {
                values.push({
                    date: 'current',
                    value: typeof currentValue === 'object' ? currentValue.value : currentValue
                });
            }
        }

        // Calculate trend
        const firstValue = values[0].value;
        const lastValue = values[values.length - 1].value;
        const totalChange = lastValue - firstValue;
        const percentChange = firstValue > 0 ? (totalChange / firstValue) * 100 : 0;

        let trendDirection = 'stable';
        if (Math.abs(percentChange) > 5) {
            trendDirection = percentChange > 0 ? 'degrading' : 'improving';
        }

        return {
            metric: metricName,
            direction: trendDirection,
            totalChange,
            percentChange: Math.round(percentChange * 100) / 100,
            dataPoints: values.length,
            healthcareImpact: this.getHealthcareImpact(metricName)
        };
    }

    // Get nested value from object using dot notation
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    // Get the most recent baseline
    getLatestBaseline() {
        const dates = Object.keys(this.baselines).sort();
        return dates.length > 0 ? this.baselines[dates[dates.length - 1]] : null;
    }

    // Generate comprehensive regression report
    generateReport() {
        return {
            timestamp: new Date().toISOString(),
            currentMetrics: this.currentMetrics,
            latestBaseline: this.getLatestBaseline(),
            regressions: this.regressions,
            trends: this.trends,
            summary: this.generateSummary(),
            recommendations: this.generateRecommendations(),
            healthcareImpact: this.assessHealthcareImpact()
        };
    }

    // Generate summary of findings
    generateSummary() {
        const criticalRegressions = this.regressions.filter(r => r.severity === 'critical');
        const majorRegressions = this.regressions.filter(r => r.severity === 'major');
        const minorRegressions = this.regressions.filter(r => r.severity === 'minor');

        const degradingTrends = this.trends.filter(t => t.direction === 'degrading');
        const improvingTrends = this.trends.filter(t => t.direction === 'improving');

        return {
            totalRegressions: this.regressions.length,
            criticalRegressions: criticalRegressions.length,
            majorRegressions: majorRegressions.length,
            minorRegressions: minorRegressions.length,
            degradingTrends: degradingTrends.length,
            improvingTrends: improvingTrends.length,
            overallHealth: criticalRegressions.length > 0 ? 'critical' :
                           majorRegressions.length > 0 ? 'degraded' :
                           this.regressions.length > 0 ? 'attention-needed' : 'healthy'
        };
    }

    // Generate recommendations based on findings
    generateRecommendations() {
        const recommendations = [];

        // Regression-based recommendations
        this.regressions.forEach(regression => {
            let recommendation = {
                type: 'regression',
                metric: regression.metric,
                severity: regression.severity,
                priority: regression.severity === 'critical' ? 'immediate' :
                         regression.severity === 'major' ? 'high' : 'medium'
            };

            switch (regression.metric) {
                case 'LCP':
                    recommendation.message = `LCP has degraded by ${regression.percentIncrease}%. Optimize largest content paint and server response times.`;
                    break;
                case 'FID':
                    recommendation.message = `FID has degraded by ${regression.percentIncrease}%. Reduce JavaScript execution time and improve interactivity.`;
                    break;
                case 'CLS':
                    recommendation.message = `CLS has degraded by ${regression.percentIncrease}%. Fix layout shifts by ensuring proper image dimensions and avoiding dynamic content.`;
                    break;
                case 'bundleSize.total':
                    recommendation.message = `Bundle size has increased by ${regression.percentIncrease}%. Review dependencies and implement code splitting.`;
                    break;
                case 'medicalImageLoad':
                    recommendation.message = `Medical image loading time has degraded by ${regression.percentIncrease}%. Optimize medical image compression and loading strategy.`;
                    recommendation.priority = 'immediate'; // Medical content is critical
                    break;
                default:
                    recommendation.message = `${regression.metric} has degraded by ${regression.percentIncrease}%. Investigation required.`;
            }

            recommendations.push(recommendation);
        });

        // Trend-based recommendations
        this.trends.forEach(trend => {
            if (trend.direction === 'degrading' && Math.abs(trend.percentChange) > 10) {
                recommendations.push({
                    type: 'trend',
                    metric: trend.metric,
                    priority: 'medium',
                    message: `${trend.metric} shows consistent degradation trend (${trend.percentChange}% over time). Proactive optimization recommended.`
                });
            }
        });

        return recommendations;
    }

    // Assess overall healthcare impact
    assessHealthcareImpact() {
        const highImpactRegressions = this.regressions.filter(r => r.healthcareImpact === 'high');
        const mediumImpactRegressions = this.regressions.filter(r => r.healthcareImpact === 'medium');

        const impactLevel = highImpactRegressions.length > 0 ? 'critical' :
                           mediumImpactRegressions.length > 0 ? 'significant' : 'minimal';

        return {
            level: impactLevel,
            affectedMetrics: {
                high: highImpactRegressions.map(r => r.metric),
                medium: mediumImpactRegressions.map(r => r.metric),
                low: this.regressions.filter(r => r.healthcareImpact === 'low').map(r => r.metric)
            },
            criticalIssues: highImpactRegressions.filter(r => r.severity === 'critical'),
            recommendation: impactLevel === 'critical' ? 'Immediate action required for healthcare compliance' :
                             impactLevel === 'significant' ? 'Optimization needed for patient experience' :
                             'Performance is within acceptable healthcare standards'
        };
    }
}

describe('Performance Regression Tests', () => {
    let detector;

    beforeEach(() => {
        detector = new PerformanceRegressionDetector();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Regression Detection', () => {
        it('should detect LCP regression', () => {
            const currentMetrics = {
                LCP: { value: 2400, rating: 'needs-improvement' }, // Degraded from 1750
                FID: { value: 32, rating: 'good' },
                CLS: { value: 0.06, rating: 'good' },
                FCP: { value: 1300, rating: 'good' },
                TTFB: { value: 380, rating: 'good' }
            };

            detector.setCurrentMetrics(currentMetrics);
            const report = detector.generateReport();

            const lcpRegression = report.regressions.find(r => r.metric === 'LCP');
            expect(lcpRegression).toBeDefined();
            expect(lcpRegression.current).toBe(2400);
            expect(lcpRegression.baseline).toBe(1750);
            expect(lcpRegression.percentIncrease).toBeGreaterThan(0);
            expect(lcpRegression.healthcareImpact).toBe('high');
        });

        it('should detect bundle size regression', () => {
            const currentMetrics = {
                bundleSize: {
                    main: 180000, // Increased from 145KB
                    vendor: 320000, // Increased from 295KB
                    total: 500000   // Actually decreased
                }
            };

            detector.setCurrentMetrics(currentMetrics);
            const report = detector.generateReport();

            const mainBundleRegression = report.regressions.find(r => r.metric === 'bundleSize.main');
            const vendorBundleRegression = report.regressions.find(r => r.metric === 'bundleSize.vendor');

            expect(mainBundleRegression).toBeDefined();
            expect(mainBundleRegression.percentIncrease).toBeGreaterThan(15); // > 15%
            expect(mainBundleRegression.severity).toBe('major');

            expect(vendorBundleRegression).toBeDefined();
            expect(vendorBundleRegression.percentIncrease).toBeGreaterThan(8); // > 8%
            expect(vendorBundleRegression.healthcareImpact).toBe('medium');
        });

        it('should detect medical image loading regression', () => {
            const currentMetrics = {
                imageLoadTime: {
                    average: 950,  // Slight increase
                    medical: 1600   // Significant increase from 1100ms
                }
            };

            detector.setCurrentMetrics(currentMetrics);
            const report = detector.generateReport();

            const medicalImageRegression = report.regressions.find(r => r.metric === 'imageLoadTime.medical');
            expect(medicalImageRegression).toBeDefined();
            expect(medicalImageRegression.current).toBe(1600);
            expect(medicalImageRegression.baseline).toBe(1100);
            expect(medicalImageRegression.percentIncrease).toBeGreaterThan(40); // > 40%
            expect(medicalImageRegression.healthcareImpact).toBe('high');
        });

        it('should not report false regressions', () => {
            const currentMetrics = {
                LCP: { value: 1600, rating: 'good' }, // Improved
                FID: { value: 30, rating: 'good' },   // Improved
                CLS: { value: 0.05, rating: 'good' }, // Improved
                bundleSize: {
                    main: 140000, // Smaller
                    vendor: 280000, // Smaller
                    total: 420000  // Smaller
                }
            };

            detector.setCurrentMetrics(currentMetrics);
            const report = detector.generateReport();

            expect(report.regressions).toHaveLength(0);
            expect(report.summary.totalRegressions).toBe(0);
            expect(report.summary.overallHealth).toBe('healthy');
        });

        it('should handle edge cases in regression detection', () => {
            const currentMetrics = {
                LCP: { value: null, rating: 'unknown' }, // Missing data
                FID: { value: undefined, rating: 'unknown' }, // Missing data
                CLS: { value: 0, rating: 'good' }, // Zero value
                bundleSize: {
                    main: 145000, // Same as baseline
                    vendor: 295000  // Same as baseline
                }
            };

            detector.setCurrentMetrics(currentMetrics);
            const report = detector.generateReport();

            // Should not throw errors with missing data
            expect(report.regressions).toBeDefined();
            expect(report.summary).toBeDefined();
        });
    });

    describe('Trend Analysis', () => {
        it('should analyze performance trends over time', () => {
            const currentMetrics = {
                LCP: { value: 2000, rating: 'good' },
                FID: { value: 40, rating: 'good' },
                bundleSize: { total: 560000 } // Slight increase
            };

            detector.setCurrentMetrics(currentMetrics);
            const report = detector.generateReport();

            expect(report.trends.length).toBeGreaterThan(0);

            const lcpTrend = report.trends.find(t => t.metric === 'LCP');
            expect(lcpTrend).toBeDefined();
            expect(lcpTrend.direction).toBe('degrading'); // 1750 -> 2000 is increase
            expect(lcpTrend.percentChange).toBeGreaterThan(10);
        });

        it('should identify improving trends', () => {
            const currentMetrics = {
                FCP: { value: 1200, rating: 'good' }, // Improved from 1300
                TTFB: { value: 350, rating: 'good' }   // Improved from 380
            };

            detector.setCurrentMetrics(currentMetrics);
            const report = detector.generateReport();

            const fcpTrend = report.trends.find(t => t.metric === 'FCP');
            const ttfbTrend = report.trends.find(t => t.metric === 'TTFB');

            expect(fcpTrend.direction).toBe('improving');
            expect(fcpTrend.percentChange).toBeLessThan(0);

            expect(ttfbTrend.direction).toBe('improving');
            expect(ttfbTrend.percentChange).toBeLessThan(0);
        });

        it('should detect stable trends', () => {
            const currentMetrics = {
                CLS: { value: 0.07, rating: 'good' } // Very similar to baseline
            };

            detector.setCurrentMetrics(currentMetrics);
            const report = detector.generateReport();

            const clsTrend = report.trends.find(t => t.metric === 'CLS');
            expect(clsTrend.direction).toBe('stable');
            expect(Math.abs(clsTrend.percentChange)).toBeLessThan(10);
        });
    });

    describe('Healthcare Impact Assessment', () => {
        it('should assess critical healthcare impact', () => {
            const currentMetrics = {
                LCP: { value: 3000, rating: 'poor' },        // Critical impact
                medicalImageLoad: { value: 1800, rating: 'poor' }, // Critical impact
                FID: { value: 100, rating: 'needs-improvement' }, // Medium impact
                bundleSize: { total: 600000 }                   // Medium impact
            };

            detector.setCurrentMetrics(currentMetrics);
            const report = detector.generateReport();

            expect(report.healthcareImpact.level).toBe('critical');
            expect(report.healthcareImpact.affectedMetrics.high).toContain('LCP');
            expect(report.healthcareImpact.affectedMetrics.high).toContain('medicalImageLoad');
            expect(report.healthcareImpact.criticalIssues.length).toBeGreaterThan(0);
            expect(report.healthcareImpact.recommendation).toContain('Immediate action required');
        });

        it('should assess minimal healthcare impact', () => {
            const currentMetrics = {
                LCP: { value: 1800, rating: 'good' },
                FID: { value: 35, rating: 'good' },
                CLS: { value: 0.07, rating: 'good' },
                bundleSize: { total: 480000 } // Actually improved
            };

            detector.setCurrentMetrics(currentMetrics);
            const report = detector.generateReport();

            expect(report.healthcareImpact.level).toBe('minimal');
            expect(report.healthcareImpact.criticalIssues).toHaveLength(0);
            expect(report.healthcareImpact.recommendation).toContain('acceptable healthcare standards');
        });

        it('should prioritize medical content in impact assessment', () => {
            const currentMetrics = {
                medicalImageLoad: { value: 1500, rating: 'needs-improvement' },
                accessibilityLoad: { value: 1400, rating: 'needs-improvement' },
                LCP: { value: 2200, rating: 'needs-improvement' }
            };

            detector.setCurrentMetrics(currentMetrics);
            const report = detector.generateReport();

            const medicalRegressions = report.regressions.filter(r => r.metric === 'medicalImageLoad');
            expect(medicalRegressions).toHaveLength(1);
            expect(medicalRegressions[0].healthcareImpact).toBe('high');
        });
    });

    describe('Recommendations Generation', () => {
        it('should generate appropriate recommendations for different regression types', () => {
            const currentMetrics = {
                LCP: { value: 2800, rating: 'poor' },
                CLS: { value: 0.15, rating: 'poor' },
                bundleSize: { total: 650000 },
                medicalImageLoad: { value: 1700, rating: 'needs-improvement' }
            };

            detector.setCurrentMetrics(currentMetrics);
            const report = detector.generateReport();

            expect(report.recommendations.length).toBeGreaterThan(0);

            const lcpRecommendation = report.recommendations.find(r => r.metric === 'LCP');
            expect(lcpRecommendation).toBeDefined();
            expect(lcpRecommendation.severity).toBe('critical');
            expect(lcpRecommendation.priority).toBe('immediate');
            expect(lcpRecommendation.message).toContain('LCP');

            const medicalImageRecommendation = report.recommendations.find(r => r.metric === 'medicalImageLoad');
            expect(medicalImageRecommendation).toBeDefined();
            expect(medicalImageRecommendation.priority).toBe('immediate'); // Medical content gets higher priority
        });

        it('should generate trend-based recommendations', () => {
            // Simulate consistent degradation
            detector.baselines['2024-03-01'] = {
                LCP: { value: 2000, rating: 'good' },
                bundleSize: { total: 580000 }
            };

            const currentMetrics = {
                LCP: { value: 2500, rating: 'needs-improvement' },
                bundleSize: { total: 620000 }
            };

            detector.setCurrentMetrics(currentMetrics);
            const report = detector.generateReport();

            const trendRecommendations = report.recommendations.filter(r => r.type === 'trend');
            expect(trendRecommendations.length).toBeGreaterThan(0);
            trendRecommendations.forEach(rec => {
                expect(rec.message).toContain('trend');
                expect(rec.priority).toBe('medium');
            });
        });

        it('should prioritize recommendations by healthcare impact', () => {
            const currentMetrics = {
                medicalImageLoad: { value: 2000, rating: 'poor' },
                LCP: { value: 2600, rating: 'needs-improvement' },
                bundleSize: { total: 700000 }
            };

            detector.setCurrentMetrics(currentMetrics);
            const report = detector.generateReport();

            const immediateRecommendations = report.recommendations.filter(r => r.priority === 'immediate');
            expect(immediateRecommendations.length).toBeGreaterThan(0);

            // Medical issues should be immediate priority
            const medicalRec = immediateRecommendations.find(r => r.metric === 'medicalImageLoad');
            expect(medicalRec).toBeDefined();
        });
    });

    describe('Report Generation', () => {
        it('should generate comprehensive regression report', () => {
            const currentMetrics = {
                LCP: { value: 2300, rating: 'needs-improvement' },
                FID: { value: 50, rating: 'needs-improvement' },
                CLS: { value: 0.1, rating: 'needs-improvement' },
                bundleSize: { total: 600000 },
                imageLoadTime: { medical: 1500 },
                memoryUsage: { peak: 55 * 1024 * 1024 }
            };

            detector.setCurrentMetrics(currentMetrics);
            const report = detector.generateReport();

            // Report structure validation
            expect(report.timestamp).toBeDefined();
            expect(report.currentMetrics).toEqual(currentMetrics);
            expect(report.latestBaseline).toBeDefined();
            expect(report.regressions).toBeDefined();
            expect(report.trends).toBeDefined();
            expect(report.summary).toBeDefined();
            expect(report.recommendations).toBeDefined();
            expect(report.healthcareImpact).toBeDefined();

            // Summary validation
            expect(report.summary.totalRegressions).toBeGreaterThan(0);
            expect(report.summary.overallHealth).toBeDefined();
            expect(['healthy', 'attention-needed', 'degraded', 'critical']).toContain(report.summary.overallHealth);
        });

        it('should handle missing baseline data gracefully', () => {
            const emptyDetector = new PerformanceRegressionDetector();
            emptyDetector.baselines = {}; // No baselines

            const currentMetrics = {
                LCP: { value: 2000, rating: 'good' },
                FID: { value: 30, rating: 'good' }
            };

            emptyDetector.setCurrentMetrics(currentMetrics);
            const report = emptyDetector.generateReport();

            expect(report.latestBaseline).toBeNull();
            expect(report.regressions).toHaveLength(0);
            expect(report.trends).toHaveLength(0);
            expect(report.summary.totalRegressions).toBe(0);
        });

        it('should handle single baseline data gracefully', () => {
            const singleBaselineDetector = new PerformanceRegressionDetector();
            singleBaselineDetector.baselines = {
                '2024-01-01': {
                    LCP: { value: 1800, rating: 'good' },
                    FID: { value: 30, rating: 'good' }
                }
            };

            const currentMetrics = {
                LCP: { value: 2200, rating: 'needs-improvement' },
                FID: { value: 45, rating: 'needs-improvement' }
            };

            singleBaselineDetector.setCurrentMetrics(currentMetrics);
            const report = singleBaselineDetector.generateReport();

            expect(report.regressions.length).toBeGreaterThan(0);
            expect(report.trends).toHaveLength(0); // No trend analysis with single data point
        });
    });

    describe('Integration with CI/CD', () => {
        it('should provide exit codes for automation', () => {
            const currentMetrics = {
                LCP: { value: 3000, rating: 'poor' }, // Critical regression
                medicalImageLoad: { value: 2000, rating: 'poor' } // Critical regression
            };

            detector.setCurrentMetrics(currentMetrics);
            const report = detector.generateReport();

            // Simulate CI/CD exit code logic
            const exitCode = report.summary.criticalRegressions > 0 ? 1 :
                           report.summary.majorRegressions > 0 ? 1 : 0;

            expect(exitCode).toBe(1); // Should fail CI/CD with critical regressions
        });

        it('should pass CI/CD with acceptable performance', () => {
            const currentMetrics = {
                LCP: { value: 1900, rating: 'good' },
                FID: { value: 35, rating: 'good' },
                CLS: { value: 0.08, rating: 'good' },
                bundleSize: { total: 520000 }
            };

            detector.setCurrentMetrics(currentMetrics);
            const report = detector.generateReport();

            const exitCode = report.summary.criticalRegressions > 0 ? 1 :
                           report.summary.majorRegressions > 0 ? 1 : 0;

            expect(exitCode).toBe(0); // Should pass CI/CD
            expect(report.summary.overallHealth).toBe('healthy');
        });
    });

    describe('Performance Baseline Management', () => {
        it('should allow updating performance baselines', () => {
            const newBaseline = {
                LCP: { value: 1700, rating: 'good' },
                FID: { value: 28, rating: 'good' },
                CLS: { value: 0.05, rating: 'good' },
                bundleSize: { total: 500000 }
            };

            const today = new Date().toISOString().split('T')[0];
            detector.baselines[today] = newBaseline;

            const currentMetrics = {
                LCP: { value: 1750, rating: 'good' },
                FID: { value: 30, rating: 'good' },
                CLS: { value: 0.06, rating: 'good' },
                bundleSize: { total: 510000 }
            };

            detector.setCurrentMetrics(currentMetrics);
            const report = detector.generateReport();

            expect(report.latestBaseline).toBe(newBaseline);
            expect(report.regressions).toHaveLength(0); // Should not have regressions with updated baseline
        });

        it('should handle multiple baseline versions', () => {
            const baselineCount = Object.keys(detector.baselines).length;
            expect(baselineCount).toBeGreaterThan(1);

            const latestBaseline = detector.getLatestBaseline();
            expect(latestBaseline).toBeDefined();

            // Latest baseline should be from the most recent date
            const dates = Object.keys(detector.baselines).sort();
            expect(latestBaseline).toBe(detector.baselines[dates[dates.length - 1]]);
        });
    });
});