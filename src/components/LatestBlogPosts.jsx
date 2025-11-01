import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Rss, Calendar, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { blogPosts } from '@/data/blogPosts';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { getPostEnrichment } from '@/data/blogPostsEnrichment';
import { normalizeToArray } from '@/utils/safeFetch';

const LatestBlogPosts = () => {
    const { t, i18n } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadPosts = () => {
            try {
                setLoading(true);
                setError(null);
                
                // Get the 3 most recent posts from static blog data
                const recentPosts = blogPosts
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 3);

                // Normalize to ensure it's always an array
                const normalizedPosts = normalizeToArray(recentPosts, 'LatestBlogPosts');

                setPosts(normalizedPosts);
            } catch (error) {
                console.error('[LatestBlogPosts] Erro ao carregar posts do blog:', error);
                setError(error.message);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        loadPosts();
    }, []);

    const getDateLocale = () => {
        return i18n.language === 'pt' ? ptBR : enUS;
    };

    const formatPostDate = (dateString) => {
        try {
            return format(new Date(dateString), 'dd MMMM, yyyy', { locale: getDateLocale() });
        } catch {
            return format(new Date(), 'dd MMMM, yyyy', { locale: getDateLocale() });
        }
    };

    const getPostCategory = (post) => {
        return post.category || t('blog.categories.general', 'Geral');
    };

    const getPostTitle = (post) => {
        return post.title || 'Sem título';
    };

    const getPostExcerpt = (post) => {
        return post.excerpt || 'Leia mais sobre este artigo...';
    };

    const getPostLink = (post) => {
        const slugValue = typeof post.slug === 'string' ? post.slug : post.slug?.current;
        return slugValue ? `/blog/${slugValue}` : '/blog';
    };

    const renderPost = (post, index) => {
        const enrichment = getPostEnrichment(post.id);
        const readingTime = post.readingTimeMinutes || 4;

        // Category color mapping for accent elements
        const categoryColors = {
            'Prevenção': 'from-emerald-500 to-teal-500',
            'Tratamentos': 'from-blue-500 to-cyan-500',
            'Tecnologia': 'from-purple-500 to-indigo-500',
            'Dúvidas Frequentes': 'from-amber-500 to-orange-500',
            'default': 'from-gray-500 to-slate-500'
        };

        const categoryGradient = categoryColors[getPostCategory(post)] || categoryColors.default;

        return (
            <motion.article
                key={post.id}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative flex flex-col md:flex-row items-stretch bg-gradient-to-br from-white via-gray-50/50 to-white rounded-3xl border-2 border-gray-200/60 hover:border-teal-400 hover:shadow-2xl hover:shadow-teal-100/50 transition-all duration-500 overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                role="article"
                aria-labelledby={`post-title-${post.id}`}
            >
                {/* Left vertical accent bar */}
                <div className={`w-2 md:w-3 bg-gradient-to-b ${categoryGradient} flex-shrink-0`}></div>

                {/* Main content area - Horizontal layout */}
                <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col justify-between">
                    <div>
                        {/* Top row: Category badge and metadata */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                            {/* Category badge */}
                            <span className={`inline-flex items-center px-4 py-2 text-xs font-bold tracking-widest uppercase bg-gradient-to-r ${categoryGradient} text-white rounded-full shadow-lg`}>
                                {getPostCategory(post)}
                            </span>

                            {/* Metadata row - Compact */}
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
                                    <time dateTime={post.date} className="font-light">
                                        {formatPostDate(post.date)}
                                    </time>
                                </div>
                                <span className="text-gray-300">•</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-light">{readingTime} min</span>
                                </div>
                            </div>
                        </div>

                        {/* Title - Large, dominant */}
                        <h3
                            id={`post-title-${post.id}`}
                            className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold mb-4 text-gray-900 leading-tight tracking-tight group-hover:text-teal-700 transition-colors duration-300"
                        >
                            <Link
                                to={getPostLink(post)}
                                className="hover:underline decoration-2 decoration-teal-400 underline-offset-8 focus:outline-none focus:text-teal-700"
                            >
                                {getPostTitle(post)}
                            </Link>
                        </h3>

                        {/* Excerpt - Two columns on larger screens */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                                {getPostExcerpt(post)}
                            </p>

                            {/* Learning Points - Compact in second column */}
                            {enrichment?.learningPoints && enrichment.learningPoints.length > 0 && (
                                <div className="bg-gradient-to-br from-teal-50/80 to-cyan-50/50 rounded-2xl p-5 border border-teal-200/40">
                                    <p className="text-sm font-bold text-teal-800 mb-3 flex items-center gap-2">
                                        <span className="text-xl">✓</span>
                                        <span>Você vai aprender:</span>
                                    </p>
                                    <ul className="space-y-2">
                                        {enrichment.learningPoints.slice(0, 3).map((point, idx) => (
                                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2 leading-snug">
                                                <span className="text-teal-600 mt-0.5 flex-shrink-0 text-xs">▸</span>
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom CTA - Full width */}
                    <Link
                        to={getPostLink(post)}
                        className="mt-auto focus:outline-none group/button block"
                        aria-label={`Leia mais sobre: ${getPostTitle(post)}`}
                    >
                        <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 border-2 border-teal-200/60 hover:border-teal-400 rounded-2xl transition-all duration-300 group-hover/button:shadow-lg">
                            <span className="text-lg font-semibold text-gray-800 group-hover/button:text-teal-700 transition-colors">
                                {t('blog.read_more', 'Ler artigo completo')}
                            </span>
                            <ArrowRight className="w-6 h-6 text-teal-600 transition-all duration-300 group-hover/button:translate-x-2" aria-hidden="true" />
                        </div>
                    </Link>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-teal-400/0 via-cyan-400/0 to-blue-400/0 group-hover:from-teal-400/10 group-hover:via-cyan-400/10 group-hover:to-blue-400/10 transition-all duration-500 pointer-events-none"></div>
            </motion.article>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-cyan-600" />
                </div>
            );
        }

        if (posts.length === 0) {
            return (
                <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-2xl max-w-2xl mx-auto">
                    <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-yellow-800">
                        {t('blog.preview_unavailable', 'Prévia temporariamente indisponível')}
                    </h3>
                    <p className="text-yellow-700 text-sm mt-2">
                        {t('blog.preview_unavailable_desc', 'Em breve você encontrará os últimos artigos aqui.')}
                    </p>
                </div>
            );
        }

        // Extra safety: ensure posts is an array before mapping
        if (!Array.isArray(posts)) {
            console.error('[LatestBlogPosts] Posts is not an array:', typeof posts);
            return (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-600" />
                    <h3 className="text-xl font-semibold text-red-900 mb-2">
                        Erro de tipo de dados
                    </h3>
                    <p className="text-red-700 text-sm">
                        Os dados do blog não estão no formato esperado. Por favor, recarregue a página.
                    </p>
                </div>
            );
        }

        return (
            <div className="flex flex-col space-y-8 max-w-6xl mx-auto">
                {posts.map((post, index) => renderPost(post, index))}
            </div>
        );
    };

    return (
        <section className="py-10 md:py-12 lg:py-16 bg-white relative overflow-hidden scroll-block-internal">
            {/* Background Decorations */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/30" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-indigo-400/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-indigo-400/5 to-blue-400/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-[7%] relative z-10">
                {/* Header Section */}
                <div className="text-center mb-10 md:mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 via-indigo-50 to-blue-100 text-cyan-700 mb-8 border border-cyan-200/50 shadow-lg backdrop-blur-sm"
                    >
                        <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center">
                            <Rss className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-bold tracking-wide uppercase">
                            {t('blog.title', 'Blog')}
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight"
                    >
                        <span className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                            Últimas do Blog
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-600 mb-10 max-w-4xl mx-auto leading-relaxed font-medium"
                    >
                        Artigos e novidades sobre saúde ocular para manter você bem informado.
                    </motion.p>
                </div>

                {/* Posts Content */}
                {renderContent()}

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-12"
                >
                    <Link to="/blog">
                        <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                            {t('blog.visitBlog', 'Visitar Blog Completo')}
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default LatestBlogPosts;
