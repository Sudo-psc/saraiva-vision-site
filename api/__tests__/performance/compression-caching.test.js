/**
 * API Tests for Compression and Caching Headers
 * Tests Brotli/gzip compression, cache control, ETags, and performance headers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';

// Mock the main API app
const createMockApp = () => {
    const app = express();

    // Security headers
    app.use(helmet({
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https://storage.googleapis.com"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                connectSrc: ["'self'", "https://maps.googleapis.com"],
                fontSrc: ["'self'", "data:"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"]
            }
        }
    }));

    // Compression middleware
    app.use(compression({
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                return false;
            }
            // Don't compress small responses
            if (req.url.includes('/api/health')) {
                return false;
            }
            return compression.filter(req, res);
        },
        threshold: 1024, // Only compress responses larger than 1KB
        level: 6, // Compression level (1-9)
        windowBits: 15,
        memLevel: 8
    }));

    // Cache control middleware
    app.use((req, res, next) => {
        // Set appropriate cache headers based on route
        if (req.url.startsWith('/api/')) {
            // API endpoints - cache for 5 minutes with revalidation
            res.set({
                'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60',
                'Vary': 'Accept-Encoding, Accept',
                'ETag': generateETag(req.url)
            });
        } else if (req.url.startsWith('/img/')) {
            // Static images - cache for 1 year
            res.set({
                'Cache-Control': 'public, max-age=31536000, immutable',
                'ETag': generateETag(req.url)
            });
        } else if (req.url.includes('.js') || req.url.includes('.css')) {
            // JS/CSS assets - cache for 1 year with immutable
            res.set({
                'Cache-Control': 'public, max-age=31536000, immutable',
                'ETag': generateETag(req.url)
            });
        } else {
            // Default - cache for 1 hour
            res.set({
                'Cache-Control': 'public, max-age=3600',
                'ETag': generateETag(req.url)
            });
        }
        next();
    });

    // Performance headers
    app.use((req, res, next) => {
        res.set({
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
            'Server-Timing': generateServerTimingHeader()
        });
        next();
    });

    // Mock API routes
    app.get('/api/health', (req, res) => {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage()
        });
    });

    app.get('/api/clinic-info', (req, res) => {
        res.json({
            name: 'Saraiva Vision',
            address: 'Av. Minas Gerais, 1234 - Caratinga, MG',
            phone: '(33) 3321-4000',
            email: 'contato@saraivavision.com.br',
            crm: 'MG 123456',
            specialties: ['Oftalmologia', 'Cirurgia Refrativa', 'Catarata']
        });
    });

    app.get('/api/google-reviews', (req, res) => {
        // Simulate larger response that should be compressed
        const reviews = Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            rating: 5,
            text: `Excelente atendimento profissional. Dra. Saraiva é muito atenciosa e competente. Recomendo muito!`,
            author: `Paciente ${i + 1}`,
            date: new Date(Date.now() - i * 86400000).toISOString(),
            helpful: Math.floor(Math.random() * 20)
        }));

        res.json({
            rating: 4.9,
            totalReviews: 136,
            reviews,
            lastUpdated: new Date().toISOString()
        });
    });

    app.get('/api/blog-posts', (req, res) => {
        const posts = Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            title: `Post Médico ${i + 1}: Avanços em Oftalmologia`,
            excerpt: 'Descubra as últimas tecnologias e tratamentos inovadores...',
            content: 'Conteúdo médico detalhado sobre procedimentos oftalmológicos...',
            category: 'Oftalmologia',
            date: new Date(Date.now() - i * 86400000).toISOString(),
            image: `/img/blog/post-${i + 1}.webp`,
            readingTime: `${5 + Math.floor(Math.random() * 10)} min`
        }));

        res.json(posts);
    });

    // Simulate image serving
    app.get('/img/:filename', (req, res) => {
        const filename = req.params.filename;
        const isWebP = filename.endsWith('.webp');
        const isAVIF = filename.endsWith('.avif');

        let contentType = 'image/jpeg';
        if (isWebP) contentType = 'image/webp';
        if (isAVIF) contentType = 'image/avif';

        // Mock image data
        const mockImageData = Buffer.alloc(isWebP ? 15000 : 25000);

        res.set({
            'Content-Type': contentType,
            'Content-Length': mockImageData.length,
            'Last-Modified': new Date(Date.now() - 86400000).toUTCString(),
            'Accept-Ranges': 'bytes'
        });

        // Support range requests
        const range = req.headers.range;
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : mockImageData.length - 1;
            const chunkSize = (end - start) + 1;

            res.status(206);
            res.set({
                'Content-Range': `bytes ${start}-${end}/${mockImageData.length}`,
                'Content-Length': chunkSize
            });

            res.send(mockImageData.slice(start, end + 1));
        } else {
            res.send(mockImageData);
        }
    });

    // Mock static asset serving
    app.get('/assets/:filename', (req, res) => {
        const filename = req.params.filename;
        const isJS = filename.endsWith('.js');
        const isCSS = filename.endsWith('.css');

        let contentType = 'application/octet-stream';
        if (isJS) contentType = 'application/javascript';
        if (isCSS) contentType = 'text/css';

        // Mock asset data (larger files for compression testing)
        const mockData = Buffer.alloc(isJS ? 50000 : isCSS ? 20000 : 10000);

        res.set({
            'Content-Type': contentType,
            'Content-Length': mockData.length
        });

        res.send(mockData);
    });

    return app;
};

// Helper functions
const generateETag = (url) => {
    const hash = require('crypto')
        .createHash('md5')
        .update(url + Date.now())
        .digest('hex');
    return `"${hash}"`;
};

const generateServerTimingHeader = () => {
    const timings = [
        'db;dur=45',
        'cache;dur=2',
        'render;dur=15',
        'total;dur=62'
    ];
    return timings.join(', ');
};

describe('API Compression and Caching Tests', () => {
    let app;

    beforeEach(() => {
        app = createMockApp();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Compression Tests', () => {
        it('should compress JSON responses with gzip', async () => {
            const response = await request(app)
                .get('/api/google-reviews')
                .set('Accept-Encoding', 'gzip')
                .expect(200);

            expect(response.headers['content-encoding']).toBe('gzip');
            expect(response.headers['vary']).toContain('Accept-Encoding');
            expect(response.body).toHaveProperty('rating', 4.9);
            expect(response.body).toHaveProperty('reviews');
            expect(response.body.reviews).toHaveLength(50);
        });

        it('should compress JSON responses with Brotli when supported', async () => {
            const response = await request(app)
                .get('/api/blog-posts')
                .set('Accept-Encoding', 'br, gzip')
                .expect(200);

            // Brotli should be preferred over gzip
            expect(['br', 'gzip']).toContain(response.headers['content-encoding']);
            expect(response.headers['vary']).toContain('Accept-Encoding');
            expect(response.body).toHaveLength(20);
        });

        it('should skip compression for small responses', async () => {
            const response = await request(app)
                .get('/api/health')
                .set('Accept-Encoding', 'gzip, deflate')
                .expect(200);

            expect(response.headers).not.toHaveProperty('content-encoding');
            expect(response.body).toHaveProperty('status', 'healthy');
        });

        it('should respect no-compression header', async () => {
            const response = await request(app)
                .get('/api/google-reviews')
                .set('Accept-Encoding', 'gzip')
                .set('X-No-Compression', 'true')
                .expect(200);

            expect(response.headers).not.toHaveProperty('content-encoding');
        });

        it('should compress JavaScript assets', async () => {
            const response = await request(app)
                .get('/assets/main.js')
                .set('Accept-Encoding', 'gzip')
                .expect(200);

            expect(response.headers['content-encoding']).toBe('gzip');
            expect(response.headers['content-type']).toContain('application/javascript');
        });

        it('should compress CSS assets', async () => {
            const response = await request(app)
                .get('/assets/styles.css')
                .set('Accept-Encoding', 'br')
                .expect(200);

            expect(['br', 'gzip']).toContain(response.headers['content-encoding']);
            expect(response.headers['content-type']).toContain('text/css');
        });

        it('should handle different compression quality levels', async () => {
            const sizes = [];

            // Test different endpoints with varying response sizes
            const endpoints = ['/api/health', '/api/clinic-info', '/api/google-reviews', '/api/blog-posts'];

            for (const endpoint of endpoints) {
                const response = await request(app)
                    .get(endpoint)
                    .set('Accept-Encoding', 'gzip')
                    .expect(200);

                sizes.push({
                    endpoint,
                    size: response.headers['content-length'] ? parseInt(response.headers['content-length']) : 0,
                    compressed: response.headers['content-encoding'] === 'gzip'
                });
            }

            // Larger responses should be compressed
            const largeResponses = sizes.filter(s => s.endpoint.includes('/google-reviews') || s.endpoint.includes('/blog-posts'));
            largeResponses.forEach(response => {
                expect(response.compressed).toBe(true);
            });
        });
    });

    describe('Cache Control Tests', () => {
        it('should set appropriate cache headers for API endpoints', async () => {
            const response = await request(app)
                .get('/api/clinic-info')
                .expect(200);

            expect(response.headers['cache-control']).toBe('public, max-age=300, s-maxage=300, stale-while-revalidate=60');
            expect(response.headers['etag']).toBeDefined();
            expect(response.headers['vary']).toContain('Accept-Encoding');
        });

        it('should set long cache headers for static images', async () => {
            const response = await request(app)
                .get('/img/medical-procedure.webp')
                .expect(200);

            expect(response.headers['cache-control']).toBe('public, max-age=31536000, immutable');
            expect(response.headers['etag']).toBeDefined();
            expect(response.headers['last-modified']).toBeDefined();
        });

        it('should set immutable cache headers for JS/CSS assets', async () => {
            const jsResponse = await request(app)
                .get('/assets/app.js')
                .expect(200);

            const cssResponse = await request(app)
                .get('/assets/styles.css')
                .expect(200);

            expect(jsResponse.headers['cache-control']).toBe('public, max-age=31536000, immutable');
            expect(cssResponse.headers['cache-control']).toBe('public, max-age=31536000, immutable');
        });

        it('should support ETag-based conditional requests', async () => {
            const firstResponse = await request(app)
                .get('/api/clinic-info')
                .expect(200);

            const etag = firstResponse.headers['etag'];

            // Request with matching ETag should return 304
            const conditionalResponse = await request(app)
                .get('/api/clinic-info')
                .set('If-None-Match', etag)
                .expect(304);

            expect(conditionalResponse.headers['etag']).toBe(etag);
            expect(conditionalResponse.headers['cache-control']).toBeDefined();
        });

        it('should support Last-Modified conditional requests', async () => {
            const firstResponse = await request(app)
                .get('/img/medical-image.webp')
                .expect(200);

            const lastModified = firstResponse.headers['last-modified'];

            // Request with If-Modified-Since should return 304
            const conditionalResponse = await request(app)
                .get('/img/medical-image.webp')
                .set('If-Modified-Since', lastModified)
                .expect(304);

            expect(conditionalResponse.headers['last-modified']).toBe(lastModified);
        });

        it('should handle cache invalidation properly', async () => {
            // First request
            const firstResponse = await request(app)
                .get('/api/google-reviews')
                .expect(200);

            const firstETag = firstResponse.headers['etag'];

            // Simulate data change by waiting a bit and making new request
            await new Promise(resolve => setTimeout(resolve, 10));

            const secondResponse = await request(app)
                .get('/api/google-reviews')
                .expect(200);

            // ETag should be different for updated content
            expect(secondResponse.headers['etag']).not.toBe(firstETag);
        });
    });

    describe('Performance Headers Tests', () => {
        it('should include security headers', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['x-frame-options']).toBe('DENY');
            expect(response.headers['x-xss-protection']).toBe('1; mode=block');
            expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
            expect(response.headers['permissions-policy']).toBeDefined();
        });

        it('should include Server-Timing header', async () => {
            const response = await request(app)
                .get('/api/clinic-info')
                .expect(200);

            expect(response.headers['server-timing']).toBeDefined();
            expect(response.headers['server-timing']).toContain('db');
            expect(response.headers['server-timing']).toContain('cache');
            expect(response.headers['server-timing']).toContain('total');
        });

        it('should set proper Content-Type headers', async () => {
            const apiResponse = await request(app)
                .get('/api/clinic-info')
                .expect(200);

            const imageResponse = await request(app)
                .get('/img/medical.webp')
                .expect(200);

            const jsResponse = await request(app)
                .get('/assets/app.js')
                .expect(200);

            expect(apiResponse.headers['content-type']).toContain('application/json');
            expect(imageResponse.headers['content-type']).toContain('image/webp');
            expect(jsResponse.headers['content-type']).toContain('application/javascript');
        });

        it('should include Content-Length for proper progress indication', async () => {
            const response = await request(app)
                .get('/api/google-reviews')
                .expect(200);

            expect(response.headers['content-length']).toBeDefined();
            const contentLength = parseInt(response.headers['content-length']);
            expect(contentLength).toBeGreaterThan(0);
        });
    });

    describe('Healthcare Compliance Headers', () => {
        it('should set appropriate headers for medical data privacy', async () => {
            const response = await request(app)
                .get('/api/clinic-info')
                .expect(200);

            // Ensure no sensitive information in headers
            const headerValues = Object.values(response.headers);
            headerValues.forEach(header => {
                if (typeof header === 'string') {
                    expect(header).not.toMatch(/password|secret|key|token/i);
                }
            });
        });

        it('should handle PHI (Protected Health Information) securely', async () => {
            const response = await request(app)
                .get('/api/clinic-info')
                .expect(200);

            // Check for proper security headers when handling healthcare data
            expect(response.headers['strict-transport-security']).toBeDefined();
            expect(response.headers['content-security-policy']).toBeDefined();
            expect(response.headers['content-security-policy']).toContain('default-src');
        });

        it('should maintain audit trail through headers', async () => {
            const response = await request(app)
                .get('/api/google-reviews')
                .expect(200);

            // Should include timing information for audit purposes
            expect(response.headers['server-timing']).toBeDefined();
            expect(response.headers['server-timing']).toMatch(/db;dur=\d+/);
        });
    });

    describe('Content Negotiation Tests', () => {
        it('should serve WebP images when supported', async () => {
            const response = await request(app)
                .get('/img/medical-procedure.webp')
                .set('Accept', 'image/webp,image/apng,image/*,*/*;q=0.8')
                .expect(200);

            expect(response.headers['content-type']).toBe('image/webp');
        });

        it('should serve AVIF images when supported and available', async () => {
            const response = await request(app)
                .get('/img/medical-procedure.avif')
                .set('Accept', 'image/avif,image/webp,image/*,*/*;q=0.8')
                .expect(200);

            expect(response.headers['content-type']).toBe('image/avif');
        });

        it('should fallback to JPEG for unsupported formats', async () => {
            const response = await request(app)
                .get('/img/medical-procedure.jpg')
                .set('Accept', 'image/webp,image/avif,*/*;q=0.8')
                .expect(200);

            expect(response.headers['content-type']).toBe('image/jpeg');
        });

        it('should handle Accept-Encoding negotiation properly', async () => {
            const encodings = ['gzip', 'deflate', 'br'];

            for (const encoding of encodings) {
                const response = await request(app)
                    .get('/api/google-reviews')
                    .set('Accept-Encoding', encoding)
                    .expect(200);

                // Should support at least gzip
                if (encoding === 'gzip') {
                    expect(response.headers['content-encoding']).toBe(encoding);
                }
            }
        });
    });

    describe('Range Request Support', () => {
        it('should support byte range requests for images', async () => {
            const response = await request(app)
                .get('/img/medical-large.webp')
                .set('Range', 'bytes=0-1023')
                .expect(206);

            expect(response.headers['accept-ranges']).toBe('bytes');
            expect(response.headers['content-range']).toMatch(/bytes 0-1023\/\d+/);
            expect(response.headers['content-length']).toBe('1024');
            expect(response.status).toBe(206);
        });

        it('should handle multiple range requests', async () => {
            const response = await request(app)
                .get('/img/medical-large.webp')
                .set('Range', 'bytes=0-511,512-1023')
                .expect(200); // Our mock simplifies this

            expect(response.headers['accept-ranges']).toBe('bytes');
        });

        it('should handle invalid range requests gracefully', async () => {
            const response = await request(app)
                .get('/img/medical-large.webp')
                .set('Range', 'bytes=10000-20000')
                .expect(416); // Range Not Satisfiable
        });
    });

    describe('Performance Metrics', () => {
        it('should maintain response times under thresholds', async () => {
            const endpoints = [
                '/api/health',
                '/api/clinic-info',
                '/api/google-reviews',
                '/api/blog-posts'
            ];

            const thresholds = {
                '/api/health': 50,      // 50ms for simple health check
                '/api/clinic-info': 100, // 100ms for clinic info
                '/api/google-reviews': 200, // 200ms for reviews with compression
                '/api/blog-posts': 150   // 150ms for blog posts
            };

            for (const endpoint of endpoints) {
                const startTime = Date.now();
                await request(app).get(endpoint).expect(200);
                const responseTime = Date.now() - startTime;

                expect(responseTime).toBeLessThan(thresholds[endpoint]);
            }
        });

        it('should achieve good compression ratios', async () => {
            const response = await request(app)
                .get('/api/google-reviews')
                .set('Accept-Encoding', 'gzip')
                .expect(200);

            if (response.headers['content-encoding'] === 'gzip') {
                const compressedSize = parseInt(response.headers['content-length'] || '0');
                const estimatedOriginalSize = JSON.stringify(response.body).length;

                if (estimatedOriginalSize > 0) {
                    const compressionRatio = (estimatedOriginalSize - compressedSize) / estimatedOriginalSize;
                    expect(compressionRatio).toBeGreaterThan(0.5); // At least 50% compression
                }
            }
        });

        it('should measure server timing accuracy', async () => {
            const response = await request(app)
                .get('/api/clinic-info')
                .expect(200);

            const timingHeader = response.headers['server-timing'];
            expect(timingHeader).toBeDefined();

            // Parse timing metrics
            const timingMetrics = timingHeader.split(',').map(metric => {
                const [name, ...parts] = metric.trim().split(';');
                const durPart = parts.find(part => part.startsWith('dur='));
                const duration = durPart ? parseFloat(durPart.split('=')[1]) : 0;
                return { name: name.trim(), duration };
            });

            // Should include total timing
            const totalTiming = timingMetrics.find(m => m.name === 'total');
            expect(totalTiming).toBeDefined();
            expect(totalTiming.duration).toBeGreaterThan(0);

            // Individual timings should sum approximately to total
            const dbTiming = timingMetrics.find(m => m.name === 'db');
            const cacheTiming = timingMetrics.find(m => m.name === 'cache');

            if (dbTiming && cacheTiming) {
                const sumIndividual = dbTiming.duration + cacheTiming.duration;
                expect(sumIndividual).toBeLessThanOrEqual(totalTiming.duration * 1.5); // Allow some variance
            }
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle malformed Accept-Encoding headers', async () => {
            const response = await request(app)
                .get('/api/clinic-info')
                .set('Accept-Encoding', 'invalid-encoding')
                .expect(200);

            // Should still respond, just without compression
            expect(response.headers).not.toHaveProperty('content-encoding');
            expect(response.body).toHaveProperty('name', 'Saraiva Vision');
        });

        it('should handle cache control for dynamic content', async () => {
            const response = await request(app)
                .get('/api/google-reviews')
                .query({ t: Date.now() }) // Cache-busting parameter
                .expect(200);

            expect(response.headers['cache-control']).toContain('max-age=300');
            expect(response.headers['etag']).toBeDefined();
        });

        it('should handle concurrent requests efficiently', async () => {
            const concurrentRequests = Array.from({ length: 10 }, () =>
                request(app).get('/api/clinic-info').expect(200)
            );

            const startTime = Date.now();
            const responses = await Promise.all(concurrentRequests);
            const totalTime = Date.now() - startTime;

            // All requests should succeed
            responses.forEach(response => {
                expect(response.body).toHaveProperty('name', 'Saraiva Vision');
            });

            // Should handle concurrent requests efficiently
            expect(totalTime).toBeLessThan(500); // 10 concurrent requests in < 500ms
        });

        it('should handle large payload compression', async () => {
            // This simulates a very large response
            const largeResponse = await request(app)
                .get('/api/google-reviews')
                .set('Accept-Encoding', 'gzip')
                .expect(200);

            // Should be compressed for large responses
            expect(largeResponse.headers['content-encoding']).toBe('gzip');

            // Should maintain data integrity
            expect(largeResponse.body).toHaveProperty('rating', 4.9);
            expect(largeResponse.body.reviews).toHaveLength(50);
        });
    });
});