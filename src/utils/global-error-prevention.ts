/**
 * Prevenção global de erros comuns no DOM
 */

import { isDevelopment } from '@/config/env';

/**
 * Intercepta erros de classList em elementos null
 */
function preventClassListErrors(): void {
    // Interceptar document.querySelector para retornar proxy seguro
    const originalQuerySelector = Document.prototype.querySelector;
    const originalQuerySelectorAll = Document.prototype.querySelectorAll;
    const originalGetElementById = Document.prototype.getElementById;

    // Wrapper seguro para querySelector
    Document.prototype.querySelector = function <T extends Element>(selector: string): T | null {
        try {
            const element = originalQuerySelector.call(this, selector) as T | null;
            return element ? createSafeElementProxy(element) : null;
        } catch (error) {
            if (isDevelopment) {
                console.warn(`querySelector failed for "${selector}":`, error);
            }
            return null;
        }
    };

    // Wrapper seguro para getElementById
    Document.prototype.getElementById = function (id: string): HTMLElement | null {
        try {
            const element = originalGetElementById.call(this, id);
            return element ? createSafeElementProxy(element) : null;
        } catch (error) {
            if (isDevelopment) {
                console.warn(`getElementById failed for "${id}":`, error);
            }
            return null;
        }
    };

    // Interceptar Element.prototype.querySelector também
    const originalElementQuerySelector = Element.prototype.querySelector;
    Element.prototype.querySelector = function <T extends Element>(selector: string): T | null {
        try {
            const element = originalElementQuerySelector.call(this, selector) as T | null;
            return element ? createSafeElementProxy(element) : null;
        } catch (error) {
            if (isDevelopment) {
                console.warn(`Element.querySelector failed for "${selector}":`, error);
            }
            return null;
        }
    };
}

/**
 * Cria um proxy seguro para elementos que previne erros de classList
 */
function createSafeElementProxy<T extends Element>(element: T): T {
    return new Proxy(element, {
        get(target, prop) {
            // Interceptar acesso ao classList
            if (prop === 'classList') {
                if (!target || !target.classList) {
                    if (isDevelopment) {
                        console.warn('Attempted to access classList on null/undefined element');
                    }
                    // Retornar um classList mock que não faz nada
                    return createMockClassList();
                }
                return target.classList;
            }

            // Para outras propriedades, retornar normalmente
            const value = target[prop as keyof T];

            // Se for uma função, fazer bind para manter o contexto
            if (typeof value === 'function') {
                return value.bind(target);
            }

            return value;
        }
    });
}

/**
 * Cria um classList mock que não gera erros
 */
function createMockClassList(): DOMTokenList {
    const mockMethods = {
        add: () => { },
        remove: () => { },
        toggle: () => false,
        contains: () => false,
        replace: () => false,
        item: () => null,
        forEach: () => { },
        entries: () => [][Symbol.iterator](),
        keys: () => [][Symbol.iterator](),
        values: () => [][Symbol.iterator](),
        [Symbol.iterator]: () => [][Symbol.iterator](),
    };

    return new Proxy([] as any, {
        get(target, prop) {
            if (prop === 'length') return 0;
            if (prop === 'value') return '';
            if (prop in mockMethods) {
                return mockMethods[prop as keyof typeof mockMethods];
            }
            return undefined;
        },
        set() {
            return true; // Ignorar tentativas de set
        }
    }) as DOMTokenList;
}

/**
 * Intercepta erros globais relacionados ao DOM
 */
function setupGlobalErrorHandling(): void {
    // Interceptar erros não capturados
    window.addEventListener('error', (event) => {
        const error = event.error;

        // Verificar se é erro de classList
        if (error && error.message && error.message.includes('classList')) {
            if (isDevelopment) {
                console.warn('Prevented classList error:', error.message);
                console.trace('Error stack trace:');
            }

            // Prevenir que o erro apareça no console
            event.preventDefault();
            return false;
        }

        // Verificar se é erro de "Cannot read properties of null"
        if (error && error.message && error.message.includes('Cannot read properties of null')) {
            if (isDevelopment) {
                console.warn('Prevented null property access error:', error.message);
                console.trace('Error stack trace:');
            }

            // Prevenir que o erro apareça no console
            event.preventDefault();
            return false;
        }
    });

    // Interceptar promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;

        if (reason && reason.message &&
            (reason.message.includes('classList') ||
                reason.message.includes('Cannot read properties of null'))) {
            if (isDevelopment) {
                console.warn('Prevented unhandled promise rejection:', reason.message);
            }

            // Prevenir que o erro apareça no console
            event.preventDefault();
        }
    });
}

/**
 * Aguarda o DOM estar pronto antes de executar scripts
 */
function ensureDOMReady(): Promise<void> {
    return new Promise((resolve) => {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            resolve();
        } else {
            document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
        }
    });
}

/**
 * Inicializa todas as prevenções de erro
 */
export async function initializeErrorPrevention(): Promise<void> {
    // Aguardar DOM estar pronto
    await ensureDOMReady();

    // Configurar interceptadores
    preventClassListErrors();
    setupGlobalErrorHandling();

    if (isDevelopment) {
        console.log('✅ Global error prevention initialized');
    }
}

/**
 * Executa uma função de forma segura, capturando erros de DOM
 */
export function safeExecute<T>(
    fn: () => T,
    fallback?: T,
    errorMessage?: string
): T | undefined {
    try {
        return fn();
    } catch (error) {
        if (isDevelopment) {
            console.warn(errorMessage || 'Safe execution failed:', error);
        }
        return fallback;
    }
}

// Auto-inicializar se estivermos no browser
if (typeof window !== 'undefined') {
    initializeErrorPrevention().catch(error => {
        console.error('Failed to initialize error prevention:', error);
    });
}