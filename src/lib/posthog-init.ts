import posthog from 'posthog-js';
import { ENV, isDevelopment } from '@/config/env';
import { POSTHOG_CONFIG } from '@/utils/posthogConfig';

let isInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * Initialize PostHog with proper error handling and idempotency
 */
export function initializePostHog(): Promise<void> {
    // Se já está inicializado, retornar promise resolvida
    if (isInitialized) {
        return Promise.resolve();
    }

    // Se já está inicializando, retornar a promise existente
    if (initPromise) {
        return initPromise;
    }

    // Verificar se estamos no browser
    if (typeof window === 'undefined') {
        return Promise.resolve();
    }

    // Verificar se a chave está disponível
    if (!ENV.POSTHOG_KEY) {
        if (isDevelopment) {
            console.warn('⚠️ PostHog não inicializado: VITE_POSTHOG_KEY não configurada');
        }
        return Promise.resolve();
    }

    initPromise = new Promise((resolve, reject) => {
        try {
            posthog.init(ENV.POSTHOG_KEY!, {
                ...POSTHOG_CONFIG,
                api_host: ENV.POSTHOG_HOST || POSTHOG_CONFIG.api_host,
                loaded: (posthogInstance) => {
                    isInitialized = true;
                    if (isDevelopment) {
                        posthogInstance.debug();
                        console.log('✅ PostHog inicializado com sucesso');
                    }
                    resolve();
                },
                bootstrap: {
                    // Evitar inicialização dupla em StrictMode
                    distinctId: undefined,
                    isIdentifiedID: false,
                    featureFlags: {},
                }
            });
        } catch (error) {
            console.error('❌ Erro ao inicializar PostHog:', error);
            reject(error);
        }
    });

    return initPromise;
}

/**
 * Verificar se PostHog está disponível
 */
export function isPostHogAvailable(): boolean {
    return isInitialized && Boolean(ENV.POSTHOG_KEY) && Boolean((window as any).posthog);
}

/**
 * Executar operação PostHog de forma segura
 */
export function safePostHogOperation<T>(
    operation: (posthog: typeof posthog) => T,
    fallback?: T
): T | undefined {
    if (isPostHogAvailable()) {
        try {
            return operation((window as any).posthog);
        } catch (error) {
            console.warn('PostHog operation failed:', error);
            return fallback;
        }
    }
    return fallback;
}

/**
 * Cleanup PostHog (útil para testes)
 */
export function cleanupPostHog(): void {
    isInitialized = false;
    initPromise = null;
    if (typeof window !== 'undefined' && (window as any).posthog) {
        try {
            (window as any).posthog.reset();
        } catch (error) {
            console.warn('Error cleaning up PostHog:', error);
        }
    }
}

// Auto-inicializar quando o DOM estiver pronto
if (typeof window !== 'undefined') {
    const autoInit = () => {
        initializePostHog().catch(error => {
            console.error('Failed to auto-initialize PostHog:', error);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit, { once: true });
    } else {
        // DOM já está pronto, inicializar no próximo tick
        setTimeout(autoInit, 0);
    }
}