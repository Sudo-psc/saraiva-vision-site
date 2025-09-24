import { useCallback, useEffect, useRef, useState } from 'react';
import { safeElementOperation, waitForElement, onDOMReady } from '@/utils/dom-safety';

/**
 * Hook para operações seguras no DOM
 */
export function useSafeDOM() {
    const mountedRef = useRef(true);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const safeQuery = useCallback(<T extends Element = Element>(
        selector: string,
        parent?: Document | Element
    ): T | null => {
        if (!mountedRef.current) return null;

        try {
            return (parent || document).querySelector<T>(selector);
        } catch (error) {
            console.warn(`Safe query failed for "${selector}":`, error);
            return null;
        }
    }, []);

    const safeOperation = useCallback(<T extends Element>(
        selector: string | T,
        operation: (element: T) => void,
        options?: {
            timeout?: number;
            retries?: number;
            onError?: (error: Error) => void;
        }
    ) => {
        if (!mountedRef.current) return;

        safeElementOperation(selector, operation, {
            ...options,
            onError: (error) => {
                if (mountedRef.current && options?.onError) {
                    options.onError(error);
                }
            }
        });
    }, []);

    const waitForEl = useCallback(<T extends Element = Element>(
        selector: string,
        options?: {
            timeout?: number;
            parent?: Document | Element;
        }
    ): Promise<T | null> => {
        if (!mountedRef.current) {
            return Promise.resolve(null);
        }

        return waitForElement<T>(selector, options).catch(() => null);
    }, []);

    return {
        safeQuery,
        safeOperation,
        waitForElement: waitForEl,
        isMounted: () => mountedRef.current
    };
}

/**
 * Hook para manipulação segura de classes CSS
 */
export function useSafeClassList(elementRef: React.RefObject<Element> | string) {
    const { safeOperation } = useSafeDOM();

    const addClass = useCallback((className: string) => {
        const target = typeof elementRef === 'string' ? elementRef : elementRef.current;
        if (!target) return;

        safeOperation(target, (element) => {
            element.classList.add(className);
        }, {
            onError: (error) => {
                console.warn(`Failed to add class "${className}":`, error);
            }
        });
    }, [elementRef, safeOperation]);

    const removeClass = useCallback((className: string) => {
        const target = typeof elementRef === 'string' ? elementRef : elementRef.current;
        if (!target) return;

        safeOperation(target, (element) => {
            element.classList.remove(className);
        }, {
            onError: (error) => {
                console.warn(`Failed to remove class "${className}":`, error);
            }
        });
    }, [elementRef, safeOperation]);

    const toggleClass = useCallback((className: string, force?: boolean) => {
        const target = typeof elementRef === 'string' ? elementRef : elementRef.current;
        if (!target) return;

        safeOperation(target, (element) => {
            element.classList.toggle(className, force);
        }, {
            onError: (error) => {
                console.warn(`Failed to toggle class "${className}":`, error);
            }
        });
    }, [elementRef, safeOperation]);

    const hasClass = useCallback((className: string): boolean => {
        const target = typeof elementRef === 'string' ? elementRef : elementRef.current;
        if (!target) return false;

        try {
            const element = typeof target === 'string'
                ? document.querySelector(target)
                : target;

            return element?.classList.contains(className) || false;
        } catch (error) {
            console.warn(`Failed to check class "${className}":`, error);
            return false;
        }
    }, [elementRef]);

    return {
        addClass,
        removeClass,
        toggleClass,
        hasClass
    };
}

/**
 * Hook para aguardar elementos aparecerem no DOM
 */
export function useElementWatcher<T extends Element = Element>(
    selector: string,
    options?: {
        timeout?: number;
        parent?: Document | Element;
    }
) {
    const [element, setElement] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { waitForElement } = useSafeDOM();

    useEffect(() => {
        setLoading(true);
        setError(null);

        waitForElement<T>(selector, options)
            .then((el) => {
                setElement(el);
                setLoading(false);
            })
            .catch((err) => {
                setError(err);
                setLoading(false);
            });
    }, [selector, options?.timeout, options?.parent, waitForElement]);

    return { element, loading, error };
}

/**
 * Hook para executar código quando o DOM estiver pronto
 */
export function useDOMReady(callback: () => void, deps: React.DependencyList = []) {
    useEffect(() => {
        onDOMReady(callback);
    }, deps);
}