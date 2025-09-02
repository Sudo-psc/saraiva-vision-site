import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    SkipBack,
    SkipForward,
    X,
    ExternalLink,
    RotateCcw,
    Download,
    Settings
} from 'lucide-react';

const AudioPlayer = ({
    episode,
    mode = 'card', // 'card', 'inline', 'modal'
    onClose = () => { },
    className = ''
}) => {
    const { t } = useTranslation();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [error, setError] = useState(null);

    const audioRef = useRef(null);
    const progressRef = useRef(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleLoadStart = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);
        const handleEnded = () => setIsPlaying(false);
        const handleError = () => {
            setIsLoading(false);
            setIsPlaying(false);
            setError('Falha ao carregar o áudio. Tente novamente mais tarde.');
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, []);

    // Prevent simultaneous playback across multiple players
    useEffect(() => {
        const onOtherPlay = (e) => {
            if (!e?.detail) return;
            if (e.detail.id !== episode.id) {
                const audio = audioRef.current;
                if (audio && !audio.paused) {
                    audio.pause();
                    setIsPlaying(false);
                }
            }
        };
        window.addEventListener('sv:audio-play', onOtherPlay);
        return () => window.removeEventListener('sv:audio-play', onOtherPlay);
    }, [episode.id]);

    const canPlay = !!(episode && episode.src);

    const togglePlayPause = () => {
        if (!canPlay) return;
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            // Notify other players to pause
            try {
                window.dispatchEvent(new CustomEvent('sv:audio-play', { detail: { id: episode.id } }));
            } catch (_) { }
            // Ensure inline playback on iOS + unmute before play
            audio.playsInline = true;
            try { audio.muted = false; } catch (_) {}
            const playPromise = audio.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch(() => {
                        // Retry once for Safari quirks
                        try { audio.muted = false; } catch (_) {}
                        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
                    });
            } else {
                setIsPlaying(true);
            }
        }
    };

    const handleSeek = (seconds) => {
        const audio = audioRef.current;
        audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
    };

    const handleProgressClick = (e) => {
        const progressBar = progressRef.current;
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const audio = audioRef.current;
        audio.currentTime = percent * duration;
    };

    const toggleMute = () => {
        const audio = audioRef.current;
        if (isMuted) {
            audio.volume = volume;
            setIsMuted(false);
        } else {
            audio.volume = 0;
            setIsMuted(true);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        audioRef.current.volume = newVolume;
        setIsMuted(newVolume === 0);
    };

    const handlePlaybackRateChange = (rate) => {
        setPlaybackRate(rate);
        audioRef.current.playbackRate = rate;
        setShowSettings(false);
    };

    const handleRestart = () => {
        const audio = audioRef.current;
        audio.currentTime = 0;
        setCurrentTime(0);
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = episode.src;
        link.download = `${episode.title}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;

    // Pause audio on unmount to avoid background playback
    useEffect(() => {
        return () => {
            try {
                if (audioRef.current) {
                    audioRef.current.pause();
                }
            } catch (_) { }
        };
    }, []);

    // Respect hook rules: call at top level with condition
    const isModal = mode === 'modal';
    useBodyScrollLock(isModal);

    // Modal variant moved below PlayerControls to avoid TDZ

    // Variants
    const isCompact = mode === 'inline';
    const isCard = mode === 'card';

    const PlayerControls = () => (
        <div className="space-y-4">
            {/* Progress Bar */}
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
                >
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-700 rounded-full transition-all group-hover:from-blue-700 group-hover:to-blue-800 relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRestart}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        aria-label="Reiniciar episódio"
                        title="Reiniciar do início"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => handleSeek(-10)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        aria-label="Voltar 10 segundos"
                    >
                        <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                        onClick={togglePlayPause}
                        disabled={isLoading || !canPlay}
                        className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-full flex items-center justify-center transition-all shadow-lg"
                        aria-label={canPlay ? (isPlaying ? 'Pausar' : 'Reproduzir') : 'Áudio indisponível'}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : isPlaying ? (
                            <Pause className="w-5 h-5" />
                        ) : (
                            <Play className="w-5 h-5 ml-0.5" />
                        )}
                    </button>

                    <button
                        onClick={() => handleSeek(10)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        aria-label="Avançar 10 segundos"
                    >
                        <SkipForward className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Volume Control */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={toggleMute}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
                        >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        {!isCompact && (
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-16 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
                                aria-label="Volume"
                            />
                        )}
                    </div>

                    {/* Download Button */}
                    {episode.src && (
                        <button
                            onClick={handleDownload}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            aria-label="Baixar episódio"
                            title="Baixar episódio"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    )}

                    {/* Playback Speed Settings */}
                    {!isCompact && (
                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                                <button
                                                    key={rate}
                                                    onClick={() => handlePlaybackRateChange(rate)}
                                                    className={`w-full text-left px-2 py-1 rounded-lg text-sm transition-colors ${playbackRate === rate
                                                        ? 'bg-blue-100 text-blue-700 font-medium'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {rate}x
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* External Links */}
                    <div className="flex items-center gap-1">
                        {episode.spotifyUrl && (
                            <a
                                href={episode.spotifyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
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
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Ouvir no Apple Podcasts"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.182c5.42 0 9.818 4.398 9.818 9.818S17.42 21.818 12 21.818 2.182 17.42 2.182 12 6.58 2.182 12 2.182zm0 3.273c-3.6 0-6.545 2.945-6.545 6.545S8.4 18.545 12 18.545s6.545-2.945 6.545-6.545S15.6 5.455 12 5.455zm0 2.182c2.4 0 4.364 1.964 4.364 4.363S14.4 16.364 12 16.364 7.636 14.4 7.636 12 9.6 7.637 12 7.637zm0 1.636c-1.5 0-2.727 1.227-2.727 2.727S10.5 14.727 12 14.727 14.727 13.5 14.727 12 13.5 9.273 12 9.273z" />
                                </svg>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // Modal variant (placed after PlayerControls so it's defined)
    if (isModal) {
        return (
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
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Fechar player"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="text-center mb-6">
                        <img
                            src={episode.cover}
                            alt={episode.title}
                            className="w-40 h-40 rounded-2xl mx-auto mb-4 shadow-lg object-cover"
                            width={256}
                            height={256}
                            onError={(e) => { try { e.currentTarget.src = '/Podcasts/Covers/podcast.png'; } catch (_) {} }}
                        />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{episode.title}</h3>
                        {episode.description && (
                            <p className="text-sm text-gray-600 mb-3 max-w-md mx-auto leading-relaxed">{episode.description}</p>
                        )}
                        <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                            {episode.duration && <span>{episode.duration}</span>}
                            {episode.category && (
                                <>
                                    <span>•</span>
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium text-xs">
                                        {episode.category}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Hidden audio element used by controls (modal mode) */}
                    <audio
                        ref={audioRef}
                        src={episode.src}
                        preload="metadata"
                        playsInline
                        className="hidden"
                    />

                    {error ? (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                            {error}
                        </div>
                    ) : (
                        <PlayerControls />
                    )}
                </motion.div>
            </motion.div>
        );
    }

    return (
        <div className={`bg-white rounded-2xl shadow-soft-light border border-gray-100 ${isCompact ? 'p-4' : 'p-6'} ${className}`}>
            <audio
                ref={audioRef}
                src={episode.src}
                preload="metadata"
                playsInline
                className="hidden"
            />

            {/* Card header with large cover */}
            {isCard && episode.cover && (
                <div className="mb-4">
                    <img
                        src={episode.cover}
                        alt={`${t('podcast.cover_alt', 'Capa do podcast')}: ${episode.title}`}
                        className="w-full aspect-square rounded-xl object-cover shadow-md"
                        loading="lazy"
                        onError={(e) => { try { e.currentTarget.src = '/Podcasts/Covers/podcast.png'; } catch (_) {} }}
                    />
                    <div className="mt-3">
                        <h4 className="font-bold text-gray-900 mb-1 line-clamp-2">{episode.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            {episode.duration && <span>{episode.duration}</span>}
                            {episode.category && (
                                <>
                                    <span>•</span>
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                        {episode.category}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Inline header with small cover and description */}
            {isCompact && (
                <div className="flex items-start gap-4 mb-6">
                    <img
                        src={episode.cover}
                        alt={`${t('podcast.cover_alt', 'Capa do podcast')}: ${episode.title}`}
                        className="w-16 h-16 rounded-xl object-cover shadow-md flex-shrink-0"
                        loading="lazy"
                        onError={(e) => { try { e.currentTarget.src = '/Podcasts/Covers/podcast.png'; } catch (_) {} }}
                    />
                    <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-gray-900 mb-1 line-clamp-2">{episode.title}</h4>
                        {episode.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">{episode.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            {episode.duration && <span>{episode.duration}</span>}
                            {episode.category && (
                                <>
                                    <span>•</span>
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                        {episode.category}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <PlayerControls />
        </div>
    );
};

export default AudioPlayer;
