/**
 * Blog List Component
 * Lista todos os posts do blog com filtros e busca
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
    BookOpen
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

const BlogList = () => {
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

    const getCategoryColor = (color) => {
        const colors = {
            blue: 'bg-blue-100 text-blue-700 border-blue-200',
            green: 'bg-green-100 text-green-700 border-green-200',
            purple: 'bg-purple-100 text-purple-700 border-purple-200',
            orange: 'bg-orange-100 text-orange-700 border-orange-200'
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 mb-4">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-semibold text-sm">Blog Saraiva Vision</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                    Artigos Especializados em Oftalmologia
                </h1>

                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                    Informações confiáveis sobre saúde ocular, lentes de contato,
                    cirurgias e cuidados com a visão em Caratinga, MG
                </p>
            </motion.div>

            {/* Filtros e Busca */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-12"
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filtros e Busca
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Busca por texto */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Buscar artigos
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder="Digite sua busca..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Filtro por categoria */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Categoria
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Tag
                                </label>
                                <select
                                    value={selectedTag}
                                    onChange={(e) => setSelectedTag(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            <div className="mt-4 text-center">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategory('all');
                                        setSelectedTag('all');
                                    }}
                                >
                                    Limpar Filtros
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Resultados */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-900">
                        {filteredPosts.length === 0 ? 'Nenhum artigo encontrado' :
                            filteredPosts.length === 1 ? '1 artigo encontrado' :
                                `${filteredPosts.length} artigos encontrados`}
                    </h2>
                </div>

                {/* Lista de Posts */}
                {filteredPosts.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Eye className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-600 mb-2">
                                Nenhum artigo encontrado
                            </h3>
                            <p className="text-slate-500">
                                Tente ajustar os filtros ou buscar por outros termos.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer">
                                    <CardHeader>
                                        <div className="flex items-start justify-between mb-3">
                                            <Badge className={getCategoryColor(post.category.color)}>
                                                {post.category.name}
                                            </Badge>
                                            {post.featured && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Destaque
                                                </Badge>
                                            )}
                                        </div>

                                        <CardTitle className="text-lg leading-tight hover:text-blue-600 transition-colors">
                                            {post.title}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                                            {post.excerpt}
                                        </p>

                                        {/* Metadados */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    <span>{post.author.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{post.readingTime}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                <Calendar className="w-3 h-3" />
                                                <span>{formatDate(post.publishedAt)}</span>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {post.tags.slice(0, 3).map(tag => (
                                                <Badge
                                                    key={tag.slug}
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    <Tag className="w-2 h-2 mr-1" />
                                                    {tag.name}
                                                </Badge>
                                            ))}
                                            {post.tags.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{post.tags.length - 3}
                                                </Badge>
                                            )}
                                        </div>

                                        <Button
                                            className="w-full"
                                            variant="outline"
                                            onClick={() => {
                                                // Navegar para o post específico
                                                window.location.href = `/blog/${post.slug}`;
                                            }}
                                        >
                                            Ler Artigo
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Call to Action */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center">
                    <CardContent className="p-8">
                        <h2 className="text-2xl font-bold mb-4">
                            Precisa de Atendimento Especializado?
                        </h2>
                        <p className="text-blue-100 mb-6">
                            Agende sua consulta na Clínica Saraiva Vision em Caratinga, MG
                        </p>
                        <Button
                            size="lg"
                            className="bg-white text-blue-700 hover:bg-blue-50"
                        >
                            Agendar Consulta
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default BlogList;