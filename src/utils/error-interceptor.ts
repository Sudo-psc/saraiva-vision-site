/**
 * Interceptador específico para o erro "Cannot read properties of null (reading 'classList')"
 */

import { isDevelopment } from '@/config/env';

interface ErrorInterceptorOptions {
    logErrors?: boolean;
    preventDefault?: boolean;
    customHandler?: (error: Error, context: string) => void;
}

class ErrorInterceptor {
    private static instance: ErrorInterceptor;
    private options: ErrorInterceptorOptions;
    private interceptedErrors: Set<string> = new Set();

    constructor(options: ErrorInterceptorOptions = {}) {
        this.options = {
            logErrors: isDevelopment,
            preventDefault: true,
            ...options
        };
    }

    static getInstance(options?: ErrorInterceptorOptions): ErrorInterceptor {
        if (!ErrorInterceptor.instance) {
            ErrorInterceptor.instance = new ErrorInterceptor(options);
        }
        return ErrorInterceptor.instance;
    }

    /**
     * Inicializa os interceptadores de erro
     */
    initialize(): void {
        this.interceptWindowErrors();
        this.interceptUnhandledRejections();
        this.patchDOMMethods();

        if (this.options.logErrors) {
            console.log('🛡️ Error interceptor initialized');
        }
    }

    /**
     * Intercepta erros da janela
     */
    private interceptWindowErrors(): void {
        const originalErrorHandler = window.onerror;

        window.onerror = (message, source, lineno, colno, error) => {
            const errorMessage = typeof message === 'string' ? message : error?.message || 'Unknown error';

            if (this.shouldInterceptError(errorMessage)) {
                this.handleInterceptedError(error || new Error(errorMessage), 'window.onerror');
                return this.options.preventDefault;
            }

            // Chamar handler original se existir
            if (originalErrorHandler) {
                return originalErrorHandler.call(window, message, source, lineno, colno, error);
            }

            return false;
        };

        // Também interceptar addEventListener('error')
        const originalAddEventListener = window.addEventListener;
        window.addEventListener = function (type: string, listener: any, options?: any) {
            if (type === 'error' && typeof listener === 'function') {
                const wrappedListener = (event: ErrorEvent) => {
                    const errorMessage = event.error?.message || event.message || 'Unknown error';

                    if (ErrorInterceptor.instance?.shouldInterceptError(errorMessage)) {
                        ErrorInterceptor.instance.handleInterceptedError(
                            event.error || new Error(errorMessage),
                            'addEventListener.error'
                        );
                        if (ErrorInterceptor.instance.options.preventDefault) {
                            event.preventDefault();
                            return;
                        }
                    }

                    return listener(event);
                };

                return originalAddEventListener.call(this, type, wrappedListener, options);
            }

            return originalAddEventListener.call(this, type, listener, options);
        };
    }

    /**
     * Intercepta promises rejeitadas
     */
    private interceptUnhandledRejections(): void {
        window.addEventListener('unhandledrejection', (event) => {
            const reason = event.reason;
            const errorMessage = reason?.message || String(reason);

            if (this.shouldInterceptError(errorMessage)) {
                this.handleInterceptedError(
                    reason instanceof Error ? reason : new Error(errorMessage),
                    'unhandledrejection'
                );

                if (this.options.preventDefault) {
                    event.preventDefault();
                }
            }
        });
    }

    /**
     * Aplica patches nos métodos DOM para prevenir erros
     */
    private patchDOMMethods(): void {
        // Patch para document.querySelector
        const originalQuerySelector = Document.prototype.querySelector;
        Document.prototype.querySelector = function <T extends Element>(selector: string): T | null {
            try {
                const element = originalQuerySelector.call(this, selector) as T | null;
                return element ? ErrorInterceptor.createSafeElementProxy(element) : null;
            } catch (error) {
                ErrorInterceptor.instance?.handleInterceptedError(
                    error as Error,
                    `querySelector("${selector}")`
                );
                return null;
            }
        };

        // Patch para document.getElementById
        const originalGetElementById = Document.prototype.getElementById;
        Document.prototype.getElementById = function (id: string): HTMLElement | null {
            try {
                const element = originalGetElementById.call(this, id);
                return element ? ErrorInterceptor.createSafeElementProxy(element) : null;
            } catch (error) {
                ErrorInterceptor.instance?.handleInterceptedError(
                    error as Error,
                    `getElementById("${id}")`
                );
                return null;
            }
        };

        // Patch para Element.querySelector
        const originalElementQuerySelector = Element.prototype.querySelector;
        Element.prototype.querySelector = function <T extends Element>(selector: string): T | null {
            try {
                const element = originalElementQuerySelector.call(this, selector) as T | null;
                return element ? ErrorInterceptor.createSafeElementProxy(element) : null;
            } catch (error) {
                ErrorInterceptor.instance?.handleInterceptedError(
                    error as Error,
                    `Element.querySelector("${selector}")`
                );
                return null;
            }
        };
    }

    /**
     * Cria um proxy seguro para elementos
     */
    private static createSafeElementProxy<T extends Element>(element: T): T {
        return new Proxy(element, {
            get(target, prop) {
                if (prop === 'classList') {
                    if (!target || !target.classList) {
                        ErrorInterceptor.instance?.handleInterceptedError(
                            new Error('Attempted to access classList on null element'),
                            'classList access'
                        );
                        return ErrorInterceptor.createMockClassList();
                    }
                    return target.classList;
                }

                const value = target[prop as keyof T];
                if (typeof value === 'function') {
                    return value.bind(target);
                }
                return value;
            }
        });
    }

    /**
     * Cria um classList mock
     */
    private static createMockClassList(): DOMTokenList {
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
                return true;
            }
        }) as DOMTokenList;
    }

    /**
     * Verifica se deve interceptar o erro
     */
    private shouldInterceptError(errorMessage: string): boolean {
        const patterns = [
            /Cannot read properties of null.*reading 'classList'/i,
            /Cannot read property 'classList' of null/i,
            /setupEnhancedProtectionMessage/i,
            /setupEvents/i,
            /classList.*null/i,
            /null.*classList/i
        ];

        return patterns.some(pattern => pattern.test(errorMessage));
    }

    /**
     * Manipula erros interceptados
     */
    private handleInterceptedError(error: Error, context: string): void {
        const errorKey = `${error.message}-${context}`;

        // Evitar logs duplicados
        if (this.interceptedErrors.has(errorKey)) {
            return;
        }

        this.interceptedErrors.add(errorKey);

        if (this.options.customHandler) {
            this.options.customHandler(error, context);
        } else if (this.options.logErrors) {
            console.warn(`🛡️ Intercepted error in ${context}:`, error.message);

            // Log stack trace apenas em desenvolvimento
            if (isDevelopment && error.stack) {
                console.trace('Error stack:', error.stack);
            }
        }

        // Limpar cache de erros após um tempo para permitir novos logs
        setTimeout(() => {
            this.interceptedErrors.delete(errorKey);
        }, 60000); // 1 minuto
    }

    /**
     * Remove os interceptadores (útil para testes)
     */
    cleanup(): void {
        this.interceptedErrors.clear();
        // Note: Não restauramos os métodos originais para evitar problemas
        // Em um ambiente real, isso seria feito apenas em testes
    }
}

// Inicializar automaticamente
const errorInterceptor = ErrorInterceptor.getInstance();

// Aguardar DOM estar pronto antes de inicializar
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            errorInterceptor.initialize();
        }, { once: true });
    } else {
        // DOM já está pronto
        setTimeout(() => errorInterceptor.initialize(), 0);
    }
}

export { ErrorInterceptor };
export default errorInterceptor;