/**
 * Instagram Graceful Fallback Component
 * Fallback elegante que prioriza a experiência do usuário
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Instagram, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/Card';
import { gracefulFallback } from '@/utils/gracefulFallback';

const InstagramGracefulFallback = ({
    onRetry,
    showRetryButton = true,
    maxRetries = 3,
    retryCount = 0,
    className = ''
}) => {
    const [isRetrying, setIsRetrying] = useState(false);
    const [fallbackPosts, setFallbackPosts] = useState([]);

    useEffect(() => {
        // Carrega dados de fallback silenciosamente
        const loadFallbackData = async () => {
            const result = await gracefulFallback.executeFallback('instagram',
                new Error('Content unavailable'), { limit: 3 });

            if (result.success) {
                setFallbackPosts(result.data);
            }
        };

        loadFallbackData();
    }, []);

    const handleRetry = async () => {
        if (!onRetry || isRetrying || retryCount >= maxRetries) return;

        setIsRetrying(true);
        console.info('🔄 Instagram: Attempting graceful retry...');

        try {
            await onRetry();
        } finally {
            setIsRetrying(false);
        }
    };

    // Se temos posts de fallback, mostra eles sem avisos
    if (fallbackPosts.length > 0) {
        return (
            <div className={`space-y-4 ${className}`}>
                {/* Conteúdo de fallback elegante */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {fallbackPosts.map((post, index) => (
                        <motion.div
                            key={post.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                                <CardContent className="p-0">
                                    <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                        <Instagram className="w-12 h-12 text-purple-400" />
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {post.caption || 'Acompanhe nosso Instagram para mais conteúdo sobre saúde ocular'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : 'Recente'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Botão de retry discreto */}
                {showRetryButton && retryCount < maxRetries && (
                    <div className="text-center mt-6">
                        <Button
                            onClick={handleRetry}
                            disabled={isRetrying}
                            variant="outline"
                            size="sm"
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                            {isRetrying ? 'Atualizando...' : 'Atualizar conteúdo'}
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    // Fallback mínimo se não há dados
    return (
        <div className={`text-center py-8 ${className}`}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
                <Instagram className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-gray-600 mb-4">
                Conteúdo em atualização
            </p>
            {showRetryButton && retryCount < maxRetries && (
                <Button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    variant="outline"
                    size="sm"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? 'Atualizando...' : 'Tentar novamente'}
                </Button>
            )}
        </div>
    );
};

export default InstagramGracefulFallback;