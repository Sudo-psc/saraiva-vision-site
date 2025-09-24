/**
 * Comprehensive Error Handling Tests
 * Tests for error response mapping, user feedback, and fallback mechanisms
 * Requirements: 3.4, 4.5, 7.5, 9.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    createErrorResponse,
    createSuccessResponse,
    handleApiError,
    validateErrorResponse,
    getRecoverySteps,
    ERROR_MAPPINGS,
    ERROR_CATEGORIES,
    ERROR_SEVERITY,
    HTTP_STATUS
} from '../utils/errorHandler.js';
import {
    FallbackManager,
    FALLBACK_STRATEGIES,
    executeWithFallback
} from '../utils/fallbackManager.js';
import {
    ClientErrorHandler,
    handleClientError,
    handleApiError as handleClientApiError,
    ERROR_DISPLAY_TYPES,
    ERROR_ACTIONS
} from '../../../../../../..../../../../src/lib/clientErrorHandler.js';

// Mock dependencies
vi.mock('../../../../../../..../../../../src/lib/logger.js', () => ({
    createLogger: vi.fn(() => ({
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
    }))
}));

vi.mock('../../../../../../..../../../../src/lib/eventLogger.js', () => ({
    logEvent: vi.fn()
}));

describe('Error Handler', () => {
    describe('createErrorResponse', () => {
        it('should create standardized error response for validation errors', () => {
            const result = createErrorResponse('VALIDATION_ERROR', {
                requestId: 'test-123',
                field: 'email',
                validationErrors: [{ field: 'email', message: 'Invalid format' }]
            });

            expect(result.response).toMatchObject({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Os dados fornecidos são inválidos.',
                    category: ERROR_CATEGORIES.VALIDATION,
                    severity: ERROR_SEVERITY.MEDIUM,
                    recovery: 'Verifique os campos obrigatórios e tente novamente.',
                    retryable: false,
                    requestId: 'test-123',
                    field: 'email',
                    validationErrors: [{ field: 'email', message: 'Invalid format' }]
                }
            });

            expect(result.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(result.logLevel).toBe('warn');
        });

        it('should create error response for rate limiting', () => {
            const result = createErrorResponse('RATE_LIMIT_EXCEEDED', {
                requestId: 'test-456'
            });

            expect(result.response.error).toMatchObject({
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Muitas tentativas realizadas. Aguarde um momento.',
                category: ERROR_CATEGORIES.RATE_LIMIT,
                severity: ERROR_SEVERITY.MEDIUM,
                retryable: true,
                retryAfter: 300
            });

            expect(result.status).toBe(HTTP_STATUS.TOO_MANY_REQUESTS);
        });

        it('should create error response for external service failures', () => {
            const result = createErrorResponse('EMAIL_SERVICE_UNAVAILABLE', {
                requestId: 'test-789'
            });

            expect(result.response.error).toMatchObject({
                code: 'EMAIL_SERVICE_UNAVAILABLE',
                message: 'Serviço de email temporariamente indisponível.',
                category: ERROR_CATEGORIES.EXTERNAL_SERVICE,
                severity: ERROR_SEVERITY.HIGH,
                retryable: true,
                fallback: {
                    action: 'queue_for_retry',
                    message: 'Sua mensagem foi salva e será enviada assim que o serviço for restaurado.'
                }
            });

            expect(result.status).toBe(HTTP_STATUS.BAD_GATEWAY);
        });

        it('should fallback to internal server error for unknown codes', () => {
            const result = createErrorResponse('UNKNOWN_ERROR_CODE');

            expect(result.response.error.code).toBe('UNKNOWN_ERROR_CODE');
            expect(result.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        });
    });

    describe('createSuccessResponse', () => {
        it('should create standardized success response', () => {
            const response = createSuccessResponse('Operation successful', { id: 123 }, {
                requestId: 'test-success'
            });

            expect(response).toMatchObject({
                success: true,
                message: 'Operation successful',
                data: { id: 123 },
                requestId: 'test-success'
            });

            expect(response.timestamp).toBeDefined();
        });
    });

    describe('validateErrorResponse', () => {
        it('should validate correct error response format', () => {
            const validResponse = {
                success: false,
                error: {
                    code: 'TEST_ERROR',
                    message: 'Test message',
                    category: 'test',
                    severity: 'medium',
                    recovery: 'Test recovery',
                    timestamp: new Date().toISOString(),
                    requestId: 'test-123'
                }
            };

            expect(validateErrorResponse(validResponse)).toBe(true);
        });

        it('should reject invalid error response format', () => {
            const invalidResponse = {
                success: false,
                error: {
                    code: 'TEST_ERROR'
                    // Missing required fields
                }
            };

            expect(validateErrorResponse(invalidResponse)).toBe(false);
        });

        it('should reject non-error response', () => {
            const successResponse = {
                success: true,
                data: {}
            };

            expect(validateErrorResponse(successResponse)).toBe(false);
        });
    });

    describe('getRecoverySteps', () => {
        it('should return recovery steps for validation errors', () => {
            const steps = getRecoverySteps('VALIDATION_ERROR', { field: 'email' });

            expect(steps).toContain('Verifique os campos obrigatórios e tente novamente.');
            expect(steps).toContain('Verifique o campo "email" e corrija os dados.');
        });

        it('should return recovery steps for external service errors', () => {
            const steps = getRecoverySteps('EMAIL_SERVICE_UNAVAILABLE');

            expect(steps).toContain('Tente novamente em alguns minutos ou entre em contato por telefone.');
            expect(steps).toContain('Telefone: (33) 99860-1427');
            expect(steps).toContain('WhatsApp: (33) 99860-1427');
        });

        it('should return recovery steps for network errors', () => {
            const steps = getRecoverySteps('NETWORK_ERROR');

            expect(steps).toContain('Verifique sua conexão com a internet e tente novamente.');
            expect(steps).toContain('Verifique sua conexão Wi-Fi ou dados móveis.');
            expect(steps).toContain('Tente recarregar a página.');
        });

        it('should return default recovery for unknown errors', () => {
            const steps = getRecoverySteps('UNKNOWN_ERROR');

            expect(steps).toContain('Tente novamente mais tarde.');
        });
    });

    describe('handleApiError', () => {
        let mockReq, mockRes;

        beforeEach(() => {
            mockReq = {
                url: '/api/test',
                method: 'POST',
                headers: {
                    'user-agent': 'test-agent'
                }
            };

            mockRes = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn().mockReturnThis(),
                setHeader: vi.fn()
            };
        });

        it('should handle network errors', async () => {
            const networkError = new Error('Connection failed');
            networkError.code = 'ECONNREFUSED';

            await handleApiError(networkError, mockReq, mockRes, {
                source: 'test-api',
                requestId: 'test-123'
            });

            expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_GATEWAY);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'NETWORK_ERROR',
                        category: ERROR_CATEGORIES.NETWORK
                    })
                })
            );
        });

        it('should handle validation errors', async () => {
            const validationError = new Error('Validation failed');
            validationError.name = 'ValidationError';

            await handleApiError(validationError, mockReq, mockRes, {
                source: 'test-api',
                requestId: 'test-456'
            });

            expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'VALIDATION_ERROR',
                        category: ERROR_CATEGORIES.VALIDATION
                    })
                })
            );
        });

        it('should set retry-after header for rate limiting', async () => {
            const rateLimitError = new Error('Rate limited');
            rateLimitError.code = 'RATE_LIMITED';

            await handleApiError(rateLimitError, mockReq, mockRes, {
                source: 'test-api',
                requestId: 'test-789'
            });

            expect(mockRes.setHeader).toHaveBeenCalledWith('Retry-After', 300);
        });
    });
});

describe('Fallback Manager', () => {
    let fallbackManager;

    beforeEach(() => {
        fallbackManager = new FallbackManager({
            enableCaching: true,
            cacheTimeout: 1000,
            maxRetries: 2
        });
    });

    afterEach(() => {
        fallbackManager.clearCache();
    });

    describe('executeWithFallback', () => {
        it('should execute primary operation successfully', async () => {
            const primaryOperation = vi.fn().mockResolvedValue({ data: 'success' });

            const result = await fallbackManager.executeWithFallback(
                FALLBACK_STRATEGIES.EMAIL_SERVICE,
                primaryOperation
            );

            expect(result.success).toBe(true);
            expect(result.source).toBe('primary');
            expect(result.data).toEqual({ data: 'success' });
            expect(primaryOperation).toHaveBeenCalledOnce();
        });

        it('should execute fallback when primary operation fails', async () => {
            const primaryOperation = vi.fn().mockRejectedValue(new Error('Service unavailable'));

            const result = await fallbackManager.executeWithFallback(
                FALLBACK_STRATEGIES.EMAIL_SERVICE,
                primaryOperation,
                { queueForRetry: true }
            );

            expect(result.success).toBe(true);
            expect(result.source).toBe('fallback');
            expect(result.fallbackType).toBe('queued');
            expect(result.data).toEqual({ queued: true, retryAfter: 300 });
        });

        it('should use cached content for WordPress fallback', async () => {
            // Set cached content
            fallbackManager.setCachedContent('page', 'home', { title: 'Cached Page' });

            const primaryOperation = vi.fn().mockRejectedValue(new Error('WordPress unavailable'));

            const result = await fallbackManager.executeWithFallback(
                FALLBACK_STRATEGIES.WORDPRESS_CMS,
                primaryOperation,
                { contentType: 'page', identifier: 'home' }
            );

            expect(result.success).toBe(true);
            expect(result.fallbackType).toBe('cached_content');
            expect(result.data).toEqual({ title: 'Cached Page' });
        });

        it('should provide static responses for chatbot fallback', async () => {
            const primaryOperation = vi.fn().mockRejectedValue(new Error('OpenAI unavailable'));

            const result = await fallbackManager.executeWithFallback(
                FALLBACK_STRATEGIES.CHATBOT_AI,
                primaryOperation,
                { userMessage: 'Quero agendar uma consulta' }
            );

            expect(result.success).toBe(true);
            expect(result.fallbackType).toBe('static_responses');
            expect(result.data.response).toContain('agendamentos');
            expect(result.data.contactInfo).toBeDefined();
        });

        it('should handle emergency messages in chatbot fallback', async () => {
            const primaryOperation = vi.fn().mockRejectedValue(new Error('OpenAI unavailable'));

            const result = await fallbackManager.executeWithFallback(
                FALLBACK_STRATEGIES.CHATBOT_AI,
                primaryOperation,
                { userMessage: 'Tenho uma emergência, meu olho está com muita dor' }
            );

            expect(result.success).toBe(true);
            expect(result.data.response).toContain('emergências');
            expect(result.data.response).toContain('(33) 99860-1427');
        });
    });

    describe('service health tracking', () => {
        it('should mark service as unhealthy after failures', async () => {
            const failingOperation = vi.fn().mockRejectedValue(new Error('Service down'));

            // Fail multiple times
            await fallbackManager.executeWithFallback(
                FALLBACK_STRATEGIES.EMAIL_SERVICE,
                failingOperation
            );
            await fallbackManager.executeWithFallback(
                FALLBACK_STRATEGIES.EMAIL_SERVICE,
                failingOperation
            );
            await fallbackManager.executeWithFallback(
                FALLBACK_STRATEGIES.EMAIL_SERVICE,
                failingOperation
            );

            const status = fallbackManager.getServiceStatus();
            expect(status[FALLBACK_STRATEGIES.EMAIL_SERVICE].healthy).toBe(false);
            expect(status[FALLBACK_STRATEGIES.EMAIL_SERVICE].consecutiveFailures).toBe(3);
        });

        it('should use fallback immediately for known unhealthy services', async () => {
            const primaryOperation = vi.fn();

            // Mark service as unhealthy
            fallbackManager.markServiceUnhealthy(FALLBACK_STRATEGIES.EMAIL_SERVICE);
            fallbackManager.markServiceUnhealthy(FALLBACK_STRATEGIES.EMAIL_SERVICE);
            fallbackManager.markServiceUnhealthy(FALLBACK_STRATEGIES.EMAIL_SERVICE);

            const result = await fallbackManager.executeWithFallback(
                FALLBACK_STRATEGIES.EMAIL_SERVICE,
                primaryOperation,
                { queueForRetry: true }
            );

            expect(primaryOperation).not.toHaveBeenCalled();
            expect(result.source).toBe('fallback');
        });

        it('should reset health status on successful operation', async () => {
            // Mark as unhealthy first
            fallbackManager.markServiceUnhealthy(FALLBACK_STRATEGIES.EMAIL_SERVICE);

            const successfulOperation = vi.fn().mockResolvedValue({ success: true });

            await fallbackManager.executeWithFallback(
                FALLBACK_STRATEGIES.EMAIL_SERVICE,
                successfulOperation
            );

            const status = fallbackManager.getServiceStatus();
            expect(status[FALLBACK_STRATEGIES.EMAIL_SERVICE].healthy).toBe(true);
            expect(status[FALLBACK_STRATEGIES.EMAIL_SERVICE].consecutiveFailures).toBe(0);
        });
    });

    describe('caching', () => {
        it('should cache and retrieve content', () => {
            const testData = { title: 'Test Content' };

            fallbackManager.setCachedContent('test', 'item1', testData);
            const retrieved = fallbackManager.getCachedContent('test', 'item1');

            expect(retrieved).toEqual(testData);
        });

        it('should expire cached content after timeout', async () => {
            const testData = { title: 'Test Content' };

            fallbackManager.setCachedContent('test', 'item2', testData);

            // Wait for cache to expire
            await new Promise(resolve => setTimeout(resolve, 1100));

            const retrieved = fallbackManager.getCachedContent('test', 'item2');
            expect(retrieved).toBeNull();
        });
    });
});

describe('Client Error Handler', () => {
    let clientErrorHandler;

    beforeEach(() => {
        // Mock DOM elements
        global.document = {
            getElementById: vi.fn(),
            createElement: vi.fn(() => ({
                setAttribute: vi.fn(),
                style: {},
                textContent: ''
            })),
            body: {
                appendChild: vi.fn()
            }
        };

        clientErrorHandler = new ClientErrorHandler({
            enableAccessibility: true,
            autoRetry: false, // Disable for testing
            logErrors: false
        });
    });

    describe('handleError', () => {
        it('should handle API error responses', async () => {
            const apiError = {
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Validation failed',
                    category: 'validation',
                    severity: 'medium',
                    recovery: 'Check your input',
                    retryable: false,
                    field: 'email'
                }
            };

            const result = await clientErrorHandler.handleError(apiError, {
                source: 'form',
                action: 'submit'
            });

            expect(result.success).toBe(false);
            expect(result.error.userMessage).toBe('Validation failed');
            expect(result.error.field).toBe('email');
            expect(result.displayConfig.field).toBe('email');
        });

        it('should handle JavaScript Error objects', async () => {
            const jsError = new Error('Network connection failed');
            jsError.name = 'NetworkError';

            const result = await clientErrorHandler.handleError(jsError, {
                source: 'api',
                action: 'fetch'
            });

            expect(result.success).toBe(false);
            expect(result.error.type).toBe('network');
        });

        it('should create appropriate display configuration', async () => {
            const error = {
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: 'Too many requests',
                    severity: 'medium',
                    retryable: true
                }
            };

            const result = await clientErrorHandler.handleError(error, {
                displayType: ERROR_DISPLAY_TYPES.TOAST,
                retryFunction: vi.fn()
            });

            expect(result.displayConfig.type).toBe(ERROR_DISPLAY_TYPES.TOAST);
            expect(result.displayConfig.actions).toContainEqual(
                expect.objectContaining({
                    type: ERROR_ACTIONS.RETRY,
                    label: 'Tentar Novamente'
                })
            );
        });

        it('should include contact action for critical errors', async () => {
            const criticalError = {
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'System failure',
                    severity: 'critical',
                    category: 'system'
                }
            };

            const result = await clientErrorHandler.handleError(criticalError);

            expect(result.displayConfig.actions).toContainEqual(
                expect.objectContaining({
                    type: ERROR_ACTIONS.CONTACT,
                    label: 'Entrar em Contato'
                })
            );
        });
    });

    describe('error classification', () => {
        it('should classify validation errors correctly', async () => {
            const validationError = {
                error: {
                    code: 'VALIDATION_ERROR',
                    field: 'email'
                }
            };

            const result = await clientErrorHandler.handleError(validationError);
            expect(result.error.type).toBe('validation');
        });

        it('should classify network errors correctly', async () => {
            const networkError = new Error('Failed to fetch');
            networkError.name = 'NetworkError';

            const result = await clientErrorHandler.handleError(networkError);
            expect(result.error.type).toBe('network');
        });
    });

    describe('accessibility features', () => {
        it('should create accessibility-compliant display config', async () => {
            const error = {
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid email format',
                    ariaLabel: 'Email field error: invalid format'
                }
            };

            const result = await clientErrorHandler.handleError(error);

            expect(result.displayConfig.accessibility).toMatchObject({
                ariaLabel: 'Email field error: invalid format',
                role: 'alert',
                tabIndex: -1
            });
        });

        it('should generate appropriate field labels', () => {
            const label = clientErrorHandler.getFieldLabel('email');
            expect(label).toBe('Email');

            const unknownLabel = clientErrorHandler.getFieldLabel('unknown_field');
            expect(unknownLabel).toBe('unknown_field');
        });
    });
});

describe('Integration Tests', () => {
    describe('API to Client Error Flow', () => {
        it('should handle complete error flow from API to client display', async () => {
            // Simulate API error response
            const apiErrorResponse = createErrorResponse('VALIDATION_ERROR', {
                requestId: 'test-integration',
                field: 'email',
                validationErrors: [
                    { field: 'email', message: 'Invalid email format' }
                ]
            });

            // Handle on client side
            const clientResult = await handleClientApiError(apiErrorResponse.response, {
                displayType: ERROR_DISPLAY_TYPES.INLINE,
                source: 'contact_form'
            });

            expect(clientResult.success).toBe(false);
            expect(clientResult.error.userMessage).toBe('Os dados fornecidos são inválidos.');
            expect(clientResult.error.field).toBe('email');
            expect(clientResult.displayConfig.type).toBe(ERROR_DISPLAY_TYPES.INLINE);
            expect(clientResult.displayConfig.validationErrors).toHaveLength(1);
        });

        it('should handle fallback scenarios end-to-end', async () => {
            // Simulate service failure with fallback
            const serviceFailure = async () => {
                throw new Error('Email service unavailable');
            };

            const fallbackResult = await executeWithFallback(
                FALLBACK_STRATEGIES.EMAIL_SERVICE,
                serviceFailure,
                { queueForRetry: true }
            );

            expect(fallbackResult.success).toBe(true);
            expect(fallbackResult.source).toBe('fallback');
            expect(fallbackResult.data.queued).toBe(true);

            // Handle fallback result on client
            const clientResult = await handleClientError({
                error: {
                    code: 'EMAIL_SERVICE_UNAVAILABLE',
                    message: 'Email service temporarily unavailable',
                    fallback: fallbackResult
                }
            });

            expect(clientResult.success).toBe(false);
            expect(clientResult.error.userMessage).toContain('temporariamente indisponível');
        });
    });
});

describe('Error Response Validation', () => {
    it('should validate all error mappings have required fields', () => {
        Object.entries(ERROR_MAPPINGS).forEach(([code, mapping]) => {
            expect(mapping).toHaveProperty('status');
            expect(mapping).toHaveProperty('category');
            expect(mapping).toHaveProperty('severity');
            expect(mapping).toHaveProperty('userMessage');
            expect(mapping).toHaveProperty('technicalMessage');
            expect(mapping).toHaveProperty('recovery');
            expect(mapping).toHaveProperty('retryable');
            expect(mapping).toHaveProperty('logLevel');

            // Validate status codes are valid HTTP status codes
            expect(mapping.status).toBeGreaterThanOrEqual(400);
            expect(mapping.status).toBeLessThan(600);

            // Validate categories are from defined enum
            expect(Object.values(ERROR_CATEGORIES)).toContain(mapping.category);

            // Validate severity levels are from defined enum
            expect(Object.values(ERROR_SEVERITY)).toContain(mapping.severity);

            // Validate retryable is boolean
            expect(typeof mapping.retryable).toBe('boolean');
        });
    });

    it('should have Portuguese user messages', () => {
        Object.entries(ERROR_MAPPINGS).forEach(([code, mapping]) => {
            // Check that user messages are in Portuguese (contain common Portuguese words/patterns)
            const portuguesePatterns = [
                /[áàâãéêíóôõúç]/i, // Portuguese accents
                /\b(o|a|os|as|um|uma|de|da|do|para|com|em|na|no|que|não|é|são)\b/i, // Common Portuguese words
                /ção\b/i, // Common Portuguese suffix
                /mente\b/i // Common Portuguese adverb suffix
            ];

            const hasPortuguesePattern = portuguesePatterns.some(pattern =>
                pattern.test(mapping.userMessage)
            );

            expect(hasPortuguesePattern).toBe(true);
        });
    });
});