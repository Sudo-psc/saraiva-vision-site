/**
 * Utilitários para operações seguras no DOM
 */

/**
 * Executa uma função de forma segura, verificando se o elemento existe
 */
export function safeElementOperation<T extends Element>(
    selector: string | T,
    operation: (element: T) => void,
    options: {
        timeout?: number;
        retries?: number;
        onError?: (error: Error) => void;
    } = {}
): void {
    const { timeout = 5000, retries = 3, onError } = options;

    const executeOperation = (attempt: number = 1) => {
        try {
            let element: T | null;

            if (typeof selector === 'string') {
                element = document.querySelector<T>(selector);
            } else {
                element = selector;
            }

            if (element) {
                operation(element);
                return;
            }

            // Se não encontrou o elemento e ainda há tentativas
            if (attempt < retries) {
                setTimeout(() => executeOperation(attempt + 1), 100 * attempt);
                return;
            }

            // Se esgotou as tentativas
            const error = new Error(`Element not found: ${selector}`);
            if (onError) {
                onError(error);
            } else {
                console.warn(error.message);
            }
        } catch (error) {
            const err = error as Error;
            if (onError) {
                onError(err);
            } else {
                console.error('DOM operation failed:', err);
            }
        }
    };

    // Se o DOM já está pronto, executar imediatamente
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        executeOperation();
    } else {
        // Aguardar o DOM estar pronto
        const timeoutId = setTimeout(() => {
            executeOperation();
        }, timeout);

        document.addEventListener('DOMContentLoaded', () => {
            clearTimeout(timeoutId);
            executeOperation();
        }, { once: true });
    }
}

/**
 * Adiciona classe de forma segura
 */
export function safeAddClass(selector: string, className: string): void {
    safeElementOperation(selector, (element) => {
        element.classList.add(className);
    }, {
        onError: (error) => {
            console.warn(`Failed to add class "${className}" to "${selector}":`, error.message);
        }
    });
}

/**
 * Remove classe de forma segura
 */
export function safeRemoveClass(selector: string, className: string): void {
    safeElementOperation(selector, (element) => {
        element.classList.remove(className);
    }, {
        onError: (error) => {
            console.warn(`Failed to remove class "${className}" from "${selector}":`, error.message);
        }
    });
}

/**
 * Toggle classe de forma segura
 */
export function safeToggleClass(selector: string, className: string, force?: boolean): void {
    safeElementOperation(selector, (element) => {
        element.classList.toggle(className, force);
    }, {
        onError: (error) => {
            console.warn(`Failed to toggle class "${className}" on "${selector}":`, error.message);
        }
    });
}

/**
 * Wrapper seguro para querySelector
 */
export function safeQuerySelector<T extends Element = Element>(
    selector: string,
    parent: Document | Element = document
): T | null {
    try {
        return parent.querySelector<T>(selector);
    } catch (error) {
        console.warn(`Invalid selector "${selector}":`, error);
        return null;
    }
}

/**
 * Wrapper seguro para querySelectorAll
 */
export function safeQuerySelectorAll<T extends Element = Element>(
    selector: string,
    parent: Document | Element = document
): NodeListOf<T> | T[] {
    try {
        return parent.querySelectorAll<T>(selector);
    } catch (error) {
        console.warn(`Invalid selector "${selector}":`, error);
        return [] as T[];
    }
}

/**
 * Aguarda um elemento aparecer no DOM
 */
export function waitForElement<T extends Element = Element>(
    selector: string,
    options: {
        timeout?: number;
        parent?: Document | Element;
    } = {}
): Promise<T> {
    const { timeout = 10000, parent = document } = options;

    return new Promise((resolve, reject) => {
        // Verificar se já existe
        const existing = safeQuerySelector<T>(selector, parent);
        if (existing) {
            resolve(existing);
            return;
        }

        // Configurar observer
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    const element = safeQuerySelector<T>(selector, parent);
                    if (element) {
                        observer.disconnect();
                        clearTimeout(timeoutId);
                        resolve(element);
                        return;
                    }
                }
            }
        });

        // Timeout
        const timeoutId = setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element "${selector}" not found within ${timeout}ms`));
        }, timeout);

        // Iniciar observação
        observer.observe(parent, {
            childList: true,
            subtree: true
        });
    });
}

/**
 * Executa callback quando o DOM estiver pronto
 */
export function onDOMReady(callback: () => void): void {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // DOM já está pronto
        setTimeout(callback, 0);
    } else {
        // Aguardar DOM estar pronto
        document.addEventListener('DOMContentLoaded', callback, { once: true });
    }
}

/**
 * Previne erros de classList em elementos null
 */
export function createSafeClassListProxy(element: Element | null): DOMTokenList | null {
    if (!element) {
        return null;
    }

    return new Proxy(element.classList, {
        get(target, prop) {
            if (!element || !element.classList) {
                console.warn('Attempted to access classList on null/undefined element');
                return () => { }; // Retorna função vazia para métodos
            }
            return target[prop as keyof DOMTokenList];
        }
    });
}