import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Rss } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const LatestBlogPosts = () => {
    const { t } = useTranslation();

    const featuredPosts = [
        {
            id: 'dry-eyes',
            title: t('blog.posts.dryEyes.title'),
            excerpt: t('blog.posts.dryEyes.excerpt'),
            category: t('blog.categories.prevention'),
            link: '/blog/sindrome-do-olho-seco-sintomas-e-tratamentos'
        },
        {
            id: 'cataract',
            title: t('blog.posts.cataract.title'),
            excerpt: t('blog.posts.cataract.excerpt'),
            category: t('blog.categories.treatments'),
            link: '/blog/cirurgia-de-catarata-guia-completo'
        },
        {
            id: 'child-eyes',
            title: t('blog.posts.childEyes.title'),
            excerpt: t('blog.posts.childEyes.excerpt'),
            category: t('blog.categories.pediatric'),
            link: '/blog/cuidados-com-a-visao-infantil'
        }
    ];

    return (
        <section className="py-10 md:py-12 lg:py-16 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center mb-10 md:mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-green-100 via-emerald-50 to-teal-100 text-green-700 mb-8 border border-green-200/50 shadow-lg backdrop-blur-sm"
                    >
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                            <Rss className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-bold tracking-wide uppercase">{t('blog.title', 'Blog')}</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight"
                    >
                        <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredPosts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-transform duration-300"
                        >
                            <div className="p-6">
                                <div className="mb-4">
                                    <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                                        {post.category}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-slate-900">{post.title}</h3>
                                <p className="text-slate-600 mb-4">{post.excerpt}</p>
                                <Link to={post.link}>
                                    <Button variant="link" className="text-green-600 hover:text-green-700 px-0">
                                        {t('blog.read_more', 'Ler mais')}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-12"
                >
                    <Link to="/blog">
                        <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white gap-2">
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
