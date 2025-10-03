/**
 * Spotify Embed Component Tests
 * Tests for Spotify podcast embed with error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpotifyEmbed from '@/components/SpotifyEmbed';

describe('SpotifyEmbed Component', () => {
  const defaultShowId = '6sHIG7HbhF1w5O63CTtxwV';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders Spotify embed iframe', () => {
      render(<SpotifyEmbed />);

      const iframe = screen.getByTitle('Player do Spotify');
      expect(iframe).toBeInTheDocument();
    });

    it('uses default show ID from environment or fallback', () => {
      render(<SpotifyEmbed />);

      const iframe = screen.getByTitle('Player do Spotify');
      const src = iframe.getAttribute('src');

      expect(src).toContain('open.spotify.com/embed/show');
      expect(src).toContain(defaultShowId);
    });

    it('renders with custom show ID', () => {
      const customId = 'custom-show-id';
      render(<SpotifyEmbed type="show" id={customId} />);

      const iframe = screen.getByTitle('Player do Spotify');
      const src = iframe.getAttribute('src');

      expect(src).toContain(customId);
    });

    it('renders episode embed when type is episode', () => {
      const episodeId = 'episode-123';
      render(<SpotifyEmbed type="episode" id={episodeId} />);

      const iframe = screen.getByTitle('Player do Spotify');
      const src = iframe.getAttribute('src');

      expect(src).toContain('open.spotify.com/embed/episode');
      expect(src).toContain(episodeId);
    });
  });

  describe('Loading States', () => {
    it('shows loading state initially', () => {
      render(<SpotifyEmbed />);

      expect(screen.getByText(/Carregando player do Spotify/i)).toBeInTheDocument();
    });

    it('hides loading state when iframe loads', async () => {
      render(<SpotifyEmbed />);

      const iframe = screen.getByTitle('Player do Spotify');
      fireEvent.load(iframe);

      await waitFor(() => {
        expect(screen.queryByText(/Carregando player do Spotify/i)).not.toBeInTheDocument();
      });
    });

    it('has loading spinner animation', () => {
      const { container } = render(<SpotifyEmbed />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error message when iframe fails to load', async () => {
      render(<SpotifyEmbed />);

      const iframe = screen.getByTitle('Player do Spotify');
      fireEvent.error(iframe);

      await waitFor(() => {
        expect(screen.getByText(/Não foi possível carregar o player do Spotify/i)).toBeInTheDocument();
      });
    });

    it('shows fallback link when error occurs', async () => {
      render(<SpotifyEmbed />);

      const iframe = screen.getByTitle('Player do Spotify');
      fireEvent.error(iframe);

      await waitFor(() => {
        const fallbackLink = screen.getByText(/Abrir no Spotify/i);
        expect(fallbackLink).toBeInTheDocument();
        expect(fallbackLink.closest('a')).toHaveAttribute('href', expect.stringContaining('open.spotify.com'));
      });
    });

    it('error fallback opens in new tab', async () => {
      render(<SpotifyEmbed />);

      const iframe = screen.getByTitle('Player do Spotify');
      fireEvent.error(iframe);

      await waitFor(() => {
        const fallbackLink = screen.getByText(/Abrir no Spotify/i).closest('a');
        expect(fallbackLink).toHaveAttribute('target', '_blank');
        expect(fallbackLink).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });

  describe('Episode Highlight', () => {
    it('shows episode title banner when provided', () => {
      const episodeTitle = 'Cirurgia Refrativa: Guia Completo';
      render(<SpotifyEmbed episodeTitle={episodeTitle} />);

      expect(screen.getByText(/Episódio destacado:/i)).toBeInTheDocument();
      expect(screen.getByText(episodeTitle)).toBeInTheDocument();
    });

    it('does not show episode title banner when not provided', () => {
      render(<SpotifyEmbed />);

      expect(screen.queryByText(/Episódio destacado:/i)).not.toBeInTheDocument();
    });

    it('shows instruction text with episode title', () => {
      render(<SpotifyEmbed episodeTitle="Test Episode" />);

      expect(screen.getByText(/Role a lista abaixo/i)).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('renders with standard height by default', () => {
      const { container } = render(<SpotifyEmbed />);
      const iframe = container.querySelector('iframe');

      expect(iframe).toHaveStyle({ height: '352px' });
    });

    it('renders with compact height when compact is true', () => {
      const { container } = render(<SpotifyEmbed compact={true} />);
      const iframe = container.querySelector('iframe');

      expect(iframe).toHaveStyle({ height: '152px' });
    });

    it('renders episode with smaller default height', () => {
      const { container } = render(<SpotifyEmbed type="episode" />);
      const iframe = container.querySelector('iframe');

      expect(iframe).toHaveStyle({ height: '232px' });
    });

    it('accepts custom height prop', () => {
      const customHeight = 400;
      const { container } = render(<SpotifyEmbed height={customHeight} />);
      const iframe = container.querySelector('iframe');

      expect(iframe).toHaveStyle({ height: `${customHeight}px` });
    });
  });

  describe('Direct Link', () => {
    it('shows direct Spotify link by default', () => {
      render(<SpotifyEmbed />);

      const link = screen.getByText(/Ouvir no Spotify/i);
      expect(link).toBeInTheDocument();
    });

    it('hides direct link when showDirectLink is false', () => {
      render(<SpotifyEmbed showDirectLink={false} />);

      expect(screen.queryByText(/Ouvir no Spotify/i)).not.toBeInTheDocument();
    });

    it('direct link opens in new tab', () => {
      render(<SpotifyEmbed />);

      const link = screen.getByText(/Ouvir no Spotify/i).closest('a');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('generates correct direct link URL for show', () => {
      const showId = 'test-show-id';
      render(<SpotifyEmbed type="show" id={showId} />);

      const link = screen.getByText(/Ouvir no Spotify/i).closest('a');
      expect(link).toHaveAttribute('href', `https://open.spotify.com/show/${showId}`);
    });

    it('generates correct direct link URL for episode', () => {
      const episodeId = 'test-episode-id';
      render(<SpotifyEmbed type="episode" id={episodeId} />);

      const link = screen.getByText(/Ouvir no Spotify/i).closest('a');
      expect(link).toHaveAttribute('href', `https://open.spotify.com/episode/${episodeId}`);
    });

    it('direct link has Spotify icon', () => {
      const { container } = render(<SpotifyEmbed />);

      const link = screen.getByText(/Ouvir no Spotify/i).closest('a');
      const svg = link?.querySelector('svg');

      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('fill', 'currentColor');
    });
  });

  describe('Iframe Attributes', () => {
    it('has proper iframe attributes for security and functionality', () => {
      render(<SpotifyEmbed />);
      const iframe = screen.getByTitle('Player do Spotify');

      expect(iframe).toHaveAttribute('loading', 'lazy');
      expect(iframe).toHaveAttribute(
        'allow',
        'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
      );
    });

    it('has responsive width', () => {
      const { container } = render(<SpotifyEmbed />);
      const iframe = container.querySelector('iframe');

      expect(iframe).toHaveClass('w-full');
    });

    it('has rounded corners', () => {
      const { container } = render(<SpotifyEmbed />);
      const iframe = container.querySelector('iframe');

      expect(iframe).toHaveClass('rounded-xl');
    });

    it('has border styling', () => {
      const { container } = render(<SpotifyEmbed />);
      const iframe = container.querySelector('iframe');

      expect(iframe).toHaveClass('border', 'border-slate-200');
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      const customClass = 'my-custom-class';
      const { container } = render(<SpotifyEmbed className={customClass} />);

      expect(container.firstChild).toHaveClass(customClass);
    });

    it('has proper container styling', () => {
      const { container } = render(<SpotifyEmbed />);

      expect(container.firstChild).toHaveClass('w-full');
    });

    it('episode banner has proper styling', () => {
      const { container } = render(<SpotifyEmbed episodeTitle="Test" />);
      const banner = container.querySelector('.bg-blue-50');

      expect(banner).toBeInTheDocument();
      expect(banner).toHaveClass('rounded-lg', 'border', 'border-blue-200');
    });
  });

  describe('Performance', () => {
    it('uses lazy loading for iframe', () => {
      render(<SpotifyEmbed />);
      const iframe = screen.getByTitle('Player do Spotify');

      expect(iframe).toHaveAttribute('loading', 'lazy');
    });

    it('has smooth opacity transition', () => {
      const { container } = render(<SpotifyEmbed />);
      const iframe = container.querySelector('iframe');

      expect(iframe).toHaveStyle({ transition: 'opacity 0.3s ease-in-out' });
    });

    it('starts with opacity 0 until loaded', () => {
      const { container } = render(<SpotifyEmbed />);
      const iframe = container.querySelector('iframe');

      expect(iframe).toHaveClass('opacity-0');
    });
  });

  describe('Accessibility', () => {
    it('has descriptive iframe title', () => {
      render(<SpotifyEmbed />);
      const iframe = screen.getByTitle('Player do Spotify');

      expect(iframe).toHaveAttribute('title', 'Player do Spotify');
    });

    it('direct link has transition for hover states', () => {
      render(<SpotifyEmbed />);
      const link = screen.getByText(/Ouvir no Spotify/i).closest('a');

      expect(link).toHaveClass('transition-colors');
    });

    it('maintains proper heading hierarchy in episode banner', () => {
      render(<SpotifyEmbed episodeTitle="Test" />);

      // Banner uses paragraph, not heading, which is correct for this context
      const banner = screen.getByText(/Episódio destacado:/i);
      expect(banner.tagName).toBe('P');
    });
  });
});
