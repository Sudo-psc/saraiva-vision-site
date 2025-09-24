/**
 * Tests for Chatbot Cache Service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Supabase before importing the service
const mockSupabase = {
    from: vi.fn(() => ({
        select: vi.fn(() => ({
            eq: vi.fn(() => ({
                single: vi.fn()
            }))
        })),
        insert: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(() => ({
            eq: vi.fn()
        })),
        delete: vi.fn(() => ({
            eq: vi.fn(),
            ilike: vi.fn(),
            lt: vi.fn(),
            select: vi.fn()
        }))
    }))
};

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => mockSupabase)
}));

// Mock crypto module
vi.mock('crypto', () => ({
    default: {
        createHash: vi.fn(() => ({
            update: vi.fn(() => ({
                digest: vi.fn(() => 'mocked-hash-value')
            }))
        }))
    }
}));

// Import after mocking
const { default: chatbotCacheService } = await import('../chatbotCacheService.js');

describe('ChatbotCacheService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset cache service state
        chatbotCacheService.memoryCache.clear();
        chatbotCacheService.cacheStats = {
            hits: 0,
            misses: 0,
            memoryHits: 0,
            dbHits: 0,
            invalidations: 0,
            totalRequests: 0
        };
    });

    describe('generateCacheKey', () => {
        it('should generate consistent cache keys for same input', () => {
            const message = 'O que é catarata?';
            const context = { appointmentIntent: false };

            const key1 = chatbotCacheService.generateCacheKey(message, context);
            const key2 = chatbotCacheService.generateCacheKey(message, context);

            expect(key1).toBe(key2);
            expect(key1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hash
        });

        it('should generate different keys for different contexts', () => {
            const message = 'Preciso agendar consulta';
            const context1 = { appointmentIntent: false };
            const context2 = { appointmentIntent: true };

            const key1 = chatbotCacheService.generateCacheKey(message, context1);
            const key2 = chatbotCacheService.generateCacheKey(message, context2);

            expect(key1).not.toBe(key2);
        });
    });

    describe('normalizeMessage', () => {
        it('should normalize messages consistently', () => {
            const message1 = 'O que é CATARATA???';
            const message2 = 'o que é catarata';

            const normalized1 = chatbotCacheService.normalizeMessage(message1);
            const normalized2 = chatbotCacheService.normalizeMessage(message2);

            expect(normalized1).toBe(normalized2);
            expect(normalized1).toBe('o que e catarata');
        });

        it('should handle special characters and whitespace', () => {
            const message = '  O que é... catarata?!  ';
            const normalized = chatbotCacheService.normalizeMessage(message);

            expect(normalized).toBe('o que e catarata');
        });
    });

    describe('categorizeMessage', () => {
        it('should categorize medical conditions correctly', () => {
            expect(chatbotCacheService.categorizeMessage('o que e catarata')).toBe('cataract');
            expect(chatbotCacheService.categorizeMessage('sintomas de glaucoma')).toBe('glaucoma');
            expect(chatbotCacheService.categorizeMessage('tenho miopia')).toBe('myopia');
        });

        it('should categorize appointment messages', () => {
            expect(chatbotCacheService.categorizeMessage('quero agendar consulta')).toBe('appointment');
            expect(chatbotCacheService.categorizeMessage('qual o horario')).toBe('appointment');
        });

        it('should categorize emergency messages', () => {
            expect(chatbotCacheService.categorizeMessage('emergencia socorro')).toBe('emergency');
            expect(chatbotCacheService.categorizeMessage('urgente perdi visao')).toBe('emergency');
        });

        it('should default to general category', () => {
            expect(chatbotCacheService.categorizeMessage('ola como vai')).toBe('general');
        });
    });

    describe('shouldCache', () => {
        it('should not cache emergency responses', () => {
            const message = 'emergência';
            const response = 'Procure ajuda médica imediatamente';
            const category = 'emergency';

            expect(chatbotCacheService.shouldCache(message, response, category)).toBe(false);
        });

        it('should not cache very short responses', () => {
            const message = 'oi';
            const response = 'Olá!';
            const category = 'general';

            expect(chatbotCacheService.shouldCache(message, response, category)).toBe(false);
        });

        it('should not cache responses with personal information', () => {
            const message = 'qual meu agendamento';
            const response = 'Seu agendamento é dia 15/03/2024 às 14:30';
            const category = 'appointment';

            expect(chatbotCacheService.shouldCache(message, response, category)).toBe(false);
        });

        it('should cache valid medical information', () => {
            const message = 'o que é catarata';
            const response = 'Catarata é uma condição ocular onde o cristalino do olho fica opaco, causando visão turva. É uma condição comum relacionada ao envelhecimento.';
            const category = 'cataract';

            expect(chatbotCacheService.shouldCache(message, response, category)).toBe(true);
        });
    });

    describe('getCachedResponse', () => {
        it('should return cache miss for non-existent entries', async () => {
            mockSupabase.from().select().eq().single.mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' } // No rows returned
            });

            const result = await chatbotCacheService.getCachedResponse('test message');

            expect(result.success).toBe(false);
            expect(chatbotCacheService.cacheStats.misses).toBe(1);
        });

        it('should return cached response from memory cache', async () => {
            const message = 'o que é catarata';
            const cacheKey = chatbotCacheService.generateCacheKey(message);
            const cachedData = {
                response: 'Catarata é uma condição ocular...',
                metadata: { tokensUsed: 100 },
                createdAt: Date.now(),
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                ttl_seconds: 86400,
                accessCount: 1
            };

            chatbotCacheService.memoryCache.set(cacheKey, cachedData);

            const result = await chatbotCacheService.getCachedResponse(message);

            expect(result.success).toBe(true);
            expect(result.response).toBe(cachedData.response);
            expect(result.metadata.cacheSource).toBe('memory');
            expect(chatbotCacheService.cacheStats.hits).toBe(1);
            expect(chatbotCacheService.cacheStats.memoryHits).toBe(1);
        });

        it('should return cached response from database', async () => {
            const message = 'o que é glaucoma';
            const cachedData = {
                response: 'Glaucoma é uma doença ocular...',
                metadata: { tokensUsed: 120 },
                created_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                access_count: 5
            };

            mockSupabase.from().select().eq().single.mockResolvedValue({
                data: cachedData,
                error: null
            });

            const result = await chatbotCacheService.getCachedResponse(message);

            expect(result.success).toBe(true);
            expect(result.response).toBe(cachedData.response);
            expect(result.metadata.cacheSource).toBe('database');
            expect(chatbotCacheService.cacheStats.hits).toBe(1);
            expect(chatbotCacheService.cacheStats.dbHits).toBe(1);
        });
    });

    describe('cacheResponse', () => {
        it('should cache valid responses', async () => {
            const message = 'o que é miopia';
            const response = 'Miopia é um erro refrativo onde objetos distantes aparecem borrados...';
            const context = {};
            const metadata = { tokensUsed: 150, responseTime: 2000 };

            mockSupabase.from().upsert.mockResolvedValue({ error: null });

            const result = await chatbotCacheService.cacheResponse(message, response, context, metadata);

            expect(result.success).toBe(true);
            expect(result.category).toBe('myopia');
            expect(mockSupabase.from().upsert).toHaveBeenCalled();
        });

        it('should not cache emergency responses', async () => {
            const message = 'emergência médica';
            const response = 'Procure ajuda imediatamente';

            const result = await chatbotCacheService.cacheResponse(message, response);

            expect(result.success).toBe(false);
            expect(result.reason).toBe('not_cacheable');
        });

        it('should not cache responses with personal information', async () => {
            const message = 'meu agendamento';
            const response = 'Seu agendamento é dia 15/03/2024 às 14:30 com Dr. Silva';

            const result = await chatbotCacheService.cacheResponse(message, response);

            expect(result.success).toBe(false);
            expect(result.reason).toBe('not_cacheable');
        });
    });

    describe('calculateSimilarity', () => {
        it('should calculate similarity correctly', () => {
            const text1 = 'o que e catarata';
            const text2 = 'o que e glaucoma';
            const text3 = 'sintomas de catarata';

            const similarity1 = chatbotCacheService.calculateSimilarity(text1, text2);
            const similarity2 = chatbotCacheService.calculateSimilarity(text1, text3);

            expect(similarity1).toBeGreaterThan(0);
            expect(similarity1).toBeLessThan(1);
            expect(similarity2).toBeGreaterThan(similarity1); // More similar
        });

        it('should return 1 for identical texts', () => {
            const text = 'o que e catarata';
            const similarity = chatbotCacheService.calculateSimilarity(text, text);

            expect(similarity).toBe(1);
        });

        it('should return 0 for completely different texts', () => {
            const text1 = 'catarata glaucoma miopia';
            const text2 = 'pizza hamburguer batata';
            const similarity = chatbotCacheService.calculateSimilarity(text1, text2);

            expect(similarity).toBe(0);
        });
    });

    describe('invalidateCache', () => {
        it('should invalidate cache by category', async () => {
            mockSupabase.from().delete().select.mockResolvedValue({
                data: [{ cache_key: 'key1' }, { cache_key: 'key2' }],
                error: null
            });

            const result = await chatbotCacheService.invalidateCache({ category: 'cataract' });

            expect(result.success).toBe(true);
            expect(result.invalidatedCount).toBe(2);
            expect(chatbotCacheService.cacheStats.invalidations).toBe(2);
        });

        it('should handle invalidation errors', async () => {
            mockSupabase.from().delete().select.mockResolvedValue({
                data: null,
                error: { message: 'Database error' }
            });

            const result = await chatbotCacheService.invalidateCache({ category: 'test' });

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('getCacheStatistics', () => {
        it('should return correct statistics', () => {
            chatbotCacheService.cacheStats = {
                hits: 80,
                misses: 20,
                memoryHits: 60,
                dbHits: 20,
                invalidations: 5,
                totalRequests: 100
            };
            chatbotCacheService.memoryCache.set('test1', {});
            chatbotCacheService.memoryCache.set('test2', {});

            const stats = chatbotCacheService.getCacheStatistics();

            expect(stats.hitRate).toBe(80);
            expect(stats.memoryHitRate).toBe(75); // 60/80 * 100
            expect(stats.memoryCacheSize).toBe(2);
            expect(stats.totalRequests).toBe(100);
        });
    });

    describe('memory cache management', () => {
        it('should limit memory cache size', () => {
            const originalMaxSize = chatbotCacheService.config.maxMemoryCacheSize;
            chatbotCacheService.config.maxMemoryCacheSize = 3;

            // Add more entries than the limit
            for (let i = 0; i < 5; i++) {
                chatbotCacheService.addToMemoryCache(`key${i}`, {
                    response: `response${i}`,
                    createdAt: Date.now() - i * 1000,
                    lastAccessed: Date.now() - i * 1000
                });
            }

            expect(chatbotCacheService.memoryCache.size).toBe(3);

            // Restore original config
            chatbotCacheService.config.maxMemoryCacheSize = originalMaxSize;
        });

        it('should remove oldest entries when cache is full', () => {
            const originalMaxSize = chatbotCacheService.config.maxMemoryCacheSize;
            chatbotCacheService.config.maxMemoryCacheSize = 2;

            chatbotCacheService.addToMemoryCache('old', {
                response: 'old response',
                createdAt: Date.now() - 10000,
                lastAccessed: Date.now() - 10000
            });

            chatbotCacheService.addToMemoryCache('new', {
                response: 'new response',
                createdAt: Date.now(),
                lastAccessed: Date.now()
            });

            chatbotCacheService.addToMemoryCache('newest', {
                response: 'newest response',
                createdAt: Date.now() + 1000,
                lastAccessed: Date.now() + 1000
            });

            expect(chatbotCacheService.memoryCache.size).toBe(2);
            expect(chatbotCacheService.memoryCache.has('old')).toBe(false);
            expect(chatbotCacheService.memoryCache.has('new')).toBe(true);
            expect(chatbotCacheService.memoryCache.has('newest')).toBe(true);

            // Restore original config
            chatbotCacheService.config.maxMemoryCacheSize = originalMaxSize;
        });
    });
});