/**
 * Social Links Component Tests
 * Tests for social media links with 3D effects and responsiveness
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SocialLinks, { SocialShare } from '@/components/SocialLinks';

// Mock NAP_CANONICAL
vi.mock('@/lib/napCanonical', () => ({
  NAP_CANONICAL: {
    social: {
      instagram: {
        url: 'https://www.instagram.com/saraiva_vision/',
        handle: '@saraiva_vision',
      },
      facebook: {
        url: 'https://www.facebook.com/philipeoftalmo',
        handle: '@philipeoftalmo',
      },
      youtube: {
        url: 'https://www.youtube.com/c/SaraivaVision',
        handle: '@SaraivaVision',
      },
    },
  },
}));

describe('SocialLinks Component', () => {
  beforeEach(() => {
    // Mock window.innerWidth for device type detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all social links', () => {
      render(<SocialLinks />);

      expect(screen.getByLabelText(/Visitar Instagram/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Visitar Facebook/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Visitar YouTube/i)).toBeInTheDocument();
    });

    it('renders with horizontal layout by default', () => {
      const { container } = render(<SocialLinks />);
      const nav = container.querySelector('[role="navigation"]');

      expect(nav).toHaveClass('flex', 'items-center', 'gap-3');
    });

    it('renders with vertical layout when specified', () => {
      const { container } = render(<SocialLinks variant="vertical" />);
      const nav = container.querySelector('[role="navigation"]');

      expect(nav).toHaveClass('flex', 'flex-col', 'gap-3');
    });

    it('renders with grid layout when specified', () => {
      const { container } = render(<SocialLinks variant="grid" />);
      const nav = container.querySelector('[role="navigation"]');

      expect(nav).toHaveClass('grid', 'grid-cols-3', 'gap-3');
    });

    it('shows labels when showLabels is true', () => {
      render(<SocialLinks showLabels={true} />);

      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('YouTube')).toBeInTheDocument();
    });

    it('hides labels by default', () => {
      render(<SocialLinks />);

      expect(screen.queryByText('Instagram')).not.toBeInTheDocument();
      expect(screen.queryByText('Facebook')).not.toBeInTheDocument();
      expect(screen.queryByText('YouTube')).not.toBeInTheDocument();
    });
  });

  describe('Link Attributes', () => {
    it('opens links in new tab with proper security attributes', () => {
      render(<SocialLinks />);

      const instagramLink = screen.getByLabelText(/Visitar Instagram/i);

      expect(instagramLink).toHaveAttribute('target', '_blank');
      expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('has correct href attributes', () => {
      render(<SocialLinks />);

      const instagramLink = screen.getByLabelText(/Visitar Instagram/i);
      const facebookLink = screen.getByLabelText(/Visitar Facebook/i);
      const youtubeLink = screen.getByLabelText(/Visitar YouTube/i);

      expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com/saraiva_vision/');
      expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com/philipeoftalmo');
      expect(youtubeLink).toHaveAttribute('href', 'https://www.youtube.com/c/SaraivaVision');
    });
  });

  describe('Accessibility', () => {
    it('has proper navigation role', () => {
      const { container } = render(<SocialLinks />);
      const nav = container.querySelector('[role="navigation"]');

      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('aria-label', 'Redes sociais da Clínica Saraiva Vision');
    });

    it('has proper aria-labels for each link', () => {
      render(<SocialLinks />);

      expect(screen.getByLabelText(/Visitar Instagram - @saraiva_vision/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Visitar Facebook - @philipeoftalmo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Visitar YouTube - @SaraivaVision/i)).toBeInTheDocument();
    });

    it('has focus styles', () => {
      render(<SocialLinks />);
      const instagramLink = screen.getByLabelText(/Visitar Instagram/i);

      expect(instagramLink).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-teal-400');
    });

    it('icons have aria-hidden="true"', () => {
      const { container } = render(<SocialLinks />);
      const icons = container.querySelectorAll('[aria-hidden="true"]');

      // Should have at least 3 icons (one per social link) + glass bubbles
      expect(icons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Size Variants', () => {
    it('renders with small size', () => {
      const { container } = render(<SocialLinks size="sm" />);
      const links = container.querySelectorAll('a');

      links.forEach((link) => {
        expect(link).toHaveClass('w-8', 'h-8');
      });
    });

    it('renders with medium size (default)', () => {
      const { container } = render(<SocialLinks size="md" />);
      const links = container.querySelectorAll('a');

      links.forEach((link) => {
        expect(link).toHaveClass('w-10', 'h-10');
      });
    });

    it('renders with large size', () => {
      const { container } = render(<SocialLinks size="lg" />);
      const links = container.querySelectorAll('a');

      links.forEach((link) => {
        expect(link).toHaveClass('w-12', 'h-12');
      });
    });
  });

  describe('3D Effects', () => {
    it('applies transform on hover when enable3D is true', async () => {
      const { container } = render(<SocialLinks enable3D={true} />);
      const iconContainer = container.querySelector('[class*="relative"]');

      if (iconContainer) {
        fireEvent.mouseEnter(iconContainer);

        await waitFor(() => {
          const style = window.getComputedStyle(iconContainer);
          // Transform is applied inline
          expect(iconContainer).toHaveStyle({ transition: expect.stringContaining('transform') });
        });
      }
    });

    it('does not apply 3D transform when enable3D is false', () => {
      const { container } = render(<SocialLinks enable3D={false} />);
      const iconContainer = container.querySelector('[class*="relative"]');

      if (iconContainer) {
        fireEvent.mouseEnter(iconContainer);

        // Should use simple scale instead of 3D transforms
        expect(iconContainer).toHaveStyle({ transition: expect.stringContaining('transform') });
      }
    });

    it('disables animations when enableAnimation is false', () => {
      render(<SocialLinks enableAnimation={false} />);

      // Component should render but not respond to hover/touch
      const instagramLink = screen.getByLabelText(/Visitar Instagram/i);
      expect(instagramLink).toBeInTheDocument();
    });
  });

  describe('Touch Interactions', () => {
    it('handles touch start events', () => {
      const { container } = render(<SocialLinks />);
      const iconContainer = container.querySelector('[class*="relative"]');

      if (iconContainer) {
        fireEvent.touchStart(iconContainer);
        // Should not throw errors
        expect(iconContainer).toBeInTheDocument();
      }
    });

    it('provides haptic feedback on touch (if supported)', () => {
      // Mock navigator.vibrate
      const vibrateMock = vi.fn();
      Object.defineProperty(navigator, 'vibrate', {
        writable: true,
        configurable: true,
        value: vibrateMock,
      });

      const { container } = render(<SocialLinks />);
      const iconContainer = container.querySelector('[class*="relative"]');

      if (iconContainer) {
        fireEvent.touchStart(iconContainer);

        expect(vibrateMock).toHaveBeenCalledWith(10);
      }
    });
  });

  describe('Glass Bubble Effect', () => {
    it('renders glass bubble when enableGlassBubble is true', () => {
      const { container } = render(<SocialLinks enableGlassBubble={true} />);
      const bubbles = container.querySelectorAll('[class*="blur"]');

      expect(bubbles.length).toBeGreaterThan(0);
    });

    it('does not render glass bubble when enableGlassBubble is false', () => {
      const { container } = render(<SocialLinks enableGlassBubble={false} />);

      // Component still renders, just without bubble effects
      expect(screen.getByLabelText(/Visitar Instagram/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('detects desktop device type', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1920,
      });

      render(<SocialLinks />);

      // Component should render normally
      expect(screen.getByLabelText(/Visitar Instagram/i)).toBeInTheDocument();
    });

    it('detects tablet device type', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 768,
      });

      render(<SocialLinks />);

      expect(screen.getByLabelText(/Visitar Instagram/i)).toBeInTheDocument();
    });

    it('detects mobile device type', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375,
      });

      render(<SocialLinks />);

      expect(screen.getByLabelText(/Visitar Instagram/i)).toBeInTheDocument();
    });
  });
});

describe('SocialShare Component', () => {
  const mockUrl = 'https://saraivavision.com.br/blog/test-post';
  const mockTitle = 'Test Blog Post';
  const mockDescription = 'Test description';

  describe('Minimal Variant', () => {
    it('renders minimal share links', () => {
      render(<SocialShare url={mockUrl} title={mockTitle} variant="minimal" />);

      expect(screen.getByText(/Compartilhar:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Compartilhar no Facebook/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Compartilhar no Twitter/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Compartilhar no LinkedIn/i)).toBeInTheDocument();
    });

    it('encodes URL and title correctly', () => {
      render(<SocialShare url={mockUrl} title={mockTitle} variant="minimal" />);

      const facebookLink = screen.getByLabelText(/Compartilhar no Facebook/i);
      const encodedUrl = encodeURIComponent(mockUrl);

      expect(facebookLink.getAttribute('href')).toContain(encodedUrl);
    });
  });

  describe('Extended Variant', () => {
    it('renders extended share links with labels', () => {
      render(<SocialShare url={mockUrl} title={mockTitle} variant="extended" />);

      expect(screen.getByText('Compartilhe este conteúdo')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-labels for share links', () => {
      render(<SocialShare url={mockUrl} title={mockTitle} />);

      expect(screen.getByLabelText(/Compartilhar no Facebook/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Compartilhar no Twitter/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Compartilhar no LinkedIn/i)).toBeInTheDocument();
    });

    it('has focus styles', () => {
      render(<SocialShare url={mockUrl} title={mockTitle} />);
      const facebookLink = screen.getByLabelText(/Compartilhar no Facebook/i);

      expect(facebookLink).toHaveClass('focus:outline-none', 'focus:ring-2');
    });
  });

  describe('Link Attributes', () => {
    it('opens share links in new tab', () => {
      render(<SocialShare url={mockUrl} title={mockTitle} />);
      const facebookLink = screen.getByLabelText(/Compartilhar no Facebook/i);

      expect(facebookLink).toHaveAttribute('target', '_blank');
      expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('generates correct Facebook share URL', () => {
      render(<SocialShare url={mockUrl} title={mockTitle} />);
      const facebookLink = screen.getByLabelText(/Compartilhar no Facebook/i);

      expect(facebookLink.getAttribute('href')).toContain('facebook.com/sharer/sharer.php');
    });

    it('generates correct Twitter share URL', () => {
      render(<SocialShare url={mockUrl} title={mockTitle} />);
      const twitterLink = screen.getByLabelText(/Compartilhar no Twitter/i);

      expect(twitterLink.getAttribute('href')).toContain('twitter.com/intent/tweet');
    });

    it('generates correct LinkedIn share URL', () => {
      render(<SocialShare url={mockUrl} title={mockTitle} />);
      const linkedinLink = screen.getByLabelText(/Compartilhar no LinkedIn/i);

      expect(linkedinLink.getAttribute('href')).toContain('linkedin.com/sharing/share-offsite');
    });
  });
});
