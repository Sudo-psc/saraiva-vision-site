import { useTranslation } from 'react-i18next';

const DEFAULT_SHOW_ID = import.meta.env.VITE_SPOTIFY_SHOW_ID || '6sHIG7HbhF1w5O63CTtxwV';

const SpotifyEmbed = ({ 
  type = 'show', 
  id = DEFAULT_SHOW_ID, 
  className = '',
  episodeTitle = null,
  compact = false
}) => {
  const { t } = useTranslation();

  const src = type === 'episode'
    ? `https://open.spotify.com/embed/episode/${id}`
    : `https://open.spotify.com/embed/show/${id}`;

  const height = compact ? 152 : (type === 'episode' ? 232 : 352);

  return (
    <div className={`w-full ${className}`}>
      {episodeTitle && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-cyan-200">
          <p className="text-sm text-cyan-800 font-medium">
            🎧 Episódio destacado: <span className="font-bold">{episodeTitle}</span>
          </p>
          <p className="text-xs text-cyan-600 mt-1">
            Role a lista abaixo para encontrar e reproduzir este episódio
          </p>
        </div>
      )}
      <iframe
        title={t('podcast.spotify_embed_title', 'Player do Spotify')}
        className="w-full rounded-xl border border-slate-200"
        style={{ height: `${height}px`, backgroundColor: 'transparent', border: 0 }}
        src={src}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
      <div className="mt-2 text-center">
        <a
          href={`https://open.spotify.com/${type === 'episode' ? 'episode' : 'show'}/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-600 hover:text-cyan-700 underline text-sm"
        >
          {t('podcast.listen_spotify', 'Ouvir no Spotify')}
        </a>
      </div>
    </div>
  );
};

export default SpotifyEmbed;
