import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AudioPlayer from '@/components/media/AudioPlayer';
import type { AudioPlayerEpisode } from '@/types/media';

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  }
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('AudioPlayer', () => {
  const mockEpisode: AudioPlayerEpisode = {
    id: 'test-1',
    title: 'Test Episode',
    description: 'Test description',
    src: '/test-audio.mp3',
    cover: '/test-cover.jpg',
    duration: '10:00',
    category: 'Test'
  };

  beforeEach(() => {
    Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined)
    });

    Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      value: vi.fn()
    });

    Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
      configurable: true,
      value: vi.fn()
    });
  });

  it('renders card mode correctly', () => {
    render(<AudioPlayer episode={mockEpisode} mode="card" />);

    expect(screen.getByText('Test Episode')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('renders compact mode correctly', () => {
    render(<AudioPlayer episode={mockEpisode} mode="compact" />);

    expect(screen.getByText('Test Episode')).toBeInTheDocument();
    const playButton = screen.getByLabelText('Reproduzir');
    expect(playButton).toBeInTheDocument();
  });

  it('toggles play/pause on button click', async () => {
    render(<AudioPlayer episode={mockEpisode} mode="card" />);

    const playButton = screen.getByLabelText('Reproduzir');
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Pausar')).toBeInTheDocument();
    });

    const pauseButton = screen.getByLabelText('Pausar');
    fireEvent.click(pauseButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Reproduzir')).toBeInTheDocument();
    });
  });

  it('renders modal mode with close button', () => {
    const onClose = vi.fn();
    render(<AudioPlayer episode={mockEpisode} mode="modal" onClose={onClose} />);

    const closeButton = screen.getByLabelText('Fechar player');
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('handles volume changes', () => {
    render(<AudioPlayer episode={mockEpisode} mode="card" />);

    const volumeInput = screen.getByLabelText('Volume');
    fireEvent.change(volumeInput, { target: { value: '0.5' } });

    expect(volumeInput).toHaveValue('0.5');
  });

  it('calls onPlay callback when playing', async () => {
    const onPlay = vi.fn();
    render(<AudioPlayer episode={mockEpisode} mode="card" onPlay={onPlay} />);

    const playButton = screen.getByLabelText('Reproduzir');
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(onPlay).toHaveBeenCalledWith(mockEpisode);
    });
  });

  it('calls onPause callback when pausing', async () => {
    const onPause = vi.fn();
    render(<AudioPlayer episode={mockEpisode} mode="card" onPause={onPause} />);

    const playButton = screen.getByLabelText('Reproduzir');
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Pausar')).toBeInTheDocument();
    });

    const pauseButton = screen.getByLabelText('Pausar');
    fireEvent.click(pauseButton);

    await waitFor(() => {
      expect(onPause).toHaveBeenCalled();
    });
  });

  it('renders audio element with correct src', () => {
    const { container } = render(<AudioPlayer episode={mockEpisode} mode="card" />);

    const audioElement = container.querySelector('audio');
    expect(audioElement).toBeInTheDocument();
    expect(audioElement).toHaveAttribute('src', '/test-audio.mp3');
  });

  it('shows progress bar', () => {
    render(<AudioPlayer episode={mockEpisode} mode="card" />);

    const progressBar = screen.getByRole('slider', { name: 'Progresso do áudio' });
    expect(progressBar).toBeInTheDocument();
  });

  it('renders external links when provided', () => {
    const episodeWithLinks: AudioPlayerEpisode = {
      ...mockEpisode,
      spotifyUrl: 'https://spotify.com/test',
      applePodcastsUrl: 'https://apple.com/test'
    };

    render(<AudioPlayer episode={episodeWithLinks} mode="card" />);

    const spotifyLink = screen.getByLabelText('Ouvir no Spotify');
    expect(spotifyLink).toBeInTheDocument();
    expect(spotifyLink).toHaveAttribute('href', 'https://spotify.com/test');

    const appleLink = screen.getByLabelText('Ouvir no Apple Podcasts');
    expect(appleLink).toBeInTheDocument();
    expect(appleLink).toHaveAttribute('href', 'https://apple.com/test');
  });

  it('supports keyboard navigation on progress bar', () => {
    render(<AudioPlayer episode={mockEpisode} mode="card" />);

    const progressBar = screen.getByRole('slider', { name: 'Progresso do áudio' });

    fireEvent.keyDown(progressBar, { key: 'ArrowLeft' });
    fireEvent.keyDown(progressBar, { key: 'ArrowRight' });
    fireEvent.keyDown(progressBar, { key: ' ' });

    expect(progressBar).toBeInTheDocument();
  });
});
