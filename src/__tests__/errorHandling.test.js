import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    classifyError,
    getUserFriendlyError,
    getRecoverySteps,
    isRecoverable,
    getSeverityIndicator,
    ErrorTypes,
    ErrorSeverity,
    ErrorMessages,
    withRetry,
    withFormRetry,
    calculateRetryDelay,
    getRetryConfig,
    announceToScreenReader,
    announceError,
    announceRetry,
    announceRetrySuccess,
    logError
} from '@/lib/errorHandling';

// Mock navigator for network tests
const mockNavigator = {
    onLine: true
};

global.navigator = mockNavigator;

describe('Error Handling System', () => {
    describe('classifyError', () => {
        it('classifies network errors correctly', () => {
            const networkError = { name: 'NetworkError' };
            const result = classifyError(networkError);

            expect(result.type).toBe(ErrorTypes.NETWORK);
            expect(result.code).toBe('network.failed');
        });

        it('classifies timeout errors correctly', () => {
            const timeoutError = { name: 'TimeoutError' };
            const result = classifyError(timeoutError);

            expect(result.type).toBe(ErrorTypes.NETWORK);
            expect(result.code).toBe('network.timeout');
        });

        it('classifies offline errors correctly', () => {
            mockNavigator.onLine = false;
            const offlineError = {};
            const result = classifyError(offlineError);

            expect(result.type).toBe(ErrorTypes.NETWORK);
            expect(result.code).toBe('network.offline');

            mockNavigator.onLine = true; // Reset
        });

        it('classifies API errors correctly', () => {
            const apiError = { error: 'missing_token' };
            const result = classifyError(apiError);

            expect(result.type).toBe(ErrorTypes.API);
            expect(result.code).toBe('api.missing_token');
        });

        it('classifies reCAPTCHA errors correctly', () => {
            const recaptchaError = { code: 'missing_token' };
            const result = classifyError(recaptchaError);

            expect(result.type).toBe(ErrorTypes.RECAPTCHA);
            expect(result.code).toBe('recaptcha.missing_token');
        });

        it('classifies validation errors correctly', () => {
            const validationError = { field: 'name', code: 'invalid' };
            const result = classifyError(validationError);

            expect(result.type).toBe(ErrorTypes.VALIDATION);
            expect(result.code).toBe('validation.invalid');
        });

        it('classifies unknown errors correctly', () => {
            const unknownError = {};
            const result = classifyError(unknownError);

            expect(result.type).toBe(ErrorTypes.UNKNOWN);
            expect(result.code).toBe('unknown');
        });

        it('handles null/undefined errors', () => {
            const result = classifyError(null);

            expect(result.type).toBe(ErrorTypes.UNKNOWN);
            expect(result.code).toBe('unknown');
        });
    });

    describe('getUserFriendlyError', () => {
        it('returns user-friendly error message for network errors', () => {
            const error = { name: 'NetworkError' };
            const friendlyError = getUserFriendlyError(error);

            expect(friendlyError.userMessage).toBe('Falha na conexão.');
            expect(friendlyError.severity).toBe(ErrorSeverity.MEDIUM);
            expect(friendlyError.recovery).toBe('Verifique sua conexão e tente novamente.');
            expect(friendlyError.type).toBe(ErrorTypes.NETWORK);
        });

        it('returns user-friendly error message for API errors', () => {
            const error = { error: 'rate_limited' };
            const friendlyError = getUserFriendlyError(error);

            expect(friendlyError.userMessage).toBe('Muitas tentativas. Aguarde um momento.');
            expect(friendlyError.severity).toBe(ErrorSeverity.MEDIUM);
            expect(friendlyError.type).toBe(ErrorTypes.RATE_LIMIT);
        });

        it('returns user-friendly error message for validation errors', () => {
            const error = { field: 'name', code: 'invalid' };
            const friendlyError = getUserFriendlyError(error);

            expect(friendlyError.type).toBe(ErrorTypes.VALIDATION);
            expect(friendlyError.field).toBeDefined();
        });

        it('includes original error in the response', () => {
            const originalError = { name: 'NetworkError', message: 'Failed to fetch' };
            const friendlyError = getUserFriendlyError(originalError);

            expect(friendlyError.originalError).toBe(originalError);
        });
    });

    describe('getRecoverySteps', () => {
        it('returns recovery steps for network errors', () => {
            const error = { name: 'NetworkError' };
            const steps = getRecoverySteps(error);

            expect(steps.length).toBeGreaterThan(0);
            expect(steps[0]).toContain('Verifique sua conexão');
            expect(steps.some(step => step.includes('Wi-Fi'))).toBe(true);
        });

        it('returns recovery steps for reCAPTCHA errors', () => {
            const error = { code: 'verification_failed' };
            const steps = getRecoverySteps(error);

            expect(steps.length).toBeGreaterThan(0);
            expect(steps.some(step => step.includes('cache'))).toBe(true);
            expect(steps.some(step => step.includes('navegador'))).toBe(true);
        });

        it('returns recovery steps for rate limit errors', () => {
            const error = { error: 'rate_limited' };
            const steps = getRecoverySteps(error);

            expect(steps.length).toBeGreaterThan(0);
            expect(steps.some(step => step.includes('Aguarde'))).toBe(true);
            expect(steps.some(step => step.includes('urgente'))).toBe(true);
        });

        it('returns recovery steps for email service errors', () => {
            const error = { error: 'email_service_error' };
            const steps = getRecoverySteps(error);

            expect(steps.length).toBeGreaterThan(0);
            expect(steps.some(step => step.includes('telefone'))).toBe(true);
        });

        it('returns recovery steps for unknown errors', () => {
            const error = {};
            const steps = getRecoverySteps(error);

            expect(steps.length).toBeGreaterThan(0);
            expect(steps.some(step => step.includes('contato'))).toBe(true);
        });

        it('filters out empty steps', () => {
            const error = { name: 'NetworkError' };
            const steps = getRecoverySteps(error);

            expect(steps.every(step => step && step.trim() !== '')).toBe(true);
        });
    });

    describe('isRecoverable', () => {
        it('returns true for recoverable errors', () => {
            const networkError = { name: 'NetworkError' };
            expect(isRecoverable(networkError)).toBe(true);

            const apiError = { error: 'rate_limited' };
            expect(isRecoverable(apiError)).toBe(true);
        });

        it('returns false for critical errors', () => {
            // Use an error that maps to a critical severity
            const criticalError = { code: 'missing_secret' }; // This maps to CRITICAL severity

            expect(isRecoverable(criticalError)).toBe(false);
        });
    });

    describe('getSeverityIndicator', () => {
        it('returns correct indicator for low severity', () => {
            const indicator = getSeverityIndicator(ErrorSeverity.LOW);

            expect(indicator.color).toBe('yellow');
            expect(indicator.icon).toBe('⚠️');
            expect(indicator.label).toBe('Atenção');
        });

        it('returns correct indicator for medium severity', () => {
            const indicator = getSeverityIndicator(ErrorSeverity.MEDIUM);

            expect(indicator.color).toBe('orange');
            expect(indicator.icon).toBe('🔶');
            expect(indicator.label).toBe('Aviso');
        });

        it('returns correct indicator for high severity', () => {
            const indicator = getSeverityIndicator(ErrorSeverity.HIGH);

            expect(indicator.color).toBe('red');
            expect(indicator.icon).toBe('🔴');
            expect(indicator.label).toBe('Erro');
        });

        it('returns correct indicator for critical severity', () => {
            const indicator = getSeverityIndicator(ErrorSeverity.CRITICAL);

            expect(indicator.color).toBe('darkred');
            expect(indicator.icon).toBe('🚨');
            expect(indicator.label).toBe('Crítico');
        });

        it('returns default indicator for unknown severity', () => {
            const indicator = getSeverityIndicator('unknown');

            expect(indicator.color).toBe('gray');
            expect(indicator.icon).toBe('❓');
            expect(indicator.label).toBe('Desconhecido');
        });
    });

    describe('withRetry', () => {
        it('retries failed operations', async () => {
            let attemptCount = 0;
            const failingOperation = vi.fn()
                .mockImplementationOnce(() => {
                    attemptCount++;
                    throw new Error('First attempt failed');
                })
                .mockImplementationOnce(() => {
                    attemptCount++;
                    return 'success';
                });

            const result = await withRetry(failingOperation, { maxAttempts: 2 });

            expect(result).toBe('success');
            expect(attemptCount).toBe(2);
            expect(failingOperation).toHaveBeenCalledTimes(2);
        });

        it('stops retrying after max attempts', async () => {
            const failingOperation = vi.fn()
                .mockImplementation(() => {
                    throw new Error('Always fails');
                });

            await expect(withRetry(failingOperation, { maxAttempts: 3 }))
                .rejects.toThrow('Always fails');

            expect(failingOperation).toHaveBeenCalledTimes(3);
        });

        it('respects shouldRetry function', async () => {
            const failingOperation = vi.fn()
                .mockImplementation(() => {
                    throw new Error('Non-retryable error');
                });

            const shouldRetry = vi.fn().mockReturnValue(false);

            await expect(withRetry(failingOperation, { maxAttempts: 3, shouldRetry }))
                .rejects.toThrow('Non-retryable error');

            expect(failingOperation).toHaveBeenCalledTimes(1);
            expect(shouldRetry).toHaveBeenCalledTimes(1);
        });

        it('adds exponential backoff delay', async () => {
            const startTime = Date.now();
            let attemptCount = 0;

            const slowOperation = vi.fn()
                .mockImplementationOnce(() => {
                    attemptCount++;
                    throw new Error('First attempt');
                })
                .mockImplementationOnce(() => {
                    attemptCount++;
                    return 'success';
                });

            await withRetry(slowOperation, { maxAttempts: 2 });
            const endTime = Date.now();

            expect(endTime - startTime).toBeGreaterThanOrEqual(1000); // At least 1 second delay
        });
    });

    describe('calculateRetryDelay', () => {
        it('calculates exponential backoff with jitter', () => {
            const delay1 = calculateRetryDelay(1);
            const delay2 = calculateRetryDelay(2);
            const delay3 = calculateRetryDelay(3);

            expect(delay2).toBeGreaterThan(delay1);
            expect(delay3).toBeGreaterThan(delay2);

            // Should have some jitter (not exactly the same)
            expect(delay1).not.toBe(1000);
            expect(delay1).toBeGreaterThan(1000);
            expect(delay1).toBeLessThan(2000);
        });

        it('respects maximum delay', () => {
            const delay = calculateRetryDelay(10); // High attempt number

            expect(delay).toBeLessThanOrEqual(30000); // Max 30 seconds
        });
    });

    describe('logError', () => {
        let consoleSpy;

        beforeEach(() => {
            consoleSpy = vi.spyOn(console, 'group').mockImplementation(() => { });
            vi.spyOn(console, 'error').mockImplementation(() => { });
            vi.spyOn(console, 'groupEnd').mockImplementation(() => { });
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('logs errors in development mode', () => {
            process.env.NODE_ENV = 'development';
            const error = { name: 'TestError', message: 'Test error' };
            const context = { action: 'test' };

            const result = logError(error, context);

            expect(result).toMatchObject({
                type: 'unknown',
                code: 'unknown',
                message: 'Test error',
                context
            });
            expect(console.group).toHaveBeenCalled();
            expect(console.error).toHaveBeenCalledTimes(3); // error, context, classification
        });

        it('does not log to console in production mode', () => {
            process.env.NODE_ENV = 'production';
            const error = { name: 'TestError', message: 'Test error' };

            const result = logError(error);

            expect(result).toMatchObject({
                type: 'unknown',
                code: 'unknown',
                message: 'Test error'
            });
            expect(console.group).not.toHaveBeenCalled();
        });

        it('returns structured log data', () => {
            const error = { name: 'NetworkError', message: 'Connection failed' };
            const context = { endpoint: '/api/contact' };

            const result = logError(error, context);

            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('type', 'network');
            expect(result).toHaveProperty('code', 'network.failed');
            expect(result).toHaveProperty('message', 'Connection failed');
            expect(result).toHaveProperty('context', context);
        });
    });

    describe('ErrorMessages', () => {
        it('contains all required error message configurations', () => {
            // Check validation errors
            expect(ErrorMessages['validation.name_too_short']).toBeDefined();
            expect(ErrorMessages['validation.email_invalid']).toBeDefined();
            expect(ErrorMessages['validation.consent_required']).toBeDefined();

            // Check network errors
            expect(ErrorMessages['network.offline']).toBeDefined();
            expect(ErrorMessages['network.timeout']).toBeDefined();

            // Check API errors
            expect(ErrorMessages['api.missing_token']).toBeDefined();
            expect(ErrorMessages['api.rate_limited']).toBeDefined();

            // Check reCAPTCHA errors
            expect(ErrorMessages['recaptcha.missing_token']).toBeDefined();
            expect(ErrorMessages['recaptcha.verification_failed']).toBeDefined();

            // Check email service errors
            expect(ErrorMessages['email_service_unavailable']).toBeDefined();

            // Check unknown error
            expect(ErrorMessages['unknown']).toBeDefined();
        });

        it('error messages have required properties', () => {
            const errorMessage = ErrorMessages['validation.name_too_short'];

            expect(errorMessage).toHaveProperty('userMessage');
            expect(errorMessage).toHaveProperty('severity');
            expect(errorMessage).toHaveProperty('recovery');
            expect(errorMessage).toHaveProperty('ariaLabel');
            expect(errorMessage).toHaveProperty('retryable');
            expect(typeof errorMessage.userMessage).toBe('string');
            expect(typeof errorMessage.severity).toBe('string');
            expect(typeof errorMessage.recovery).toBe('string');
            expect(typeof errorMessage.ariaLabel).toBe('string');
            expect(typeof errorMessage.retryable).toBe('boolean');
        });

        it('field-specific errors have field property', () => {
            const fieldError = ErrorMessages['validation.name_too_short'];

            expect(fieldError).toHaveProperty('field');
            expect(fieldError.field).toBe('name');
        });
    });

    describe('getRetryConfig', () => {
        it('returns null for non-retryable errors', () => {
            // Use an error that doesn't depend on navigator.onLine
            const error = { code: 'missing_secret' }; // reCAPTCHA missing_secret is CRITICAL and not retryable
            const config = getRetryConfig(error);

            expect(config).toBeNull();
        });

        it('returns network-specific config for network errors', () => {
            const error = { name: 'NetworkError' };
            const config = getRetryConfig(error);

            expect(config).toBeDefined();
            expect(config.maxAttempts).toBeGreaterThanOrEqual(3);
            expect(config.shouldRetry).toBeDefined();
        });

        it('returns rate limit config for rate limit errors', () => {
            const error = { error: 'rate_limited' };
            const config = getRetryConfig(error);

            expect(config).toBeDefined();
            expect(config.baseDelay).toBeGreaterThanOrEqual(60000); // 1 minute
        });

        it('uses custom retry configuration from error message', () => {
            // Mock an error message with custom retry config
            const originalMessage = ErrorMessages['network.timeout'];
            ErrorMessages['network.timeout'] = {
                ...originalMessage,
                maxRetries: 5,
                retryDelay: 2000
            };

            const error = { name: 'TimeoutError' };
            const config = getRetryConfig(error);

            expect(config.maxAttempts).toBe(5);
            expect(config.baseDelay).toBe(2000);

            // Restore original
            ErrorMessages['network.timeout'] = originalMessage;
        });
    });

    describe('withFormRetry', () => {
        let mockSubmitFn;
        let mockFormData;

        beforeEach(() => {
            mockSubmitFn = vi.fn();
            mockFormData = { name: 'Test', email: 'test@example.com' };
        });

        it('calls submit function with form data', async () => {
            mockSubmitFn.mockResolvedValue({ success: true });

            await withFormRetry(mockSubmitFn, mockFormData);

            expect(mockSubmitFn).toHaveBeenCalledWith(mockFormData);
        });

        it('announces retry attempts to screen readers', async () => {
            mockSubmitFn
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValue({ success: true });

            // Mock document for announcements
            const mockElement = { textContent: '', setAttribute: vi.fn(), style: {} };
            global.document = {
                getElementById: vi.fn().mockReturnValue(null),
                createElement: vi.fn().mockReturnValue(mockElement),
                body: { appendChild: vi.fn() }
            };

            await withFormRetry(mockSubmitFn, mockFormData, { maxAttempts: 2 });

            // Should have created announcer element
            expect(global.document.createElement).toHaveBeenCalledWith('div');

            // Cleanup
            delete global.document;
        });
    });

    describe('Accessibility Features', () => {
        let mockDocument;

        beforeEach(() => {
            // Mock document for browser environment
            mockDocument = {
                getElementById: vi.fn(),
                createElement: vi.fn(),
                body: { appendChild: vi.fn() }
            };
            global.document = mockDocument;
        });

        afterEach(() => {
            delete global.document;
        });

        describe('announceToScreenReader', () => {
            it('creates announcer element if not exists', () => {
                const mockElement = {
                    setAttribute: vi.fn(),
                    style: {},
                    textContent: ''
                };

                mockDocument.getElementById.mockReturnValue(null);
                mockDocument.createElement.mockReturnValue(mockElement);

                announceToScreenReader('Test message');

                expect(mockDocument.createElement).toHaveBeenCalledWith('div');
                expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
                expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
                expect(mockDocument.body.appendChild).toHaveBeenCalledWith(mockElement);
            });

            it('uses existing announcer element', () => {
                const mockElement = { textContent: '' };
                mockDocument.getElementById.mockReturnValue(mockElement);

                announceToScreenReader('Test message');

                expect(mockDocument.createElement).not.toHaveBeenCalled();
            });

            it('sets message with delay', async () => {
                const mockElement = { textContent: '' };
                mockDocument.getElementById.mockReturnValue(mockElement);

                announceToScreenReader('Test message');

                // Message should be set after timeout
                await new Promise(resolve => setTimeout(resolve, 150));
                expect(mockElement.textContent).toBe('Test message');
            });

            it('handles assertive priority', () => {
                const mockElement = {
                    setAttribute: vi.fn(),
                    style: {},
                    textContent: ''
                };

                mockDocument.getElementById.mockReturnValue(null);
                mockDocument.createElement.mockReturnValue(mockElement);

                announceToScreenReader('Urgent message', 'assertive');

                expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
            });
        });

        describe('announceError', () => {
            it('announces error with proper context', () => {
                const mockElement = { textContent: '' };
                mockDocument.getElementById.mockReturnValue(mockElement);

                const error = { name: 'NetworkError' };
                const message = announceError(error, { action: 'Form submission' });

                expect(message).toContain('Form submission');
                expect(message).toContain('Aviso'); // Network errors are medium severity = "Aviso"
            });

            it('includes field information for validation errors', () => {
                const mockElement = { textContent: '' };
                mockDocument.getElementById.mockReturnValue(mockElement);

                // Test the announceError function directly with a proper validation error
                // We'll mock getUserFriendlyError to return a validation error with field info
                const originalGetUserFriendlyError = getUserFriendlyError;
                const mockFriendlyError = {
                    userMessage: 'O nome é obrigatório.',
                    field: 'name',
                    severity: ErrorSeverity.MEDIUM,
                    type: ErrorTypes.VALIDATION
                };

                // Create a spy that returns our mock error
                const getUserFriendlyErrorSpy = vi.fn().mockReturnValue(mockFriendlyError);

                // Replace the function temporarily
                const errorHandling = await import('@/lib/errorHandling');
                errorHandling.getUserFriendlyError = getUserFriendlyErrorSpy;

                const error = { field: 'name', code: 'required' };
                const message = announceError(error);

                expect(message).toContain('campo name');

                // Restore
                errorHandling.getUserFriendlyError = originalGetUserFriendlyError;
            });

            it('uses assertive priority for high severity errors', () => {
                const mockElement = {
                    setAttribute: vi.fn(),
                    style: {},
                    textContent: ''
                };

                mockDocument.getElementById.mockReturnValue(null);
                mockDocument.createElement.mockReturnValue(mockElement);

                // Create a high severity error that will trigger assertive mode
                const error = { error: 'email_service_error' }; // This is HIGH severity

                announceError(error);

                expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
            });
        });

        describe('announceRetry', () => {
            it('announces retry attempt with timing', () => {
                const mockElement = { textContent: '' };
                mockDocument.getElementById.mockReturnValue(mockElement);

                announceRetry(2, 3, 5000);

                // Should announce attempt and delay
                setTimeout(() => {
                    expect(mockElement.textContent).toContain('Tentativa 2 de 3');
                    expect(mockElement.textContent).toContain('5 segundos');
                }, 150);
            });
        });

        describe('announceRetrySuccess', () => {
            it('announces success after retry', () => {
                const mockElement = { textContent: '' };
                mockDocument.getElementById.mockReturnValue(mockElement);

                announceRetrySuccess(3);

                setTimeout(() => {
                    expect(mockElement.textContent).toContain('Sucesso na tentativa 3');
                }, 150);
            });

            it('announces simple success for first attempt', () => {
                const mockElement = { textContent: '' };
                mockDocument.getElementById.mockReturnValue(mockElement);

                announceRetrySuccess(1);

                setTimeout(() => {
                    expect(mockElement.textContent).toContain('Formulário enviado com sucesso');
                    expect(mockElement.textContent).not.toContain('tentativa');
                }, 150);
            });
        });
    });

    describe('Enhanced Error Messages', () => {
        it('includes accessibility labels for all error types', () => {
            Object.values(ErrorMessages).forEach(errorMessage => {
                expect(errorMessage).toHaveProperty('ariaLabel');
                expect(typeof errorMessage.ariaLabel).toBe('string');
                expect(errorMessage.ariaLabel.length).toBeGreaterThan(0);
            });
        });

        it('includes retryable flag for all error types', () => {
            Object.values(ErrorMessages).forEach(errorMessage => {
                expect(errorMessage).toHaveProperty('retryable');
                expect(typeof errorMessage.retryable).toBe('boolean');
            });
        });

        it('includes retry configuration for retryable errors', () => {
            const retryableErrors = Object.values(ErrorMessages).filter(msg => msg.retryable);

            retryableErrors.forEach(errorMessage => {
                // Should have either maxRetries or use default config
                if (errorMessage.maxRetries !== undefined) {
                    expect(typeof errorMessage.maxRetries).toBe('number');
                    expect(errorMessage.maxRetries).toBeGreaterThan(0);
                }

                if (errorMessage.retryDelay !== undefined) {
                    expect(typeof errorMessage.retryDelay).toBe('number');
                    expect(errorMessage.retryDelay).toBeGreaterThan(0);
                }
            });
        });
    });

    describe('Error Types and Severity', () => {
        it('defines all error types', () => {
            expect(ErrorTypes.VALIDATION).toBe('validation');
            expect(ErrorTypes.NETWORK).toBe('network');
            expect(ErrorTypes.API).toBe('api');
            expect(ErrorTypes.RATE_LIMIT).toBe('rate_limit');
            expect(ErrorTypes.RECAPTCHA).toBe('recaptcha');
            expect(ErrorTypes.EMAIL_SERVICE).toBe('email_service');
            expect(ErrorTypes.UNKNOWN).toBe('unknown');
        });

        it('defines all severity levels', () => {
            expect(ErrorSeverity.LOW).toBe('low');
            expect(ErrorSeverity.MEDIUM).toBe('medium');
            expect(ErrorSeverity.HIGH).toBe('high');
            expect(ErrorSeverity.CRITICAL).toBe('critical');
        });
    });

    describe('Enhanced Severity Indicators', () => {
        it('includes accessibility properties', () => {
            const indicator = getSeverityIndicator(ErrorSeverity.HIGH);

            expect(indicator).toHaveProperty('ariaLabel');
            expect(indicator).toHaveProperty('role');
            expect(typeof indicator.ariaLabel).toBe('string');
            expect(typeof indicator.role).toBe('string');
        });

        it('provides appropriate aria labels for all severities', () => {
            Object.values(ErrorSeverity).forEach(severity => {
                const indicator = getSeverityIndicator(severity);
                expect(indicator.ariaLabel).toBeDefined();
                expect(indicator.ariaLabel.length).toBeGreaterThan(0);
            });
        });
    });
});
