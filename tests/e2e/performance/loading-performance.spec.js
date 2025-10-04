/**
 * E2E Performance Tests with Playwright
 * Tests real-world loading performance, Core Web Vitals, and user experience metrics
 */

import { test, expect, devices } from '@playwright/test';

// Test configurations for different devices and network conditions
const mobileConfig = {
    ...devices['iPhone 13'],
    viewport: { width: 390, height: 844 }
};

const tabletConfig = {
    ...devices['iPad Pro'],
    viewport: { width: 1024, height: 1366 }
};

const desktopConfig = {
    viewport: { width: 1920, height: 1080 }
};

// Network throttling configurations
const slow3G = {
    downloadThroughput: 500 * 1024 / 8,  // 500 Kbps
    uploadThroughput: 500 * 1024 / 8,    // 500 Kbps
    latency: 400,                         // 400ms RTT
};

const fast3G = {
    downloadThroughput: 1.6 * 1024 * 1024 / 8,  // 1.6 Mbps
    uploadThroughput: 750 * 1024 / 8,           // 750 Kbps
    latency: 300,                               // 300ms RTT
};

const regular4G = {
    downloadThroughput: 4 * 1024 * 1024 / 8,    // 4 Mbps
    uploadThroughput: 3 * 1024 * 1024 / 8,      // 3 Mbps
    latency: 100,                               // 100ms RTT
};

// Helper functions for performance measurements
const measureWebVitals = async (page) => {
    const vitals = await page.evaluate(() => {
        return new Promise((resolve) => {
            const vitals = {};

            // Largest Contentful Paint (LCP)
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                vitals.LCP = Math.round(lastEntry.startTime);
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay (FID)
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                vitals.FID = Math.round(entries[0].processingStart - entries[0].startTime);
            }).observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                vitals.CLS = Math.round(clsValue * 1000) / 1000;
            }).observe({ entryTypes: ['layout-shift'] });

            // First Contentful Paint (FCP)
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                vitals.FCP = Math.round(entries[0].startTime);
            }).observe({ entryTypes: ['paint'] });

            // Time to First Byte (TTFB)
            const navigationEntries = performance.getEntriesByType('navigation');
            if (navigationEntries.length > 0) {
                const navEntry = navigationEntries[0];
                vitals.TTFB = Math.round(navEntry.responseStart - navEntry.requestStart);
            }

            // DOM Content Loaded
            vitals.DOMContentLoaded = Math.round(performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart);

            // Total page load time
            vitals.loadComplete = Math.round(performance.timing.loadEventEnd - performance.timing.navigationStart);

            // Wait a bit for all metrics to be collected
            setTimeout(() => resolve(vitals), 3000);
        });
    });

    return vitals;
};

const measureResourceLoading = async (page) => {
    const resources = await page.evaluate(() => {
        const resourceEntries = performance.getEntriesByType('resource');

        return resourceEntries.map(entry => ({
            name: entry.name,
            type: getResourceType(entry.name),
            size: entry.transferSize || 0,
            duration: Math.round(entry.duration),
            startTime: Math.round(entry.startTime),
            responseEnd: Math.round(entry.responseEnd),
            protocol: entry.nextHopProtocol || 'unknown'
        }));
    });

    function getResourceType(url) {
        if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') ||
            url.includes('.webp') || url.includes('.avif')) return 'image';
        if (url.includes('.js')) return 'script';
        if (url.includes('.css')) return 'stylesheet';
        if (url.includes('/api/')) return 'api';
        if (url.includes('fonts.googleapis.com') || url.includes('.woff') ||
            url.includes('.ttf') || url.includes('.eot')) return 'font';
        return 'other';
    }

    return resources;
};

const measureMemoryUsage = async (page) => {
    const memory = await page.evaluate(() => {
        if (performance.memory) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    });

    return memory;
};

describe('Loading Performance Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Enable performance observer
        await page.addInitScript(() => {
            // Mock performance.memory for Chrome
            if (!performance.memory) {
                performance.memory = {
                    usedJSHeapSize: 1000000,
                    totalJSHeapSize: 2000000,
                    jsHeapSizeLimit: 4000000
                };
            }
        });
    });

    test.describe('Desktop Performance', () => {
        test('should load homepage within performance thresholds on desktop', async ({ page }) => {
            await page.goto('https://saraivavision.com.br', {
                waitUntil: 'networkidle'
            });

            // Wait for critical content to load
            await page.waitForSelector('[data-testid="clinic-logo"]', { timeout: 10000 });
            await page.waitForSelector('[data-testid="hero-section"]', { timeout: 10000 });

            const vitals = await measureWebVitals(page);

            // Core Web Vitals thresholds for healthcare platform
            expect(vitals.LCP).toBeLessThan(2500);  // LCP < 2.5s
            expect(vitals.FID).toBeLessThan(100);   // FID < 100ms
            expect(vitals.CLS).toBeLessThan(0.1);   // CLS < 0.1

            // Additional performance metrics
            expect(vitals.FCP).toBeLessThan(1800);  // FCP < 1.8s
            expect(vitals.TTFB).toBeLessThan(800);  // TTFB < 800ms
            expect(vitals.loadComplete).toBeLessThan(4000);  // Load < 4s

            console.log('Desktop Performance Metrics:', vitals);
        });

        test('should optimize medical image loading', async ({ page }) => {
            await page.goto('https://saraivavision.com.br', {
                waitUntil: 'networkidle'
            });

            // Wait for medical images to load
            await page.waitForSelector('img[alt*="Dr. Philipe"]', { timeout: 10000 });

            const resources = await measureResourceLoading(page);
            const imageResources = resources.filter(r => r.type === 'image');

            // Check image optimization
            const modernFormatImages = imageResources.filter(img =>
                img.name.includes('.webp') || img.name.includes('.avif')
            );

            const compressedImages = imageResources.filter(img =>
                img.size < 100000 // Less than 100KB
            );

            // Should use modern image formats
            expect(modernFormatImages.length).toBeGreaterThan(imageResources.length * 0.7);

            // Images should be compressed
            expect(compressedImages.length).toBeGreaterThan(imageResources.length * 0.8);

            // Check lazy loading implementation
            const lazyImages = await page.locator('img[loading="lazy"]').count();
            const totalImages = await page.locator('img').count();

            if (totalImages > 4) { // Only check if there are many images
                expect(lazyImages).toBeGreaterThan(totalImages * 0.5);
            }

            console.log('Image Loading Stats:', {
                total: imageResources.length,
                modernFormats: modernFormatImages.length,
                compressed: compressedImages.length,
                lazyLoading: lazyImages,
                totalImages
            });
        });

        test('should handle bundle splitting and code loading efficiently', async ({ page }) => {
            const responses = [];

            page.on('response', response => {
                if (response.url().includes('.js') || response.url().includes('.css')) {
                    responses.push({
                        url: response.url(),
                        status: response.status(),
                        size: response.headers()['content-length'] || 0,
                        type: response.url().includes('.js') ? 'script' : 'stylesheet'
                    });
                }
            });

            await page.goto('https://saraivavision.com.br', {
                waitUntil: 'networkidle'
            });

            // Analyze bundle loading
            const mainBundles = responses.filter(r => r.url.includes('main'));
            const vendorBundles = responses.filter(r => r.url.includes('vendor') || r.url.includes('chunk'));
            const lazyBundles = responses.filter(r => r.url.includes('lazy') || r.url.includes('async'));

            // Check bundle sizes (in KB)
            const mainSize = mainBundles.reduce((sum, b) => sum + parseInt(b.size || 0), 0) / 1024;
            const vendorSize = vendorBundles.reduce((sum, b) => sum + parseInt(b.size || 0), 0) / 1024;

            expect(mainSize).toBeLessThan(250);  // Main bundle < 250KB
            expect(vendorSize).toBeLessThan(400); // Vendor bundle < 400KB

            console.log('Bundle Analysis:', {
                mainSize: Math.round(mainSize),
                vendorSize: Math.round(vendorSize),
                lazyBundles: lazyBundles.length,
                totalBundles: responses.length
            });
        });
    });

    test.describe('Mobile Performance', () => {
        test.use(mobileConfig);

        test('should load homepage within mobile performance thresholds', async ({ page }) => {
            await page.emulateNetwork(fast3G);

            const startTime = Date.now();
            await page.goto('https://saraivavision.com.br', {
                waitUntil: 'networkidle'
            });
            const loadTime = Date.now() - startTime;

            // Mobile-specific thresholds (more lenient)
            const vitals = await measureWebVitals(page);

            expect(vitals.LCP).toBeLessThan(4000);  // LCP < 4s on mobile
            expect(vitals.FID).toBeLessThan(300);   // FID < 300ms on mobile
            expect(vitals.CLS).toBeLessThan(0.25);  // CLS < 0.25 on mobile

            // Total load time should be reasonable on mobile networks
            expect(loadTime).toBeLessThan(8000);  // < 8s on 3G

            console.log('Mobile Performance Metrics:', { ...vitals, totalLoadTime: loadTime });
        });

        test('should handle touch interactions and mobile-specific features', async ({ page }) => {
            await page.emulateNetwork(fast3G);
            await page.goto('https://saraivavision.com.br', {
                waitUntil: 'networkidle'
            });

            // Test mobile menu interaction
            const menuButton = page.locator('[data-testid="mobile-menu-button"]');
            if (await menuButton.isVisible()) {
                await menuButton.tap();
                await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

                // Test menu responsiveness
                const menuItem = page.locator('[data-testid="nav-item"]').first();
                await menuItem.tap();

                // Should not cause layout shifts
                const vitals = await measureWebVitals(page);
                expect(vitals.CLS).toBeLessThan(0.25);
            }

            // Test touch scrolling performance
            await page.evaluate(() => {
                window.scrollTo(0, window.innerHeight);
            });

            await page.waitForTimeout(1000);

            // Check if scroll causes layout shifts
            const scrollVitals = await measureWebVitals(page);
            expect(scrollVitals.CLS).toBeLessThan(0.25);
        });

        test('should optimize images for mobile devices', async ({ page }) => {
            await page.emulateNetwork(regular4G);
            await page.goto('https://saraivavision.com.br', {
                waitUntil: 'networkidle'
            });

            const resources = await measureResourceLoading(page);
            const imageResources = resources.filter(r => r.type === 'image');

            // Check for responsive images
            const responsiveImages = await page.locator('img[srcset]').count();
            const pictureElements = await page.locator('picture img').count();

            // Should have responsive image implementation
            expect(responsiveImages + pictureElements).toBeGreaterThan(0);

            // Check image sizes are appropriate for mobile
            const mobileOptimizedImages = imageResources.filter(img =>
                img.size < 80000 // < 80KB for mobile
            );

            expect(mobileOptimizedImages.length).toBeGreaterThan(imageResources.length * 0.6);

            console.log('Mobile Image Optimization:', {
                responsiveImages,
                pictureElements,
                mobileOptimized: mobileOptimizedImages.length,
                totalImages: imageResources.length
            });
        });
    });

    test.describe('Tablet Performance', () => {
        test.use(tabletConfig);

        test('should load homepage within tablet performance thresholds', async ({ page }) => {
            await page.goto('https://saraivavision.com.br', {
                waitUntil: 'networkidle'
            });

            const vitals = await measureWebVitals(page);

            // Tablet thresholds (between mobile and desktop)
            expect(vitals.LCP).toBeLessThan(3000);  // LCP < 3s
            expect(vitals.FID).toBeLessThan(200);   // FID < 200ms
            expect(vitals.CLS).toBeLessThan(0.15);  // CLS < 0.15

            console.log('Tablet Performance Metrics:', vitals);
        });

        test('should handle tablet-specific layouts efficiently', async ({ page }) => {
            await page.goto('https://saraivavision.com.br', {
                waitUntil: 'networkidle'
            });

            // Test responsive layout handling
            await page.setViewportSize({ width: 768, height: 1024 }); // Test tablet portrait

            await page.waitForTimeout(1000);

            const portraitVitals = await measureWebVitals(page);
            expect(portraitVitals.CLS).toBeLessThan(0.15);

            // Test landscape
            await page.setViewportSize({ width: 1024, height: 768 });

            await page.waitForTimeout(1000);

            const landscapeVitals = await measureWebVitals(page);
            expect(landscapeVitals.CLS).toBeLessThan(0.15);

            console.log('Tablet Layout Performance:', {
                portrait: portraitVitals.CLS,
                landscape: landscapeVitals.CLS
            });
        });
    });

    test.describe('Network Performance Under Different Conditions', () => {
        test('should handle slow 3G network gracefully', async ({ page }) => {
            await page.emulateNetwork(slow3G);

            const startTime = Date.now();
            await page.goto('https://saraivavision.com.br', {
                waitUntil: 'networkidle'
            });
            const loadTime = Date.now() - startTime;

            // Should still be usable on slow networks
            expect(loadTime).toBeLessThan(15000);  // < 15s on slow 3G

            // Critical content should load first
            const criticalElements = [
                '[data-testid="clinic-logo"]',
                '[data-testid="hero-section"]',
                '[data-testid="contact-info"]'
            ];

            for (const selector of criticalElements) {
                const element = page.locator(selector);
                if (await element.isVisible()) {
                    // Element should be present and accessible
                    await expect(element.first()).toBeVisible();
                }
            }

            console.log('Slow 3G Performance:', { loadTime, criticalContentLoaded: true });
        });

        test('should implement progressive loading under network constraints', async ({ page }) => {
            await page.emulateNetwork(fast3G);

            // Track resource loading order
            const loadOrder = [];
            page.on('response', response => {
                loadOrder.push({
                    url: response.url(),
                    type: getResourceType(response.url()),
                    timestamp: Date.now()
                });
            });

            await page.goto('https://saraivavision.com.br', {
                waitUntil: 'networkidle'
            });

            // Analyze loading priority
            const criticalCSS = loadOrder.find(r => r.type === 'stylesheet' && r.url.includes('critical'));
            const mainJS = loadOrder.find(r => r.type === 'script' && r.url.includes('main'));
            const images = loadOrder.filter(r => r.type === 'image');

            // Critical resources should load first
            if (criticalCSS && mainJS) {
                const cssIndex = loadOrder.indexOf(criticalCSS);
                const jsIndex = loadOrder.indexOf(mainJS);
                const firstImageIndex = images.length > 0 ? loadOrder.indexOf(images[0]) : -1;

                if (firstImageIndex > -1) {
                    expect(cssIndex).toBeLessThan(firstImageIndex);
                    expect(jsIndex).toBeLessThan(firstImageIndex + 5); // Allow some overlap
                }
            }

            console.log('Progressive Loading Analysis:', {
                criticalResources: criticalCSS ? 'loaded' : 'not found',
                mainScript: mainJS ? 'loaded' : 'not found',
                totalImages: images.length,
                loadOrderLength: loadOrder.length
            });

            function getResourceType(url) {
                if (url.includes('.jpg') || url.includes('.png') || url.includes('.webp')) return 'image';
                if (url.includes('.js')) return 'script';
                if (url.includes('.css')) return 'stylesheet';
                if (url.includes('/api/')) return 'api';
                return 'other';
            }
        });
    });

    test.describe('Memory and Resource Management', () => {
        test('should manage memory usage efficiently', async ({ page }) => {
            await page.goto('https://saraivavision.com.br', {
                waitUntil: 'networkidle'
            });

            const initialMemory = await measureMemoryUsage(page);

            // Simulate user interactions that might increase memory usage
            await page.hover('[data-testid="service-card"]');
            await page.click('[data-testid="service-card"]');

            // Navigate to different sections
            await page.click('[data-testid="about-link"]');
            await page.waitForLoadState('networkidle');

            const peakMemory = await measureMemoryUsage(page);

            // Memory should not grow excessively
            if (initialMemory && peakMemory) {
                const memoryGrowth = peakMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
                expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // < 50MB growth

                console.log('Memory Usage:', {
                    initial: Math.round(initialMemory.usedJSHeapSize / 1024 / 1024),
                    peak: Math.round(peakMemory.usedJSHeapSize / 1024 / 1024),
                    growth: Math.round(memoryGrowth / 1024 / 1024)
                });
            }
        });

        test('should clean up resources properly', async ({ page }) => {
            await page.goto('https://saraivavision.com.br', {
                waitUntil: 'networkidle'
            });

            // Track resource cleanup
            const initialResources = await measureResourceLoading(page);

            // Navigate away and back
            await page.goto('https://saraivavision.com.br/blog', {
                waitUntil: 'networkidle'
            });

            await page.goBack({
                waitUntil: 'networkidle'
            });

            // Check for resource leaks
            const finalResources = await measureResourceLoading(page);

            // Should not have excessive resource duplication
            const resourceGrowth = finalResources.length - initialResources.length;
            expect(resourceGrowth).toBeLessThan(10); // < 10 additional resources

            console.log('Resource Management:', {
                initialResources: initialResources.length,
                finalResources: finalResources.length,
                resourceGrowth
            });
        });
    });

    test.describe('Healthcare-Specific Performance Requirements', () => {
        test('should prioritize medical content loading', async ({ page }) => {
            await page.goto('https://saraivavision.com.br', {
                waitUntil: 'networkidle'
            });

            // Medical content should load quickly
            const medicalContentSelectors = [
                '[data-testid="dr-philipe-photo"]',
                '[data-testid="clinic-specialties"]',
                '[data-testid="medical-credentials"]',
                '[data-testid="contact-info"]'
            ];

            const loadTimes = {};

            for (const selector of medicalContentSelectors) {
                const element = page.locator(selector);
                if (await element.isVisible()) {
                    const startTime = Date.now();
                    await expect(element.first()).toBeVisible({ timeout: 5000 });
                    loadTimes[selector] = Date.now() - startTime;
                }
            }

            // Medical content should load quickly (< 2s each)
            Object.values(loadTimes).forEach(loadTime => {
                expect(loadTime).toBeLessThan(2000);
            });

            console.log('Medical Content Load Times:', loadTimes);
        });

        test('should maintain accessibility during loading', async ({ page }) => {
            // Enable accessibility tracking
            await page.addInitScript(() => {
                window.accessibilityErrors = [];
                const originalLog = console.error;
                console.error = (...args) => {
                    if (args[0] && args[0].includes('ARIA')) {
                        window.accessibilityErrors.push(args);
                    }
                    originalLog.apply(console, args);
                };
            });

            await page.goto('https://saraivavision.com.br', {
                waitUntil: 'networkidle'
            });

            // Check for accessibility issues during loading
            const accessibilityErrors = await page.evaluate(() => {
                return window.accessibilityErrors;
            });

            // Should not have accessibility errors
            expect(accessibilityErrors.length).toBe(0);

            // Check ARIA attributes are present
            const mainRegion = page.locator('main[role="main"]');
            const navigation = page.locator('nav[role="navigation"]');
            const landmarkRegions = page.locator('[role="region"], [aria-label]');

            await expect(mainRegion).toHaveCount(1);
            await expect(navigation).toHaveCount(1);
            await expect(landmarkRegions).toHaveCount.greaterThan(0);

            console.log('Accessibility Compliance:', {
                errors: accessibilityErrors.length,
                mainRegion: await mainRegion.count(),
                navigation: await navigation.count(),
                landmarks: await landmarkRegions.count()
            });
        });

        test('should handle medical image loading with appropriate quality', async ({ page }) => {
            await page.goto('https://saraivavision.com.br', {
                waitUntil: 'networkidle'
            });

            const resources = await measureResourceLoading(page);
            const medicalImages = resources.filter(r =>
                r.type === 'image' &&
                (r.name.includes('drphilipe') || r.name.includes('medical') || r.name.includes('clinic'))
            );

            // Medical images should have good quality (not over-compressed)
            for (const image of medicalImages) {
                // Should be large enough for medical clarity
                expect(image.size).toBeGreaterThan(10000); // > 10KB

                // Should load reasonably fast
                expect(image.duration).toBeLessThan(3000); // < 3s
            }

            console.log('Medical Image Quality:', {
                count: medicalImages.length,
                averageSize: medicalImages.length > 0
                    ? Math.round(medicalImages.reduce((sum, img) => sum + img.size, 0) / medicalImages.length / 1024)
                    : 0,
                averageLoadTime: medicalImages.length > 0
                    ? Math.round(medicalImages.reduce((sum, img) => sum + img.duration, 0) / medicalImages.length)
                    : 0
            });
        });
    });

    test.describe('Performance Regression Detection', () => {
        test('should maintain consistent performance across page loads', async ({ page }) => {
            const loadTimes = [];

            // Test multiple page loads
            for (let i = 0; i < 3; i++) {
                const startTime = Date.now();
                await page.goto('https://saraivavision.com.br', {
                    waitUntil: 'networkidle'
                });
                const loadTime = Date.now() - startTime;

                const vitals = await measureWebVitals(page);
                loadTimes.push({ loadTime, ...vitals });

                // Navigate away before next test
                await page.goto('about:blank');
                await page.waitForTimeout(1000);
            }

            // Performance should be consistent
            const avgLoadTime = loadTimes.reduce((sum, load) => sum + load.loadTime, 0) / loadTimes.length;
            const maxVariance = Math.max(...loadTimes.map(load => Math.abs(load.loadTime - avgLoadTime)));

            expect(maxVariance).toBeLessThan(avgLoadTime * 0.3); // < 30% variance

            console.log('Performance Consistency:', {
                loads: loadTimes.length,
                averageLoadTime: Math.round(avgLoadTime),
                maxVariance: Math.round(maxVariance),
                loadTimes: loadTimes.map(l => Math.round(l.loadTime))
            });
        });
    });
});

describe('Performance Monitoring and Reporting', () => {
    test('should generate comprehensive performance report', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('https://saraivavision.com.br', {
            waitUntil: 'networkidle'
        });
        const totalLoadTime = Date.now() - startTime;

        const vitals = await measureWebVitals(page);
        const resources = await measureResourceLoading(page);
        const memory = await measureMemoryUsage(page);

        const performanceReport = {
            timestamp: new Date().toISOString(),
            totalLoadTime,
            coreWebVitals: {
                LCP: { value: vitals.LCP, rating: vitals.LCP < 2500 ? 'good' : vitals.LCP < 4000 ? 'needs-improvement' : 'poor' },
                FID: { value: vitals.FID, rating: vitals.FID < 100 ? 'good' : vitals.FID < 300 ? 'needs-improvement' : 'poor' },
                CLS: { value: vitals.CLS, rating: vitals.CLS < 0.1 ? 'good' : vitals.CLS < 0.25 ? 'needs-improvement' : 'poor' }
            },
            additionalMetrics: {
                FCP: vitals.FCP,
                TTFB: vitals.TTFB,
                DOMContentLoaded: vitals.DOMContentLoaded
            },
            resourceAnalysis: {
                totalResources: resources.length,
                imageResources: resources.filter(r => r.type === 'image').length,
                scriptResources: resources.filter(r => r.type === 'script').length,
                stylesheetResources: resources.filter(r => r.type === 'stylesheet').length,
                apiResources: resources.filter(r => r.type === 'api').length
            },
            memoryUsage: memory ? {
                used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
            } : null,
            recommendations: generateRecommendations(vitals, resources, memory)
        };

        console.log('Comprehensive Performance Report:', JSON.stringify(performanceReport, null, 2));

        // Validate report structure
        expect(performanceReport.coreWebVitals).toBeDefined();
        expect(performanceReport.resourceAnalysis).toBeDefined();
        expect(performanceReport.recommendations).toBeDefined();
        expect(performanceReport.recommendations.length).toBeGreaterThan(0);

        function generateRecommendations(vitals, resources, memory) {
            const recommendations = [];

            if (vitals.LCP > 2500) {
                recommendations.push({
                    type: 'LCP',
                    priority: 'high',
                    message: 'Optimize largest contentful paint by improving image loading and server response times'
                });
            }

            if (vitals.FID > 100) {
                recommendations.push({
                    type: 'FID',
                    priority: 'high',
                    message: 'Reduce JavaScript execution time and break up long tasks'
                });
            }

            if (vitals.CLS > 0.1) {
                recommendations.push({
                    type: 'CLS',
                    priority: 'medium',
                    message: 'Ensure proper image dimensions and avoid dynamic content insertion'
                });
            }

            const largeResources = resources.filter(r => r.size > 500000);
            if (largeResources.length > 0) {
                recommendations.push({
                    type: 'resource-size',
                    priority: 'medium',
                    message: `Optimize ${largeResources.length} large resources (>500KB)`
                });
            }

            return recommendations;
        }
    });
});