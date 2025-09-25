/**
 * Testes para o Sistema de Fallback Gracioso
 */

import { gracefulFallback, FallbackStrategies } from '../gracefulFallback';

describe('GracefulFallbackManager', () => {
    beforeEach(() => {
        // Limpa dados de teste
        gracefulFallback.fallbackData.clear();
        gracefulFallback.activeServices.clear();
    });

    describe('Registro de Estratégias', () => {
        it('deve registrar uma estratégia de fallback', () => {
            const strategy = {
                type: 'test',
                execute: async () => ({ test: 'data' })
            };

            gracefulFallback.registerFallback('testService', strategy);

            expect(gracefulFallback.fallbackStrategies.has('testService')).toBe(true);
        });
    });

    describe('Execução de Fallback', () => {
        it('deve executar fallback graciosamente', async () => {
            const mockStrategy = {
                type: 'test',
                execute: jest.fn().mockResolvedValue({ test: 'fallback data' })
            };

            gracefulFallback.registerFallback('testService', mockStrategy);

            const result = await gracefulFallback.executeFallback(
                'testService',
                new Error('Test error'),
                { context: 'test' }
            );

            expect(result.success).toBe(true);
            expect(result.data).toEqual({ test: 'fallback data' });
            expect(result.source).toBe('fallback');
            expect(result.graceful).toBe(true);
            expect(mockStrategy.execute).toHaveBeenCalledWith({ context: 'test' });
        });

        it('deve usar fallback padrão quando não há estratégia', async () => {
            const result = await gracefulFallback.executeFallback(
                'unknownService',
                new Error('Test error')
            );

            expect(result.success).toBe(false);
            expect(result.source).toBe('default_fallback');
            expect(result.graceful).toBe(true);
        });
    });

    describe('Monitoramento de Saúde', () => {
        it('deve monitorar saúde dos serviços', () => {
            gracefulFallback.monitorServiceHealth('testService', true);
            expect(gracefulFallback.activeServices.has('testService')).toBe(true);

            gracefulFallback.monitorServiceHealth('testService', false);
            expect(gracefulFallback.activeServices.has('testService')).toBe(false);
        });

        it('deve limpar fallback quando serviço volta a funcionar', () => {
            // Simula fallback ativo
            gracefulFallback.fallbackData.set('testService', {
                data: { test: 'data' },
                timestamp: new Date(),
                source: 'fallback'
            });

            expect(gracefulFallback.isUsingFallback('testService')).toBe(true);

            gracefulFallback.monitorServiceHealth('testService', true);
            expect(gracefulFallback.isUsingFallback('testService')).toBe(false);
        });
    });

    describe('Estratégias Pré-definidas', () => {
        it('deve ter estratégia para Google Reviews', async () => {
            const result = await FallbackStrategies.googleReviews.execute();

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toHaveProperty('id');
            expect(result[0]).toHaveProperty('reviewer');
            expect(result[0]).toHaveProperty('starRating');
            expect(result[0]).toHaveProperty('comment');
        });

        it('deve ter estratégia para Instagram', async () => {
            const result = await FallbackStrategies.instagram.execute({ limit: 2 });

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThanOrEqual(1);
        });

        it('deve ter estratégia para serviços', async () => {
            const result = await FallbackStrategies.services.execute();

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toHaveProperty('id');
            expect(result[0]).toHaveProperty('title');
        });
    });

    describe('Logs Silenciosos', () => {
        let consoleSpy;

        beforeEach(() => {
            consoleSpy = jest.spyOn(console, 'info').mockImplementation();
        });

        afterEach(() => {
            consoleSpy.mockRestore();
        });

        it('deve fazer log apenas no console', async () => {
            const mockStrategy = {
                type: 'test',
                execute: jest.fn().mockResolvedValue({ test: 'data' })
            };

            gracefulFallback.registerFallback('testService', mockStrategy);

            await gracefulFallback.executeFallback(
                'testService',
                new Error('Test error')
            );

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('🔄 testService: Switching to fallback gracefully'),
                expect.any(Object)
            );
        });
    });
});

// Mock para localStorage em testes
Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    },
    writable: true,
});