import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Rss, Calendar, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getRecentPosts } from '@/content/blog';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';

const LatestBlogPosts = () => {
    const { t, i18n } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPosts = () => {
            try {
                setLoading(true);
                // Get the 3 most recent posts from static blog data
                const recentPosts = getRecentPosts(3);
                setPosts(recentPosts);
            } catch (error) {
                console.error('Erro ao carregar posts do blog:', error);
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
        return `/blog/${post.slug}`;
    };

    const getPostImage = (post) => {
        return post.image || null;
    };

    const renderPost = (post, index) => {
        const featuredImage = getPostImage(post);

        return (
            <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl min-h-[420px] flex flex-col"
            >
                {/* Featured Image */}
                {featuredImage && (
                    <div className="relative h-48 overflow-hidden">
                        <img
                            src={featuredImage}
                            alt={`Imagem ilustrativa do artigo: ${getPostTitle(post)}`}
                            className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                            style={{ maxWidth: '100%', display: 'block' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                )}

                <div className="p-6 flex flex-col flex-grow">
                    {/* Category and Date */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                            {getPostCategory(post)}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{formatPostDate(post.date)}</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 text-slate-900 line-clamp-3">
                        {getPostTitle(post)}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-slate-600 mb-4 line-clamp-5 leading-relaxed flex-grow">
                        {getPostExcerpt(post)}
                    </p>

                    {/* Read More Link */}
                    <Link to={getPostLink(post)}>
                        <Button variant="link" className="text-blue-600 hover:text-blue-700 px-0 group">
                            {t('blog.read_more', 'Ler mais')}
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            </motion.div>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
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

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 via-indigo-50 to-blue-100 text-blue-700 mb-8 border border-blue-200/50 shadow-lg backdrop-blur-sm"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
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
                        <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
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
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
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
