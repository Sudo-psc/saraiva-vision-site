import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mic2, ArrowRight, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AudioPlayer from '@/components/AudioPlayer';
import { Link } from 'react-router-dom';

const PODCAST_ROUTE = '/podcast';

const LatestEpisodes = () => {
    const { t } = useTranslation();

    // Episódio em destaque para a homepage
    const featuredEpisode = {
        id: 'cirurgia-refrativa-ep1',
        src: '/Podcasts/saude-ocular-cirurgia-refrativa.mp3',
        title: t('podcast.episodes.cirurgia_refrativa.title'),
        description: t('podcast.episodes.cirurgia_refrativa.description'),
        duration: '08:15',
        cover: '/Podcasts/Covers/refrativa.jpg',
        category: 'Cirurgias',
        date: '2025-09-01',
        spotifyUrl: 'https://open.spotify.com/show/6sHIG7HbhF1w5O63CTtxwV'
    };

    return (
        <section className="py-10 md:py-12 lg:py-16 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden">
            {/* Enhanced Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Main gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/12 to-purple-400/12 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/12 to-pink-400/12 rounded-full blur-3xl animate-pulse delay-1000" />

                {/* Additional floating elements */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-cyan-300/8 to-blue-400/8 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '6s' }} />
                <div className="absolute bottom-16 left-16 w-40 h-40 bg-gradient-to-br from-indigo-300/6 to-purple-300/6 rounded-full blur-2xl animate-bounce delay-500" style={{ animationDuration: '8s' }} />

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.5) 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Enhanced Header */}
                <div className="text-center mb-10 md:mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100 text-blue-700 mb-8 border border-blue-200/50 shadow-lg backdrop-blur-sm"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <Mic2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-bold tracking-wide uppercase">{t('navbar.podcast', 'Podcast')}</span>
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight"
                    >
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Podcast em Destaque
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-600 mb-10 max-w-4xl mx-auto leading-relaxed font-medium"
                    >
                        Confira nosso episódio mais recente sobre saúde ocular. Informação de qualidade para cuidar melhor dos seus olhos.
                    </motion.p>

                    {/* Statistics badges */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap items-center justify-center gap-4 mb-8"
                    >
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-slate-200/50 shadow-sm">
                            <Headphones className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold text-slate-700">Episódio em Destaque</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-slate-200/50 shadow-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-semibold text-slate-700">Mais no Spotify</span>
                        </div>
                    </motion.div>
                </div>

                {/* Episódio em Destaque */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mb-8 max-w-4xl mx-auto"
                >
                    <div className="relative group perspective-1000">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                        <AudioPlayer
                            episode={featuredEpisode}
                            mode="inline"
                            className="h-full relative glass-blue card-3d shadow-xl rounded-xl hover:shadow-2xl transition-all duration-300 group-hover:transform group-hover:scale-[1.02] border border-blue-200/40"
                        />
                    </div>
                </motion.div>

                {/* Enhanced CTA to full podcast page */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                >
                    <div className="relative inline-block">
                        {/* Glow effect */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-indigo-400/30 rounded-2xl blur-lg opacity-70" />

                        <Link to={PODCAST_ROUTE} aria-label={t('podcast.visit_podcast', 'Ver todos os episódios')}>
                            <Button
                                size="lg"
                                className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 gap-3 px-10 py-4 text-lg font-bold rounded-2xl shadow-2xl border-0 transform hover:scale-105 transition-all duration-300"
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
                </motion.div>
            </div>
        </section>
    );
};

export default LatestEpisodes;
