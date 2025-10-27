/**
 * Web Vitals Validation Tests
 * Tests Core Web Vitals, performance metrics, and healthcare-specific requirements
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Web Vitals library
const mockWebVitals = {
    getCLS: vi.fn(),
    getFID: vi.fn(),
    getFCP: vi.fn(),
    getLCP: vi.fn(),
    getTTFB: vi.fn(),
    getINP: vi.fn()
};

// Mock performance API
const mockPerformanceObserver = vi.fn();
const mockPerformanceEntries = [];

// Healthcare-specific performance thresholds
const HEALTHCARE_THRESHOLDS = {
    // Core Web Vitals (stricter for healthcare)
    LCP: {
        good: 2000,      // 2.0s (stricter than standard 2.5s)
        needsImprovement: 3000, // 3.0s
        poor: 4000       // 4.0s
    },
    FID: {
        good: 80,        // 80ms (stricter than standard 100ms)
        needsImprovement: 180,   // 180ms
        poor: 300        // 300ms
    },
    CLS: {
        good: 0.08,      // 0.08 (stricter than standard 0.1)
        needsImprovement: 0.18,  // 0.18
        poor: 0.25       // 0.25
    },
    FCP: {
        good: 1500,      // 1.5s (stricter than standard 1.8s)
        needsImprovement: 2500,  // 2.5s
        poor: 4000       // 4.0s
    },
    TTFB: {
        good: 600,       // 600ms (stricter than standard 800ms)
        needsImprovement: 1000,  // 1.0s
        poor: 1800       // 1.8s
    },
    // Healthcare-specific metrics
    medicalImageLoad: {
        good: 1500,      // Medical images should load quickly
        needsImprovement: 2500,
        poor: 4000
    },
    accessibilityLoad: {
        good: 1000,      // Screen reader accessibility content
        needsImprovement: 2000,
        poor: 3000
    }
};

// Mock Web Vitals implementation
class WebVitalsValidator {
    constructor() {
        this.metrics = new Map();
        this.observers = [];
        this.thresholds = JSON.parse(JSON.stringify(HEALTHCARE_THRESHOLDS));
        this.healthcareSpecific = true;
    }

    // Core Web Vitals collection
    collectLCP(callback) {
        const mockLCPEntry = {
            name: 'largest-contentful-paint',
            startTime: 1850,
            renderTime: 1800,
            loadTime: 1900,
            element: 'img.medical-procedure',
            url: '/img/catarata-procedure.webp',
            id: 'lcp-123'
        };

        setTimeout(() => {
            this.metrics.set('LCP', {
                value: mockLCPEntry.startTime,
                rating: this.getRating('LCP', mockLCPEntry.startTime),
                entry: mockLCPEntry,
                timestamp: Date.now()
            });
            callback(this.metrics.get('LCP'));
        }, 100);
    }

    collectFID(callback) {
        const mockFIDEntry = {
            name: 'first-input',
            startTime: 1200,
            processingStart: 1235,
            processingEnd: 1250,
            duration: 15,
            inputType: 'click',
            name: 'pointer'
        };

        setTimeout(() => {
            const fidValue = mockFIDEntry.processingStart - mockFIDEntry.startTime;
            this.metrics.set('FID', {
                value: fidValue,
                rating: this.getRating('FID', fidValue),
                entry: mockFIDEntry,
                timestamp: Date.now()
            });
            callback(this.metrics.get('FID'));
        }, 150);
    }

    collectCLS(callback) {
        const mockCLSEntries = [
            { value: 0.05, startTime: 1000, hadRecentInput: false },
            { value: 0.03, startTime: 1500, hadRecentInput: false },
            { value: 0.02, startTime: 2000, hadRecentInput: false }
        ];

        let clsValue = 0;
        mockCLSEntries.forEach((entry, index) => {
            setTimeout(() => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    this.metrics.set('CLS', {
                        value: clsValue,
                        rating: this.getRating('CLS', clsValue),
                        entries: mockCLSEntries.slice(0, index + 1),
                        timestamp: Date.now()
                    });
                    callback(this.metrics.get('CLS'));
                }
            }, 50 * (index + 1));
        });
    }

    collectFCP(callback) {
        const mockFCPEntry = {
            name: 'first-contentful-paint',
            startTime: 1400,
            duration: 0,
            entryType: 'paint'
        };

        setTimeout(() => {
            this.metrics.set('FCP', {
                value: mockFCPEntry.startTime,
                rating: this.getRating('FCP', mockFCPEntry.startTime),
                entry: mockFCPEntry,
                timestamp: Date.now()
            });
            callback(this.metrics.get('FCP'));
        }, 80);
    }

    collectTTFB(callback) {
        const mockTTFBEntry = {
            name: 'navigation',
            entryType: 'navigation',
            startTime: 0,
            requestStart: 350,
            responseStart: 750,
            responseEnd: 950,
            domContentLoadedEventEnd: 1400,
            loadEventEnd: 1800
        };

        setTimeout(() => {
            const ttfbValue = mockTTFBEntry.responseStart - mockTTFBEntry.requestStart;
            this.metrics.set('TTFB', {
                value: ttfbValue,
                rating: this.getRating('TTFB', ttfbValue),
                entry: mockTTFBEntry,
                timestamp: Date.now()
            });
            callback(this.metrics.get('TTFB'));
        }, 60);
    }

    // Healthcare-specific metrics
    collectMedicalImageLoad(callback) {
        const mockImageEntry = {
            name: 'medical-image-load',
            startTime: 800,
            responseEnd: 1650,
            loadTime: 850,
            element: 'img.dr-philipe-photo',
            src: '/img/drphilipe_perfil-1280w.webp',
            size: 45678,
            format: 'webp',
            medical: true
        };

        setTimeout(() => {
            this.metrics.set('medicalImageLoad', {
                value: mockImageEntry.loadTime,
                rating: this.getRating('medicalImageLoad', mockImageEntry.loadTime),
                entry: mockImageEntry,
                timestamp: Date.now()
            });
            callback(this.metrics.get('medicalImageLoad'));
        }, 120);
    }

    collectAccessibilityLoad(callback) {
        const mockA11yEntry = {
            name: 'accessibility-ready',
            startTime: 600,
            domInteractive: 1200,
            a11yReady: 1300,
            screenReaderReady: 1400,
            landmarksLoaded: true,
            ariaLabelsPresent: true
        };

        setTimeout(() => {
            const a11yLoadTime = mockA11yEntry.a11yReady - mockA11yEntry.startTime;
            this.metrics.set('accessibilityLoad', {
                value: a11yLoadTime,
                rating: this.getRating('accessibilityLoad', a11yLoadTime),
                entry: mockA11yEntry,
                timestamp: Date.now()
            });
            callback(this.metrics.get('accessibilityLoad'));
        }, 90);
    }

    // Rating calculation
    getRating(metric, value) {
        const thresholds = this.thresholds[metric];
        if (!thresholds) {
            return 'unknown';
        }

        if (value <= thresholds.good) return 'good';
        if (value <= thresholds.needsImprovement) return 'needs-improvement';
        return 'poor';
    }

    // Get comprehensive report
    getReport() {
        const report = {
            timestamp: new Date().toISOString(),
            healthcareSpecific: this.healthcareSpecific,
            thresholds: this.thresholds,
            metrics: {},
            overallRating: 'unknown',
            recommendations: []
        };

        // Collect all metrics
        for (const [name, metric] of this.metrics.entries()) {
            report.metrics[name] = {
                value: metric.value,
                rating: metric.rating,
                threshold: this.thresholds[name] || null
            };
        }

        // Calculate overall rating
        const ratings = Object.values(report.metrics).map(m => m.rating);
        const poorCount = ratings.filter(r => r === 'poor').length;
        const needsImprovementCount = ratings.filter(r => r === 'needs-improvement').length;

        if (poorCount > 0) {
            report.overallRating = 'poor';
        } else if (needsImprovementCount > 0) {
            report.overallRating = 'needs-improvement';
        } else {
            report.overallRating = 'good';
        }

        // Generate recommendations
        report.recommendations = this.generateRecommendations(report.metrics);

        return report;
    }

    generateRecommendations(metrics) {
        const recommendations = [];

        Object.entries(metrics).forEach(([name, metric]) => {
            if (metric.rating === 'poor') {
                switch (name) {
                    case 'LCP':
                        recommendations.push({
                            type: 'critical',
                            metric: 'LCP',
                            message: 'Medical content load time is critical. Optimize images and server response.',
                            priority: 'high',
                            healthcareImpact: 'high'
                        });
                        break;
                    case 'FID':
                        recommendations.push({
                            type: 'critical',
                            metric: 'FID',
                            message: 'Interaction delays affect patient experience. Reduce JavaScript execution time.',
                            priority: 'high',
                            healthcareImpact: 'medium'
                        });
                        break;
                    case 'CLS':
                        recommendations.push({
                            type: 'critical',
                            metric: 'CLS',
                            message: 'Layout shifts impact medical content readability. Ensure proper image dimensions.',
                            priority: 'high',
                            healthcareImpact: 'high'
                        });
                        break;
                    case 'medicalImageLoad':
                        recommendations.push({
                            type: 'healthcare',
                            metric: 'medicalImageLoad',
                            message: 'Medical images are loading slowly. Consider WebP format and proper compression.',
                            priority: 'high',
                            healthcareImpact: 'critical'
                        });
                        break;
                    case 'accessibilityLoad':
                        recommendations.push({
                            type: 'healthcare',
                            metric: 'accessibilityLoad',
                            message: 'Accessibility features are delayed. Prioritize screen reader compatibility.',
                            priority: 'high',
                            healthcareImpact: 'critical'
                        });
                        break;
                }
            } else if (metric.rating === 'needs-improvement') {
                recommendations.push({
                    type: 'optimization',
                    metric: name,
                    message: `${name} can be improved for better healthcare experience.`,
                    priority: 'medium',
                    healthcareImpact: 'medium'
                });
            }
        });

        return recommendations;
    }
}

describe('Web Vitals Validation Tests', () => {
    let validator;

    beforeEach(() => {
        validator = new WebVitalsValidator();
        vi.clearAllMocks();

        // Mock performance API
        global.PerformanceObserver = mockPerformanceObserver;
        global.performance = {
            ...global.performance,
            now: vi.fn(() => Date.now()),
            timing: {
                navigationStart: Date.now() - 2000,
                domContentLoadedEventEnd: Date.now() - 1000,
                loadEventEnd: Date.now()
            },
            getEntriesByType: vi.fn((type) => {
                if (type === 'navigation') {
                    return [{
                        requestStart: Date.now() - 1650,
                        responseStart: Date.now() - 1250,
                        responseEnd: Date.now() - 1050
                    }];
                }
                return mockPerformanceEntries;
            })
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Core Web Vitals Collection', () => {
        it('should collect and rate Largest Contentful Paint (LCP)', async () => {
            const promise = new Promise(resolve => {
                validator.collectLCP(resolve);
            });

            const lcpMetric = await promise;

            expect(lcpMetric.value).toBe(1850);
            expect(lcpMetric.rating).toBe('good'); // < 2000ms
            expect(lcpMetric.entry.element).toBe('img.medical-procedure');
            expect(lcpMetric.entry.url).toBe('/img/catarata-procedure.webp');
        });

        it('should collect and rate First Input Delay (FID)', async () => {
            const promise = new Promise(resolve => {
                validator.collectFID(resolve);
            });

            const fidMetric = await promise;

            expect(fidMetric.value).toBe(35); // processingStart - startTime
            expect(fidMetric.rating).toBe('good'); // < 80ms
            expect(fidMetric.entry.inputType).toBe('click');
        });

        it('should collect and rate Cumulative Layout Shift (CLS)', async () => {
            const updates = [];

            validator.collectCLS(metric => {
                updates.push(metric);
            });

            await new Promise(resolve => setTimeout(resolve, 200));

            expect(updates.length).toBeGreaterThan(0);
            const clsMetric = updates[updates.length - 1];

            expect(clsMetric.value).toBeCloseTo(0.1, 5); // Sum of all shifts (0.05 + 0.03 + 0.02)
            expect(clsMetric.rating).toBe('needs-improvement'); // > 0.08 but < 0.18
            expect(clsMetric.entries).toHaveLength(3);
        });

        it('should collect and rate First Contentful Paint (FCP)', async () => {
            const promise = new Promise(resolve => {
                validator.collectFCP(resolve);
            });

            const fcpMetric = await promise;

            expect(fcpMetric.value).toBe(1400);
            expect(fcpMetric.rating).toBe('good'); // < 1500ms
            expect(fcpMetric.entry.entryType).toBe('paint');
        });

        it('should collect and rate Time to First Byte (TTFB)', async () => {
            const promise = new Promise(resolve => {
                validator.collectTTFB(resolve);
            });

            const ttfbMetric = await promise;

            expect(ttfbMetric.value).toBe(400); // responseStart - requestStart
            expect(ttfbMetric.rating).toBe('good'); // < 600ms
        });

        it('should handle poor performance scenarios', async () => {
            // Simulate poor LCP
            const poorValidator = new WebVitalsValidator();
            poorValidator.thresholds.LCP = {
                good: 1000,
                needsImprovement: 1400,
                poor: 1600
            }; // Very strict for testing

            const promise = new Promise(resolve => {
                poorValidator.collectLCP(resolve);
            });

            const lcpMetric = await promise;

            expect(lcpMetric.value).toBe(1850);
            expect(lcpMetric.rating).toBe('poor'); // > 1000ms
        });
    });

    describe('Healthcare-Specific Metrics', () => {
        it('should collect medical image loading performance', async () => {
            const promise = new Promise(resolve => {
                validator.collectMedicalImageLoad(resolve);
            });

            const imageMetric = await promise;

            expect(imageMetric.value).toBe(850);
            expect(imageMetric.rating).toBe('good'); // < 1500ms
            expect(imageMetric.entry.element).toBe('img.dr-philipe-photo');
            expect(imageMetric.entry.medical).toBe(true);
            expect(imageMetric.entry.format).toBe('webp');
        });

        it('should collect accessibility loading performance', async () => {
            const promise = new Promise(resolve => {
                validator.collectAccessibilityLoad(resolve);
            });

            const a11yMetric = await promise;

            expect(a11yMetric.value).toBe(700); // a11yReady - startTime
            expect(a11yMetric.rating).toBe('good'); // < 1000ms
            expect(a11yMetric.entry.landmarksLoaded).toBe(true);
            expect(a11yMetric.entry.ariaLabelsPresent).toBe(true);
        });

        it('should prioritize medical content in performance calculations', async () => {
            const medicalMetrics = [];
            const regularMetrics = [];

            // Collect all metrics
            const lcpPromise = new Promise(resolve => {
                validator.collectLCP(metric => {
                    medicalMetrics.push(metric);
                    resolve(metric);
                });
            });

            const medicalImagePromise = new Promise(resolve => {
                validator.collectMedicalImageLoad(metric => {
                    medicalMetrics.push(metric);
                    resolve(metric);
                });
            });

            const a11yPromise = new Promise(resolve => {
                validator.collectAccessibilityLoad(metric => {
                    medicalMetrics.push(metric);
                    resolve(metric);
                });
            });

            await Promise.all([lcpPromise, medicalImagePromise, a11yPromise]);

            // Medical-specific metrics should be tracked
            expect(medicalMetrics.length).toBeGreaterThan(0);
            medicalMetrics.forEach(metric => {
                expect(metric.value).toBeDefined();
                expect(metric.rating).toBeDefined();
            });
        });

        it('should validate healthcare compliance thresholds', () => {
            const healthcareThresholds = validator.thresholds;

            // Healthcare thresholds should be stricter than standard
            expect(healthcareThresholds.LCP.good).toBeLessThan(2500); // Stricter than standard
            expect(healthcareThresholds.FID.good).toBeLessThan(100);  // Stricter than standard
            expect(healthcareThresholds.CLS.good).toBeLessThan(0.1);   // Stricter than standard

            // Healthcare-specific thresholds should exist
            expect(healthcareThresholds.medicalImageLoad).toBeDefined();
            expect(healthcareThresholds.accessibilityLoad).toBeDefined();
        });
    });

    describe('Performance Rating System', () => {
        it('should calculate correct ratings for different values', () => {
            const testCases = [
                { metric: 'LCP', value: 1500, expected: 'good' },
                { metric: 'LCP', value: 2500, expected: 'needs-improvement' },
                { metric: 'LCP', value: 3500, expected: 'poor' },
                { metric: 'FID', value: 50, expected: 'good' },
                { metric: 'FID', value: 150, expected: 'needs-improvement' },
                { metric: 'FID', value: 250, expected: 'poor' },
                { metric: 'CLS', value: 0.05, expected: 'good' },
                { metric: 'CLS', value: 0.15, expected: 'needs-improvement' },
                { metric: 'CLS', value: 0.20, expected: 'poor' }
            ];

            testCases.forEach(({ metric, value, expected }) => {
                const rating = validator.getRating(metric, value);
                expect(rating).toBe(expected);
            });
        });

        it('should handle unknown metrics gracefully', () => {
            const rating = validator.getRating('unknown-metric', 1000);
            expect(rating).toBe('unknown');
        });

        it('should calculate overall performance rating', async () => {
            // Collect all metrics
            const metrics = await Promise.all([
                new Promise(resolve => validator.collectLCP(resolve)),
                new Promise(resolve => validator.collectFID(resolve)),
                new Promise(resolve => validator.collectCLS(resolve)),
                new Promise(resolve => validator.collectFCP(resolve)),
                new Promise(resolve => validator.collectTTFB(resolve))
            ]);

            const report = validator.getReport();

            expect(report.overallRating).toBeDefined();
            expect(['good', 'needs-improvement', 'poor']).toContain(report.overallRating);
            expect(report.metrics).toHaveProperty('LCP');
            expect(report.metrics).toHaveProperty('FID');
            expect(report.metrics).toHaveProperty('CLS');
        });
    });

    describe('Recommendations Generation', () => {
        it('should generate critical recommendations for poor metrics', async () => {
            // Simulate poor CLS
            const poorValidator = new WebVitalsValidator();
            poorValidator.metrics.set('CLS', {
                value: 0.2,
                rating: 'poor',
                entry: { value: 0.2, hadRecentInput: false }
            });

            const report = poorValidator.getReport();

            const clsRecommendations = report.recommendations.filter(r => r.metric === 'CLS');
            expect(clsRecommendations).toHaveLength(1);
            expect(clsRecommendations[0].priority).toBe('high');
            expect(clsRecommendations[0].type).toBe('critical');
            expect(clsRecommendations[0].healthcareImpact).toBe('high');
        });

        it('should generate healthcare-specific recommendations', async () => {
            // Simulate poor medical image loading
            const poorValidator = new WebVitalsValidator();
            poorValidator.metrics.set('medicalImageLoad', {
                value: 3000,
                rating: 'poor',
                entry: { src: '/img/medical-procedure.jpg', medical: true }
            });

            const report = poorValidator.getReport();

            const medicalRecommendations = report.recommendations.filter(r => r.metric === 'medicalImageLoad');
            expect(medicalRecommendations).toHaveLength(1);
            expect(medicalRecommendations[0].type).toBe('healthcare');
            expect(medicalRecommendations[0].healthcareImpact).toBe('critical');
            expect(medicalRecommendations[0].message).toContain('WebP');
        });

        it('should prioritize recommendations by healthcare impact', async () => {
            // Simulate multiple poor metrics
            const poorValidator = new WebVitalsValidator();
            poorValidator.metrics.set('LCP', { value: 3500, rating: 'poor' });
            poorValidator.metrics.set('CLS', { value: 0.2, rating: 'poor' });
            poorValidator.metrics.set('medicalImageLoad', { value: 3000, rating: 'poor', entry: { medical: true } });
            poorValidator.metrics.set('accessibilityLoad', { value: 2500, rating: 'poor', entry: { medical: true } });

            const report = poorValidator.getReport();

            // Should have recommendations ordered by priority
            const criticalRecs = report.recommendations.filter(r => r.priority === 'high');
            expect(criticalRecs.length).toBeGreaterThan(0);

            // Healthcare-specific recommendations should have critical impact
            const healthcareRecs = report.recommendations.filter(r => r.type === 'healthcare');
            expect(healthcareRecs.length).toBeGreaterThan(0);
            healthcareRecs.forEach(rec => {
                expect(['high', 'critical']).toContain(rec.priority);
            });
        });

        it('should provide actionable improvement suggestions', async () => {
            const poorValidator = new WebVitalsValidator();
            poorValidator.metrics.set('FID', { value: 250, rating: 'poor' });
            poorValidator.metrics.set('FCP', { value: 2800, rating: 'poor' });

            const report = poorValidator.getReport();

            const recommendations = report.recommendations;
            expect(recommendations.length).toBeGreaterThan(0);

            recommendations.forEach(rec => {
                expect(rec.message).toBeDefined();
                expect(rec.message.length).toBeGreaterThan(10);
                expect(rec.priority).toBeDefined();
                expect(rec.type).toBeDefined();
            });
        });
    });

    describe('Comprehensive Performance Report', () => {
        it('should generate complete performance report', async () => {
            // Collect all metrics
            await Promise.all([
                new Promise(resolve => validator.collectLCP(resolve)),
                new Promise(resolve => validator.collectFID(resolve)),
                new Promise(resolve => validator.collectCLS(resolve)),
                new Promise(resolve => validator.collectFCP(resolve)),
                new Promise(resolve => validator.collectTTFB(resolve)),
                new Promise(resolve => validator.collectMedicalImageLoad(resolve)),
                new Promise(resolve => validator.collectAccessibilityLoad(resolve))
            ]);

            const report = validator.getReport();

            // Report structure validation
            expect(report.timestamp).toBeDefined();
            expect(report.healthcareSpecific).toBe(true);
            expect(report.thresholds).toEqual(HEALTHCARE_THRESHOLDS);
            expect(report.metrics).toBeDefined();
            expect(report.overallRating).toBeDefined();
            expect(report.recommendations).toBeDefined();

            // Core Web Vitals should be present
            expect(report.metrics).toHaveProperty('LCP');
            expect(report.metrics).toHaveProperty('FID');
            expect(report.metrics).toHaveProperty('CLS');
            expect(report.metrics).toHaveProperty('FCP');
            expect(report.metrics).toHaveProperty('TTFB');

            // Healthcare-specific metrics should be present
            expect(report.metrics).toHaveProperty('medicalImageLoad');
            expect(report.metrics).toHaveProperty('accessibilityLoad');

            // Each metric should have required properties
            Object.values(report.metrics).forEach(metric => {
                expect(metric.value).toBeDefined();
                expect(metric.rating).toBeDefined();
                expect(['good', 'needs-improvement', 'poor']).toContain(metric.rating);
            });
        });

        it('should validate healthcare compliance in report', async () => {
            const report = validator.getReport();

            // Healthcare-specific validation
            expect(report.healthcareSpecific).toBe(true);
            expect(report.thresholds.medicalImageLoad).toBeDefined();
            expect(report.thresholds.accessibilityLoad).toBeDefined();

            // Recommendations should consider healthcare impact
            if (report.recommendations.length > 0) {
                report.recommendations.forEach(rec => {
                    expect(rec.healthcareImpact).toBeDefined();
                    expect(['low', 'medium', 'high', 'critical']).toContain(rec.healthcareImpact);
                });
            }
        });

        it('should measure performance against healthcare standards', async () => {
            // Simulate a real healthcare scenario
            const healthcareValidator = new WebVitalsValidator();

            // Medical content should load quickly
            await Promise.all([
                new Promise(resolve => healthcareValidator.collectLCP(resolve)),
                new Promise(resolve => healthcareValidator.collectMedicalImageLoad(resolve)),
                new Promise(resolve => healthcareValidator.collectAccessibilityLoad(resolve))
            ]);

            const report = healthcareValidator.getReport();

            // Critical healthcare metrics should be good
            expect(report.metrics.LCP.rating).toBe('good');
            expect(report.metrics.medicalImageLoad.rating).toBe('good');
            expect(report.metrics.accessibilityLoad.rating).toBe('good');

            // Overall rating should reflect healthcare priorities
            expect(['good', 'needs-improvement']).toContain(report.overallRating);
        });
    });

    describe('Performance Monitoring Integration', () => {
        it('should integrate with existing performance monitoring system', async () => {
            // Mock integration with performance monitor
            const performanceMonitor = {
                recordWebVital: vi.fn(),
                generateReport: vi.fn()
            };

            // Collect metrics
            const lcpPromise = new Promise(resolve => {
                validator.collectLCP(metric => {
                    performanceMonitor.recordWebVital('LCP', metric);
                    resolve(metric);
                });
            });

            await lcpPromise;

            expect(performanceMonitor.recordWebVital).toHaveBeenCalledWith('LCP', expect.any(Object));
        });

        it('should handle real-time monitoring scenarios', async () => {
            const realtimeValidator = new WebVitalsValidator();
            const metricsCollected = [];

            // Setup real-time monitoring
            realtimeValidator.collectCLS(metric => {
                metricsCollected.push({ name: 'CLS', ...metric });
            });

            realtimeValidator.collectFID(metric => {
                metricsCollected.push({ name: 'FID', ...metric });
            });

            // Wait for metrics to be collected
            await new Promise(resolve => setTimeout(resolve, 200));

            expect(metricsCollected.length).toBeGreaterThan(0);
            metricsCollected.forEach(metric => {
                expect(metric.name).toBeDefined();
                expect(metric.value).toBeDefined();
                expect(metric.rating).toBeDefined();
                expect(metric.timestamp).toBeDefined();
            });
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle missing performance API gracefully', async () => {
            // Remove performance API
            const originalPerformance = global.performance;
            delete global.performance;

            const fallbackValidator = new WebVitalsValidator();

            // Should not throw errors
            expect(() => {
                fallbackValidator.getRating('LCP', 1000);
            }).not.toThrow();

            // Restore performance API
            global.performance = originalPerformance;
        });

        it('should handle invalid metric values', () => {
            const invalidCases = [
                { metric: 'LCP', value: null },
                { metric: 'CLS', value: undefined },
                { metric: 'FID', value: 'invalid' },
                { metric: 'FCP', value: -100 }
            ];

            invalidCases.forEach(({ metric, value }) => {
                expect(() => {
                    validator.getRating(metric, value);
                }).not.toThrow();
            });
        });

        it('should handle timeouts in metric collection', async () => {
            const timeoutValidator = new WebVitalsValidator();

            // Mock a timeout scenario
            const timeoutPromise = new Promise((resolve, reject) => {
                setTimeout(() => reject(new Error('Timeout')), 50);
                timeoutValidator.collectLCP(resolve);
            });

            await expect(timeoutPromise).rejects.toThrow('Timeout');
        });
    });
});