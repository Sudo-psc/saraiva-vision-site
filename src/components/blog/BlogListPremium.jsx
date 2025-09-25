/**
 * Blog List Premium Component
 * Lista de posts com design premium, efeitos 3D e vidro líquido
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Calendar,
    Clock,
    User,
    Tag,
    Eye,
    Filter,
    BookOpen,
    Sparkles,
    TrendingUp,
    Heart,
    Star,
    ArrowRight,
    Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    blogPosts,
    blogCategories,
    popularTags,
    searchPosts,
    getBlogPostsByCategory,
    getBlogPostsByTag
} from '@/data/blogPosts';
import '../../styles/premiumLiquidGlass.css';

const BlogListPremium = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedTag, setSelectedTag] = useState('all');

    // Filtrar posts baseado nos critérios selecionados
    const filteredPosts = useMemo(() => {
        let posts = blogPosts.filter(post => post.status === 'published');

        // Aplicar busca por texto
        if (searchQuery.trim()) {
            posts = searchPosts(searchQuery);
        }

        // Aplicar filtro por categoria
        if (selectedCategory !== 'all') {
            posts = posts.filter(post => post.category.slug === selectedCategory);
        }

        // Aplicar filtro por tag
        if (selectedTag !== 'all') {
            posts = posts.filter(post =>
                post.tags.some(tag => tag.slug === selectedTag)
            );
        }

        // Ordenar por data de publicação (mais recente primeiro)
        return posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    }, [searchQuery, selectedCategory, selectedTag]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCategoryIcon = (categorySlug) => {
        const icons = {
            'lentes-de-contato': <Eye className="w-4 h-4" />,
            'cirurgias-oculares': <Zap className="w-4 h-4" />,
            'saude-ocular': <Heart className="w-4 h-4" />,
            'tecnologia': <Star className="w-4 h-4" />
        };
        return icons[categorySlug] || <BookOpen className="w-4 h-4" />;
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--premium-bg-cool)' }}>
            <div className="premium-container py-20">
                {/* Header Premium */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                    className="premium-header mb-20"
                >
                    <div className="premium-badge mb-8">
                        <BookOpen className="w-5 h-5" />
                        Blog Saraiva Vision
                    </div>

                    <h1 className="premium-title mb-8">
                        Artigos Especializados em Oftalmologia
                    </h1>

                    <p className="premium-subtitle">
                        Informações confiáveis sobre saúde ocular, lentes de contato,
                        cirurgias e cuidados com a visão em Caratinga, MG
                    </p>
                </motion.div>

                {/* Filtros Premium */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="premium-section mb-16"
                >
                    <div className="premium-glass-card premium-hover-lift">
                        <div className="premium-card-content">
                            <div className="flex items-center gap-3 mb-8">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                                    style={{ background: 'var(--premium-primary)' }}
                                >
                                    <Filter className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold" style={{ color: 'var(--premium-text-primary)' }}>
                                    Filtros e Busca
                                </h2>
                            </div>

                            <div className="premium-grid premium-grid-3">
                                {/* Busca por texto */}
                                <div>
                                    <label className="block text-lg font-semibold mb-4" style={{ color: 'var(--premium-text-primary)' }}>
                                        Buscar artigos
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--premium-text-muted)' }} />
                                        <input
                                            type="text"
                                            placeholder="Digite sua busca..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="premium-input pl-12 text-lg"
                                        />
                                    </div>
                                </div>

                                {/* Filtro por categoria */}
                                <div>
                                    <label className="block text-lg font-semibold mb-4" style={{ color: 'var(--premium-text-primary)' }}>
                                        Categoria
                                    </label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="premium-input text-lg"
                                    >
                                        <option value="all">Todas as categorias</option>
                                        {blogCategories.map(category => (
                                            <option key={category.slug} value={category.slug}>
                                                {category.icon} {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro por tag */}
                                <div>
                                    <label className="block text-lg font-semibold mb-4" style={{ color: 'var(--premium-text-primary)' }}>
                                        Tag
                                    </label>
                                    <select
                                        value={selectedTag}
                                        onChange={(e) => setSelectedTag(e.target.value)}
                                        className="premium-input text-lg"
                                    >
                                        <option value="all">Todas as tags</option>
                                        {popularTags.map(tag => (
                                            <option key={tag.slug} value={tag.slug}>
                                                {tag.name} ({tag.count})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Botão para limpar filtros */}
                            {(searchQuery || selectedCategory !== 'all' || selectedTag !== 'all') && (
                                <div className="text-center mt-8">
                                    <button
                                        className="premium-button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedCategory('all');
                                            setSelectedTag('all');
                                        }}
                                    >
                                        Limpar Filtros
                                        <Sparkles className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.section>

                {/* Resultados Premium */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="premium-section mb-16"
                >
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl font-bold" style={{ color: 'var(--premium-text-primary)' }}>
                            {filteredPosts.length === 0 ? 'Nenhum artigo encontrado' :
                                filteredPosts.length === 1 ? '1 artigo encontrado' :
                                    `${filteredPosts.length} artigos encontrados`}
                        </h2>

                        {filteredPosts.length > 0 && (
                            <div className="premium-badge">
                                <TrendingUp className="w-4 h-4" />
                                Mais recentes primeiro
                            </div>
                        )}
                    </div>

                    {/* Lista de Posts Premium */}
                    {filteredPosts.length === 0 ? (
                        <div className="premium-glass-card text-center">
                            <div className="premium-card-content py-16">
                                <div
                                    className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center text-white"
                                    style={{ background: 'var(--premium-secondary)' }}
                                >
                                    <Eye className="w-12 h-12" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--premium-text-primary)' }}>
                                    Nenhum artigo encontrado
                                </h3>
                                <p className="text-xl" style={{ color: 'var(--premium-text-secondary)' }}>
                                    Tente ajustar os filtros ou buscar por outros termos.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="premium-grid premium-grid-3">
                            {filteredPosts.map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index, duration: 0.8 }}
                                >
                                    <div className="premium-glass-card premium-hover-lift h-full cursor-pointer group">
                                        <div className="premium-card-content h-full flex flex-col">
                                            {/* Header do Card */}
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="premium-badge">
                                                    {getCategoryIcon(post.category.slug)}
                                                    {post.category.name}
                                                </div>
                                                {post.featured && (
                                                    <div className="premium-badge bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                                                        <Star className="w-3 h-3" />
                                                        Destaque
                                                    </div>
                                                )}
                                            </div>

                                            {/* Título */}
                                            <h3 className="text-xl font-bold mb-4 leading-tight group-hover:text-blue-600 transition-colors" style={{ color: 'var(--premium-text-primary)' }}>
                                                {post.title}
                                            </h3>

                                            {/* Excerpt */}
                                            <p className="text-lg mb-6 flex-grow line-clamp-3" style={{ color: 'var(--premium-text-secondary)' }}>
                                                {post.excerpt}
                                            </p>

                                            {/* Metadados */}
                                            <div className="space-y-4 mb-6">
                                                <div className="flex items-center gap-6 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4" />
                                                        <span className="font-medium">{post.author.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{post.readingTime}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDate(post.publishedAt)}</span>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {post.tags.slice(0, 3).map(tag => (
                                                    <span
                                                        key={tag.slug}
                                                        className="premium-badge text-xs"
                                                    >
                                                        <Tag className="w-2 h-2" />
                                                        {tag.name}
                                                    </span>
                                                ))}
                                                {post.tags.length > 3 && (
                                                    <span className="premium-badge text-xs">
                                                        +{post.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Botão */}
                                            <button
                                                className="premium-button w-full group-hover:scale-105 transition-transform"
                                                onClick={() => {
                                                    window.location.href = `/blog/${post.slug}`;
                                                }}
                                            >
                                                Ler Artigo
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.section>

                {/* Call to Action Premium */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="premium-section"
                >
                    <div className="premium-cta">
                        <div className="relative z-10">
                            <h2 className="premium-cta-title">
                                Precisa de Atendimento Especializado?
                            </h2>
                            <p className="premium-cta-text">
                                Agende sua consulta na Clínica Saraiva Vision em Caratinga, MG
                            </p>
                            <button className="premium-button text-lg px-8 py-4">
                                Agendar Consulta
                                <Heart className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.section>
            </div>
        </div>
    );
};

export default BlogListPremium;