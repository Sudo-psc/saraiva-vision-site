'use client';

import React, { useState, useCallback } from 'react';
import { Play, Clock, Calendar, ExternalLink, Volume2 } from 'lucide-react';
import Image from 'next/image';

interface PodcastEpisode {
  title: string;
  description?: string;
  formattedDuration?: string;
  publishedAt?: string;
  embedUrl?: string;
  spotifyUrl?: string;
  imageUrl?: string;
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
  const [isPlayerLoaded, setIsPlayerLoaded] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handlePlayClick = useCallback(() => {
    setIsPlayerLoaded(true);
    if (onPlay) {
      onPlay(episode);
    }
  }, [episode, onPlay]);

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

  return (
    <div className={`
      bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
      border border-gray-100 overflow-hidden
      ${compact ? 'p-4' : 'p-6'}
    `}>
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

            {showPlayer && !isPlayerLoaded && (
              <button
                onClick={handlePlayClick}
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center
                         hover:bg-opacity-60 transition-all duration-200 group"
                aria-label={`Reproduzir ${title}`}
              >
                <Play className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
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

      {showPlayer && isPlayerLoaded && embedUrl && (
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
