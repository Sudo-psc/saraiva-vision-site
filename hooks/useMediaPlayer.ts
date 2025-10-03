'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type {
  MediaPlayerState,
  MediaPlayerControls,
  AudioPlayerEpisode,
  PlayerConfig,
  StoredPlayerState
} from '@/types/media';

const STORAGE_KEY = 'saraiva-media-player';
const SKIP_INTERVAL = 10;

interface UseMediaPlayerOptions {
  episode: AudioPlayerEpisode;
  config?: PlayerConfig;
  onPlay?: (episode: AudioPlayerEpisode) => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
  onTimeUpdate?: (currentTime: number) => void;
}

interface UseMediaPlayerReturn {
  audioRef: React.RefObject<HTMLAudioElement>;
  progressRef: React.RefObject<HTMLDivElement>;
  state: MediaPlayerState;
  controls: MediaPlayerControls;
  formatTime: (time: number) => string;
  handleProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function useMediaPlayer({
  episode,
  config = {},
  onPlay,
  onPause,
  onEnded,
  onError,
  onTimeUpdate
}: UseMediaPlayerOptions): UseMediaPlayerReturn {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<MediaPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: config.volume ?? 1,
    isMuted: false,
    playbackRate: config.playbackRate ?? 1,
    isLoading: false,
    error: null,
    buffered: 0
  });

  const loadState = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const data: StoredPlayerState = JSON.parse(stored);
      if (data.episodeId === episode.id) {
        setState(prev => ({
          ...prev,
          currentTime: data.currentTime,
          volume: data.volume,
          playbackRate: data.playbackRate
        }));

        if (audioRef.current) {
          audioRef.current.currentTime = data.currentTime;
          audioRef.current.volume = data.volume;
          audioRef.current.playbackRate = data.playbackRate;
        }
      }
    } catch (error) {
      console.warn('Failed to load player state:', error);
    }
  }, [episode.id]);

  const saveState = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const stateToSave: StoredPlayerState = {
        episodeId: episode.id,
        currentTime: state.currentTime,
        volume: state.volume,
        playbackRate: state.playbackRate,
        lastPlayed: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save player state:', error);
    }
  }, [episode.id, state.currentTime, state.volume, state.playbackRate]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  useEffect(() => {
    if (state.currentTime > 0) {
      saveState();
    }
  }, [state.currentTime, saveState]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
      if (onTimeUpdate) {
        onTimeUpdate(audio.currentTime);
      }
    };

    const updateDuration = () => {
      setState(prev => ({ ...prev, duration: audio.duration }));
    };

    const updateBuffered = () => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const bufferedPercent = (bufferedEnd / audio.duration) * 100;
        setState(prev => ({ ...prev, buffered: bufferedPercent }));
      }
    };

    const handleLoadStart = () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    };

    const handleCanPlay = () => {
      setState(prev => ({ ...prev, isLoading: false }));
    };

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      if (onEnded) {
        onEnded();
      }
    };

    const handleError = () => {
      const error = new Error('Failed to load audio');
      setState(prev => ({
        ...prev,
        isLoading: false,
        isPlaying: false,
        error: 'Falha ao carregar o áudio. Tente novamente mais tarde.'
      }));
      if (onError) {
        onError(error);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('progress', updateBuffered);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('progress', updateBuffered);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onTimeUpdate, onEnded, onError]);

  useEffect(() => {
    const handleOtherPlay = (e: CustomEvent) => {
      if (!e?.detail) return;
      if (e.detail.id !== episode.id) {
        const audio = audioRef.current;
        if (audio && !audio.paused) {
          audio.pause();
          setState(prev => ({ ...prev, isPlaying: false }));
        }
      }
    };

    window.addEventListener('sv:audio-play', handleOtherPlay as EventListener);
    return () => window.removeEventListener('sv:audio-play', handleOtherPlay as EventListener);
  }, [episode.id]);

  useEffect(() => {
    return () => {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      } catch (error) {
        console.warn('Error pausing audio on unmount:', error);
      }
    };
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !episode.src) return;

    try {
      window.dispatchEvent(new CustomEvent('sv:audio-play', { detail: { id: episode.id } }));

      audio.playsInline = true;
      audio.muted = false;

      if (audio.readyState < 2) {
        setState(prev => ({ ...prev, isLoading: true }));
        await new Promise<void>((resolve, reject) => {
          const handleCanPlay = () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            setState(prev => ({ ...prev, isLoading: false }));
            resolve();
          };
          const handleError = () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            setState(prev => ({ ...prev, isLoading: false }));
            reject(new Error('Failed to load audio'));
          };
          audio.addEventListener('canplay', handleCanPlay);
          audio.addEventListener('error', handleError);
          audio.load();
        });
      }

      await audio.play();
      setState(prev => ({ ...prev, isPlaying: true }));

      if (onPlay) {
        onPlay(episode);
      }
    } catch (error) {
      console.warn('Audio play failed:', error);
      setState(prev => ({
        ...prev,
        isPlaying: false,
        error: 'Falha ao reproduzir o áudio. Tente novamente.'
      }));
      if (onError) {
        onError(error as Error);
      }
    }
  }, [episode, onPlay, onError]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setState(prev => ({ ...prev, isPlaying: false }));

    if (onPause) {
      onPause();
    }
  }, [onPause]);

  const togglePlayPause = useCallback(async () => {
    if (state.isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [state.isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, Math.min(state.duration, time));
  }, [state.duration]);

  const skipForward = useCallback((seconds: number = config.skipInterval ?? SKIP_INTERVAL) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.min(state.duration, audio.currentTime + seconds);
  }, [state.duration, config.skipInterval]);

  const skipBackward = useCallback((seconds: number = config.skipInterval ?? SKIP_INTERVAL) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, audio.currentTime - seconds);
  }, [config.skipInterval]);

  const setVolume = useCallback((volume: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const clampedVolume = Math.max(0, Math.min(1, volume));
    audio.volume = clampedVolume;
    setState(prev => ({
      ...prev,
      volume: clampedVolume,
      isMuted: clampedVolume === 0
    }));
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.isMuted) {
      audio.volume = state.volume;
      setState(prev => ({ ...prev, isMuted: false }));
    } else {
      audio.volume = 0;
      setState(prev => ({ ...prev, isMuted: true }));
    }
  }, [state.isMuted, state.volume]);

  const setPlaybackRate = useCallback((rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const clampedRate = Math.max(0.5, Math.min(2, rate));
    audio.playbackRate = clampedRate;
    setState(prev => ({ ...prev, playbackRate: clampedRate }));
  }, []);

  const restart = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setState(prev => ({ ...prev, currentTime: 0 }));
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressRef.current;
    const audio = audioRef.current;
    if (!progressBar || !audio) return;

    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * state.duration;

    audio.currentTime = newTime;
  }, [state.duration]);

  const formatTime = useCallback((time: number): string => {
    if (!isFinite(time)) return '0:00';

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const controls: MediaPlayerControls = {
    play,
    pause,
    togglePlayPause,
    seek,
    skipForward,
    skipBackward,
    setVolume,
    toggleMute,
    setPlaybackRate,
    restart
  };

  return {
    audioRef,
    progressRef,
    state,
    controls,
    formatTime,
    handleProgressClick
  };
}
