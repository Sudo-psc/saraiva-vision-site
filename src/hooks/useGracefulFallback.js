/**
 * Hook para gerenciar fallbacks graciosos
 * Simplifica o uso do sistema de fallback em componentes
 */

import { useState, useEffect, useCallback } from 'react';
import { gracefulFallback } from '@/utils/gracefulFallback';

export const useGracefulFallback = (serviceName, options = {}) => {
    const [isUsingFallback, setIsUsingFallback] = useState(false);
    const [fallbackData, setFallbackData] = useState(null);
    const [lastError, setLastError] = useState(null);

    const {
        autoExecute = true,
        onFallbackActivated,
        onFallbackCleared,
        context = {}
    } = options;

    // Verifica se está usando fallback
    useEffect(() => {
        const checkFallbackStatus = () => {
            const isUsing = gracefulFallback.isUsingFallback(serviceName);
            const data = gracefulFallback.getFallbackData(serviceName);

            setIsUsingFallback(isUsing);
            setFallbackData(data);
        };

        checkFallbackStatus();

        // Verifica periodicamente (apenas em desenvolvimento)
        let interval;
        if (process.env.NODE_ENV === 'development') {
            interval = setInterval(checkFallbackStatus, 5000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [serviceName]);

    // Executa fallback
    const executeFallback = useCallback(async (error, customContext = {}) => {
        console.info(`🔄 ${serviceName}: Executing graceful fallback`);

        const result = await gracefulFallback.executeFallback(
            serviceName,
            error,
            { ...context, ...customContext }
        );

        setLastError(error);
        setIsUsingFallback(result.success);
        setFallbackData(result.success ? { data: result.data, timestamp: new Date() } : null);

        if (result.success && onFallbackActivated) {
            onFallbackActivated(result);
        }

        return result;
    }, [serviceName, context, onFallbackActivated]);

    // Limpa fallback
    const clearFallback = useCallback(() => {
        gracefulFallback.clearFallback(serviceName);
        setIsUsingFallback(false);
        setFallbackData(null);
        setLastError(null);

        if (onFallbackCleared) {
            onFallbackCleared();
        }
    }, [serviceName, onFallbackCleared]);

    // Monitora saúde do serviço
    const monitorHealth = useCallback((isHealthy) => {
        gracefulFallback.monitorServiceHealth(serviceName, isHealthy);

        if (isHealthy && isUsingFallback) {
            clearFallback();
        }
    }, [serviceName, isUsingFallback, clearFallback]);

    // Obtém estatísticas (apenas desenvolvimento)
    const getStats = useCallback(() => {
        if (process.env.NODE_ENV !== 'development') return null;
        return gracefulFallback.getStats();
    }, []);

    return {
        isUsingFallback,
        fallbackData: fallbackData?.data,
        lastError,
        executeFallback,
        clearFallback,
        monitorHealth,
        getStats
    };
};

export default useGracefulFallback;