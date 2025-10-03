'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Clock,
  Calendar,
  ExternalLink,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward
} from 'lucide-react';
import Image from 'next/image';

interface PodcastEpisode {
  title: string;
  description?: string;
  formattedDuration?: string;
  publishedAt?: string;
  embedUrl?: string;
  spotifyUrl?: string;
  imageUrl?: string;
  audioUrl?: string;
}

interface PodcastPlayerProps {
  episode: PodcastEpisode;
  showPlayer?: boolean;
  compact?: boolean;
  onPlay?: (episode: PodcastEpisode) => void;
}

const PodcastPlayer: React.FC<PodcastPlayerProps> = ({
  episode,
  showPlayer = true,
  compact = false,
  onPlay = undefined
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlayerLoaded, setIsPlayerLoaded] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const hasAudioUrl = Boolean(episode.audioUrl);
  const canUseNativePlayer = hasAudioUrl && !episode.embedUrl;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !canUseNativePlayer) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [canUseNativePlayer]);

  const togglePlayPause = useCallback(async () => {
    if (!canUseNativePlayer) {
      setIsPlayerLoaded(true);
      if (onPlay) {
        onPlay(episode);
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        if (onPlay) {
          onPlay(episode);
        }
      } catch (error) {
        console.warn('Playback failed:', error);
      }
    }
  }, [canUseNativePlayer, isPlaying, episode, onPlay]);

  const handlePlayClick = useCallback(() => {
    togglePlayPause();
  }, [togglePlayPause]);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  }, [duration]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const handleSpotifyClick = useCallback(() => {
    if (episode?.spotifyUrl) {
      window.open(episode.spotifyUrl, '_blank', 'noopener,noreferrer');
    }
  }, [episode?.spotifyUrl]);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  }, []);

  const truncateDescription = useCallback((text: string, maxLength: number = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }, []);

  if (!episode) {
    return null;
  }

  const {
    title,
    description,
    formattedDuration,
    publishedAt,
    embedUrl,
    spotifyUrl,
    imageUrl
  } = episode;

  const progress = duration ? (currentTime / duration) * 100 : 0;

  const formatTime = (time: number): string => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`
      bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
      border border-gray-100 overflow-hidden
      ${compact ? 'p-4' : 'p-6'}
    `}>
      {canUseNativePlayer && (
        <audio
          ref={audioRef}
          src={episode.audioUrl}
          preload="metadata"
          className="hidden"
        />
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0">
          <div className={`
            relative rounded-lg overflow-hidden bg-gray-100
            ${compact ? 'w-16 h-16' : 'w-20 h-20'}
          `}>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
            )}

            {showPlayer && (!isPlayerLoaded || canUseNativePlayer) && (
              <button
                onClick={handlePlayClick}
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center
                         hover:bg-opacity-60 transition-all duration-200 group"
                aria-label={`${isPlaying ? 'Pausar' : 'Reproduzir'} ${title}`}
              >
                {canUseNativePlayer && isPlaying ? (
                  <Pause className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                ) : (
                  <Play className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`
            font-semibold text-gray-900 mb-2 line-clamp-2
            ${compact ? 'text-lg' : 'text-xl'}
          `}>
            {title}
          </h3>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            {publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(publishedAt)}</span>
              </div>
            )}

            {formattedDuration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formattedDuration}</span>
              </div>
            )}
          </div>

          {description && !compact && (
            <div className="text-gray-700 text-sm leading-relaxed">
              <p>
                {showFullDescription
                  ? description
                  : truncateDescription(description)
                }
              </p>

              {description.length > 150 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-blue-600 hover:text-blue-700 font-medium mt-1 text-xs"
                >
                  {showFullDescription ? 'Ver menos' : 'Ver mais'}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          {spotifyUrl && (
            <button
              onClick={handleSpotifyClick}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Abrir no Spotify"
              aria-label="Abrir no Spotify"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {canUseNativePlayer && isPlaying && (
        <div className="mt-4 space-y-3">
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => skip(-10)}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                aria-label="Voltar 10 segundos"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlayPause}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => skip(10)}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                aria-label="Avançar 10 segundos"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <div className="text-xs text-gray-600 flex items-center gap-1">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="relative flex items-center gap-1">
              <button
                onClick={toggleMute}
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {showVolumeSlider && (
                <div
                  className="absolute right-full mr-2 top-1/2 -translate-y-1/2"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary-600"
                    aria-label="Volume"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showPlayer && isPlayerLoaded && embedUrl && !canUseNativePlayer && (
        <div className="mt-4">
          <div className="relative w-full" style={{ height: '152px' }}>
            <iframe
              src={embedUrl}
              width="100%"
              height="152"
              allow="encrypted-media"
              loading="lazy"
              className="rounded-lg border-0"
              title={`Player do Spotify - ${title}`}
            />
          </div>
        </div>
      )}

      {description && compact && (
        <div className="text-gray-600 text-sm leading-relaxed">
          <p>{truncateDescription(description, 100)}</p>
        </div>
      )}
    </div>
  );
};

export default PodcastPlayer;
