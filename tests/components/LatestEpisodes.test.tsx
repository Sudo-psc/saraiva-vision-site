/**
 * Latest Episodes Component Tests
 * Tests for featured podcast episode display
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LatestEpisodes from '@/components/LatestEpisodes';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock PodcastPlayer component
vi.mock('@/components/PodcastPlayer', () => ({
  default: ({ episode, mode, className }: any) => (
    <div data-testid="podcast-player" data-mode={mode} className={className}>
      <div>{episode.title}</div>
      <div>{episode.duration}</div>
    </div>
  ),
}));

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, size, className, ...props }: any) => (
    <button data-size={size} className={className} {...props}>
      {children}
    </button>
  ),
}));

describe('LatestEpisodes Component', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      render(<LatestEpisodes />);

      expect(screen.getByText(/Podcast em Destaque/i)).toBeInTheDocument();
    });

    it('renders the section header', () => {
      render(<LatestEpisodes />);

      expect(screen.getByText('Podcast')).toBeInTheDocument();
      expect(screen.getByText(/Podcast em Destaque/i)).toBeInTheDocument();
    });

    it('renders the description', () => {
      render(<LatestEpisodes />);

      expect(
        screen.getByText(/Confira nosso episódio mais recente sobre saúde ocular/i)
      ).toBeInTheDocument();
    });

    it('renders podcast player by default', () => {
      render(<LatestEpisodes />);

      expect(screen.getByTestId('podcast-player')).toBeInTheDocument();
    });

    it('hides podcast player when showPlayer is false', () => {
      render(<LatestEpisodes showPlayer={false} />);

      expect(screen.queryByTestId('podcast-player')).not.toBeInTheDocument();
    });
  });

  describe('Featured Episode', () => {
    it('passes featured episode to PodcastPlayer', () => {
      render(<LatestEpisodes />);

      const player = screen.getByTestId('podcast-player');
      expect(player).toHaveTextContent(/Cirurgia Refrativa/i);
      expect(player).toHaveTextContent('08:15');
    });

    it('renders PodcastPlayer in inline mode', () => {
      render(<LatestEpisodes />);

      const player = screen.getByTestId('podcast-player');
      expect(player).toHaveAttribute('data-mode', 'inline');
    });
  });

  describe('Statistics Badges', () => {
    it('renders episode badge', () => {
      render(<LatestEpisodes />);

      expect(screen.getByText(/Episódio em Destaque/i)).toBeInTheDocument();
    });

    it('renders Spotify badge', () => {
      render(<LatestEpisodes />);

      expect(screen.getByText(/Mais no Spotify/i)).toBeInTheDocument();
    });

    it('Spotify badge has pulse animation indicator', () => {
      const { container } = render(<LatestEpisodes />);

      const pulseDot = container.querySelector('.animate-pulse');
      expect(pulseDot).toBeInTheDocument();
    });
  });

  describe('Call to Action', () => {
    it('renders CTA button to podcast page', () => {
      render(<LatestEpisodes />);

      const button = screen.getByText(/Ver Todos os Episódios/i);
      expect(button).toBeInTheDocument();
    });

    it('CTA links to /podcast', () => {
      render(<LatestEpisodes />);

      const link = screen.getByLabelText(/Ver todos os episódios/i);
      expect(link).toHaveAttribute('href', '/podcast');
    });

    it('renders CTA description', () => {
      render(<LatestEpisodes />);

      expect(
        screen.getByText(/Descubra mais episódios sobre saúde ocular/i)
      ).toBeInTheDocument();
    });

    it('CTA button has proper size', () => {
      render(<LatestEpisodes />);

      const button = screen.getByText(/Ver Todos os Episódios/i);
      expect(button).toHaveAttribute('data-size', 'lg');
    });

    it('CTA has icons', () => {
      const { container } = render(<LatestEpisodes />);

      // Should have headphones and arrow icons in button
      const button = screen.getByText(/Ver Todos os Episódios/i);
      const svgs = button.parentElement?.querySelectorAll('svg');

      expect(svgs).toBeDefined();
      expect(svgs?.length).toBeGreaterThanOrEqual(2); // Headphones + Arrow
    });
  });

  describe('Background Effects', () => {
    it('has gradient background', () => {
      const { container } = render(<LatestEpisodes />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-gradient-to-br');
    });

    it('has decorative gradient orbs', () => {
      const { container } = render(<LatestEpisodes />);

      const orbs = container.querySelectorAll('.blur-3xl');
      expect(orbs.length).toBeGreaterThan(0);
    });

    it('has animated elements', () => {
      const { container } = render(<LatestEpisodes />);

      const animatedElements = container.querySelectorAll('.animate-pulse, .animate-bounce');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('has grid pattern overlay', () => {
      const { container } = render(<LatestEpisodes />);

      const gridPattern = container.querySelector('[style*="radial-gradient"]');
      expect(gridPattern).toBeInTheDocument();
    });
  });

  describe('Player Styling', () => {
    it('player has 3D card effect classes', () => {
      render(<LatestEpisodes />);

      const player = screen.getByTestId('podcast-player');
      expect(player).toHaveClass('card-3d');
    });

    it('player has glass effect', () => {
      render(<LatestEpisodes />);

      const player = screen.getByTestId('podcast-player');
      expect(player).toHaveClass('glass-blue');
    });

    it('player has hover effects', () => {
      render(<LatestEpisodes />);

      const player = screen.getByTestId('podcast-player');
      expect(player.className).toContain('hover:shadow-2xl');
      expect(player.className).toContain('hover:scale-[1.02]');
    });

    it('player wrapper has glow effect on hover', () => {
      const { container } = render(<LatestEpisodes />);

      const glowEffect = container.querySelector('.group-hover\\:opacity-100');
      expect(glowEffect).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('has responsive padding', () => {
      const { container } = render(<LatestEpisodes />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('py-10', 'md:py-12', 'lg:py-16');
    });

    it('has responsive heading sizes', () => {
      const { container } = render(<LatestEpisodes />);

      const heading = screen.getByText(/Podcast em Destaque/i);
      expect(heading).toHaveClass('text-4xl', 'md:text-5xl', 'lg:text-6xl');
    });

    it('has responsive description sizes', () => {
      const { container } = render(<LatestEpisodes />);

      const description = screen.getByText(/Confira nosso episódio mais recente/i);
      expect(description).toHaveClass('text-lg', 'md:text-xl');
    });

    it('player container has max width constraint', () => {
      const { container } = render(<LatestEpisodes />);

      const playerContainer = screen.getByTestId('podcast-player').parentElement?.parentElement;
      expect(playerContainer).toHaveClass('max-w-4xl');
    });
  });

  describe('Styling Props', () => {
    it('applies custom className', () => {
      const customClass = 'my-custom-class';
      const { container } = render(<LatestEpisodes className={customClass} />);

      const section = container.querySelector('section');
      expect(section).toHaveClass(customClass);
    });

    it('maintains default classes with custom className', () => {
      const { container } = render(<LatestEpisodes className="custom" />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('custom');
      expect(section).toHaveClass('bg-gradient-to-br');
    });
  });

  describe('Accessibility', () => {
    it('has semantic section element', () => {
      const { container } = render(<LatestEpisodes />);

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('has proper heading hierarchy', () => {
      render(<LatestEpisodes />);

      const h2 = screen.getByText(/Podcast em Destaque/i);
      expect(h2.tagName).toBe('H2');
    });

    it('CTA link has aria-label', () => {
      render(<LatestEpisodes />);

      const link = screen.getByLabelText(/Ver todos os episódios/i);
      expect(link).toHaveAttribute('aria-label');
    });

    it('decorative elements do not interfere with accessibility', () => {
      const { container } = render(<LatestEpisodes />);

      const section = container.querySelector('section');
      const decorativeElements = section?.querySelectorAll('.pointer-events-none');

      expect(decorativeElements).toBeDefined();
      decorativeElements?.forEach((el) => {
        expect(el).toHaveClass('pointer-events-none');
      });
    });
  });

  describe('Badge Components', () => {
    it('podcast badge has icon', () => {
      const { container } = render(<LatestEpisodes />);

      const badge = screen.getByText('Podcast').closest('div');
      const icon = badge?.querySelector('svg');

      expect(icon).toBeInTheDocument();
    });

    it('badges have proper styling', () => {
      const { container } = render(<LatestEpisodes />);

      const episodeBadge = screen.getByText(/Episódio em Destaque/i).closest('div');
      expect(episodeBadge).toHaveClass('bg-white/60', 'backdrop-blur-sm', 'rounded-full');
    });
  });

  describe('CTA Styling', () => {
    it('CTA has glow effect container', () => {
      const { container } = render(<LatestEpisodes />);

      const glowContainer = container.querySelector('.blur-lg');
      expect(glowContainer).toBeInTheDocument();
    });

    it('CTA button has gradient background', () => {
      render(<LatestEpisodes />);

      const button = screen.getByText(/Ver Todos os Episódios/i);
      expect(button).toHaveClass('bg-gradient-to-r');
    });

    it('CTA button has hover scale effect', () => {
      render(<LatestEpisodes />);

      const button = screen.getByText(/Ver Todos os Episódios/i);
      expect(button).toHaveClass('hover:scale-105');
    });
  });

  describe('Performance', () => {
    it('uses relative positioning for layering', () => {
      const { container } = render(<LatestEpisodes />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('relative');
    });

    it('decorative elements use absolute positioning', () => {
      const { container } = render(<LatestEpisodes />);

      const decorativeContainer = container.querySelector('.absolute.inset-0');
      expect(decorativeContainer).toBeInTheDocument();
    });

    it('maintains proper z-index layering', () => {
      const { container } = render(<LatestEpisodes />);

      const contentContainer = container.querySelector('.relative.z-10');
      expect(contentContainer).toBeInTheDocument();
    });
  });
});
