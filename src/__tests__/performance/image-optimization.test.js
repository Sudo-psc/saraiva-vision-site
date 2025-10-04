/**
 * Comprehensive Test Suite for Image Optimization Utilities
 * Tests WebP/AVIF format detection, compression, lazy loading, and optimization
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    initImageOptimization,
    destroyImageOptimization,
    getOptimizedImageUrl,
    getSupportedImageFormat,
    preloadCriticalImages,
    ProgressiveImage,
    ImageLazyLoader,
    imageOptimizationStyles
} from '../../utils/imageOptimization.js';

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
const mockUnobserve = vi.fn();

vi.mock('intersection-observer', () => ({
    default: vi.fn()
}));

global.IntersectionObserver = vi.fn().mockImplementation((callback, options) => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
    unobserve: mockUnobserve,
    root: options?.root || null,
    rootMargin: options?.rootMargin || '0px',
    threshold: options?.threshold || 0
}));

// Mock DOM methods
global.document = {
    createElement: vi.fn().mockReturnValue({
        rel: '',
        as: '',
        href: '',
        type: '',
        appendChild: vi.fn()
    }),
    head: {
        appendChild: vi.fn()
    },
    body: {
        appendChild: vi.fn()
    },
    readyState: 'complete',
    querySelectorAll: vi.fn(),
    addEventListener: vi.fn(),
    dispatchEvent: vi.fn()
};

global.Image = vi.fn().mockImplementation(() => ({
    src: '',
    onload: null,
    onerror: null,
    width: 0,
    height: 0,
    classList: {
        add: vi.fn(),
        remove: vi.fn()
    },
    style: {},
    dataset: {},
    dispatchEvent: vi.fn()
}));

global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 0));

describe('Image Optimization Utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset DOM mocks
        global.document.readyState = 'complete';
    });

    afterEach(() => {
        destroyImageOptimization();
    });

    describe('getSupportedImageFormat', () => {
        it('detects AVIF support when canvas returns AVIF data URL', () => {
            const mockCanvas = document.createElement('canvas');
            mockCanvas.toDataURL = vi.fn()
                .mockReturnValueOnce('data:image/avif;base64,test')
                .mockReturnValueOnce('data:image/webp;base64,test');

            global.document.createElement = vi.fn().mockReturnValue(mockCanvas);

            const format = getSupportedImageFormat();
            expect(format).toBe('avif');
        });

        it('detects WebP support when AVIF is not supported', () => {
            const mockCanvas = document.createElement('canvas');
            mockCanvas.toDataURL = vi.fn()
                .mockReturnValueOnce('data:image/png;base64,test')
                .mockReturnValueOnce('data:image/webp;base64,test');

            global.document.createElement = vi.fn().mockReturnValue(mockCanvas);

            const format = getSupportedImageFormat();
            expect(format).toBe('webp');
        });

        it('falls back to JPG when neither AVIF nor WebP is supported', () => {
            const mockCanvas = document.createElement('canvas');
            mockCanvas.toDataURL = vi.fn()
                .mockReturnValueOnce('data:image/png;base64,test')
                .mockReturnValueOnce('data:image/jpeg;base64,test');

            global.document.createElement = vi.fn().mockReturnValue(mockCanvas);

            const format = getSupportedImageFormat();
            expect(format).toBe('jpg');
        });
    });

    describe('getOptimizedImageUrl', () => {
        it('optimizes Google Cloud Storage URLs with parameters', () => {
            const baseUrl = 'https://storage.googleapis.com/bucket/image.jpg';
            const options = { width: 800, height: 600, quality: 90, format: 'webp' };

            const optimizedUrl = getOptimizedImageUrl(baseUrl, options);

            expect(optimizedUrl).toContain('w=800');
            expect(optimizedUrl).toContain('h=600');
            expect(optimizedUrl).toContain('q=90');
            expect(optimizedUrl).toContain('fm=webp');
        });

        it('optimizes Cloudinary URLs with parameters', () => {
            const baseUrl = 'https://res.cloudinary.com/cloud/image/upload/image.jpg';
            const options = { width: 1200, quality: 85, format: 'avif' };

            const optimizedUrl = getOptimizedImageUrl(baseUrl, options);

            expect(optimizedUrl).toContain('w=1200');
            expect(optimizedUrl).toContain('q=85');
            expect(optimizedUrl).toContain('fm=avif');
        });

        it('replaces local image extensions with supported format', () => {
            const baseUrl = '/img/medical-photo.jpg';
            vi.mocked(getSupportedImageFormat).mockReturnValue('webp');

            const optimizedUrl = getOptimizedImageUrl(baseUrl, { format: 'webp' });

            expect(optimizedUrl).toBe('/img/medical-photo.webp');
        });

        it('handles PNG images with format conversion', () => {
            const baseUrl = '/img/clinic-logo.png';

            const optimizedUrl = getOptimizedImageUrl(baseUrl, { format: 'avif' });

            expect(optimizedUrl).toBe('/img/clinic-logo.avif');
        });

        it('applies default quality when not specified', () => {
            const baseUrl = 'https://storage.googleapis.com/bucket/image.jpg';

            const optimizedUrl = getOptimizedImageUrl(baseUrl, { width: 800 });

            expect(optimizedUrl).toContain('q=85');
        });
    });

    describe('preloadCriticalImages', () => {
        it('creates preload link tags for critical images', () => {
            const mockLink = {
                rel: '',
                as: '',
                href: '',
                type: '',
                appendChild: vi.fn()
            };
            global.document.createElement = vi.fn().mockReturnValue(mockLink);

            preloadCriticalImages();

            expect(global.document.createElement).toHaveBeenCalledWith('link');
            expect(mockLink.rel).toBe('preload');
            expect(mockLink.as).toBe('image');
            expect(mockLink.href).toBeDefined();
        });

        it('sets correct MIME type for WebP images', () => {
            const mockLink = { rel: '', as: '', href: '', type: '', appendChild: vi.fn() };
            global.document.createElement = vi.fn().mockReturnValue(mockLink);

            // Mock critical image list to include WebP
            vi.doMock('../../utils/imageOptimization.js', async () => {
                const actual = await vi.importActual('../../utils/imageOptimization.js');
                return {
                    ...actual,
                    PRELOAD_IMAGES: ['/img/logo.webp']
                };
            });

            preloadCriticalImages();

            expect(mockLink.type).toBe('image/webp');
        });
    });

    describe('ProgressiveImage', () => {
        let progressiveImage;
        let mockImgElement;

        beforeEach(() => {
            mockImgElement = {
                src: '',
                classList: {
                    add: vi.fn(),
                    remove: vi.fn()
                }
            };
        });

        it('loads small image first with blur effect', () => {
            progressiveImage = new ProgressiveImage('/img/small.jpg', '/img/large.jpg');

            const mockSmallImg = new Image();
            mockSmallImg.src = '/img/small.jpg';
            mockSmallImg.onload = vi.fn().mockImplementation(() => {
                expect(mockImgElement.src).toBe('/img/small.jpg');
                expect(mockImgElement.classList.add).toHaveBeenCalledWith('progressive-image-blur');
            });

            progressiveImage.load(mockImgElement);
            mockSmallImg.onload();
        });

        it('loads large image after small image loads', () => {
            progressiveImage = new ProgressiveImage('/img/small.jpg', '/img/large.jpg');

            const mockLargeImg = new Image();
            mockLargeImg.src = '/img/large.jpg';
            mockLargeImg.onload = vi.fn().mockImplementation(() => {
                expect(mockImgElement.src).toBe('/img/large.jpg');
                expect(mockImgElement.classList.remove).toHaveBeenCalledWith('progressive-image-blur');
                expect(mockImgElement.classList.add).toHaveBeenCalledWith('progressive-image-loaded');
            });

            progressiveImage.load(mockImgElement);

            // Simulate small image loaded first
            setTimeout(() => {
                mockLargeImg.onload();
            }, 0);
        });
    });

    describe('ImageLazyLoader', () => {
        let lazyLoader;
        let mockImages;

        beforeEach(() => {
            mockImages = [
                {
                    dataset: { src: '/img/test1.jpg', srcset: '/img/test1-2x.jpg 2x' },
                    style: {},
                    classList: { add: vi.fn(), remove: vi.fn() },
                    dispatchEvent: vi.fn()
                },
                {
                    dataset: { src: '/img/test2.jpg' },
                    style: {},
                    classList: { add: vi.fn(), remove: vi.fn() },
                    dispatchEvent: vi.fn()
                }
            ];

            lazyLoader = new ImageLazyLoader();
        });

        afterEach(() => {
            lazyLoader.disconnect();
        });

        it('observes images with data-src attribute', () => {
            lazyLoader.observe(mockImages);

            expect(mockObserve).toHaveBeenCalledTimes(2);
            expect(mockImages[0].classList.add).toHaveBeenCalledWith('blur-load');
            expect(mockImages[1].classList.add).toHaveBeenCalledWith('blur-load');
        });

        it('loads image when it intersects with viewport', () => {
            lazyLoader.observe(mockImages);

            // Simulate intersection
            const mockEntries = [
                {
                    target: mockImages[0],
                    isIntersecting: true
                }
            ];

            const callback = global.IntersectionObserver.mock.calls[0][0];
            callback(mockEntries, mockUnobserve);

            expect(mockUnobserve).toHaveBeenCalledWith(mockImages[0]);
            expect(mockImages[0].style.opacity).toBe('0');
        });

        it('handles image load errors gracefully', () => {
            const mockTempImg = {
                onload: null,
                onerror: null,
                src: ''
            };

            global.Image = vi.fn().mockImplementation(() => mockTempImg);

            lazyLoader.observe(mockImages);

            // Simulate intersection and load error
            const mockEntries = [{ target: mockImages[0], isIntersecting: true }];
            const callback = global.IntersectionObserver.mock.calls[0][0];
            callback(mockEntries, mockUnobserve);

            // Trigger error
            mockTempImg.onerror && mockTempImg.onerror();

            expect(mockImages[0].src).toBe('/img/placeholder.svg');
        });

        it('applies fade-in effect after successful load', () => {
            const mockTempImg = {
                onload: null,
                onerror: null,
                src: ''
            };

            global.Image = vi.fn().mockImplementation(() => mockTempImg);

            lazyLoader.observe(mockImages);

            // Simulate intersection
            const mockEntries = [{ target: mockImages[0], isIntersecting: true }];
            const callback = global.IntersectionObserver.mock.calls[0][0];
            callback(mockEntries, mockUnobserve);

            // Trigger successful load
            mockTempImg.onload && mockTempImg.onload();

            expect(mockImages[0].classList.remove).toHaveBeenCalledWith('blur-load');
            expect(requestAnimationFrame).toHaveBeenCalled();
            expect(mockImages[0].style.transition).toBe('opacity 0.3s ease-in-out');
        });

        it('falls back to immediate loading for browsers without IntersectionObserver', () => {
            // Remove IntersectionObserver support
            global.IntersectionObserver = undefined;

            const fallbackLoader = new ImageLazyLoader();
            const loadSpy = vi.spyOn(fallbackLoader, 'loadImage');

            fallbackLoader.observe(mockImages);

            expect(loadSpy).toHaveBeenCalledTimes(2);
        });
    });

    describe('initImageOptimization', () => {
        it('injects optimization styles into document head', () => {
            const mockStyle = {
                textContent: '',
                appendChild: vi.fn()
            };
            global.document.createElement = vi.fn().mockReturnValue(mockStyle);

            initImageOptimization();

            expect(global.document.createElement).toHaveBeenCalledWith('style');
            expect(mockStyle.textContent).toBe(imageOptimizationStyles);
            expect(global.document.head.appendChild).toHaveBeenCalledWith(mockStyle);
        });

        it('initializes lazy loading and observes existing images', () => {
            const mockLazyImages = [
                { dataset: { src: '/img/test.jpg' } },
                { dataset: { src: '/img/test2.jpg' } }
            ];
            global.document.querySelectorAll = vi.fn().mockReturnValue(mockLazyImages);

            initImageOptimization();

            expect(global.document.querySelectorAll).toHaveBeenCalledWith('img[data-src]');
        });

        it('sets up MutationObserver for dynamic images', () => {
            const mockObserver = {
                observe: vi.fn()
            };
            global.MutationObserver = vi.fn().mockImplementation(() => mockObserver);

            initImageOptimization();

            expect(mockObserver.observe).toHaveBeenCalledWith(
                global.document.body,
                { childList: true, subtree: true }
            );
        });

        it('handles DOM loading states correctly', () => {
            global.document.readyState = 'loading';
            const addEventListenerSpy = vi.spyOn(global.document, 'addEventListener');

            initImageOptimization();

            expect(addEventListenerSpy).toHaveBeenCalledWith(
                'DOMContentLoaded',
                expect.any(Function)
            );
        });
    });

    describe('destroyImageOptimization', () => {
        it('disconnects lazy loader and cleans up resources', () => {
            initImageOptimization();

            destroyImageOptimization();

            // Should not throw error and should clean up properly
            expect(mockDisconnect).toHaveBeenCalled();
        });
    });

    describe('imageOptimizationStyles', () => {
        it('contains required CSS classes for image effects', () => {
            expect(imageOptimizationStyles).toContain('.blur-load');
            expect(imageOptimizationStyles).toContain('.progressive-image-blur');
            expect(imageOptimizationStyles).toContain('.progressive-image-loaded');
            expect(imageOptimizationStyles).toContain('.medical-image-placeholder');
        });

        it('has proper blur and transition effects', () => {
            expect(imageOptimizationStyles).toContain('filter: blur(10px)');
            expect(imageOptimizationStyles).toContain('filter: blur(20px)');
            expect(imageOptimizationStyles).toContain('filter: blur(0)');
            expect(imageOptimizationStyles).toContain('transition: filter');
            expect(imageOptimizationStyles).toContain('transition: opacity');
        });
    });

    describe('Performance Considerations', () => {
        it('avoids duplicate style injection', () => {
            const mockStyle = { textContent: '', appendChild: vi.fn() };
            global.document.createElement = vi.fn().mockReturnValue(mockStyle);

            initImageOptimization();
            initImageOptimization(); // Second call

            expect(global.document.createElement).toHaveBeenCalledTimes(1);
        });

        it('handles large numbers of images efficiently', () => {
            const manyImages = Array.from({ length: 100 }, (_, i) => ({
                dataset: { src: `/img/test${i}.jpg` },
                style: {},
                classList: { add: vi.fn(), remove: vi.fn() },
                dispatchEvent: vi.fn()
            }));

            const startTime = performance.now();
            const lazyLoader = new ImageLazyLoader();
            lazyLoader.observe(manyImages);
            const endTime = performance.now();

            expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
            lazyLoader.disconnect();
        });
    });

    describe('Healthcare Compliance', () => {
        it('ensures medical image placeholders maintain professionalism', () => {
            expect(imageOptimizationStyles).toContain('.medical-image-placeholder');
            expect(imageOptimizationStyles).toContain('🏥');
            expect(imageOptimizationStyles).toContain('opacity: 0.3');
        });

        it('preserves image quality for medical content', () => {
            const medicalImageUrl = '/img/medical-procedure.jpg';
            const optimizedUrl = getOptimizedImageUrl(medicalImageUrl, {
                quality: 95, // Higher quality for medical images
                format: 'webp'
            });

            expect(optimizedUrl).toContain('q=95');
            expect(optimizedUrl).toEndWith('.webp');
        });
    });
});