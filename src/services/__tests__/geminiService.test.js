/**
 * Tests for Gemini Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock environment variables first
vi.stubEnv('GOOGLE_GEMINI_API_KEY', 'test-api-key');

// Mock the Google Generative AI
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn();
const mockGoogleGenerativeAI = vi.fn();

vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: mockGoogleGenerativeAI
}));

describe('GeminiService', () => {
    let GeminiServiceClass;

    beforeEach(async () => {
        vi.clearAllMocks();

        // Setup mocks
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => 'Mocked response from Gemini',
                candidates: [{
                    safetyRatings: [],
                    finishReason: 'STOP'
                }],
                usageMetadata: {
                    totalTokenCount: 50
                }
            }
        });

        mockGetGenerativeModel.mockReturnValue({
            generateContent: mockGenerateContent
        });

        mockGoogleGenerativeAI.mockImplementation(() => ({
            getGenerativeModel: mockGetGenerativeModel
        }));

        // Import the class (not the singleton)
        const module = await import('../geminiService.js');
        GeminiServiceClass = module.default.constructor;
    });

    describe('initialization', () => {
        it('should initialize with valid API key', () => {
            const service = new GeminiServiceClass();
            expect(service.apiKey).toBe('test-api-key');
            expect(mockGoogleGenerativeAI).toHaveBeenCalled();
        });

        it('should throw error without API key', () => {
            vi.stubEnv('GOOGLE_GEMINI_API_KEY', '');

            expect(() => {
                new GeminiServiceClass();
            }).toThrow('GOOGLE_GEMINI_API_KEY environment variable is required');
        });
    });

    describe('rate limiting', () => {
        it('should allow requests within rate limit', () => {
            const service = new GeminiServiceClass();
            const result = service.checkRateLimit('test-session');
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBeLessThan(60);
        });

        it('should block requests exceeding rate limit', () => {
            const service = new GeminiServiceClass();
            const sessionId = 'test-session-limit';

            // Make 60 requests to hit the limit
            for (let i = 0; i < 60; i++) {
                service.checkRateLimit(sessionId);
            }

            // 61st request should be blocked
            const result = service.checkRateLimit(sessionId);
            expect(result.allowed).toBe(false);
            expect(result.remaining).toBe(0);
        });
    });

    describe('generateResponse', () => {
        it('should generate response successfully', async () => {
            const service = new GeminiServiceClass();
            const response = await service.generateResponse('Hello, test message');

            expect(response.success).toBe(true);
            expect(response.content).toBe('Mocked response from Gemini');
            expect(response.metadata).toHaveProperty('responseTime');
            expect(response.metadata).toHaveProperty('tokensUsed');
            expect(mockGenerateContent).toHaveBeenCalledWith('Hello, test message');
        });

        it('should handle conversation history', async () => {
            const service = new GeminiServiceClass();
            const conversationHistory = [
                { role: 'user', content: 'Previous message' },
                { role: 'assistant', content: 'Previous response' }
            ];

            const response = await service.generateResponse('Current message', {
                conversationHistory
            });

            expect(response.success).toBe(true);
            expect(mockGenerateContent).toHaveBeenCalled();
        });

        it('should handle context parameters', async () => {
            const service = new GeminiServiceClass();
            const response = await service.generateResponse('Test message', {
                context: {
                    appointmentIntent: true,
                    emergencyContext: false
                }
            });

            expect(response.success).toBe(true);
            expect(mockGenerateContent).toHaveBeenCalled();
        });

        it('should handle rate limit errors', async () => {
            const service = new GeminiServiceClass();
            const sessionId = 'rate-limit-test';

            // Hit rate limit
            for (let i = 0; i < 60; i++) {
                service.checkRateLimit(sessionId);
            }

            await expect(
                service.generateResponse('Test message', { sessionId })
            ).rejects.toThrow('Rate limit exceeded');
        });

        it('should handle API errors', async () => {
            const service = new GeminiServiceClass();
            mockGenerateContent.mockRejectedValueOnce(new Error('API Error'));

            await expect(
                service.generateResponse('Test message')
            ).rejects.toThrow('Failed to generate response');
        });
    });

    describe('health status', () => {
        it('should return health status', () => {
            const service = new GeminiServiceClass();
            const health = service.getHealthStatus();

            expect(health).toHaveProperty('service', 'GeminiService');
            expect(health).toHaveProperty('status');
            expect(health).toHaveProperty('apiKeyConfigured', true);
            expect(health).toHaveProperty('modelInitialized');
            expect(health).toHaveProperty('timestamp');
        });
    });

    describe('configuration validation', () => {
        it('should validate configuration successfully', async () => {
            const service = new GeminiServiceClass();
            const validation = await service.validateConfiguration();

            expect(validation.valid).toBe(true);
            expect(validation.message).toBe('Gemini API configuration is valid');
            expect(validation.testResponse).toBe('Mocked response from Gemini');
        });

        it('should handle validation errors', async () => {
            const service = new GeminiServiceClass();
            mockGenerateContent.mockRejectedValueOnce(new Error('Validation failed'));

            const validation = await service.validateConfiguration();
            expect(validation.valid).toBe(false);
            expect(validation.message).toBe('Validation failed');
        });
    });
});