import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PodcastEpisodeCard from '@/components/PodcastEpisodeCard';

describe('PodcastEpisodeCard covers', () => {
  const baseEpisode = {
    id: 'dmri',
    title: 'DMRI — Quando a Mácula Decide se Aposentar',
    description: 'Episódio sobre Degeneração Macular Relacionada à Idade',
    date: '2025-08-31T00:00:00.000Z',
    duration: '12:34',
    tags: ['DMRI', 'Retina'],
    category: 'Doenças Oculares',
    cover: '/Podcasts/Covers/dmri.png'
  };

  it('exibe a capa do episódio quando disponível', () => {
    render(<PodcastEpisodeCard episode={baseEpisode} index={0} />);
    const img = screen.getByAltText(baseEpisode.title);
    // Simula carregamento bem-sucedido
    fireEvent.load(img);
    expect(img.getAttribute('src')).toContain('/Podcasts/Covers/dmri.png');
    expect(img).not.toHaveClass('hidden');
    expect(screen.queryByText(/Imagem não disponível/i)).not.toBeInTheDocument();
  });

  it('usa fallback de capa quando a imagem falhar', async () => {
    const broken = { ...baseEpisode, cover: '/Podcasts/Covers/inexistente.png' };
    render(<PodcastEpisodeCard episode={broken} index={0} />);
    const img = screen.getByAltText(broken.title);
    // Dispara erro para acionar fallback
    fireEvent.error(img);
    // Após o onError custom e interno, a src deve apontar para a capa padrão
    expect(img.getAttribute('src')).toContain('/Podcasts/Covers/podcast.png');
  });
});

