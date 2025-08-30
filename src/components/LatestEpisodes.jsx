import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    Play,
    Clock,
    Calendar,
    Mic2,
    ArrowRight,
    Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Episódios completos para reprodução na homepage
const LATEST_EPISODES = [
    {
        id: 'glaucoma-ep1',
        slug: 'glaucoma-prevencao-tratamento',
        src: '/Podcasts/glaucoma.mp3',
        title: 'Glaucoma: Prevenção e Tratamento',
        description: 'Um guia completo sobre o glaucoma, seus sintomas, métodos de prevenção e opções de tratamento disponíveis.',
        cover: '/Podcasts/Covers/glaucoma.avif',
        duration: '12:30',
        date: '2024-08-20',
        category: 'Doenças Oculares',
        featured: true,
        spotifyUrl: 'https://open.spotify.com/show/6sHIG7HbhF1w5O63CTtxwV',
        applePodcastsUrl: 'https://podcasts.apple.com/episode/glaucoma',
    },
    {
        id: 'pterigio-ep2',
        slug: 'pterigio-sintomas-tratamento',
        src: '/Podcasts/pterigio.mp3',
        title: 'Pterígio: Sintomas e Tratamento',
        description: 'Entenda o que é pterígio, seus sintomas, causas e as opções de tratamento disponíveis.',
        cover: '/Podcasts/Covers/ptigio.jpeg',
        duration: '10:45',
        date: '2024-08-15',
        category: 'Doenças Oculares',
        featured: false,
        spotifyUrl: 'https://open.spotify.com/show/6sHIG7HbhF1w5O63CTtxwV',
        applePodcastsUrl: 'https://podcasts.apple.com/episode/pterigio',
    },
    {
        id: 'retina-ep3',
        slug: 'retina-cuidados-prevencao',
        src: '/Podcasts/retina.mp3',
        title: 'Retina: Cuidados e Prevenção',
        description: 'Conheça os principais problemas que afetam a retina e como preveni-los para manter a saúde ocular.',
        cover: '/Podcasts/Covers/retina.jpeg',
        duration: '14:20',
        date: '2024-08-10',
        category: 'Prevenção',
        featured: false,
        spotifyUrl: 'https://open.spotify.com/show/6sHIG7HbhF1w5O63CTtxwV',
        applePodcastsUrl: 'https://podcasts.apple.com/episode/retina',
    }
];

const EXTERNAL_PODCAST_URL = '/podcast';

const LatestEpisodes = () => {
    const { t } = useTranslation();
    const episode = LATEST_EPISODES[0];
    const sectionRef = useRef(null);
    const bgAudioRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        const audio = bgAudioRef.current;
        if (!section || !audio) return;

        let played = false;
        const observer = new window.IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !played) {
                    audio.volume = 0.25;
                    audio.play();
                    played = true;
                } else if (!entry.isIntersecting && played) {
                    audio.pause();
                    audio.currentTime = 0;
                    played = false;
                }
            },
            { threshold: 0.5 }
        );
        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className="py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden no-scrollbar-x">
            {/* Áudio de fundo oculto */}
            <audio ref={bgAudioRef} src="/Podcasts/Instrumental_intro.mp3" preload="auto" style={{ display: 'none' }} />

            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/12 to-sky-400/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-sky-400/12 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Curved Top Divider */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
                <svg
                    className="relative block w-full h-16 transform rotate-180"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#F5F9FC" stopOpacity="1" />
                            <stop offset="50%" stopColor="#EBF4FF" stopOpacity="1" />
                            <stop offset="100%" stopColor="#F5F9FC" stopOpacity="1" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                        fill="url(#waveGradient)"
                    />
                </svg>
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10 no-scrollbar-x">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-100 text-blue-700 mb-6"
                    >
                        <div className="relative">
                            <img
                                src="/img/drphilipe_perfil.png"
                                alt="Dr. Philipe Saraiva"
                                className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 shadow-sm"
                            />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                        </div>
                        <Mic2 className="w-4 h-4" />
                        <span className="text-sm font-semibold">Podcast Saraiva Vision</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6"
                    >
                        Últimos Episódios
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed"
                    >
                        Conteúdo especializado em oftalmologia com Dr. Philipe Saraiva.
                        Aprenda sobre cuidados, prevenção e tratamentos para manter seus olhos saudáveis.
                    </motion.p>

                    {/* Host Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-blue-300 shadow-soft-light mb-8"
                    >
                        <div className="relative">
                            <img
                                src="/img/drphilipe_perfil.png"
                                alt="Dr. Philipe Saraiva"
                                className="w-12 h-12 rounded-full object-cover border-3 border-white shadow-md"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                                <Mic2 className="w-2 h-2 text-white" />
                            </div>
                        </div>
                        <div className="text-left">
                            <h4 className="text-sm font-bold text-slate-900">Dr. Philipe Saraiva</h4>
                            <p className="text-xs text-slate-600">Oftalmologista • CRM-MG 69.870</p>
                        </div>
                    </motion.div>
                </div>

                {/* Episódio em destaque (primeiro da lista) */}
                {LATEST_EPISODES.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="mb-12"
                    >
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft-light border-2 border-slate-300 p-8 lg:p-12">
                            <div className="flex flex-col lg:flex-row items-center gap-8">
                                <div className="flex-shrink-0">
                                    <div className="relative">
                                        <img
                                            src={LATEST_EPISODES[0].cover}
                                            alt={LATEST_EPISODES[0].title}
                                            className="w-48 h-48 lg:w-56 lg:h-56 rounded-3xl object-cover shadow-2xl"
                                        />
                                        <div className="absolute inset-0 bg-black/20 rounded-3xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer group">
                                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Play className="w-8 h-8 text-blue-600 ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-grow text-center lg:text-left">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                        Episódio em Destaque
                                    </div>

                                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                                        {LATEST_EPISODES[0].title}
                                    </h3>

                                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                        {LATEST_EPISODES[0].description}
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 justify-center lg:justify-start">
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(LATEST_EPISODES[0].date).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{LATEST_EPISODES[0].duration}</span>
                                            </div>
                                            <span>•</span>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                {LATEST_EPISODES[0].category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Embedded audio player */}
                                    <div className="mb-6">
                                        <audio
                                            controls
                                            className="w-full"
                                            preload="metadata"
                                        >
                                            <source src={LATEST_EPISODES[0].src} type="audio/mpeg" />
                                            Seu navegador não suporta o elemento de áudio.
                                        </audio>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                                        <a
                                            href={LATEST_EPISODES[0].spotifyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button
                                                size="lg"
                                                className="bg-green-600 hover:bg-green-700 text-white gap-2 px-8"
                                            >
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.54 0-.36.179-.66.479-.78 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02v-.12h.002zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.48.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3L19.081 10.68z" />
                                                </svg>
                                                Ouvir no Spotify
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Episódios adicionais em grid */}
                {LATEST_EPISODES.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="mb-12"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {LATEST_EPISODES.slice(1).map((episode, index) => (
                                <div key={episode.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-soft-light border border-slate-200 p-6 group hover:shadow-lg transition-all">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="relative">
                                                <img
                                                    src={episode.cover}
                                                    alt={episode.title}
                                                    className="w-20 h-20 rounded-xl object-cover shadow-md"
                                                />
                                                <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                                                        <Play className="w-4 h-4 text-blue-600 ml-0.5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                    {episode.category}
                                                </span>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{episode.duration}</span>
                                                </div>
                                            </div>
                                            
                                            <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                {episode.title}
                                            </h4>
                                            
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                                {episode.description}
                                            </p>
                                            
                                            <div className="mb-3">
                                                <audio
                                                    controls
                                                    className="w-full h-8"
                                                    preload="none"
                                                >
                                                    <source src={episode.src} type="audio/mpeg" />
                                                </audio>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">
                                                    {new Date(episode.date).toLocaleDateString('pt-BR')}
                                                </span>
                                                <a
                                                    href={episode.spotifyUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-600 hover:text-green-700 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.54 0-.36.179-.66.479-.78 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02v-.12h.002zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.48.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3L19.081 10.68z" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* CTA para mais podcasts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                >
                    <Link to={EXTERNAL_PODCAST_URL}>
                        <Button
                            size="lg"
                            variant="outline"
                            className="bg-white/70 backdrop-blur-sm border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white gap-2 px-8 py-3"
                        >
                            <Headphones className="w-5 h-5" />
                            Ver Todos os Episódios
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* Curved Bottom Divider */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
                <svg
                    className="relative block w-full h-16"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="waveGradientBottom" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                            <stop offset="50%" stopColor="#F8FAFC" stopOpacity="1" />
                            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                        fill="url(#waveGradientBottom)"
                    />
                </svg>
            </div>
        </section>
    );
};

export default LatestEpisodes;
