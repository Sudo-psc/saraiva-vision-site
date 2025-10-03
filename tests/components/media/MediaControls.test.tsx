import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MediaControls from '@/components/media/MediaControls';
import type { MediaPlayerState, MediaPlayerControls, AudioPlayerEpisode } from '@/types/media';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('MediaControls', () => {
  const mockState: MediaPlayerState = {
    isPlaying: false,
    currentTime: 0,
    duration: 600,
    volume: 1,
    isMuted: false,
    playbackRate: 1,
    isLoading: false,
    error: null,
    buffered: 0
  };

  const mockControls: MediaPlayerControls = {
    play: vi.fn(),
    pause: vi.fn(),
    togglePlayPause: vi.fn(),
    seek: vi.fn(),
    skipForward: vi.fn(),
    skipBackward: vi.fn(),
    setVolume: vi.fn(),
    toggleMute: vi.fn(),
    setPlaybackRate: vi.fn(),
    restart: vi.fn()
  };

  const mockEpisode: AudioPlayerEpisode = {
    id: 'test-1',
    title: 'Test Episode',
    src: '/test.mp3'
  };

  it('renders play button when not playing', () => {
    render(
      <MediaControls
        state={mockState}
        controls={mockControls}
        episode={mockEpisode}
      />
    );

    const playButton = screen.getByLabelText('Reproduzir');
    expect(playButton).toBeInTheDocument();
  });

  it('renders pause button when playing', () => {
    const playingState = { ...mockState, isPlaying: true };

    render(
      <MediaControls
        state={playingState}
        controls={mockControls}
        episode={mockEpisode}
      />
    );

    const pauseButton = screen.getByLabelText('Pausar');
    expect(pauseButton).toBeInTheDocument();
  });

  it('calls togglePlayPause when play/pause button clicked', () => {
    render(
      <MediaControls
        state={mockState}
        controls={mockControls}
        episode={mockEpisode}
      />
    );

    const playButton = screen.getByLabelText('Reproduzir');
    fireEvent.click(playButton);

    expect(mockControls.togglePlayPause).toHaveBeenCalled();
  });

  it('calls skipBackward when skip back button clicked', () => {
    render(
      <MediaControls
        state={mockState}
        controls={mockControls}
        episode={mockEpisode}
      />
    );

    const skipBackButton = screen.getByLabelText('Voltar 10 segundos');
    fireEvent.click(skipBackButton);

    expect(mockControls.skipBackward).toHaveBeenCalled();
  });

  it('calls skipForward when skip forward button clicked', () => {
    render(
      <MediaControls
        state={mockState}
        controls={mockControls}
        episode={mockEpisode}
      />
    );

    const skipForwardButton = screen.getByLabelText('Avançar 10 segundos');
    fireEvent.click(skipForwardButton);

    expect(mockControls.skipForward).toHaveBeenCalled();
  });

  it('calls restart when restart button clicked', () => {
    render(
      <MediaControls
        state={mockState}
        controls={mockControls}
        episode={mockEpisode}
      />
    );

    const restartButton = screen.getByLabelText('Reiniciar episódio');
    fireEvent.click(restartButton);

    expect(mockControls.restart).toHaveBeenCalled();
  });

  it('calls toggleMute when mute button clicked', () => {
    render(
      <MediaControls
        state={mockState}
        controls={mockControls}
        episode={mockEpisode}
      />
    );

    const muteButton = screen.getByLabelText('Silenciar');
    fireEvent.click(muteButton);

    expect(mockControls.toggleMute).toHaveBeenCalled();
  });

  it('shows error message when error exists', () => {
    const errorState = { ...mockState, error: 'Test error message' };

    render(
      <MediaControls
        state={errorState}
        controls={mockControls}
        episode={mockEpisode}
      />
    );

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    const loadingState = { ...mockState, isLoading: true };

    render(
      <MediaControls
        state={loadingState}
        controls={mockControls}
        episode={mockEpisode}
      />
    );

    const playButton = screen.getByLabelText('Reproduzir');
    expect(playButton).toBeDisabled();
  });

  it('renders compact mode correctly', () => {
    render(
      <MediaControls
        state={mockState}
        controls={mockControls}
        episode={mockEpisode}
        mode="compact"
      />
    );

    expect(screen.getByText('Test Episode')).toBeInTheDocument();
  });

  it('shows advanced controls when enabled', () => {
    render(
      <MediaControls
        state={mockState}
        controls={mockControls}
        episode={mockEpisode}
        showAdvancedControls={true}
      />
    );

    const volumeSlider = screen.getByLabelText('Volume');
    expect(volumeSlider).toBeInTheDocument();
  });

  it('hides advanced controls in compact mode', () => {
    render(
      <MediaControls
        state={mockState}
        controls={mockControls}
        episode={mockEpisode}
        mode="compact"
        showAdvancedControls={false}
      />
    );

    const volumeSlider = screen.queryByLabelText('Volume');
    expect(volumeSlider).not.toBeInTheDocument();
  });

  it('opens settings menu when settings button clicked', () => {
    render(
      <MediaControls
        state={mockState}
        controls={mockControls}
        episode={mockEpisode}
        showAdvancedControls={true}
      />
    );

    const settingsButton = screen.getByLabelText('Configurações de velocidade');
    fireEvent.click(settingsButton);

    expect(screen.getByText('Velocidade')).toBeInTheDocument();
  });

  it('changes playback rate when rate button clicked', () => {
    render(
      <MediaControls
        state={mockState}
        controls={mockControls}
        episode={mockEpisode}
        showAdvancedControls={true}
      />
    );

    const settingsButton = screen.getByLabelText('Configurações de velocidade');
    fireEvent.click(settingsButton);

    const rateButton = screen.getByText('1.5x');
    fireEvent.click(rateButton);

    expect(mockControls.setPlaybackRate).toHaveBeenCalledWith(1.5);
  });

  it('renders external links when provided', () => {
    const episodeWithLinks = {
      ...mockEpisode,
      spotifyUrl: 'https://spotify.com/test'
    };

    render(
      <MediaControls
        state={mockState}
        controls={mockControls}
        episode={episodeWithLinks}
        showAdvancedControls={true}
      />
    );

    const spotifyLink = screen.getByLabelText('Ouvir no Spotify');
    expect(spotifyLink).toBeInTheDocument();
    expect(spotifyLink).toHaveAttribute('href', 'https://spotify.com/test');
  });
});
