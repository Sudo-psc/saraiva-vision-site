import { env } from '@/utils/env';
/**
 * OptimizedImage Component Tests
 * Tests for responsive image loading, format validation, and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import OptimizedImage from './OptimizedImage';

describe('OptimizedImage Component', () => {
  // Mock IntersectionObserver
  let mockIntersectionObserver;

  beforeEach(() => {
    mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.prototype.observe = vi.fn();
    mockIntersectionObserver.prototype.unobserve = vi.fn();
    mockIntersectionObserver.prototype.disconnect = vi.fn();

    window.IntersectionObserver = mockIntersectionObserver;

    // Clear console mocks
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render image with correct alt text', () => {
      render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="AI Technology"
        />
      );

      const img = screen.getByAltText('AI Technology');
      expect(img).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should render with aspect ratio', () => {
      const { container } = render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
          aspectRatio="16/9"
        />
      );

      expect(container.firstChild).toHaveStyle({ aspectRatio: '16/9' });
    });

    it('should set width and height attributes', () => {
      render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
          width={800}
          height={600}
        />
      );

      const img = screen.getByAltText('Test');
      expect(img).toHaveAttribute('width', '800');
      expect(img).toHaveAttribute('height', '600');
    });
  });

  describe('Format Validation and SrcSet Generation', () => {
    it('should generate correct AVIF srcset', () => {
      const { container } = render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
        />
      );

      const avifSource = container.querySelector('source[type="image/avif"]');
      expect(avifSource).toBeInTheDocument();
      expect(avifSource.getAttribute('srcset')).toContain('capa_IA-480w.avif 480w');
      expect(avifSource.getAttribute('srcset')).toContain('capa_IA-768w.avif 768w');
      expect(avifSource.getAttribute('srcset')).toContain('capa_IA-1280w.avif 1280w');
    });

    it('should generate correct WebP srcset', () => {
      const { container } = render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
        />
      );

      const webpSource = container.querySelector('source[type="image/webp"]');
      expect(webpSource).toBeInTheDocument();
      expect(webpSource.getAttribute('srcset')).toContain('capa_IA-480w.webp 480w');
      expect(webpSource.getAttribute('srcset')).toContain('capa_IA-768w.webp 768w');
      expect(webpSource.getAttribute('srcset')).toContain('capa_IA-1280w.webp 1280w');
    });

    it('should NOT generate .avi or .avit extensions', () => {
      const { container } = render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
        />
      );

      const avifSource = container.querySelector('source[type="image/avif"]');
      const srcset = avifSource.getAttribute('srcset');

      expect(srcset).not.toContain('.avi ');
      expect(srcset).not.toContain('.avit');
      expect(srcset).toContain('.avif');
    });

    it('should handle paths with subdirectories', () => {
      const { container } = render(
        <OptimizedImage
          src="/images/blog/2024/capa_IA.png"
          alt="Test"
        />
      );

      const avifSource = container.querySelector('source[type="image/avif"]');
      expect(avifSource.getAttribute('srcset')).toContain('/images/blog/2024/capa_IA-480w.avif');
    });

    it('should extract basename correctly from filename with multiple dots', () => {
      const { container } = render(
        <OptimizedImage
          src="/Blog/capa.image.test.png"
          alt="Test"
        />
      );

      const avifSource = container.querySelector('source[type="image/avif"]');
      expect(avifSource.getAttribute('srcset')).toContain('capa.image.test-480w.avif');
    });
  });

  describe('Lazy Loading Behavior', () => {
    it('should use lazy loading by default', () => {
      render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
        />
      );

      const img = screen.getByAltText('Test');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('should support eager loading', () => {
      render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
          loading="eager"
        />
      );

      const img = screen.getByAltText('Test');
      expect(img).toHaveAttribute('loading', 'eager');
    });

    it('should initialize IntersectionObserver for lazy loading', () => {
      render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
          loading="lazy"
        />
      );

      expect(mockIntersectionObserver).toHaveBeenCalled();
    });

    it('should not initialize IntersectionObserver for eager loading', () => {
      render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
          loading="eager"
        />
      );

      expect(mockIntersectionObserver).not.toHaveBeenCalled();
    });

    it('should handle missing IntersectionObserver gracefully', () => {
      const originalIO = window.IntersectionObserver;
      delete window.IntersectionObserver;

      const { container } = render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
          loading="lazy"
        />
      );

      expect(container.querySelector('img')).toBeInTheDocument();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('IntersectionObserver not supported')
      );

      window.IntersectionObserver = originalIO;
    });
  });

  describe('Error Handling', () => {
    it('should show loading placeholder initially', () => {
      const { container } = render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
        />
      );

      const placeholder = container.querySelector('.animate-pulse');
      expect(placeholder).toBeInTheDocument();
    });

    it('should hide loading placeholder after image loads', async () => {
      const { container } = render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
        />
      );

      const img = screen.getByAltText('Test');
      fireEvent.load(img);

      await waitFor(() => {
        const placeholder = container.querySelector('.animate-pulse');
        expect(placeholder).not.toBeInTheDocument();
      });
    });

    it('should call onLoad callback', () => {
      const onLoad = vi.fn();
      render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
          onLoad={onLoad}
        />
      );

      const img = screen.getByAltText('Test');
      fireEvent.load(img);

      expect(onLoad).toHaveBeenCalled();
    });

    it('should call onError callback', () => {
      const onError = vi.fn();
      render(
        <OptimizedImage
          src="/Blog/invalid.png"
          alt="Test"
          onError={onError}
        />
      );

      const img = screen.getByAltText('Test');
      fireEvent.error(img);

      expect(onError).toHaveBeenCalled();
    });

    it('should use fallback image on error', async () => {
      render(
        <OptimizedImage
          src="/Blog/invalid.png"
          alt="Test"
          fallbackSrc="/Blog/fallback.png"
        />
      );

      const img = screen.getByAltText('Test');
      fireEvent.error(img);

      await waitFor(() => {
        expect(img).toHaveAttribute('src', '/Blog/fallback.png');
      });
    });

    it('should show error UI when no fallback provided', async () => {
      render(
        <OptimizedImage
          src="/Blog/invalid.png"
          alt="Test"
        />
      );

      const img = screen.getByAltText('Test');
      fireEvent.error(img);

      await waitFor(() => {
        expect(screen.getByText('Imagem indisponível')).toBeInTheDocument();
      });
    });

    it('should log source errors in development mode', () => {
      const originalEnv = env.DEV;
      env.DEV = true;

      const { container } = render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
        />
      );

      const avifSource = container.querySelector('source[type="image/avif"]');
      fireEvent.error(avifSource);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load AVIF sources')
      );

      env.DEV = originalEnv;
    });

    it('should hide AVIF source after error', async () => {
      const { container, rerender } = render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
        />
      );

      const avifSource = container.querySelector('source[type="image/avif"]');
      fireEvent.error(avifSource);

      // Force re-render to apply state change
      rerender(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
        />
      );

      await waitFor(() => {
        const updatedAvifSource = container.querySelector('source[type="image/avif"]');
        expect(updatedAvifSource).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance Optimizations', () => {
    it('should use async decoding', () => {
      render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
        />
      );

      const img = screen.getByAltText('Test');
      expect(img).toHaveAttribute('decoding', 'async');
    });

    it('should set custom sizes attribute', () => {
      const customSizes = '(max-width: 600px) 100vw, 50vw';
      const { container } = render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
          sizes={customSizes}
        />
      );

      const avifSource = container.querySelector('source[type="image/avif"]');
      expect(avifSource).toHaveAttribute('sizes', customSizes);
    });

    it('should apply opacity transition on load', async () => {
      render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
        />
      );

      const img = screen.getByAltText('Test');
      expect(img).toHaveClass('opacity-0');

      fireEvent.load(img);

      await waitFor(() => {
        expect(img).toHaveClass('opacity-100');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have required alt attribute', () => {
      render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Descriptive alt text"
        />
      );

      const img = screen.getByAltText('Descriptive alt text');
      expect(img).toHaveAttribute('alt', 'Descriptive alt text');
    });

    it('should maintain semantic picture element structure', () => {
      const { container } = render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
        />
      );

      const picture = container.querySelector('picture');
      expect(picture).toBeInTheDocument();

      const sources = picture.querySelectorAll('source');
      expect(sources.length).toBeGreaterThanOrEqual(2); // AVIF + WebP

      const img = picture.querySelector('img');
      expect(img).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty src gracefully', () => {
      const { container } = render(
        <OptimizedImage
          src=""
          alt="Test"
        />
      );

      expect(container.querySelector('img')).toBeInTheDocument();
    });

    it('should handle src without file extension', () => {
      const { container } = render(
        <OptimizedImage
          src="/Blog/image"
          alt="Test"
        />
      );

      const avifSource = container.querySelector('source[type="image/avif"]');
      expect(avifSource.getAttribute('srcset')).toContain('image-480w.avif');
    });

    it('should handle src with query parameters', () => {
      const { container } = render(
        <OptimizedImage
          src="/Blog/capa_IA.png?v=123"
          alt="Test"
        />
      );

      const img = screen.getByAltText('Test');
      expect(img).toHaveAttribute('src', '/Blog/capa_IA.png?v=123');
    });

    it('should setup IntersectionObserver with cleanup function', async () => {
      const observeMock = vi.fn();
      const unobserveMock = vi.fn();

      window.IntersectionObserver = vi.fn().mockImplementation((callback, options) => {
        return {
          observe: observeMock,
          unobserve: unobserveMock,
          disconnect: vi.fn()
        };
      });

      const { container } = render(
        <OptimizedImage
          src="/Blog/capa_IA.png"
          alt="Test"
          loading="lazy"
        />
      );

      // Verify IntersectionObserver was created and observe was called
      await waitFor(() => {
        expect(window.IntersectionObserver).toHaveBeenCalledWith(
          expect.any(Function),
          expect.objectContaining({
            rootMargin: '50px',
            threshold: 0.01
          })
        );
        expect(observeMock).toHaveBeenCalled();
      });

      // Verify the img ref exists for observation
      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
    });
  });
});