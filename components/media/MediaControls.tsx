'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  RotateCcw,
  Download,
  Settings,
  Share2
} from 'lucide-react';
import type { MediaControlsProps } from '@/types/media';
import { PLAYBACK_RATES } from '@/types/media';

const MediaControls: React.FC<MediaControlsProps> = ({
  state,
  controls,
  episode,
  mode = 'card',
  showAdvancedControls = true,
  className = ''
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const isCompact = mode === 'inline' || mode === 'compact';
  const progress = state.duration ? (state.currentTime / state.duration) * 100 : 0;

  const handleShare = async () => {
    if (navigator.share && episode.spotifyUrl) {
      try {
        await navigator.share({
          title: episode.title,
          text: episode.description || `Ouça: ${episode.title}`,
          url: episode.spotifyUrl
        });
      } catch (error) {
        console.warn('Share failed:', error);
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const handleDownload = () => {
    if (!episode.src) return;

    const link = document.createElement('a');
    link.href = episode.src;
    link.download = `${episode.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  if (isCompact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <button
          onClick={controls.togglePlayPause}
          disabled={state.isLoading || !episode.src}
          className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 flex-shrink-0"
          aria-label={episode.src ? (state.isPlaying ? 'Pausar' : 'Reproduzir') : 'Áudio indisponível'}
        >
          {state.isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : state.isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>

        <div className="flex-grow min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate mb-1">
            {episode.title}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{formatTime(state.currentTime)}</span>
            <span>/</span>
            <span>{formatTime(state.duration)}</span>
          </div>
        </div>

        <button
          onClick={controls.toggleMute}
          className="p-2 text-text-muted hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1"
          aria-label={state.isMuted ? 'Ativar som' : 'Silenciar'}
        >
          {state.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {state.error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={controls.restart}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1"
            aria-label="Reiniciar episódio"
            title="Reiniciar do início"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => controls.skipBackward()}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1"
            aria-label="Voltar 10 segundos"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={controls.togglePlayPause}
            disabled={state.isLoading || !episode.src}
            className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-full flex items-center justify-center transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
            aria-label={episode.src ? (state.isPlaying ? 'Pausar' : 'Reproduzir') : 'Áudio indisponível'}
          >
            {state.isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : state.isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          <button
            onClick={() => controls.skipForward()}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1"
            aria-label="Avançar 10 segundos"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <div className="flex-grow" />

          {showAdvancedControls && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={controls.toggleMute}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1"
                  aria-label={state.isMuted ? 'Ativar som' : 'Silenciar'}
                >
                  {state.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={state.isMuted ? 0 : state.volume}
                  onChange={(e) => controls.setVolume(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300"
                  aria-label="Volume"
                />
              </div>

              {episode.src && (
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1"
                  aria-label="Baixar episódio"
                  title="Baixar episódio"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1"
                  aria-label="Configurações de velocidade"
                  title="Velocidade de reprodução"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-3 min-w-[120px] z-50"
                    >
                      <div className="text-xs font-medium text-gray-700 mb-2">
                        Velocidade
                      </div>
                      <div className="space-y-1">
                        {PLAYBACK_RATES.map((rate) => (
                          <button
                            key={rate.value}
                            onClick={() => {
                              controls.setPlaybackRate(rate.value);
                              setShowSettings(false);
                            }}
                            className={`w-full text-left px-2 py-1 rounded-lg text-sm transition-colors ${
                              state.playbackRate === rate.value
                                ? 'bg-primary-50 text-primary-600 font-semibold border border-primary-200'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {rate.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1"
                  aria-label="Compartilhar"
                  title="Compartilhar"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-3 min-w-[200px] z-50"
                    >
                      <div className="text-xs font-medium text-gray-700 mb-2">
                        Compartilhar
                      </div>
                      <div className="space-y-1">
                        {episode.spotifyUrl && (
                          <button
                            onClick={() => {
                              copyToClipboard(episode.spotifyUrl!);
                              setShowShareMenu(false);
                            }}
                            className="w-full text-left px-2 py-1 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            Copiar link Spotify
                          </button>
                        )}
                        {episode.applePodcastsUrl && (
                          <button
                            onClick={() => {
                              copyToClipboard(episode.applePodcastsUrl!);
                              setShowShareMenu(false);
                            }}
                            className="w-full text-left px-2 py-1 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            Copiar link Apple Podcasts
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-1">
                {episode.spotifyUrl && (
                  <a
                    href={episode.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:text-[#1DB954] hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1"
                    aria-label="Ouvir no Spotify"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                  </a>
                )}
                {episode.applePodcastsUrl && (
                  <a
                    href={episode.applePodcastsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1"
                    aria-label="Ouvir no Apple Podcasts"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.182c5.42 0 9.818 4.398 9.818 9.818S17.42 21.818 12 21.818 2.182 17.42 2.182 12 6.58 2.182 12 2.182zm0 3.273c-3.6 0-6.545 2.945-6.545 6.545S8.4 18.545 12 18.545s6.545-2.945 6.545-6.545S15.6 5.455 12 5.455zm0 2.182c2.4 0 4.364 1.964 4.364 4.363S14.4 16.364 12 16.364 7.636 14.4 7.636 12 9.6 7.637 12 7.637zm0 1.636c-1.5 0-2.727 1.227-2.727 2.727S10.5 14.727 12 14.727 14.727 13.5 14.727 12 13.5 9.273 12 9.273z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 flex justify-between">
          <span>{formatTime(state.currentTime)}</span>
          <span>{formatTime(state.duration)}</span>
        </div>
      </div>
    </div>
  );
};

function formatTime(time: number): string {
  if (!isFinite(time)) return '0:00';

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default MediaControls;
