import { useEffect, useRef, useState } from 'react';

/**
 * Hook para efeitos idempotentes que evita execução dupla no StrictMode
 */
export function useIdempotentEffect(
    effect: () => void | (() => void),
    deps?: React.DependencyList
): void {
    const hasRun = useRef(false);
    const cleanup = useRef<(() => void) | void>();

    useEffect(() => {
        // Em StrictMode, o efeito pode executar duas vezes
        // Este guard previne execução dupla
        if (hasRun.current) {
            return cleanup.current;
        }

        hasRun.current = true;
        cleanup.current = effect();

        return () => {
            if (cleanup.current) {
                cleanup.current();
            }
            hasRun.current = false;
        };
    }, deps);
}

/**
 * Hook para fetch com AbortController e cleanup automático
 */
export function useFetchWithCleanup<T>(
    fetcher: (signal: AbortSignal) => Promise<T>,
    deps: React.DependencyList = []
) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(true);

    useIdempotentEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await fetcher(controller.signal);

                // Verificar se o componente ainda está montado
                if (!controller.signal.aborted) {
                    setData(result);
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(err as Error);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            controller.abort();
        };
    }, deps);

    return { data, error, loading };
}

/**
 * Hook para inicialização única de SDKs
 */
export function useSDKInitialization(
    initFunction: () => Promise<void> | void,
    isAvailable: () => boolean,
    deps: React.DependencyList = []
) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const initPromise = useRef<Promise<void> | null>(null);

    useIdempotentEffect(() => {
        if (isInitialized || isAvailable()) {
            setIsInitialized(true);
            return;
        }

        if (initPromise.current) {
            return;
        }

        const initialize = async () => {
            try {
                setError(null);
                const result = initFunction();

                if (result instanceof Promise) {
                    await result;
                }

                setIsInitialized(true);
            } catch (err) {
                setError(err as Error);
                console.error('SDK initialization failed:', err);
            } finally {
                initPromise.current = null;
            }
        };

        initPromise.current = initialize();

        return () => {
            initPromise.current = null;
        };
    }, deps);

    return { isInitialized, error };
}