/**
 * Exemplos de Uso do Sistema de Fallback Gracioso
 * Demonstra como implementar em diferentes cenários
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGracefulFallback } from '@/hooks/useGracefulFallback';
import { gracefulFallback } from '@/utils/gracefulFallback';

// Exemplo 1: Componente de Serviços com Fallback
const ServicesWithFallback = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const { isUsingFallback, executeFallback } = useGracefulFallback('services', {
        onFallbackActivated: (result) => {
            console.info('✅ Services fallback activated successfully');
        }
    });

    useEffect(() => {
        const fetchServices = async () => {
            try {
                // Simula chamada para API
                const response = await fetch('/api/services');

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                setServices(data);

            } catch (error) {
                // Fallback gracioso - usuário não vê erro
                const result = await executeFallback(error);
                if (result.success) {
                    setServices(result.data);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [executeFallback]);

    if (loading) {
        return <div className="animate-pulse">Carregando serviços...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
                <Card key={service.id}>
                    <CardContent className="p-4">
                        <h3 className="font-semibold">{service.title}</h3>
                        <p className="text-gray-600 text-sm">{service.description}</p>
                        {/* Usuário não vê que é fallback */}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

// Exemplo 2: Hook Personalizado com Fallback
const useWeatherData = (city) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    const { executeFallback } = useGracefulFallback('weather');

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch(`/api/weather/${city}`);
                if (!response.ok) throw new Error('Weather API unavailable');

                const data = await response.json();
                setWeather(data);

            } catch (error) {
                // Fallback para dados estáticos
                const result = await executeFallback(error, { city });
                if (result.success) {
                    setWeather(result.data);
                }
            } finally {
                setLoading(false);
            }
        };

        if (city) {
            fetchWeather();
        }
    }, [city, executeFallback]);

    return { weather, loading };
};

// Exemplo 3: Componente que usa o hook personalizado
const WeatherWidget = ({ city = 'Belo Horizonte' }) => {
    const { weather, loading } = useWeatherData(city);

    if (loading) {
        return <div className="animate-pulse">Carregando clima...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Clima em {city}</CardTitle>
            </CardHeader>
            <CardContent>
                {weather ? (
                    <div>
                        <p className="text-2xl font-bold">{weather.temperature}°C</p>
                        <p className="text-gray-600">{weather.description}</p>
                        <p className="text-sm text-gray-500">
                            Umidade: {weather.humidity}%
                        </p>
                    </div>
                ) : (
                    <p className="text-gray-500">Dados não disponíveis</p>
                )}
            </CardContent>
        </Card>
    );
};

// Exemplo 4: Configuração de Nova Estratégia
const setupCustomFallback = () => {
    // Registra estratégia para dados de clima
    gracefulFallback.registerFallback('weather', {
        type: 'static_weather',
        execute: async (context) => {
            // Dados de fallback baseados na cidade
            const fallbackWeather = {
                'Belo Horizonte': {
                    temperature: 24,
                    description: 'Parcialmente nublado',
                    humidity: 65,
                    source: 'fallback'
                },
                'São Paulo': {
                    temperature: 22,
                    description: 'Nublado',
                    humidity: 70,
                    source: 'fallback'
                }
            };

            return fallbackWeather[context.city] || {
                temperature: 25,
                description: 'Tempo agradável',
                humidity: 60,
                source: 'fallback'
            };
        }
    });
};

// Exemplo 5: Componente de Demonstração Completo
const GracefulFallbackUsageDemo = () => {
    const [showDebug, setShowDebug] = useState(false);

    useEffect(() => {
        // Configura estratégias personalizadas
        setupCustomFallback();
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Exemplos de Uso - Fallback Gracioso</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Alert>
                            <AlertDescription>
                                Estes exemplos mostram como implementar fallbacks graciosos
                                em diferentes cenários. Os usuários veem conteúdo normal,
                                enquanto desenvolvedores têm logs detalhados no console.
                            </AlertDescription>
                        </Alert>

                        <Button
                            onClick={() => setShowDebug(!showDebug)}
                            variant="outline"
                        >
                            {showDebug ? 'Ocultar' : 'Mostrar'} Console Debug
                        </Button>

                        {showDebug && (
                            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                                <p>// Abra o Console do Navegador (F12) para ver os logs:</p>
                                <p>🔄 services: Switching to fallback gracefully</p>
                                <p>🔄 weather: Using cached data for graceful experience</p>
                                <p>✅ instagram: Service restored, fallback cleared</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Serviços (com Fallback)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ServicesWithFallback />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Clima (Hook Personalizado)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <WeatherWidget city="Belo Horizonte" />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Código de Exemplo</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-gray-50 p-4 rounded text-sm">
                        <pre>{`// 1. Use o hook em qualquer componente
const { isUsingFallback, executeFallback } = useGracefulFallback('serviceName');

// 2. Execute fallback em caso de erro
try {
    const data = await fetchData();
    setData(data);
} catch (error) {
    const result = await executeFallback(error);
    if (result.success) {
        setData(result.data); // Usuário não vê diferença
    }
}

// 3. Registre estratégias personalizadas
gracefulFallback.registerFallback('myService', {
    type: 'custom',
    execute: async (context) => {
        return await getMyFallbackData(context);
    }
});`}</pre>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default GracefulFallbackUsageDemo;