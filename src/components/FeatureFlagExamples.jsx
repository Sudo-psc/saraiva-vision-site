import React from 'react';
import FeatureFlag, { ABTest, withFeatureFlag } from '@/components/FeatureFlag';
import { useFeatureFlag, useABTest, useSaraivaTracking } from '@/hooks/usePostHog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Example component showing different ways to use PostHog feature flags
 */
const FeatureFlagExamples = () => {
    const { trackUserAction } = useSaraivaTracking();

    return (
        <div className="space-y-8 p-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">PostHog Feature Flags Examples</h2>
                <p className="text-gray-600">Demonstrações de como usar feature flags e A/B tests</p>
            </div>

            {/* Basic Feature Flag Example */}
            <Card>
                <CardHeader>
                    <CardTitle>1. Feature Flag Básico</CardTitle>
                    <CardDescription>
                        Mostra/esconde funcionalidades baseado em feature flags
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FeatureFlag
                        flag="new-appointment-system"
                        fallback={
                            <div className="p-4 bg-gray-100 rounded-lg">
                                <p>Sistema de agendamento clássico</p>
                                <Button variant="outline">Agendar Consulta (Versão Antiga)</Button>
                            </div>
                        }
                        loading={
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p>Carregando sistema de agendamento...</p>
                            </div>
                        }
                    >
                        {(payload) => (
                            <div className="p-4 bg-green-50 rounded-lg">
                                <Badge className="mb-2">Nova Funcionalidade</Badge>
                                <p>Sistema de agendamento avançado com IA</p>
                                <Button
                                    className="mt-2"
                                    onClick={() => trackUserAction('new_appointment_clicked', { payload })}
                                >
                                    Agendar com IA (Nova Versão)
                                </Button>
                                {payload && (
                                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                                        {JSON.stringify(payload, null, 2)}
                                    </pre>
                                )}
                            </div>
                        )}
                    </FeatureFlag>
                </CardContent>
            </Card>

            {/* A/B Test Example */}
            <Card>
                <CardHeader>
                    <CardTitle>2. A/B Test</CardTitle>
                    <CardDescription>
                        Testa diferentes versões de um componente
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ABTest
                        testKey="cta-button-test"
                        variants={{
                            control: ({ payload }) => (
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h3 className="font-semibold mb-2">Versão Controle</h3>
                                    <Button
                                        variant="default"
                                        onClick={() => trackUserAction('cta_clicked', { variant: 'control', payload })}
                                    >
                                        Agende sua Consulta
                                    </Button>
                                </div>
                            ),
                            variant_a: ({ payload }) => (
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <h3 className="font-semibold mb-2">Variante A - Urgência</h3>
                                    <Button
                                        variant="destructive"
                                        onClick={() => trackUserAction('cta_clicked', { variant: 'variant_a', payload })}
                                    >
                                        🚨 Agende HOJE - Vagas Limitadas!
                                    </Button>
                                </div>
                            ),
                            variant_b: ({ payload }) => (
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <h3 className="font-semibold mb-2">Variante B - Benefício</h3>
                                    <Button
                                        variant="secondary"
                                        onClick={() => trackUserAction('cta_clicked', { variant: 'variant_b', payload })}
                                    >
                                        ✨ Consulta Gratuita - Agende Agora
                                    </Button>
                                </div>
                            ),
                        }}
                        fallback={
                            <div className="p-4 bg-gray-100 rounded-lg">
                                <p>A/B Test não ativo</p>
                            </div>
                        }
                    />
                </CardContent>
            </Card>

            {/* Advanced Feature Flag with Hook */}
            <Card>
                <CardHeader>
                    <CardTitle>3. Feature Flag com Hook Personalizado</CardTitle>
                    <CardDescription>
                        Uso avançado com lógica personalizada
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AdvancedFeatureExample />
                </CardContent>
            </Card>

            {/* HOC Example */}
            <Card>
                <CardHeader>
                    <CardTitle>4. Higher-Order Component</CardTitle>
                    <CardDescription>
                        Componente envolvido por feature flag
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <BetaFeatureComponent />
                </CardContent>
            </Card>
        </div>
    );
};

/**
 * Example of using feature flag hook directly
 */
const AdvancedFeatureExample = () => {
    const { isEnabled, payload, isLoading } = useFeatureFlag('advanced-analytics');
    const { trackUserAction } = useSaraivaTracking();

    if (isLoading) {
        return <div className="animate-pulse bg-gray-200 h-20 rounded"></div>;
    }

    if (!isEnabled) {
        return (
            <div className="p-4 bg-gray-100 rounded-lg">
                <p>Analytics básico ativo</p>
            </div>
        );
    }

    const handleAdvancedAnalytics = () => {
        trackUserAction('advanced_analytics_used', {
            feature_payload: payload,
            timestamp: new Date().toISOString()
        });
    };

    return (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <Badge variant="secondary" className="mb-2">Beta</Badge>
            <h4 className="font-semibold mb-2">Analytics Avançado Habilitado</h4>
            <p className="text-sm text-gray-600 mb-3">
                Funcionalidades experimentais de analytics com IA
            </p>
            <Button
                size="sm"
                onClick={handleAdvancedAnalytics}
                className="mr-2"
            >
                Usar Analytics IA
            </Button>
            {payload && (
                <details className="mt-3">
                    <summary className="text-xs cursor-pointer">Ver configuração</summary>
                    <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(payload, null, 2)}
                    </pre>
                </details>
            )}
        </div>
    );
};

/**
 * Component that will only render if beta-features flag is enabled
 */
const BetaFeature = () => {
    const { trackUserAction } = useSaraivaTracking();

    return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Badge variant="outline" className="mb-2">🧪 Beta</Badge>
            <h4 className="font-semibold mb-2">Funcionalidade Beta</h4>
            <p className="text-sm text-gray-600 mb-3">
                Esta é uma funcionalidade experimental disponível apenas para usuários beta.
            </p>
            <Button
                size="sm"
                variant="outline"
                onClick={() => trackUserAction('beta_feature_used')}
            >
                Testar Funcionalidade Beta
            </Button>
        </div>
    );
};

// Wrap component with feature flag HOC
const BetaFeatureComponent = withFeatureFlag(
    'beta-features',
    <div className="p-4 bg-gray-100 rounded-lg">
        <p>Funcionalidades beta não disponíveis</p>
    </div>
)(BetaFeature);

/**
 * Example of multivariate testing
 */
export const MultivariateTestExample = () => {
    const { variant, payload, trackVariantInteraction } = useABTest('pricing-display-test');

    const handlePricingClick = (plan) => {
        trackVariantInteraction(variant, `pricing_${plan}_clicked`);
    };

    const pricingVariants = {
        control: (
            <div className="grid grid-cols-3 gap-4">
                <PricingCard plan="basic" price="R$ 150" onClick={() => handlePricingClick('basic')} />
                <PricingCard plan="premium" price="R$ 250" onClick={() => handlePricingClick('premium')} />
                <PricingCard plan="vip" price="R$ 350" onClick={() => handlePricingClick('vip')} />
            </div>
        ),
        discount: (
            <div className="grid grid-cols-3 gap-4">
                <PricingCard plan="basic" price="R$ 120" originalPrice="R$ 150" onClick={() => handlePricingClick('basic')} />
                <PricingCard plan="premium" price="R$ 200" originalPrice="R$ 250" onClick={() => handlePricingClick('premium')} />
                <PricingCard plan="vip" price="R$ 280" originalPrice="R$ 350" onClick={() => handlePricingClick('vip')} />
            </div>
        ),
        bundle: (
            <div className="grid grid-cols-2 gap-4">
                <PricingCard plan="consulta + exame" price="R$ 200" onClick={() => handlePricingClick('bundle1')} />
                <PricingCard plan="pacote completo" price="R$ 400" onClick={() => handlePricingClick('bundle2')} />
            </div>
        ),
    };

    return pricingVariants[variant] || pricingVariants.control;
};

const PricingCard = ({ plan, price, originalPrice, onClick }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
        <CardHeader>
            <CardTitle className="text-lg">{plan}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-blue-600">
                {price}
                {originalPrice && (
                    <span className="text-sm text-gray-500 line-through ml-2">{originalPrice}</span>
                )}
            </div>
        </CardContent>
    </Card>
);

export default FeatureFlagExamples;