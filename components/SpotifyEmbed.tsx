/**
 * Spotify Embed Component - Next.js 15
 * Embeds Spotify podcast shows and episodes with responsive behavior
 */

'use client';

import { useState } from 'react';
import type { SpotifyEmbedProps } from '@/types/podcast';

const DEFAULT_SHOW_ID = process.env.NEXT_PUBLIC_SPOTIFY_SHOW_ID || '6sHIG7HbhF1w5O63CTtxwV';

export default function SpotifyEmbed({
  type = 'show',
  id = DEFAULT_SHOW_ID,
  className = '',
  episodeTitle = null,
  compact = false,
  height,
  showDirectLink = true,
}: SpotifyEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const src = type === 'episode' ? `https://open.spotify.com/embed/episode/${id}` : `https://open.spotify.com/embed/show/${id}`;

  const embedHeight = height || (compact ? 152 : type === 'episode' ? 232 : 352);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`w-full ${className}`}>
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-800 font-medium mb-3">Não foi possível carregar o player do Spotify</p>
          <a
            href={`https://open.spotify.com/${type === 'episode' ? 'episode' : 'show'}/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Abrir no Spotify
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {episodeTitle && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-medium">
            🎧 Episódio destacado: <span className="font-bold">{episodeTitle}</span>
          </p>
          <p className="text-xs text-blue-600 mt-1">Role a lista abaixo para encontrar e reproduzir este episódio</p>
        </div>
      )}

      <div className="relative">
        {isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-xl border border-slate-200"
            style={{ height: `${embedHeight}px` }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
              <p className="text-sm text-slate-600 font-medium">Carregando player do Spotify...</p>
            </div>
          </div>
        )}

        <iframe
          title="Player do Spotify"
          className={`w-full rounded-xl border border-slate-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{
            height: `${embedHeight}px`,
            backgroundColor: 'transparent',
            border: 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
          src={src}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>

      {showDirectLink && (
        <div className="mt-2 text-center">
          <a
            href={`https://open.spotify.com/${type === 'episode' ? 'episode' : 'show'}/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 underline text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Ouvir no Spotify
          </a>
        </div>
      )}
    </div>
  );
}
