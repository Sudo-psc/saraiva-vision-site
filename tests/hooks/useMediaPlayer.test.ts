import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMediaPlayer } from '@/hooks/useMediaPlayer';
import type { AudioPlayerEpisode } from '@/types/media';

describe('useMediaPlayer', () => {
  const mockEpisode: AudioPlayerEpisode = {
    id: 'test-1',
    title: 'Test Episode',
    src: '/test-audio.mp3'
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

    localStorage.clear();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useMediaPlayer({ episode: mockEpisode }));

    expect(result.current.state.isPlaying).toBe(false);
    expect(result.current.state.currentTime).toBe(0);
    expect(result.current.state.volume).toBe(1);
    expect(result.current.state.isMuted).toBe(false);
    expect(result.current.state.playbackRate).toBe(1);
  });

  it('provides audio ref', () => {
    const { result } = renderHook(() => useMediaPlayer({ episode: mockEpisode }));

    expect(result.current.audioRef).toBeDefined();
    expect(result.current.audioRef.current).toBeNull();
  });

  it('provides progress ref', () => {
    const { result } = renderHook(() => useMediaPlayer({ episode: mockEpisode }));

    expect(result.current.progressRef).toBeDefined();
    expect(result.current.progressRef.current).toBeNull();
  });

  it('provides control functions', () => {
    const { result } = renderHook(() => useMediaPlayer({ episode: mockEpisode }));

    expect(result.current.controls.play).toBeInstanceOf(Function);
    expect(result.current.controls.pause).toBeInstanceOf(Function);
    expect(result.current.controls.togglePlayPause).toBeInstanceOf(Function);
    expect(result.current.controls.seek).toBeInstanceOf(Function);
    expect(result.current.controls.skipForward).toBeInstanceOf(Function);
    expect(result.current.controls.skipBackward).toBeInstanceOf(Function);
    expect(result.current.controls.setVolume).toBeInstanceOf(Function);
    expect(result.current.controls.toggleMute).toBeInstanceOf(Function);
    expect(result.current.controls.setPlaybackRate).toBeInstanceOf(Function);
    expect(result.current.controls.restart).toBeInstanceOf(Function);
  });

  it('formats time correctly', () => {
    const { result } = renderHook(() => useMediaPlayer({ episode: mockEpisode }));

    expect(result.current.formatTime(0)).toBe('0:00');
    expect(result.current.formatTime(65)).toBe('1:05');
    expect(result.current.formatTime(125)).toBe('2:05');
    expect(result.current.formatTime(3665)).toBe('61:05');
  });

  it('handles invalid time formatting', () => {
    const { result } = renderHook(() => useMediaPlayer({ episode: mockEpisode }));

    expect(result.current.formatTime(NaN)).toBe('0:00');
    expect(result.current.formatTime(Infinity)).toBe('0:00');
  });

  it('calls onPlay callback when playing', async () => {
    const onPlay = vi.fn();
    const { result } = renderHook(() =>
      useMediaPlayer({ episode: mockEpisode, onPlay })
    );

    await act(async () => {
      await result.current.controls.play();
    });

    expect(onPlay).toHaveBeenCalledWith(mockEpisode);
  });

  it('calls onPause callback when pausing', () => {
    const onPause = vi.fn();
    const { result } = renderHook(() =>
      useMediaPlayer({ episode: mockEpisode, onPause })
    );

    act(() => {
      result.current.controls.pause();
    });

    expect(onPause).toHaveBeenCalled();
  });

  it('saves state to localStorage', async () => {
    const { result } = renderHook(() => useMediaPlayer({ episode: mockEpisode }));

    act(() => {
      result.current.controls.setVolume(0.5);
    });

    await waitFor(() => {
      const stored = localStorage.getItem('saraiva-media-player');
      if (stored) {
        const data = JSON.parse(stored);
        expect(data.volume).toBe(0.5);
        expect(data.episodeId).toBe('test-1');
      }
    });
  });

  it('loads state from localStorage', () => {
    const savedState = {
      episodeId: 'test-1',
      currentTime: 30,
      volume: 0.7,
      playbackRate: 1.5,
      lastPlayed: new Date().toISOString()
    };

    localStorage.setItem('saraiva-media-player', JSON.stringify(savedState));

    const { result } = renderHook(() => useMediaPlayer({ episode: mockEpisode }));

    expect(result.current.state.volume).toBe(0.7);
    expect(result.current.state.playbackRate).toBe(1.5);
  });

  it('handles volume changes', () => {
    const { result } = renderHook(() => useMediaPlayer({ episode: mockEpisode }));

    act(() => {
      result.current.controls.setVolume(0.5);
    });

    expect(result.current.state.volume).toBe(0.5);
    expect(result.current.state.isMuted).toBe(false);
  });

  it('handles muting', () => {
    const { result } = renderHook(() => useMediaPlayer({ episode: mockEpisode }));

    act(() => {
      result.current.controls.toggleMute();
    });

    expect(result.current.state.isMuted).toBe(true);
  });

  it('handles playback rate changes', () => {
    const { result } = renderHook(() => useMediaPlayer({ episode: mockEpisode }));

    act(() => {
      result.current.controls.setPlaybackRate(1.5);
    });

    expect(result.current.state.playbackRate).toBe(1.5);
  });

  it('clamps volume to valid range', () => {
    const { result } = renderHook(() => useMediaPlayer({ episode: mockEpisode }));

    act(() => {
      result.current.controls.setVolume(1.5);
    });

    expect(result.current.state.volume).toBe(1);

    act(() => {
      result.current.controls.setVolume(-0.5);
    });

    expect(result.current.state.volume).toBe(0);
  });

  it('clamps playback rate to valid range', () => {
    const { result } = renderHook(() => useMediaPlayer({ episode: mockEpisode }));

    act(() => {
      result.current.controls.setPlaybackRate(3);
    });

    expect(result.current.state.playbackRate).toBe(2);

    act(() => {
      result.current.controls.setPlaybackRate(0.25);
    });

    expect(result.current.state.playbackRate).toBe(0.5);
  });

  it('respects custom config', () => {
    const { result } = renderHook(() =>
      useMediaPlayer({
        episode: mockEpisode,
        config: {
          volume: 0.8,
          playbackRate: 1.25,
          skipInterval: 15
        }
      })
    );

    expect(result.current.state.volume).toBe(0.8);
    expect(result.current.state.playbackRate).toBe(1.25);
  });
});
