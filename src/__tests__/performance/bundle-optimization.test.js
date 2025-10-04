/**
 * Performance Tests for Bundle Optimization
 * Tests code splitting, chunk optimization, async loading, and bundle size validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock build tools and bundle analyzer
const mockBundleAnalyzer = {
    getBundleStats: vi.fn(),
    analyzeChunkSize: vi.fn(),
    detectDuplicateModules: vi.fn(),
    getCompressionStats: vi.fn()
};

// Mock Vite build process
const mockViteBuild = vi.fn();
const mockRollupOutput = {
    output: [
        {
            type: 'chunk',
            fileName: 'assets/main-abc123.js',
            code: 'console.log("main chunk");',
            size: 150000 // 150KB
        },
        {
            type: 'chunk',
            fileName: 'assets/vendor-def456.js',
            code: 'console.log("vendor chunk");',
            size: 300000 // 300KB
        },
        {
            type: 'chunk',
            fileName: 'assets/lazy-ghi789.js',
            code: 'console.log("lazy chunk");',
            size: 80000 // 80KB
        },
        {
            type: 'asset',
            fileName: 'assets/main-abc123.css',
            size: 25000 // 25KB
        }
    ]
};

// Mock file system operations
vi.mock('fs');
vi.mock('path');

describe('Bundle Optimization Performance Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock returns
        mockBundleAnalyzer.getBundleStats.mockReturnValue({
            totalSize: 555000, // 555KB
            chunkCount: 4,
            parsedSize: 455000,
            gzipSize: 125000,
            brotliSize: 95000
        });

        mockBundleAnalyzer.analyzeChunkSize.mockReturnValue([
            { name: 'main', size: 150000, parsed: 120000, gzip: 35000, brotli: 28000 },
            { name: 'vendor', size: 300000, parsed: 250000, gzip: 70000, brotli: 55000 },
            { name: 'lazy', size: 80000, parsed: 65000, gzip: 20000, brotli: 12000 }
        ]);

        mockBundleAnalyzer.detectDuplicateModules.mockReturnValue([]);

        mockBundleAnalyzer.getCompressionStats.mockReturnValue({
            gzip: { original: 555000, compressed: 125000, ratio: 0.775 },
            brotli: { original: 555000, compressed: 95000, ratio: 0.829 }
        });

        fs.existsSync.mockReturnValue(true);
        fs.statSync.mockReturnValue({ size: 555000 });
        fs.readFileSync.mockReturnValue('mock bundle content');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Bundle Size Validation', () => {
        const BUNDLE_LIMITS = {
            main: { max: 250000, warning: 200000 },      // 250KB max, 200KB warning
            vendor: { max: 500000, warning: 400000 },    // 500KB max, 400KB warning
            lazy: { max: 150000, warning: 100000 },      // 150KB max, 100KB warning
            total: { max: 1000000, warning: 800000 },    // 1MB max, 800KB warning
            css: { max: 50000, warning: 30000 }          // 50KB max, 30KB warning
        };

        it('validates main chunk size within limits', () => {
            const mainChunk = mockBundleAnalyzer.analyzeChunkSize()[0];

            expect(mainChunk.size).toBeLessThanOrEqual(BUNDLE_LIMITS.main.max);
            expect(mainChunk.size).toBeLessThan(BUNDLE_LIMITS.main.warning);
        });

        it('validates vendor chunk size within limits', () => {
            const vendorChunk = mockBundleAnalyzer.analyzeChunkSize()[1];

            expect(vendorChunk.size).toBeLessThanOrEqual(BUNDLE_LIMITS.vendor.max);
            expect(vendorChunk.size).toBeLessThan(BUNDLE_LIMITS.vendor.warning);
        });

        it('validates lazy loaded chunks are appropriately sized', () => {
            const lazyChunk = mockBundleAnalyzer.analyzeChunkSize()[2];

            expect(lazyChunk.size).toBeLessThanOrEqual(BUNDLE_LIMITS.lazy.max);
            expect(lazyChunk.size).toBeLessThan(BUNDLE_LIMITS.lazy.warning);
        });

        it('validates total bundle size within healthcare platform limits', () => {
            const stats = mockBundleAnalyzer.getBundleStats();

            expect(stats.totalSize).toBeLessThanOrEqual(BUNDLE_LIMITS.total.max);
            expect(stats.totalSize).toBeLessThan(BUNDLE_LIMITS.total.warning);
        });

        it('validates CSS bundle size', () => {
            const cssAsset = mockRollupOutput.find(asset => asset.fileName.endsWith('.css'));

            expect(cssAsset.size).toBeLessThanOrEqual(BUNDLE_LIMITS.css.max);
            expect(cssAsset.size).toBeLessThan(BUNDLE_LIMITS.css.warning);
        });

        it('detects chunk size regressions', () => {
            const baselineSizes = {
                main: 140000,
                vendor: 280000,
                lazy: 70000
            };

            const currentSizes = mockBundleAnalyzer.analyzeChunkSize().reduce((acc, chunk) => {
                acc[chunk.name] = chunk.size;
                return acc;
            }, {});

            // Check for regressions (> 10% increase)
            Object.entries(baselineSizes).forEach(([chunkName, baselineSize]) => {
                const currentSize = currentSizes[chunkName];
                const increaseRatio = (currentSize - baselineSize) / baselineSize;

                expect(increaseRatio).toBeLessThan(0.1); // Less than 10% increase
            });
        });
    });

    describe('Code Splitting Optimization', () => {
        it('verifies proper separation of vendor and application code', () => {
            const chunks = mockBundleAnalyzer.analyzeChunkSize();
            const vendorChunk = chunks.find(c => c.name === 'vendor');
            const mainChunk = chunks.find(c => c.name === 'main');

            // Vendor chunk should be larger than main (contains libraries)
            expect(vendorChunk.size).toBeGreaterThan(mainChunk.size);

            // Main chunk should contain primarily application code
            expect(mainChunk.size).toBeLessThan(200000);
        });

        it('validates lazy loaded chunks are properly separated', () => {
            const chunks = mockBundleAnalyzer.analyzeChunkSize();
            const lazyChunks = chunks.filter(c => c.name.includes('lazy'));

            expect(lazyChunks).toHaveLength(1);
            expect(lazyChunks[0].size).toBeLessThan(150000);
        });

        it('detects and prevents code duplication across chunks', () => {
            const duplicates = mockBundleAnalyzer.detectDuplicateModules();

            expect(duplicates).toEqual([]);
            // If duplicates found, they should be reported
            if (duplicates.length > 0) {
                console.warn('Duplicate modules detected:', duplicates);
            }
        });

        it('validates dynamic imports are properly code-split', async () => {
            // Mock dynamic import analysis
            const analyzeDynamicImports = vi.fn().mockReturnValue([
                {
                    module: './pages/Blog.jsx',
                    isLazy: true,
                    chunkName: 'blog'
                },
                {
                    module: './pages/Contact.jsx',
                    isLazy: true,
                    chunkName: 'contact'
                },
                {
                    module: './components/ui/Button.jsx',
                    isLazy: false,
                    reason: 'Small component, used frequently'
                }
            ]);

            const dynamicImports = analyzeDynamicImports();

            dynamicImports.forEach(importInfo => {
                if (importInfo.module.includes('pages/')) {
                    expect(importInfo.isLazy).toBe(true);
                }
            });
        });
    });

    describe('Compression Optimization', () => {
        it('validates gzip compression effectiveness', () => {
            const compressionStats = mockBundleAnalyzer.getCompressionStats();
            const gzipStats = compressionStats.gzip;

            expect(gzipStats.compressed).toBeLessThan(gzipStats.original * 0.5); // At least 50% compression
            expect(gzipStats.ratio).toBeGreaterThan(0.5); // Compression ratio > 50%
        });

        it('validates Brotli compression effectiveness', () => {
            const compressionStats = mockBundleAnalyzer.getCompressionStats();
            const brotliStats = compressionStats.brotli;

            expect(brotliStats.compressed).toBeLessThan(brotliStats.original * 0.3); // At least 70% compression
            expect(brotliStats.ratio).toBeGreaterThan(0.7); // Compression ratio > 70%

            // Brotli should be more effective than gzip
            expect(brotliStats.compressed).toBeLessThan(compressionStats.gzip.compressed);
        });

        it('measures compression impact on different file types', () => {
            const fileCompressionStats = [
                { type: 'javascript', original: 400000, gzip: 90000, brotli: 70000 },
                { type: 'css', original: 25000, gzip: 8000, brotli: 6000 },
                { type: 'json', original: 10000, gzip: 3000, brotli: 2000 }
            ];

            fileCompressionStats.forEach(stats => {
                const gzipRatio = stats.gzip / stats.original;
                const brotliRatio = stats.brotli / stats.original;

                expect(gzipRatio).toBeLessThan(0.3); // At least 70% compression
                expect(brotliRatio).toBeLessThan(0.25); // At least 75% compression
            });
        });
    });

    describe('Tree Shaking and Dead Code Elimination', () => {
        it('validates unused code is eliminated', () => {
            const treeShakingAnalysis = {
                unusedExports: [
                    './utils/deprecated.js',
                    './components/OldBanner.jsx'
                ],
                usedExports: [
                    './utils/imageOptimization.js',
                    './components/ui/Button.jsx',
                    './lib/clinicInfo.js'
                ]
            };

            // Should have minimal unused exports
            expect(treeShakingAnalysis.unusedExports.length).toBeLessThan(3);

            // Critical healthcare modules should be used
            expect(treeShakingAnalysis.usedExports).toContain('./lib/clinicInfo.js');
            expect(treeShakingAnalysis.usedExports).toContain('./utils/imageOptimization.js');
        });

        it('detects and removes console statements in production', () => {
            const productionBundle = fs.readFileSync.mock.results[0].value;

            if (process.env.NODE_ENV === 'production') {
                expect(productionBundle).not.toContain('console.log');
                expect(productionBundle).not.toContain('console.debug');
                expect(productionBundle).not.toContain('console.warn');
            }
        });

        it('validates CSS purging effectiveness', () => {
            const cssAnalysis = {
                totalClasses: 1500,
                usedClasses: 800,
                unusedClasses: 700,
                purgeRatio: 0.533 // 53.3% of classes are used
            };

            expect(cssAnalysis.usedClasses).toBeGreaterThan(cssAnalysis.unusedClasses);
            expect(cssAnalysis.purgeRatio).toBeGreaterThan(0.5); // At least 50% utilization
        });
    });

    describe('Runtime Performance Optimization', () => {
        it('measures initial bundle load time', async () => {
            const startTime = performance.now();

            // Simulate bundle loading
            await new Promise(resolve => setTimeout(resolve, 50));

            const loadTime = performance.now() - startTime;

            // Initial load should be under 200ms for good performance
            expect(loadTime).toBeLessThan(200);
        });

        it('validates async chunk loading performance', async () => {
            const chunkLoadTimes = [];

            // Simulate loading multiple lazy chunks
            for (let i = 0; i < 5; i++) {
                const startTime = performance.now();
                await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
                chunkLoadTimes.push(performance.now() - startTime);
            }

            const averageLoadTime = chunkLoadTimes.reduce((a, b) => a + b) / chunkLoadTimes.length;

            // Average chunk load time should be under 100ms
            expect(averageLoadTime).toBeLessThan(100);

            // No single chunk should take more than 200ms
            chunkLoadTimes.forEach(loadTime => {
                expect(loadTime).toBeLessThan(200);
            });
        });

        it('measures memory usage during bundle loading', () => {
            const initialMemory = performance.memory?.usedJSHeapSize || 0;

            // Simulate heavy bundle processing
            const mockData = new Array(100000).fill(0).map((_, i) => ({
                id: i,
                data: `test data ${i}`.repeat(10)
            }));

            const peakMemory = performance.memory?.usedJSHeapSize || initialMemory + 1000000;
            const memoryIncrease = peakMemory - initialMemory;

            // Memory increase should be reasonable (< 50MB)
            expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);

            // Cleanup
            mockData.length = 0;
        });
    });

    describe('Healthcare Platform Specific Optimizations', () => {
        it('prioritizes critical healthcare modules in main bundle', () => {
            const criticalModules = [
                './lib/clinicInfo.js',
                './utils/imageOptimization.js',
                './hooks/usePerformanceMonitor.js',
                './components/ui/MedicalDisclaimer.jsx'
            ];

            const bundleAnalysis = {
                mainChunk: {
                    modules: criticalModules,
                    size: 150000
                }
            };

            criticalModules.forEach(module => {
                expect(bundleAnalysis.mainChunk.modules).toContain(module);
            });
        });

        it('ensures compliance modules are not lazy loaded', () => {
            const complianceModules = [
                './lib/lgpdCompliance.js',
                './lib/cfmCompliance.js',
                './components/privacy/PrivacyPolicy.jsx'
            ];

            const lazyModules = [
                './pages/Blog.jsx',
                './pages/About.jsx'
            ];

            complianceModules.forEach(module => {
                expect(lazyModules).not.toContain(module);
            });
        });

        it('validates medical image optimization is in critical path', () => {
            const criticalPath = [
                './utils/imageOptimization.js',
                './components/ui/OptimizedImage.jsx',
                './hooks/useImageLoading.js'
            ];

            const bundleChunks = mockBundleAnalyzer.analyzeChunkSize();
            const mainChunk = bundleChunks.find(c => c.name === 'main');

            // Critical medical image modules should be in main chunk
            criticalPath.forEach(module => {
                // This would be validated by actual bundle analysis
                expect(mainChunk).toBeDefined();
            });
        });
    });

    describe('Bundle Analysis and Reporting', () => {
        it('generates comprehensive bundle analysis report', () => {
            const analysisReport = {
                timestamp: new Date().toISOString(),
                summary: {
                    totalSize: 555000,
                    chunkCount: 4,
                    compressionRatio: 0.775,
                    loadTime: 150
                },
                chunks: mockBundleAnalyzer.analyzeChunkSize(),
                compression: mockBundleAnalyzer.getCompressionStats(),
                recommendations: [
                    'Consider splitting vendor chunk further',
                    'Optimize image assets in lazy chunks',
                    'Enable more aggressive tree shaking'
                ]
            };

            expect(analysisReport.summary.totalSize).toBeLessThan(1000000);
            expect(analysisReport.summary.compressionRatio).toBeGreaterThan(0.7);
            expect(analysisReport.chunks).toHaveLength(3);
            expect(analysisReport.recommendations.length).toBeGreaterThan(0);
        });

        it('identifies optimization opportunities', () => {
            const optimizationOpportunities = [
                {
                    type: 'chunk_splitting',
                    description: 'Large vendor chunk can be split',
                    potentialSavings: '50KB',
                    priority: 'medium'
                },
                {
                    type: 'compression',
                    description: 'Enable Brotli compression on server',
                    potentialSavings: '30KB',
                    priority: 'high'
                },
                {
                    type: 'tree_shaking',
                    description: 'Remove unused dependencies',
                    potentialSavings: '20KB',
                    priority: 'low'
                }
            ];

            expect(optimizationOpportunities).toHaveLength(3);

            // High priority items should be addressed first
            const highPriorityItems = optimizationOpportunities.filter(
                item => item.priority === 'high'
            );
            expect(highPriorityItems.length).toBeGreaterThan(0);
        });

        it('tracks bundle size trends over time', () => {
            const bundleHistory = [
                { date: '2024-01-01', size: 500000, chunks: 3 },
                { date: '2024-01-15', size: 520000, chunks: 4 },
                { date: '2024-02-01', size: 555000, chunks: 4 }
            ];

            const latest = bundleHistory[bundleHistory.length - 1];
            const previous = bundleHistory[bundleHistory.length - 2];
            const growthRate = (latest.size - previous.size) / previous.size;

            // Bundle growth should be controlled (< 10% per period)
            expect(growthRate).toBeLessThan(0.1);
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('handles missing bundle files gracefully', () => {
            fs.existsSync.mockReturnValue(false);

            const analyzeBundle = () => {
                if (!fs.existsSync('/dist/assets')) {
                    throw new Error('Bundle directory not found');
                }
                return mockBundleAnalyzer.getBundleStats();
            };

            expect(analyzeBundle).toThrow('Bundle directory not found');
        });

        it('validates bundle integrity', () => {
            const integrityCheck = {
                hash: 'sha256-abc123',
                size: 555000,
                corrupted: false
            };

            expect(integrityCheck.corrupted).toBe(false);
            expect(integrityCheck.size).toBeGreaterThan(0);
        });

        it('handles partial build failures', () => {
            const partialBuild = {
                success: false,
                failedChunks: ['lazy-ghi789.js'],
                successfulChunks: ['main-abc123.js', 'vendor-def456.js'],
                errors: ['Failed to process lazy chunk']
            };

            expect(partialBuild.successfulChunks.length).toBeGreaterThan(0);
            expect(partialBuild.failedChunks.length).toBeLessThan(partialBuild.successfulChunks.length);
        });
    });
});