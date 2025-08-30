import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LatestEpisodes from '../LatestEpisodes';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        podcast: 'Podcast',
        'podcast.title': 'Saraiva Vision Podcast',
        'podcast.subtitle': 'Eye health in focus',
        'podcast.episodes.glaucoma.title': 'Glaucoma Episode',
        'podcast.episodes.catarata.title': 'Catarata Episode',
        'podcast.episodes.ptergio.title': 'Pterygium Episode',
        'podcast.more_episodes': 'Listen to more podcasts'
      };
      return translations[key] || key;
    }
  })
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>
  }
}));

vi.mock('../AudioPlayer', () => ({
  default: ({ episode }) => <div data-testid="audio-player">{episode.title}</div>
}));

describe('LatestEpisodes', () => {
  it('renders mini playlist with episodes', () => {
    render(<LatestEpisodes />);

    const players = screen.getAllByTestId('audio-player');
    expect(players).toHaveLength(3);
    expect(players[0]).toHaveTextContent('Glaucoma Episode');
    expect(players[1]).toHaveTextContent('Catarata Episode');
  });
});

