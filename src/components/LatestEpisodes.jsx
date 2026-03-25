import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic2, ArrowRight, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AudioPlayer from '@/components/AudioPlayer';
import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

/**
 * LatestEpisodes - Performance optimized component
 *
 * Optimizations applied:
 * 1. Removed framer-motion (saves ~78KB when all homepage components updated)
 * 2. Uses CSS animations instead
 * 3. Lazy loads content via Intersection Observer
 */
const LatestEpisodes = () => {
    const { t } = useTranslation();
    const [sectionRef, isVisible] = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '100px'
    });
    const hasAnimated = useRef(false);

    // Track if section has been visible (for animations)
    if (isVisible && !hasAnimated.current) {
        hasAnimated.current = true;
    }

    // Episódio em destaque para a homepage
    const featuredEpisode = {
        id: 'olho-seco-alem-do-desconforto',
        src: '/Podcasts/olho_seco.mp3',
        title: 'Olho Seco: Além do Desconforto — Os Riscos que Você Precisa Conhecer',
        description: 'Descubra por que o olho seco vai muito além de um simples incômodo. Dr. Philipe Saraiva Cruz revela os riscos que você precisa conhecer para proteger sua visão.',
        duration: '10:00',
        cover: '/Podcasts/Covers/olho_seco_cover_custom_20251008_135321.png',
        category: 'Doenças Oculares',
        date: '2026-02-08',
        spotifyUrl: 'https://open.spotify.com/episode/31WPR6VGuabW12OnSOVhTt'
    };

    const shouldAnimate = hasAnimated.current;

    return (
        <section
            ref={sectionRef}
            className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/40 relative overflow-hidden scroll-block-internal"
        >
            {/* CSS Keyframes for animations */}
            <style>{`
                @keyframes podcastFadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .podcast-animate-in {
                    animation: podcastFadeInUp 0.6s ease-out forwards;
                    opacity: 0;
                }
            `}</style>

            {/* Enhanced Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Main gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/12 to-cyan-400/12 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-400/12 to-teal-400/12 rounded-full blur-3xl animate-pulse delay-1000" />

                {/* Additional floating elements */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-cyan-300/8 to-cyan-400/8 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '6s' }} />
                <div className="absolute bottom-16 left-16 w-40 h-40 bg-gradient-to-br from-cyan-300/6 to-teal-300/6 rounded-full blur-2xl animate-bounce delay-500" style={{ animationDuration: '8s' }} />

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.5) 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
                {/* Enhanced Header */}
                <div className="text-center mb-10 md:mb-12">
                    <div
                        className={`inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-100 via-cyan-50 to-teal-100 text-cyan-700 mb-8 border border-cyan-200/50 shadow-lg backdrop-blur-sm ${shouldAnimate ? 'podcast-animate-in' : 'opacity-0'}`}
                        style={{ animationDelay: '0ms' }}
                    >
                        <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center">
                            <Mic2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-bold tracking-wide uppercase">{t('navbar.podcast', 'Podcast')}</span>
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    </div>

                    <h2
                        className={`text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight ${shouldAnimate ? 'podcast-animate-in' : 'opacity-0'}`}
                        style={{ animationDelay: '100ms' }}
                    >
                        <span className="bg-gradient-to-r from-cyan-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                            Podcast em Destaque
                        </span>
                    </h2>

                    <p
                        className={`text-lg md:text-xl text-slate-600 mb-10 max-w-4xl mx-auto leading-relaxed font-medium ${shouldAnimate ? 'podcast-animate-in' : 'opacity-0'}`}
                        style={{ animationDelay: '200ms' }}
                    >
                        Confira nosso episódio mais recente sobre saúde ocular. Informação de qualidade para cuidar melhor dos seus olhos.
                    </p>

                    {/* Statistics badges */}
                    <div
                        className={`flex flex-wrap items-center justify-center gap-4 mb-8 ${shouldAnimate ? 'podcast-animate-in' : 'opacity-0'}`}
                        style={{ animationDelay: '300ms' }}
                    >
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-slate-200/50 shadow-sm">
                            <Headphones className="w-4 h-4 text-cyan-600" />
                            <span className="text-sm font-semibold text-slate-700">Episódio em Destaque</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-slate-200/50 shadow-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-semibold text-slate-700">Mais no Spotify</span>
                        </div>
                    </div>
                </div>

                {/* Episódio em Destaque */}
                <div
                    className={`mb-8 max-w-4xl mx-auto ${shouldAnimate ? 'podcast-animate-in' : 'opacity-0'}`}
                    style={{ animationDelay: '400ms' }}
                >
                    <div className="relative group perspective-1000">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 via-cyan-400/20 to-teal-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                        <AudioPlayer
                            episode={featuredEpisode}
                            mode="inline"
                            className="h-full relative glass-blue card-3d shadow-xl rounded-xl hover:shadow-2xl transition-all duration-300 group-hover:transform group-hover:scale-[1.02] border border-cyan-200/40"
                        />
                    </div>
                </div>

                {/* Enhanced CTA to full podcast page */}
                <div
                    className={`text-center ${shouldAnimate ? 'podcast-animate-in' : 'opacity-0'}`}
                    style={{ animationDelay: '600ms' }}
                >
                    <div className="relative inline-block">
                        {/* Glow effect */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/30 via-cyan-400/30 to-teal-400/30 rounded-2xl blur-lg opacity-70" />

                        <Link to="/podcast" aria-label={t('podcast.visit_podcast', 'Ver todos os episódios')}>
                            <Button
                                size="lg"
                                className="relative bg-gradient-to-r from-cyan-600 via-cyan-600 to-teal-600 text-white hover:from-cyan-700 hover:via-cyan-700 hover:to-teal-700 gap-3 px-10 py-4 text-lg font-bold rounded-2xl shadow-2xl border-0 transform hover:scale-105 transition-all duration-300"
                            >
                                <Headphones className="w-6 h-6" />
                                {t('podcast.visit_podcast', 'Ver Todos os Episódios')}
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>

                    <p className="mt-4 text-slate-500 text-sm font-medium">
                        Descubra mais episódios sobre saúde ocular na nossa página dedicada
                    </p>
                </div>
            </div>
        </section>
    );
};

export default LatestEpisodes;
