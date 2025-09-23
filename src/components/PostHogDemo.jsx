import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePostHog, useSaraivaTracking, useFeatureFlag } from '@/hooks/usePostHog';
import FeatureFlag, { ABTest } from '@/components/FeatureFlag';
import { FEATURE_FLAGS, EVENTS } from '@/utils/posthogConfig';
import {
    Activity,
    BarChart3,
    Flag,
    Users,
    Eye,
    MousePointer,
    Smartphone,
    Clock,
    TrendingUp
} from 'lucide-react';

/**
 * Demo component showing PostHog integration in action
 */
const PostHogDemo = () => {
    const {
        posthog,
        trackEvent,
        trackUserAction,
        identifyUser,
        setUserProperties,
        isReady
    } = usePostHog();

    const {
        trackAppointmentRequest,
        trackServiceView,
        trackContactInteraction
    } = useSaraivaTracking();

    const [userStats, setUserStats] = useState({
        distinctId: null,
        isIdentified: false,
        featureFlags: [],
        properties: {},
    });

    const [demoEvents, setDemoEvents] = useState([]);

    // Update user stats when PostHog is ready
    useEffect(() => {
        if (isReady && posthog) {
            setUserStats({
                distinctId: posthog.get_distinct_id(),
                isIdentified: posthog.get_property('$is_identified') || false,
                featureFlags: posthog.getFeatureFlags() || [],
                properties: posthog.get_property('$set') || {},
            });
        }
    }, [isReady, posthog]);

    // Demo event handlers
    const handleTrackEvent = (eventName, properties = {}) => {
        trackEvent(eventName, properties);
        setDemoEvents(prev => [...prev, {
            id: Date.now(),
            event: eventName,
            properties,
            timestamp: new Date().toLocaleTimeString(),
        }].slice(-5)); // Keep only last 5 events
    };

    const handleIdentifyUser = () => {
        const userId = `demo_user_${Date.now()}`;
        identifyUser(userId, {
            name: 'Usuário Demo',
            email: 'demo@saraivavision.com.br',
            user_type: 'demo',
            demo_session: true,
        });
        handleTrackEvent('user_identified', { user_id: userId });
    };

    const handleSetProperties = () => {
        setUserProperties({
            preferred_language: 'pt-BR',
            device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
            demo_interaction: true,
            last_demo_interaction: new Date().toISOString(),
        });
        handleTrackEvent('user_properties_updated');
    };

    if (!isReady) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Carregando PostHog...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">PostHog Analytics Demo</h2>
                <p className="text-gray-600">
                    Demonstração interativa do sistema de analytics e feature flags
                </p>
                <Badge variant="secondary" className="mt-2">
                    <Activity className="w-4 h-4 mr-1" />
                    Status: {isReady ? 'Conectado' : 'Desconectado'}
                </Badge>
            </div>

            {/* User Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Informações do Usuário
                    </CardTitle>
                    <CardDescription>
                        Dados do usuário atual no PostHog
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold mb-2">Identificação</h4>
                            <p className="text-sm text-gray-600">
                                <strong>ID:</strong> {userStats.distinctId || 'Não disponível'}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Identificado:</strong> {userStats.isIdentified ? 'Sim' : 'Não'}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Feature Flags Ativas</h4>
                            <div className="flex flex-wrap gap-1">
                                {userStats.featureFlags.length > 0 ? (
                                    userStats.featureFlags.map(flag => (
                                        <Badge key={flag} variant="outline" className="text-xs">
                                            {flag}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-500">Nenhuma flag ativa</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button size="sm" onClick={handleIdentifyUser}>
                            Identificar Usuário
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleSetProperties}>
                            Definir Propriedades
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Event Tracking Demo */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <MousePointer className="w-5 h-5 mr-2" />
                        Rastreamento de Eventos
                    </CardTitle>
                    <CardDescription>
                        Teste diferentes tipos de eventos
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        <Button
                            size="sm"
                            onClick={() => handleTrackEvent(EVENTS.USER_ACTION, { action: 'demo_click' })}
                        >
                            Ação do Usuário
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => trackAppointmentRequest('consulta', 'demo')}
                        >
                            Agendamento
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => trackServiceView('demo-service', 'Serviço Demo')}
                        >
                            Visualizar Serviço
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => trackContactInteraction('demo', 'button')}
                        >
                            Contato
                        </Button>
                    </div>

                    {/* Recent Events */}
                    <div>
                        <h4 className="font-semibold mb-2">Eventos Recentes</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {demoEvents.length > 0 ? (
                                demoEvents.map(event => (
                                    <div key={event.id} className="text-xs bg-gray-50 p-2 rounded">
                                        <div className="flex justify-between items-start">
                                            <span className="font-mono font-semibold">{event.event}</span>
                                            <span className="text-gray-500">{event.timestamp}</span>
                                        </div>
                                        {Object.keys(event.properties).length > 0 && (
                                            <pre className="mt-1 text-gray-600 overflow-x-auto">
                                                {JSON.stringify(event.properties, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">Nenhum evento rastreado ainda</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Feature Flags Demo */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Flag className="w-5 h-5 mr-2" />
                        Feature Flags Demo
                    </CardTitle>
                    <CardDescription>
                        Demonstração de funcionalidades condicionais
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Basic Feature Flag */}
                        <div>
                            <h4 className="font-semibold mb-2">Sistema de Agendamento</h4>
                            <FeatureFlag
                                flag={FEATURE_FLAGS.NEW_APPOINTMENT_SYSTEM}
                                fallback={
                                    <div className="p-3 bg-gray-100 rounded border">
                                        <p className="text-sm">Sistema de agendamento padrão</p>
                                    </div>
                                }
                            >
                                <div className="p-3 bg-green-100 rounded border border-green-200">
                                    <Badge className="mb-2">Novo</Badge>
                                    <p className="text-sm">Sistema de agendamento com IA habilitado!</p>
                                </div>
                            </FeatureFlag>
                        </div>

                        {/* A/B Test */}
                        <div>
                            <h4 className="font-semibold mb-2">Teste A/B - Botão CTA</h4>
                            <ABTest
                                testKey={FEATURE_FLAGS.CTA_BUTTON_TEST}
                                variants={{
                                    control: () => (
                                        <Button
                                            onClick={() => handleTrackEvent('cta_clicked', { variant: 'control' })}
                                        >
                                            Agende sua Consulta
                                        </Button>
                                    ),
                                    variant_a: () => (
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleTrackEvent('cta_clicked', { variant: 'variant_a' })}
                                        >
                                            🚨 Agende HOJE!
                                        </Button>
                                    ),
                                    variant_b: () => (
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleTrackEvent('cta_clicked', { variant: 'variant_b' })}
                                        >
                                            ✨ Consulta Gratuita
                                        </Button>
                                    ),
                                }}
                                fallback={
                                    <Button disabled>Teste A/B não ativo</Button>
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Analytics Insights */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Insights de Analytics
                    </CardTitle>
                    <CardDescription>
                        Informações coletadas automaticamente
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded">
                            <Eye className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                            <p className="text-sm font-semibold">Pageviews</p>
                            <p className="text-xs text-gray-600">Rastreamento automático</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded">
                            <Smartphone className="w-8 h-8 mx-auto mb-2 text-green-600" />
                            <p className="text-sm font-semibold">Dispositivo</p>
                            <p className="text-xs text-gray-600">
                                {/Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile' : 'Desktop'}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded">
                            <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                            <p className="text-sm font-semibold">Sessão</p>
                            <p className="text-xs text-gray-600">Tempo de permanência</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Tracking */}
            <PerformanceTrackingDemo />
        </div>
    );
};

/**
 * Component to demonstrate performance tracking
 */
const PerformanceTrackingDemo = () => {
    const { trackEvent } = usePostHog();
    const [performanceData, setPerformanceData] = useState(null);

    const measurePerformance = () => {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');

            const data = {
                page_load_time: navigation.loadEventEnd - navigation.loadEventStart,
                dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                first_paint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
            };

            setPerformanceData(data);
            trackEvent('performance_measured', data);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Performance Tracking
                </CardTitle>
                <CardDescription>
                    Medição de performance da página
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={measurePerformance} className="mb-4">
                    Medir Performance
                </Button>

                {performanceData && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <strong>Tempo de Carregamento:</strong>
                            <br />
                            {Math.round(performanceData.page_load_time)}ms
                        </div>
                        <div>
                            <strong>DOM Content Loaded:</strong>
                            <br />
                            {Math.round(performanceData.dom_content_loaded)}ms
                        </div>
                        <div>
                            <strong>First Paint:</strong>
                            <br />
                            {Math.round(performanceData.first_paint)}ms
                        </div>
                        <div>
                            <strong>First Contentful Paint:</strong>
                            <br />
                            {Math.round(performanceData.first_contentful_paint)}ms
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PostHogDemo;