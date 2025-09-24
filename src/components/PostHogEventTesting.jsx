import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/Badge.jsx';
import { usePostHog, useSaraivaTracking } from '@/hooks/usePostHog';
import { EVENTS } from '@/utils/posthogConfig';
import {
    Send,
    MousePointer,
    Eye,
    Calendar,
    Phone,
    MessageCircle,
    Heart,
    Share2,
    Download,
    Search,
    ShoppingCart,
    Star,
    Clock,
    MapPin,
    User,
    Mail,
    Zap
} from 'lucide-react';

/**
 * Component for testing PostHog event tracking
 */
const PostHogEventTesting = () => {
    const { trackEvent, trackUserAction, trackBusinessEvent, trackConversion, posthog } = usePostHog();
    const {
        trackAppointmentRequest,
        trackServiceView,
        trackContactInteraction,
        trackBlogEngagement,
        trackInstagramInteraction,
        trackAccessibilityUsage,
        trackSearchQuery,
        trackNewsletterSignup
    } = useSaraivaTracking();

    const [customEvent, setCustomEvent] = useState({
        name: '',
        properties: '{}'
    });
    const [eventLog, setEventLog] = useState([]);

    // Helper to log events
    const logEvent = (eventName, properties = {}) => {
        const newEvent = {
            id: Date.now(),
            name: eventName,
            properties,
            timestamp: new Date().toLocaleTimeString(),
        };
        setEventLog(prev => [newEvent, ...prev].slice(0, 10)); // Keep last 10 events
    };

    // Manual event handlers
    const handleCustomEvent = () => {
        try {
            const properties = JSON.parse(customEvent.properties);
            trackEvent(customEvent.name, properties);
            logEvent(customEvent.name, properties);
        } catch (error) {
            alert('Erro no JSON das propriedades: ' + error.message);
        }
    };

    const handleDirectPostHogEvent = () => {
        if (posthog) {
            posthog.capture('direct_posthog_event', {
                method: 'direct_call',
                timestamp: new Date().toISOString(),
                custom_property: 'test_value'
            });
            logEvent('direct_posthog_event', { method: 'direct_call' });
        }
    };

    // Business-specific event handlers
    const handleAppointmentEvent = () => {
        trackAppointmentRequest('consulta_geral', 'manual_test');
        logEvent('appointment_request', { service: 'consulta_geral', method: 'manual_test' });
    };

    const handleServiceViewEvent = () => {
        trackServiceView('catarata', 'Cirurgia de Catarata');
        logEvent('service_viewed', { service_id: 'catarata', service_name: 'Cirurgia de Catarata' });
    };

    const handleContactEvent = () => {
        trackContactInteraction('whatsapp', 'test_button');
        logEvent('contact_interaction', { type: 'whatsapp', method: 'test_button' });
    };

    const handleBlogEvent = () => {
        trackBlogEngagement('test-post', 'view');
        logEvent('blog_engagement', { post_slug: 'test-post', action: 'view' });
    };

    const handleInstagramEvent = () => {
        trackInstagramInteraction('view', 'test-post-123');
        logEvent('instagram_interaction', { action: 'view', post_id: 'test-post-123' });
    };

    const handleAccessibilityEvent = () => {
        trackAccessibilityUsage('font_size', true);
        logEvent('accessibility_feature', { feature: 'font_size', enabled: true });
    };

    const handleSearchEvent = () => {
        trackSearchQuery('oftalmologista', 5);
        logEvent('search', { query: 'oftalmologista', results_count: 5 });
    };

    const handleNewsletterEvent = () => {
        trackNewsletterSignup('test@example.com', 'test_component');
        logEvent('newsletter_signup', { source: 'test_component' });
    };

    // User action events
    const handleUserActionEvent = (action, context) => {
        trackUserAction(action, context);
        logEvent('user_action', { action, context });
    };

    // Business events
    const handleBusinessEventTest = (eventType, data) => {
        trackBusinessEvent(eventType, data);
        logEvent('business_event', { event_type: eventType, ...data });
    };

    // Conversion events
    const handleConversionEvent = (type, value) => {
        trackConversion(type, value);
        logEvent('conversion', { conversion_type: type, value });
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">PostHog Event Testing</h2>
                <p className="text-gray-600">
                    Teste diferentes tipos de eventos e veja como são capturados
                </p>
                <Badge variant="secondary" className="mt-2">
                    <Zap className="w-4 h-4 mr-1" />
                    Eventos em Tempo Real
                </Badge>
            </div>

            {/* Custom Event Sender */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Send className="w-5 h-5 mr-2" />
                        Evento Personalizado
                    </CardTitle>
                    <CardDescription>
                        Envie um evento customizado com propriedades específicas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Nome do Evento</label>
                            <Input
                                placeholder="meu_evento_personalizado"
                                value={customEvent.name}
                                onChange={(e) => setCustomEvent(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Propriedades (JSON)</label>
                            <Textarea
                                placeholder='{"propriedade": "valor", "numero": 123}'
                                value={customEvent.properties}
                                onChange={(e) => setCustomEvent(prev => ({ ...prev, properties: e.target.value }))}
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleCustomEvent} disabled={!customEvent.name}>
                                Enviar Evento Customizado
                            </Button>
                            <Button variant="outline" onClick={handleDirectPostHogEvent}>
                                Evento Direto PostHog
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Event Buttons */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <MousePointer className="w-5 h-5 mr-2" />
                        Eventos Rápidos da Saraiva Vision
                    </CardTitle>
                    <CardDescription>
                        Teste eventos específicos do negócio com um clique
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Business Events */}
                        <Button
                            size="sm"
                            onClick={handleAppointmentEvent}
                            className="flex items-center gap-1"
                        >
                            <Calendar className="w-4 h-4" />
                            Agendamento
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleServiceViewEvent}
                            className="flex items-center gap-1"
                        >
                            <Eye className="w-4 h-4" />
                            Ver Serviço
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleContactEvent}
                            className="flex items-center gap-1"
                        >
                            <Phone className="w-4 h-4" />
                            Contato
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleBlogEvent}
                            className="flex items-center gap-1"
                        >
                            <Heart className="w-4 h-4" />
                            Blog
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleInstagramEvent}
                            className="flex items-center gap-1"
                        >
                            <Share2 className="w-4 h-4" />
                            Instagram
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleAccessibilityEvent}
                            className="flex items-center gap-1"
                        >
                            <User className="w-4 h-4" />
                            Acessibilidade
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSearchEvent}
                            className="flex items-center gap-1"
                        >
                            <Search className="w-4 h-4" />
                            Busca
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleNewsletterEvent}
                            className="flex items-center gap-1"
                        >
                            <Mail className="w-4 h-4" />
                            Newsletter
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* User Action Events */}
            <Card>
                <CardHeader>
                    <CardTitle>Ações do Usuário</CardTitle>
                    <CardDescription>
                        Eventos de interação e comportamento
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Button
                            size="sm"
                            onClick={() => handleUserActionEvent('button_click', { button_id: 'test_cta' })}
                        >
                            Clique CTA
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserActionEvent('scroll_depth', { depth: '75%' })}
                        >
                            Scroll 75%
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserActionEvent('video_play', { video_id: 'intro_video' })}
                        >
                            Play Vídeo
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserActionEvent('download', { file: 'brochure.pdf' })}
                        >
                            Download
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserActionEvent('share', { platform: 'whatsapp' })}
                        >
                            Compartilhar
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserActionEvent('rating', { stars: 5 })}
                        >
                            Avaliação 5★
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Business Events */}
            <Card>
                <CardHeader>
                    <CardTitle>Eventos de Negócio</CardTitle>
                    <CardDescription>
                        Eventos específicos do modelo de negócio
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Button
                            size="sm"
                            onClick={() => handleBusinessEventTest('consultation_booked', { service: 'catarata', date: '2024-02-15' })}
                        >
                            Consulta Agendada
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBusinessEventTest('insurance_checked', { provider: 'unimed', covered: true })}
                        >
                            Convênio Verificado
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBusinessEventTest('location_viewed', { clinic: 'matriz', maps_opened: true })}
                        >
                            Localização Vista
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBusinessEventTest('testimonial_viewed', { testimonial_id: 'test_123' })}
                        >
                            Depoimento Visto
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBusinessEventTest('faq_opened', { question: 'cirurgia_catarata' })}
                        >
                            FAQ Aberto
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBusinessEventTest('price_inquiry', { service: 'lasik' })}
                        >
                            Consulta Preço
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Conversion Events */}
            <Card>
                <CardHeader>
                    <CardTitle>Eventos de Conversão</CardTitle>
                    <CardDescription>
                        Eventos que representam conversões importantes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Button
                            size="sm"
                            onClick={() => handleConversionEvent('appointment_request', 1)}
                        >
                            Solicitação Agendamento
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConversionEvent('phone_call', 1)}
                        >
                            Ligação Telefônica
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConversionEvent('whatsapp_message', 1)}
                        >
                            Mensagem WhatsApp
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConversionEvent('newsletter_signup', 1)}
                        >
                            Inscrição Newsletter
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConversionEvent('brochure_download', 1)}
                        >
                            Download Material
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConversionEvent('consultation_completed', 350)}
                        >
                            Consulta Realizada
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Event Log */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        Log de Eventos Enviados
                    </CardTitle>
                    <CardDescription>
                        Últimos 10 eventos capturados (tempo real)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {eventLog.length > 0 ? (
                            eventLog.map(event => (
                                <div key={event.id} className="p-3 bg-gray-50 rounded-lg border">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-mono font-semibold text-blue-600">
                                            {event.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {event.timestamp}
                                        </span>
                                    </div>
                                    {Object.keys(event.properties).length > 0 && (
                                        <pre className="text-xs text-gray-600 bg-white p-2 rounded overflow-x-auto">
                                            {JSON.stringify(event.properties, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Nenhum evento enviado ainda</p>
                                <p className="text-sm">Clique nos botões acima para testar</p>
                            </div>
                        )}
                    </div>

                    {eventLog.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEventLog([])}
                            >
                                Limpar Log
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Code Examples */}
            <Card>
                <CardHeader>
                    <CardTitle>Exemplos de Código</CardTitle>
                    <CardDescription>
                        Como implementar estes eventos no seu código
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">1. Evento Customizado Simples</h4>
                            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                                {`// Usando o hook personalizado
const { trackEvent } = usePostHog();

trackEvent('meu_evento', {
  propriedade: 'valor',
  numero: 123,
  timestamp: new Date().toISOString()
});`}
                            </pre>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">2. Evento Direto PostHog</h4>
                            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                                {`// Usando PostHog diretamente
import { usePostHog } from 'posthog-js/react';

const posthog = usePostHog();
posthog?.capture('meu_evento', { 
  propriedade: 'valor' 
});`}
                            </pre>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">3. Eventos Específicos da Saraiva</h4>
                            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                                {`// Usando hooks específicos
const { trackAppointmentRequest } = useSaraivaTracking();

trackAppointmentRequest('consulta', 'whatsapp');`}
                            </pre>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">4. Evento com Context</h4>
                            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                                {`// Em um componente
const handleButtonClick = () => {
  trackUserAction('cta_clicked', {
    button_text: 'Agendar Consulta',
    page: window.location.pathname,
    user_type: 'visitor'
  });
};`}
                            </pre>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PostHogEventTesting;