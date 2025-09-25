/**
 * Demonstração do Sistema de Fallback Gracioso
 * Mostra como o sistema funciona sem avisos visuais
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useGracefulFallback } from '@/hooks/useGracefulFallback';
import GoogleReviewsWidget from './GoogleReviewsWidget';
import InstagramGracefulFallback from './instagram/InstagramGracefulFallback';

const GracefulFallbackDemo = () => {
    const [showDebugInfo, setShowDebugInfo] = useState(false);
    const [simulateError, setSimulateError] = useState(false);

    const googleFallback = useGracefulFallback('googleReviews');
    const instagramFallback = useGracefulFallback('instagram');

    const simulateGoogleError = async () => {
        setSimulateError(true);
        await googleFallback.executeFallback(
            new Error('Simulated API error'),
            { limit: 3 }
        );
        setTimeout(() => setSimulateError(false), 3000);
    };

    const clearAllFallbacks = () => {
        googleFallback.clearFallback();
        instagramFallback.clearFallback();
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Sistema de Fallback Gracioso</span>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => setShowDebugInfo(!showDebugInfo)}
                                variant="outline"
                                size="sm"
                            >
                                {showDebugInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                {showDebugInfo ? 'Ocultar Debug' : 'Mostrar Debug'}
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                {googleFallback.isUsingFallback ? (
                                    <AlertCircle className="w-5 h-5 text-orange-500" />
                                ) : (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                )}
                                <span className="font-medium">Google Reviews</span>
                            </div>
                            <Badge variant={googleFallback.isUsingFallback ? 'warning' : 'success'}>
                                {googleFallback.isUsingFallback ? 'Fallback Ativo' : 'Normal'}
                            </Badge>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                {instagramFallback.isUsingFallback ? (
                                    <AlertCircle className="w-5 h-5 text-orange-500" />
                                ) : (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                )}
                                <span className="font-medium">Instagram</span>
                            </div>
                            <Badge variant={instagramFallback.isUsingFallback ? 'warning' : 'success'}>
                                {instagramFallback.isUsingFallback ? 'Fallback Ativo' : 'Normal'}
                            </Badge>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <RefreshCw className="w-5 h-5 text-blue-500" />
                                <span className="font-medium">Controles</span>
                            </div>
                            <div className="space-y-2">
                                <Button
                                    onClick={simulateGoogleError}
                                    disabled={simulateError}
                                    size="sm"
                                    variant="outline"
                                >
                                    Simular Erro
                                </Button>
                                <Button
                                    onClick={clearAllFallbacks}
                                    size="sm"
                                    variant="outline"
                                >
                                    Limpar Fallbacks
                                </Button>
                            </div>
                        </div>
                    </div>

                    {showDebugInfo && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="font-medium mb-3">Informações de Debug</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Google Reviews</h4>
                                    <ul className="space-y-1 text-gray-600">
                                        <li>Status: {googleFallback.isUsingFallback ? 'Fallback' : 'Normal'}</li>
                                        <li>Último erro: {googleFallback.lastError?.message || 'Nenhum'}</li>
                                        <li>Dados disponíveis: {googleFallback.fallbackData ? 'Sim' : 'Não'}</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Instagram</h4>
                                    <ul className="space-y-1 text-gray-600">
                                        <li>Status: {instagramFallback.isUsingFallback ? 'Fallback' : 'Normal'}</li>
                                        <li>Último erro: {instagramFallback.lastError?.message || 'Nenhum'}</li>
                                        <li>Dados disponíveis: {instagramFallback.fallbackData ? 'Sim' : 'Não'}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-800 mb-2">Como Funciona</h3>
                        <ul className="text-blue-700 text-sm space-y-1">
                            <li>• Fallbacks são ativados automaticamente quando necessário</li>
                            <li>• Usuários veem conteúdo normal, sem avisos ou mensagens de erro</li>
                            <li>• Logs detalhados são mantidos apenas no console para desenvolvedores</li>
                            <li>• Sistema tenta se recuperar automaticamente quando possível</li>
                            <li>• Experiência do usuário permanece fluida e profissional</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Demonstração dos componentes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Google Reviews (Com Fallback Gracioso)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <GoogleReviewsWidget
                            maxReviews={3}
                            showHeader={false}
                            showStats={true}
                            showViewAllButton={false}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Instagram (Fallback Gracioso)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <InstagramGracefulFallback
                            showRetryButton={true}
                            maxRetries={3}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default GracefulFallbackDemo;