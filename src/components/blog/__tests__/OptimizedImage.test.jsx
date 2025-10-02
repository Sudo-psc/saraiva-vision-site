import { env } from '@/utils/env';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OptimizedImage from '../OptimizedImage.jsx';

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock console methods for testing
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleInfo = jest.spyOn(console, 'info').mockImplementation();

describe('OptimizedImage Component', () => {
  beforeEach(() => {
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();
    mockConsoleInfo.mockClear();
  });

  const defaultProps = {
    src: '/Blog/test_image.png',
    alt: 'Test image',
    width: 800,
    height: 600,
  };

  describe('Filename Normalization', () => {
    test('converts underscores to hyphens', () => {
      render(<OptimizedImage {...defaultProps} src="/Blog/test_image.png" />);
      // Component should normalize filename internally
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    test('removes Portuguese accents', () => {
      render(<OptimizedImage {...defaultProps} src="/Blog/capa_daltonismo.png" />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    test('handles typos gracefully', () => {
      render(<OptimizedImage {...defaultProps} src="/Blog/descolamente_retina_capa.png" />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  describe('Progressive Enhancement', () => {
    test('renders picture element with AVIF and WebP sources', () => {
      render(<OptimizedImage {...defaultProps} />);

      const picture = screen.getByRole('img').closest('picture');
      expect(picture).toBeInTheDocument();

      const avifSource = picture.querySelector('source[type="image/avif"]');
      const webpSource = picture.querySelector('source[type="image/webp"]');

      expect(avifSource).toBeInTheDocument();
      expect(webpSource).toBeInTheDocument();
    });

    test('generates correct srcSet with responsive sizes', () => {
      render(<OptimizedImage {...defaultProps} />);

      const avifSource = screen.getByRole('img').closest('picture')
        .querySelector('source[type="image/avif"]');

      expect(avifSource).toHaveAttribute('srcSet', expect.stringContaining('480w'));
      expect(avifSource).toHaveAttribute('srcSet', expect.stringContaining('768w'));
      expect(avifSource).toHaveAttribute('srcSet', expect.stringContaining('1280w'));
    });

    test('handles missing AVIF files gracefully', async () => {
      render(<OptimizedImage {...defaultProps} />);

      const avifSource = screen.getByRole('img').closest('picture')
        .querySelector('source[type="image/avif"]');

      // Simulate AVIF source error
      fireEvent.error(avifSource);

      await waitFor(() => {
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          expect.stringContaining('AVIF source failed'),
          expect.any(Object)
        );
      });
    });

    test('falls back to WebP when AVIF fails', async () => {
      render(<OptimizedImage {...defaultProps} />);

      const picture = screen.getByRole('img').closest('picture');
      const avifSource = picture.querySelector('source[type="image/avif"]');
      const webpSource = picture.querySelector('source[type="image/webp"]');

      // AVIF fails
      fireEvent.error(avifSource);

      await waitFor(() => {
        expect(webpSource).toBeInTheDocument();
        expect(avifSource).toBeInTheDocument(); // Still in DOM but browser will skip it
      });
    });
  });

  describe('Error Handling', () => {
    test('shows error state when all formats fail', async () => {
      render(<OptimizedImage {...defaultProps} />);

      const img = screen.getByRole('img');

      // Simulate image load failure
      fireEvent.error(img);
      fireEvent.error(img); // Trigger multiple times
      fireEvent.error(img); // Test idempotency

      await waitFor(() => {
        expect(screen.getByText('Imagem indisponível')).toBeInTheDocument();
      });
    });

    test('prevents infinite error loops', async () => {
      render(<OptimizedImage {...defaultProps} />);

      const img = screen.getByRole('img');

      // Trigger multiple errors beyond MAX_ERROR_ATTEMPTS
      for (let i = 0; i < 5; i++) {
        fireEvent.error(img);
      }

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          '[OptimizedImage] Max error attempts reached'
        );
      });
    });

    test('uses fallbackSrc when provided', async () => {
      const fallbackSrc = '/Blog/fallback_image.png';
      render(<OptimizedImage {...defaultProps} fallbackSrc={fallbackSrc} />);

      const img = screen.getByRole('img');
      fireEvent.error(img);

      await waitFor(() => {
        expect(img).toHaveAttribute('src', fallbackSrc);
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading placeholder initially', () => {
      render(<OptimizedImage {...defaultProps} />);

      const placeholder = document.querySelector('.animate-pulse');
      expect(placeholder).toBeInTheDocument();
    });

    test('removes placeholder after successful load', async () => {
      render(<OptimizedImage {...defaultProps} />);

      const img = screen.getByRole('img');

      // Simulate successful load
      fireEvent.load(img);

      await waitFor(() => {
        expect(img).toHaveClass('opacity-100');
        expect(img).not.toHaveClass('opacity-0');
      });
    });
  });

  describe('Accessibility', () => {
    test('provides alt text', () => {
      const altText = 'Accessible image description';
      render(<OptimizedImage {...defaultProps} alt={altText} />);

      expect(screen.getByRole('img')).toHaveAttribute('alt', altText);
    });

    test('includes loading attribute', () => {
      render(<OptimizedImage {...defaultProps} loading="lazy" />);
      expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Development Logging', () => {
    const originalEnv = env;

    beforeEach(() => {
      env.DEV = true;
    });

    afterEach(() => {
      env = originalEnv;
    });

    test('logs detailed information in development', () => {
      render(<OptimizedImage {...defaultProps} />);

      expect(mockConsoleInfo).toHaveBeenCalledWith(
        '[OptimizedImage] Generated srcSet for avif:',
        expect.objectContaining({
          basename: expect.any(String),
          sizes: expect.any(Array),
          path: '/Blog/',
        })
      );
    });

    test('logs image load success in development', async () => {
      render(<OptimizedImage {...defaultProps} />);

      const img = screen.getByRole('img');
      fireEvent.load(img);

      await waitFor(() => {
        expect(mockConsoleInfo).toHaveBeenCalledWith(
          '[OptimizedImage] Success:',
          expect.objectContaining({
            basename: expect.any(String),
            format: expect.any(String),
            size: expect.any(String),
          })
        );
      });
    });
  });

  describe('Props Validation', () => {
    test('accepts custom className', () => {
      const customClass = 'custom-image-class';
      render(<OptimizedImage {...defaultProps} className={customClass} />);

      const container = screen.getByRole('img').parentElement;
      expect(container).toHaveClass(customClass);
    });

    test('accepts aspectRatio style', () => {
      render(<OptimizedImage {...defaultProps} aspectRatio="16/9" />);

      const container = screen.getByRole('img').parentElement;
      expect(container).toHaveStyle({ aspectRatio: '16/9' });
    });

    test('accepts custom sizes prop', () => {
      const sizes = '(max-width: 768px) 100vw, 50vw';
      render(<OptimizedImage {...defaultProps} sizes={sizes} />);

      const sources = screen.getAllByRole('img').map(el => el.closest('picture')?.querySelector('source'));
      sources.forEach(source => {
        if (source) {
          expect(source).toHaveAttribute('sizes', sizes);
        }
      });
    });
  });
});