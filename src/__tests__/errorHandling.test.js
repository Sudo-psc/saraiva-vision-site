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
    calculateRetryDelay,
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
            const criticalError = { name: 'CriticalError' };
            // Mock classifyError to return CRITICAL type
            vi.spyOn({ classifyError }, 'classifyError').mockReturnValue({
                type: ErrorTypes.CRITICAL,
                code: 'critical_error'
            });

            expect(isRecoverable(criticalError)).toBe(false);

            vi.restoreAllMocks();
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
            expect(typeof errorMessage.userMessage).toBe('string');
            expect(typeof errorMessage.severity).toBe('string');
            expect(typeof errorMessage.recovery).toBe('string');
        });

        it('field-specific errors have field property', () => {
            const fieldError = ErrorMessages['validation.name_too_short'];

            expect(fieldError).toHaveProperty('field');
            expect(fieldError.field).toBe('name');
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
});
