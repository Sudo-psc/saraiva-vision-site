'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useMediaPlayer } from '@/hooks/useMediaPlayer';
import MediaControls from './MediaControls';
import type { MediaPlayerProps, PlayerMode } from '@/types/media';

const AudioPlayer: React.FC<MediaPlayerProps> = ({
  episode,
  mode = 'card',
  config,
  onPlay,
  onPause,
  onEnded,
  onError,
  onTimeUpdate,
  onClose,
  className = ''
}) => {
  const {
    audioRef,
    progressRef,
    state,
    controls,
    formatTime,
    handleProgressClick
  } = useMediaPlayer({
    episode,
    config,
    onPlay,
    onPause,
    onEnded,
    onError,
    onTimeUpdate
  });

  const progress = state.duration ? (state.currentTime / state.duration) * 100 : 0;
  const isModal = mode === 'modal';
  const isCompact = mode === 'inline' || mode === 'compact';
  const isCard = mode === 'card';

  const audioElement = (
    <audio
      ref={audioRef}
      src={episode.src}
      preload="none"
      playsInline
      className="hidden"
      aria-label={`Player de áudio: ${episode.title}`}
    />
  );

  if (isModal) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative max-h-[90dvh] overflow-y-auto touch-scroll scroll-container scrollbar-none"
            onClick={(e) => e.stopPropagation()}
          >
            {audioElement}

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
              aria-label="Fechar player"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              {episode.cover && (
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <Image
                    src={episode.cover}
                    alt={`Capa do episódio: ${episode.title}`}
                    fill
                    className="rounded-2xl shadow-lg object-cover"
                    sizes="160px"
                    priority
                  />
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900 mb-2">{episode.title}</h3>

              {episode.description && (
                <p className="text-sm text-gray-600 mb-3 max-w-md mx-auto leading-relaxed">
                  {episode.description}
                </p>
              )}

              <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                {episode.duration && <span>{episode.duration}</span>}
                {episode.category && (
                  <>
                    <span>•</span>
                    <span className="bg-primary-50 text-primary-600 px-2 py-1 rounded-full font-semibold text-xs border border-primary-200">
                      {episode.category}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div
                ref={progressRef}
                className="w-full h-2 bg-gray-200 rounded-full cursor-pointer group"
                onClick={handleProgressClick}
                role="slider"
                aria-label="Progresso do áudio"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') controls.skipBackward(5);
                  if (e.key === 'ArrowRight') controls.skipForward(5);
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all group-hover:from-primary-600 group-hover:to-primary-700 relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <MediaControls
                state={state}
                controls={controls}
                episode={episode}
                mode={mode}
                showAdvancedControls={true}
              />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (isCompact) {
    return (
      <div className={`bg-white rounded-2xl shadow-soft-light border border-gray-100 p-4 ${className}`}>
        {audioElement}

        <div className="flex items-start gap-4 mb-4">
          {episode.cover && (
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={episode.cover}
                alt={`Capa do episódio: ${episode.title}`}
                fill
                className="rounded-xl object-cover shadow-md"
                sizes="64px"
              />
            </div>
          )}

          <div className="flex-grow min-w-0">
            <h4 className="font-bold text-gray-900 mb-1 line-clamp-2">{episode.title}</h4>
            {episode.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                {episode.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {episode.duration && <span>{episode.duration}</span>}
              {episode.category && (
                <>
                  <span>•</span>
                  <span className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-semibold border border-primary-200">
                    {episode.category}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div
          ref={progressRef}
          className="w-full h-1.5 bg-gray-200 rounded-full cursor-pointer group mb-3"
          onClick={handleProgressClick}
          role="slider"
          aria-label="Progresso do áudio"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
        >
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all group-hover:from-primary-600 group-hover:to-primary-700 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-primary-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <MediaControls
          state={state}
          controls={controls}
          episode={episode}
          mode={mode}
          showAdvancedControls={false}
        />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-soft-light border border-gray-100 ${isCard ? 'p-6' : 'p-4'} ${className}`}>
      {audioElement}

      {isCard && episode.cover && (
        <div className="mb-4">
          <div className="relative w-full aspect-square">
            <Image
              src={episode.cover}
              alt={`Capa do episódio: ${episode.title}`}
              fill
              className="rounded-xl object-cover shadow-md"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="mt-3">
            <h4 className="font-bold text-gray-900 mb-1 line-clamp-2">{episode.title}</h4>
            {episode.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-3 leading-relaxed">
                {episode.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {episode.duration && <span>{episode.duration}</span>}
              {episode.category && (
                <>
                  <span>•</span>
                  <span className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-semibold border border-primary-200">
                    {episode.category}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <div
            ref={progressRef}
            className="w-full h-2 bg-gray-200 rounded-full cursor-pointer group"
            onClick={handleProgressClick}
            role="slider"
            aria-label="Progresso do áudio"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') controls.skipBackward(5);
              if (e.key === 'ArrowRight') controls.skipForward(5);
              if (e.key === ' ') {
                e.preventDefault();
                controls.togglePlayPause();
              }
            }}
          >
            {state.buffered > 0 && (
              <div
                className="absolute h-full bg-gray-300 rounded-full"
                style={{ width: `${state.buffered}%` }}
              />
            )}
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all group-hover:from-primary-600 group-hover:to-primary-700 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(state.currentTime)}</span>
            <span>{formatTime(state.duration)}</span>
          </div>
        </div>

        <MediaControls
          state={state}
          controls={controls}
          episode={episode}
          mode={mode}
          showAdvancedControls={true}
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
