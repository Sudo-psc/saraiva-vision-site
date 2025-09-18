import React from 'react';
import { useTranslation } from 'react-i18next';

// Lightweight Spotify embed component. Supports show/episode types.
// Defaults to the clinic podcast show if no ID is provided.
const DEFAULT_SHOW_ID = import.meta.env.VITE_SPOTIFY_SHOW_ID || '6sHIG7HbhF1w5O63CTtxwV';

const SpotifyEmbed = ({ type = 'show', id = DEFAULT_SHOW_ID, className = '' }) => {
  const { t } = useTranslation();

  const src = type === 'episode'
    ? `https://open.spotify.com/embed/episode/${id}`
    : `https://open.spotify.com/embed/show/${id}`;

  return (
    <div className={`w-full ${className}`}>
      <iframe
        title={t('podcast.spotify_embed_title', 'Player do Spotify')}
        className="w-full rounded-xl border border-slate-200"
        style={{ minHeight: 152, backgroundColor: 'transparent' }}
        src={src}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
      <div className="mt-2 text-center">
        <a
          href={`https://open.spotify.com/${type === 'episode' ? 'episode' : 'show'}/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 underline text-sm"
        >
          {t('podcast.listen_spotify', 'Ouvir no Spotify')}
        </a>
      </div>
    </div>
  );
};

export default SpotifyEmbed;
