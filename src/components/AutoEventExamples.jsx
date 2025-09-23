import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePostHog, useSaraivaTracking } from '@/hooks/usePostHog';
import {
    Eye,
    MousePointer,
    Timer,
    Activity,
    TrendingUp,
    Users,
    BarChart3,
    Zap
} from 'lucide-react';

/**
 * Component demonstrating automatic event tracking
 */
const AutoEventExamples = () => {
    const { trackEvent, trackUserAction } = usePostHog();
    const { trackServiceView } = useSaraivaTracking();
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = React.useState(false);
    const [timeSpent, setTimeSpent] = React.useState(0);
    const [scrollDepth, setScrollDepth] = React.useState(0);

    // Automatic visibility tracking
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                    trackEvent('section_viewed', {
                        section: 'auto_events_demo',
                        timestamp: new Date().toISOString(),
                        viewport_height: window.innerHeight,
                        viewport_width: window.innerWidth,
                    });
                }
            },
            { threshold: 0.5 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [isVisible, trackEvent]);

    // Automatic time tracking
    useEffect(() => {
        if (!isVisible) return;

        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            setTimeSpent(elapsed);
        }, 1000);

        return () => {
            clearInterval(interval);
            const totalTime = Math.floor((Date.now() - startTime) / 1000);
            if (totalTime > 5) { // Only track if spent more than 5 seconds
                trackEvent('time_spent', {
                    section: 'auto_events_demo',
                    duration_seconds: totalTime,
                    engagement_level: totalTime > 30 ? 'high' : totalTime > 10 ? 'medium' : 'low',
                });
            }
        };
    }, [isVisible, trackEvent]);

    // Automatic scroll depth tracking
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);

            setScrollDepth(scrollPercent);

            // Track milestone scroll depths
            if (scrollPercent >= 25 && scrollPercent < 50) {
                trackEvent('scroll_depth', { depth: '25%', page: window.location.pathname });
            } else if (scrollPercent >= 50 && scrollPercent < 75) {
                trackEvent('scroll_depth', { depth: '50%', page: window.location.pathname });
            } else if (scrollPercent >= 75 && scrollPercent < 90) {
                trackEvent('scroll_depth', { depth: '75%', page: window.location.pathname });
            } else if (scrollPercent >= 90) {
                trackEvent('scroll_depth', { depth: '90%', page: window.location.pathname });
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [trackEvent]);

    return (
        <div ref={sectionRef} className="space-y-6 p-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Eventos Automáticos em Ação</h2>
                <p className="text-gray-600">
                    Esta seção demonstra eventos que são capturados automaticamente
                </p>
                <div className="flex justify-center gap-2 mt-4">
                    <Badge variant={isVisible ? "default" : "secondary"}>
                        <Eye className="w-4 h-4 mr-1" />
                        {isVisible ? 'Visível' : 'Não Visível'}
                    </Badge>
                    <Badge variant="outline">
                        <Timer className="w-4 h-4 mr-1" />
                        {timeSpent}s na seção
                    </Badge>
                    <Badge variant="outline">
                        <Activity className="w-4 h-4 mr-1" />
                        Scroll: {scrollDepth}%
                    </Badge>
                </div>
            </div>

            {/* Visibility Tracking Demo */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Eye className="w-5 h-5 mr-2" />
                        Rastreamento de Visibilidade
                    </CardTitle>
                    <CardDescription>
                        Eventos disparados quando elementos ficam visíveis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold mb-2">Como Funciona:</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Usa Intersection Observer API</li>
                                <li>• Dispara evento quando 50% do elemento está visível</li>
                                <li>• Captura informações do viewport</li>
                                <li>• Evita eventos duplicados</li>
                            </ul>
                        </div>

                        <VisibilityTrackingExample />
                    </div>
                </CardContent>
            </Card>

            {/* Click Tracking Demo */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <MousePointer className="w-5 h-5 mr-2" />
                        Rastreamento de Cliques
                    </CardTitle>
                    <CardDescription>
                        Eventos automáticos para interações do usuário
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <TrackedButton
                                variant="default"
                                eventData={{ button_type: 'primary', action: 'cta_main' }}
                            >
                                CTA Principal
                            </TrackedButton>

                            <TrackedButton
                                variant="outline"
                                eventData={{ button_type: 'secondary', action: 'learn_more' }}
                            >
                                Saiba Mais
                            </TrackedButton>

                            <TrackedButton
                                variant="destructive"
                                eventData={{ button_type: 'urgent', action: 'book_now' }}
                            >
                                Agendar Agora
                            </TrackedButton>

                            <TrackedButton
                                variant="ghost"
                                eventData={{ button_type: 'subtle', action: 'contact' }}
                            >
                                Contato
                            </TrackedButton>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-semibold mb-2">Dados Capturados Automaticamente:</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Texto do botão</li>
                                <li>• Posição na página</li>
                                <li>• Timestamp preciso</li>
                                <li>• Contexto da sessão</li>
                                <li>• Informações do dispositivo</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Form Tracking Demo */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Rastreamento de Formulários
                    </CardTitle>
                    <CardDescription>
                        Eventos automáticos para interações com formulários
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TrackedForm />
                </CardContent>
            </Card>

            {/* Performance Tracking */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Rastreamento de Performance
                    </CardTitle>
                    <CardDescription>
                        Métricas automáticas de performance da página
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PerformanceMetrics />
                </CardContent>
            </Card>

            {/* User Behavior Tracking */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Rastreamento de Comportamento
                    </CardTitle>
                    <CardDescription>
                        Padrões de comportamento capturados automaticamente
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <BehaviorTrackingDemo />
                </CardContent>
            </Card>
        </div>
    );
};

/**
 * Component that tracks its own visibility
 */
const VisibilityTrackingExample = () => {
    const { trackEvent } = usePostHog();
    const [viewCount, setViewCount] = React.useState(0);
    const elementRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    const newCount = viewCount + 1;
                    setViewCount(newCount);
                    trackEvent('element_viewed', {
                        element_id: 'visibility_demo',
                        view_count: newCount,
                        intersection_ratio: entry.intersectionRatio,
                        bounding_rect: {
                            width: entry.boundingClientRect.width,
                            height: entry.boundingClientRect.height,
                        },
                    });
                }
            },
            { threshold: [0.1, 0.5, 0.9] }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, [viewCount, trackEvent]);

    return (
        <div
            ref={elementRef}
            className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-dashed border-purple-300"
        >
            <div className="text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h4 className="font-semibold">Elemento Rastreado</h4>
                <p className="text-sm text-gray-600">
                    Visualizado {viewCount} vez(es)
                </p>
                <Badge variant="outline" className="mt-2">
                    Evento disparado automaticamente
                </Badge>
            </div>
        </div>
    );
};

/**
 * Button component with automatic click tracking
 */
const TrackedButton = ({ children, eventData, ...props }) => {
    const { trackUserAction } = usePostHog();

    const handleClick = (e) => {
        trackUserAction('button_click', {
            button_text: children,
            button_position: {
                x: e.clientX,
                y: e.clientY,
            },
            page_url: window.location.href,
            timestamp: new Date().toISOString(),
            ...eventData,
        });

        // Call original onClick if provided
        if (props.onClick) {
            props.onClick(e);
        }
    };

    return (
        <Button {...props} onClick={handleClick}>
            {children}
        </Button>
    );
};

/**
 * Form with automatic tracking
 */
const TrackedForm = () => {
    const { trackEvent } = usePostHog();
    const [formData, setFormData] = React.useState({ name: '', email: '' });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Track form field interactions
        trackEvent('form_field_interaction', {
            field_name: field,
            field_value_length: value.length,
            form_id: 'demo_form',
            interaction_type: 'input',
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        trackEvent('form_submit', {
            form_id: 'demo_form',
            fields_filled: Object.keys(formData).filter(key => formData[key].length > 0),
            total_fields: Object.keys(formData).length,
            completion_rate: Object.keys(formData).filter(key => formData[key].length > 0).length / Object.keys(formData).length,
        });

        alert('Formulário enviado! (Evento rastreado)');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Nome</label>
                <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Seu nome"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                    type="email"
                    className="w-full p-2 border rounded-lg"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                />
            </div>

            <Button type="submit" className="w-full">
                Enviar (Rastreado)
            </Button>
        </form>
    );
};

/**
 * Performance metrics display
 */
const PerformanceMetrics = () => {
    const { trackEvent } = usePostHog();
    const [metrics, setMetrics] = React.useState(null);

    const measurePerformance = () => {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');

            const performanceData = {
                page_load_time: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
                dom_content_loaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
                first_paint: Math.round(paint.find(p => p.name === 'first-paint')?.startTime || 0),
                first_contentful_paint: Math.round(paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0),
                dns_lookup: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
                tcp_connection: Math.round(navigation.connectEnd - navigation.connectStart),
            };

            setMetrics(performanceData);

            trackEvent('performance_measured', {
                ...performanceData,
                user_agent: navigator.userAgent,
                connection_type: navigator.connection?.effectiveType || 'unknown',
                memory_used: performance.memory?.usedJSHeapSize || 0,
            });
        }
    };

    return (
        <div className="space-y-4">
            <Button onClick={measurePerformance}>
                Medir Performance
            </Button>

            {metrics && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 bg-blue-50 rounded">
                        <div className="font-semibold">Page Load</div>
                        <div>{metrics.page_load_time}ms</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                        <div className="font-semibold">DOM Ready</div>
                        <div>{metrics.dom_content_loaded}ms</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded">
                        <div className="font-semibold">First Paint</div>
                        <div>{metrics.first_paint}ms</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded">
                        <div className="font-semibold">First Content</div>
                        <div>{metrics.first_contentful_paint}ms</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded">
                        <div className="font-semibold">DNS Lookup</div>
                        <div>{metrics.dns_lookup}ms</div>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded">
                        <div className="font-semibold">TCP Connect</div>
                        <div>{metrics.tcp_connection}ms</div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Behavior tracking demonstration
 */
const BehaviorTrackingDemo = () => {
    const { trackEvent } = usePostHog();
    const [behaviors, setBehaviors] = React.useState({
        mouse_movements: 0,
        key_presses: 0,
        idle_time: 0,
        tab_switches: 0,
    });

    useEffect(() => {
        let mouseCount = 0;
        let keyCount = 0;
        let idleTimer;
        let idleTime = 0;

        const handleMouseMove = () => {
            mouseCount++;
            if (mouseCount % 100 === 0) { // Track every 100 movements
                setBehaviors(prev => ({ ...prev, mouse_movements: mouseCount }));
                trackEvent('user_activity', {
                    activity_type: 'mouse_movement',
                    count: mouseCount,
                    timestamp: new Date().toISOString(),
                });
            }
        };

        const handleKeyPress = () => {
            keyCount++;
            setBehaviors(prev => ({ ...prev, key_presses: keyCount }));
            if (keyCount % 10 === 0) { // Track every 10 key presses
                trackEvent('user_activity', {
                    activity_type: 'keyboard_interaction',
                    count: keyCount,
                    timestamp: new Date().toISOString(),
                });
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setBehaviors(prev => ({ ...prev, tab_switches: prev.tab_switches + 1 }));
                trackEvent('user_activity', {
                    activity_type: 'tab_switch',
                    action: 'tab_hidden',
                    timestamp: new Date().toISOString(),
                });
            } else {
                trackEvent('user_activity', {
                    activity_type: 'tab_switch',
                    action: 'tab_visible',
                    timestamp: new Date().toISOString(),
                });
            }
        };

        // Idle time tracking
        const resetIdleTimer = () => {
            clearTimeout(idleTimer);
            idleTime = 0;
            idleTimer = setTimeout(() => {
                idleTime = 30; // 30 seconds idle
                setBehaviors(prev => ({ ...prev, idle_time: idleTime }));
                trackEvent('user_activity', {
                    activity_type: 'idle_detected',
                    idle_duration: idleTime,
                    timestamp: new Date().toISOString(),
                });
            }, 30000);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('keypress', handleKeyPress);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('mousemove', resetIdleTimer);
        document.addEventListener('keypress', resetIdleTimer);

        resetIdleTimer();

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('keypress', handleKeyPress);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('mousemove', resetIdleTimer);
            document.removeEventListener('keypress', resetIdleTimer);
            clearTimeout(idleTimer);
        };
    }, [trackEvent]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded text-center">
                <div className="text-2xl font-bold text-blue-600">{behaviors.mouse_movements}</div>
                <div className="text-sm">Movimentos do Mouse</div>
            </div>
            <div className="p-3 bg-green-50 rounded text-center">
                <div className="text-2xl font-bold text-green-600">{behaviors.key_presses}</div>
                <div className="text-sm">Teclas Pressionadas</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded text-center">
                <div className="text-2xl font-bold text-yellow-600">{behaviors.idle_time}s</div>
                <div className="text-sm">Tempo Inativo</div>
            </div>
            <div className="p-3 bg-purple-50 rounded text-center">
                <div className="text-2xl font-bold text-purple-600">{behaviors.tab_switches}</div>
                <div className="text-sm">Mudanças de Aba</div>
            </div>
        </div>
    );
};

export default AutoEventExamples;