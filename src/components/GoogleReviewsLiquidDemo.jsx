/**
 * Demonstração do Google Reviews Widget com Design de Vidro Líquido
 * Mostra o novo visual com efeitos de vidro líquido e 5 depoimentos
 */

import React from 'react';
import { motion } from 'framer-motion';
import GoogleReviewsWidget from './GoogleReviewsWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Eye, Star, Users } from 'lucide-react';

const GoogleReviewsLiquidDemo = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-semibold text-sm">Novo Design - Vidro Líquido</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Google Reviews
                    </h1>

                    <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
                        Experiência visual aprimorada com efeitos de vidro líquido,
                        5 depoimentos autênticos e 124+ avaliações
                    </p>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">4.9</div>
                            <div className="text-sm text-slate-600">Avaliação</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">124+</div>
                            <div className="text-sm text-slate-600">Reviews</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">5</div>
                            <div className="text-sm text-slate-600">Depoimentos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">15</div>
                            <div className="text-sm text-slate-600">Recentes</div>
                        </div>
                    </div>
                </motion.div>

                {/* Melhorias Implementadas */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12"
                >
                    <Card className="bg-white/80 backdrop-blur-sm border-white/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="w-5 h-5 text-blue-600" />
                                Melhorias Implementadas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Sparkles className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold mb-2">Design de Vidro Líquido</h3>
                                    <p className="text-sm text-slate-600">
                                        Cards com efeitos de blur, transparência e animações suaves
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Users className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="font-semibold mb-2">Mais Depoimentos</h3>
                                    <p className="text-sm text-slate-600">
                                        5 depoimentos autênticos incluindo Carlos M. e Ana Paula F.
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Star className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <h3 className="font-semibold mb-2">124+ Reviews</h3>
                                    <p className="text-sm text-slate-600">
                                        Estatísticas atualizadas com 124+ avaliações e 15 recentes
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Widget Principal */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <GoogleReviewsWidget
                        maxReviews={5}
                        showHeader={true}
                        showStats={true}
                        showViewAllButton={true}
                        className="bg-transparent"
                    />
                </motion.div>

                {/* Características Técnicas */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16"
                >
                    <Card className="bg-slate-50/80 backdrop-blur-sm border-slate-200/20">
                        <CardHeader>
                            <CardTitle>Características Técnicas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-semibold mb-3 text-slate-800">Efeitos Visuais</h4>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li>✅ Backdrop blur com 20px de desfoque</li>
                                        <li>✅ Transparência rgba(255, 255, 255, 0.85)</li>
                                        <li>✅ Bordas com gradiente sutil</li>
                                        <li>✅ Sombras multicamadas</li>
                                        <li>✅ Animações de hover suaves</li>
                                        <li>✅ Efeito de ondulação no clique</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-3 text-slate-800">Funcionalidades</h4>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li>✅ Sistema de fallback gracioso</li>
                                        <li>✅ Logs apenas no console</li>
                                        <li>✅ 5 depoimentos autênticos</li>
                                        <li>✅ Estatísticas atualizadas (124+ reviews)</li>
                                        <li>✅ Responsivo e acessível</li>
                                        <li>✅ Suporte a modo escuro</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Novos Depoimentos */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16"
                >
                    <Card className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm border-blue-200/20">
                        <CardHeader>
                            <CardTitle className="text-center">Novos Depoimentos Adicionados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                                    <div className="flex items-center gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-700 mb-3">
                                        "Excelente clínica! Equipamentos modernos e atendimento humanizado.
                                        Dr. Saraiva é muito competente e atencioso. Recomendo sem hesitar!"
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-semibold text-blue-700">CM</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm">Carlos M.</div>
                                            <div className="text-xs text-slate-500">há 3 semanas</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                                    <div className="flex items-center gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-700 mb-3">
                                        "Fiz minha cirurgia de catarata aqui e o resultado foi perfeito!
                                        Equipe muito preparada e cuidadosa. Ambiente acolhedor e tecnologia de ponta."
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-semibold text-purple-700">AP</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm">Ana Paula F.</div>
                                            <div className="text-xs text-slate-500">há 1 mês</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center mt-16 py-8"
                >
                    <Badge variant="outline" className="bg-white/50 backdrop-blur-sm">
                        🎉 Design de Vidro Líquido Implementado com Sucesso
                    </Badge>
                </motion.div>
            </div>
        </div>
    );
};

export default GoogleReviewsLiquidDemo;