/**
 * Podcast Transcript Component Tests
 * Tests for podcast transcript with search and collapsible sections
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PodcastTranscript from '@/components/podcast/PodcastTranscript';
import type { PodcastEpisode } from '@/types/podcast';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockEpisode: PodcastEpisode = {
  id: 'test-episode',
  slug: 'test-episode',
  title: 'Test Episode Title',
  description: 'Test episode description',
  cover: '/test-cover.jpg',
  duration: '10:00',
  date: '2025-10-01',
  category: 'Saúde Ocular',
  tags: ['teste', 'podcast'],
  featured: false,
  spotifyShowId: 'test-show-id',
  spotifyEpisodeId: 'test-episode-id',
  spotifyUrl: 'https://open.spotify.com/episode/test',
  transcript: {
    summary: 'This is a test episode summary about eye health.',
    keywords: ['catarata', 'cirurgia', 'Caratinga'],
    highlights: [
      {
        timestamp: '02:30',
        text: 'Important point about cataract surgery.',
        keywords: ['catarata', 'cirurgia'],
      },
      {
        timestamp: '05:15',
        text: 'Discussion about eye health in Caratinga.',
        keywords: ['saúde ocular', 'Caratinga'],
      },
    ],
    fullTranscript: '<h3>Introduction</h3><p>Welcome to our podcast about eye health.</p>',
  },
  relatedServices: [
    {
      title: 'Cirurgia de Catarata',
      url: '/servicos/catarata',
      icon: 'eye',
    },
    {
      title: 'Exames Oftalmológicos',
      url: '/servicos/exames',
      icon: 'search',
    },
  ],
  relatedPosts: [
    {
      id: 1,
      title: 'Como Prevenir Catarata',
      slug: 'prevenir-catarata',
    },
    {
      id: 2,
      title: 'Guia de Saúde Ocular',
      slug: 'guia-saude-ocular',
    },
  ],
};

describe('PodcastTranscript Component', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      expect(screen.getByText(/Transcrição do Episódio/i)).toBeInTheDocument();
    });

    it('renders summary section', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      expect(screen.getByText(/Resumo/i)).toBeInTheDocument();
      expect(screen.getByText(mockEpisode.transcript.summary)).toBeInTheDocument();
    });

    it('renders keywords', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      expect(screen.getByText('catarata')).toBeInTheDocument();
      expect(screen.getByText('cirurgia')).toBeInTheDocument();
      expect(screen.getByText('Caratinga')).toBeInTheDocument();
    });

    it('does not render when episode has no transcript', () => {
      const episodeWithoutTranscript = { ...mockEpisode, transcript: undefined };
      const { container } = render(<PodcastTranscript episode={episodeWithoutTranscript as any} />);

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('Expand/Collapse Functionality', () => {
    it('transcript is collapsed by default', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      expect(screen.getByText(/Expandir/i)).toBeInTheDocument();
      expect(screen.queryByText(/Introduction/i)).not.toBeInTheDocument();
    });

    it('expands transcript when button is clicked', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      const expandButton = screen.getByLabelText(/Expandir transcrição/i);
      fireEvent.click(expandButton);

      expect(screen.getByText(/Ocultar/i)).toBeInTheDocument();
      expect(screen.getByText(/Introduction/i)).toBeInTheDocument();
    });

    it('collapses transcript when button is clicked again', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      const expandButton = screen.getByLabelText(/Expandir transcrição/i);

      // Expand
      fireEvent.click(expandButton);
      expect(screen.getByText(/Introduction/i)).toBeInTheDocument();

      // Collapse
      const collapseButton = screen.getByLabelText(/Ocultar transcrição/i);
      fireEvent.click(collapseButton);
      expect(screen.queryByText(/Introduction/i)).not.toBeInTheDocument();
    });

    it('can be expanded by default with prop', () => {
      render(<PodcastTranscript episode={mockEpisode} defaultExpanded={true} />);

      expect(screen.getByText(/Introduction/i)).toBeInTheDocument();
      expect(screen.getByText(/Ocultar/i)).toBeInTheDocument();
    });
  });

  describe('Highlights Section', () => {
    it('renders highlights by default', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      expect(screen.getByText('Important point about cataract surgery.')).toBeInTheDocument();
      expect(screen.getByText('Discussion about eye health in Caratinga.')).toBeInTheDocument();
    });

    it('shows highlight timestamps', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      expect(screen.getByText('02:30')).toBeInTheDocument();
      expect(screen.getByText('05:15')).toBeInTheDocument();
    });

    it('shows highlight keywords', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      // Keywords appear in multiple places (main keywords section + highlight keywords)
      const catarataElements = screen.getAllByText('catarata');
      expect(catarataElements.length).toBeGreaterThan(1);
    });

    it('can toggle highlights visibility', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      const toggleButton = screen.getByText(/Ocultar Destaques/i);
      fireEvent.click(toggleButton);

      expect(screen.queryByText('Important point about cataract surgery.')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText(/Mostrar Destaques/i));
      expect(screen.getByText('Important point about cataract surgery.')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('renders search input by default', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      expect(screen.getByPlaceholderText(/Buscar nos destaques/i)).toBeInTheDocument();
    });

    it('does not render search when enableSearch is false', () => {
      render(<PodcastTranscript episode={mockEpisode} enableSearch={false} />);

      expect(screen.queryByPlaceholderText(/Buscar nos destaques/i)).not.toBeInTheDocument();
    });

    it('filters highlights based on search query', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      const searchInput = screen.getByPlaceholderText(/Buscar nos destaques/i);

      // Search for "cataract"
      fireEvent.change(searchInput, { target: { value: 'cataract' } });

      expect(screen.getByText('Important point about cataract surgery.')).toBeInTheDocument();
      expect(screen.queryByText('Discussion about eye health in Caratinga.')).not.toBeInTheDocument();
    });

    it('filters highlights by keyword', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      const searchInput = screen.getByPlaceholderText(/Buscar nos destaques/i);

      fireEvent.change(searchInput, { target: { value: 'Caratinga' } });

      expect(screen.getByText('Discussion about eye health in Caratinga.')).toBeInTheDocument();
      expect(screen.queryByText('Important point about cataract surgery.')).not.toBeInTheDocument();
    });

    it('shows no results message when search yields no matches', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      const searchInput = screen.getByPlaceholderText(/Buscar nos destaques/i);

      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      expect(screen.getByText(/Nenhum destaque encontrado para "nonexistent"/i)).toBeInTheDocument();
    });

    it('has clear search button', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      const searchInput = screen.getByPlaceholderText(/Buscar nos destaques/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const clearButton = screen.getByText(/Limpar/i);
      expect(clearButton).toBeInTheDocument();

      fireEvent.click(clearButton);
      expect(searchInput).toHaveValue('');
    });
  });

  describe('Related Services', () => {
    it('renders related services section', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      expect(screen.getByText(/Serviços Relacionados/i)).toBeInTheDocument();
      expect(screen.getByText('Cirurgia de Catarata')).toBeInTheDocument();
      expect(screen.getByText('Exames Oftalmológicos')).toBeInTheDocument();
    });

    it('related services link to correct URLs', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      const catarataLink = screen.getByText('Cirurgia de Catarata').closest('a');
      const examesLink = screen.getByText('Exames Oftalmológicos').closest('a');

      expect(catarataLink).toHaveAttribute('href', '/servicos/catarata');
      expect(examesLink).toHaveAttribute('href', '/servicos/exames');
    });

    it('does not render section when no related services', () => {
      const episodeWithoutServices = { ...mockEpisode, relatedServices: [] };
      render(<PodcastTranscript episode={episodeWithoutServices} />);

      expect(screen.queryByText(/Serviços Relacionados/i)).not.toBeInTheDocument();
    });
  });

  describe('Related Blog Posts', () => {
    it('renders related blog posts section', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      expect(screen.getByText(/Artigos Relacionados no Blog/i)).toBeInTheDocument();
      expect(screen.getByText('Como Prevenir Catarata')).toBeInTheDocument();
      expect(screen.getByText('Guia de Saúde Ocular')).toBeInTheDocument();
    });

    it('related posts link to correct blog URLs', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      const post1Link = screen.getByText('Como Prevenir Catarata').closest('a');
      const post2Link = screen.getByText('Guia de Saúde Ocular').closest('a');

      expect(post1Link).toHaveAttribute('href', '/blog/prevenir-catarata');
      expect(post2Link).toHaveAttribute('href', '/blog/guia-saude-ocular');
    });

    it('does not render section when no related posts', () => {
      const episodeWithoutPosts = { ...mockEpisode, relatedPosts: [] };
      render(<PodcastTranscript episode={episodeWithoutPosts} />);

      expect(screen.queryByText(/Artigos Relacionados no Blog/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('expand button has proper aria-label', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      const button = screen.getByLabelText(/Expandir transcrição/i);
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('expand button updates aria-expanded state', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      const button = screen.getByLabelText(/Expandir transcrição/i);
      expect(button).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(button);

      const collapseButton = screen.getByLabelText(/Ocultar transcrição/i);
      expect(collapseButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('search input has proper aria-label', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      const searchInput = screen.getByPlaceholderText(/Buscar nos destaques/i);
      expect(searchInput).toHaveAttribute('aria-label', 'Buscar nos destaques do episódio');
    });

    it('clear button has aria-label', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      const searchInput = screen.getByPlaceholderText(/Buscar nos destaques/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const clearButton = screen.getByLabelText(/Limpar busca/i);
      expect(clearButton).toHaveAttribute('aria-label');
    });

    it('buttons have focus styles', () => {
      render(<PodcastTranscript episode={mockEpisode} />);

      const expandButton = screen.getByLabelText(/Expandir transcrição/i);
      expect(expandButton).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('icons have aria-hidden attribute', () => {
      const { container } = render(<PodcastTranscript episode={mockEpisode} />);

      const hiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      const customClass = 'my-custom-class';
      const { container } = render(<PodcastTranscript episode={mockEpisode} className={customClass} />);

      expect(container.firstChild).toHaveClass(customClass);
    });

    it('has proper header styling', () => {
      const { container } = render(<PodcastTranscript episode={mockEpisode} />);

      const header = container.querySelector('.bg-gradient-to-r');
      expect(header).toHaveClass('from-primary-500', 'to-secondary-500');
    });

    it('summary section has gradient background', () => {
      const { container } = render(<PodcastTranscript episode={mockEpisode} />);

      const summary = screen.getByText(mockEpisode.transcript.summary).closest('div');
      expect(summary).toHaveClass('bg-gradient-to-br');
    });

    it('highlights have proper card styling', () => {
      const { container } = render(<PodcastTranscript episode={mockEpisode} />);

      const highlight = screen.getByText('Important point about cataract surgery.').closest('div');
      expect(highlight).toHaveClass('rounded-xl', 'border');
    });
  });

  describe('HTML Content Rendering', () => {
    it('renders full transcript HTML safely', () => {
      render(<PodcastTranscript episode={mockEpisode} defaultExpanded={true} />);

      expect(screen.getByText(/Introduction/i)).toBeInTheDocument();
      expect(screen.getByText(/Welcome to our podcast about eye health/i)).toBeInTheDocument();
    });

    it('applies prose styling to transcript content', () => {
      const { container } = render(<PodcastTranscript episode={mockEpisode} defaultExpanded={true} />);

      const proseContainer = container.querySelector('.prose');
      expect(proseContainer).toBeInTheDocument();
      expect(proseContainer).toHaveClass('prose-lg', 'max-w-none');
    });
  });
});
