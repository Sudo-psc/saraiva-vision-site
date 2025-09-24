import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RefreshCw,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Pause,
    Play,
    SkipForward
} from 'lucide-react';
import useAccessibilityPreferences from '../../hooks/useAccessibilityPreferences';

/**
 * InstagramRetryManager - Advanced retry mechanism with exponential backoff
 * Provides visual feedback and control over retry operations
 */
const InstagramRetryManager = ({
    onRetry,
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    jitterFactor = 0.1,
    autoRetry = true,
    showProgress = true,
    showControls = true,
    errorType = 'unknown',
    className = '',
    onRetryStateChange = null
}) => {
    const [retryState, setRetryState] = useState({
        attempts: 0,
        isRetrying: false,
        isPaused: false,
        nextRetryIn: 0,
        lastError: null,
        retryHistory: []
    });

    const [countdown, setCountdown] = useState(0);
    const retryTimeoutRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    // Accessibility preferences
    const {
        shouldReduceMotion,
        getAnimationConfig,
        getAccessibilityClasses,
        getAccessibilityStyles
    } = useAccessibilityPreferences();

    // Calculate next retry delay with exponential backoff and jitter
    const calculateRetryDelay = useCallback((attemptNumber) => {
        let delay = Math.min(
            baseDelay * Math.pow(backoffMultiplier, attemptNumber),
            maxDelay
        );

        // Add jitter to prevent thundering herd
        const jitter = delay * jitterFactor * (Math.random() - 0.5);
        delay += jitter;

        // Special handling for different error types
        switch (errorType) {
            case 'rate-limit':
                delay = Math.max(delay, 60000); // Minimum 1 minute for rate limits
                break;
            case 'auth':
                delay = Math.max(delay, 5000); // Minimum 5 seconds for auth errors
                break;
            case 'server':
                delay = Math.max(delay, 2000); // Minimum 2 seconds for server errors
                break;
        }

        return Math.round(delay);
    }, [baseDelay, backoffMultiplier, maxDelay, jitterFactor, errorType]);

    // Start countdown timer
    const startCountdown = useCallback((delayMs) => {
        setCountdown(Math.ceil(delayMs / 1000));

        countdownIntervalRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownIntervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    // Stop countdown timer
    const stopCountdown = useCallback(() => {
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        setCountdown(0);
    }, []);

    // Execute retry with delay
    const executeRetry = useCallback(async (attemptNumber, immediate = false) => {
        if (attemptNumber >= maxRetries) {
            setRetryState(prev => ({
                ...prev,
                isRetrying: false,
                lastError: new Error('Maximum retry attempts exceeded')
            }));
            return;
        }

        const delay = immediate ? 0 : calculateRetryDelay(attemptNumber);
        const retryTime = Date.now() + delay;

        setRetryState(prev => ({
            ...prev,
            attempts: attemptNumber + 1,
            isRetrying: true,
            nextRetryIn: retryTime,
            retryHistory: [
                ...prev.retryHistory,
                {
                    attempt: attemptNumber + 1,
                    timestamp: Date.now(),
                    delay,
                    status: 'scheduled'
                }
            ]
        }));

        if (onRetryStateChange) {
            onRetryStateChange({
                attempts: attemptNumber + 1,
                isRetrying: true,
                nextRetryIn: retryTime
            });
        }

        if (!immediate && delay > 0) {
            startCountdown(delay);

            retryTimeoutRef.current = setTimeout(async () => {
                await performRetry(attemptNumber + 1);
            }, delay);
        } else {
            await performRetry(attemptNumber + 1);
        }
    }, [maxRetries, calculateRetryDelay, onRetryStateChange, startCountdown]);

    // Perform the actual retry operation
    const performRetry = useCallback(async (attemptNumber) => {
        try {
            stopCountdown();

            // Update retry history
            setRetryState(prev => ({
                ...prev,
                retryHistory: prev.retryHistory.map(entry =>
                    entry.attempt === attemptNumber
                        ? { ...entry, status: 'executing', executedAt: Date.now() }
                        : entry
                )
            }));

            const result = await onRetry();

            // Success
            setRetryState(prev => ({
                ...prev,
                isRetrying: false,
                lastError: null,
                retryHistory: prev.retryHistory.map(entry =>
                    entry.attempt === attemptNumber
                        ? { ...entry, status: 'success', completedAt: Date.now() }
                        : entry
                )
            }));

            if (onRetryStateChange) {
                onRetryStateChange({
                    attempts: attemptNumber,
                    isRetrying: false,
                    success: true
                });
            }

        } catch (error) {
            // Update retry history with failure
            setRetryState(prev => ({
                ...prev,
                lastError: error,
                retryHistory: prev.retryHistory.map(entry =>
                    entry.attempt === attemptNumber
                        ? { ...entry, status: 'failed', completedAt: Date.now(), error: error.message }
                        : entry
                )
            }));

            // Schedule next retry if not at max attempts
            if (attemptNumber < maxRetries && autoRetry && !retryState.isPaused) {
                await executeRetry(attemptNumber, false);
            } else {
                setRetryState(prev => ({
                    ...prev,
                    isRetrying: false
                }));

                if (onRetryStateChange) {
                    onRetryStateChange({
                        attempts: attemptNumber,
                        isRetrying: false,
                        success: false,
                        error
                    });
                }
            }
        }
    }, [onRetry, maxRetries, autoRetry, retryState.isPaused, onRetryStateChange, stopCountdown, executeRetry]);

    // Manual retry trigger
    const handleManualRetry = useCallback(() => {
        if (retryState.isRetrying || retryState.attempts >= maxRetries) return;
        executeRetry(retryState.attempts, true);
    }, [retryState.isRetrying, retryState.attempts, maxRetries, executeRetry]);

    // Pause/resume retry process
    const handlePauseResume = useCallback(() => {
        if (retryState.isPaused) {
            // Resume
            setRetryState(prev => ({ ...prev, isPaused: false }));
            if (retryState.attempts < maxRetries && retryState.lastError) {
                executeRetry(retryState.attempts, false);
            }
        } else {
            // Pause
            setRetryState(prev => ({ ...prev, isPaused: true }));
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = null;
            }
            stopCountdown();
        }
    }, [retryState.isPaused, retryState.attempts, retryState.lastError, maxRetries, executeRetry, stopCountdown]);

    // Skip current retry delay
    const handleSkipDelay = useCallback(() => {
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
        stopCountdown();
        performRetry(retryState.attempts);
    }, [retryState.attempts, performRetry, stopCountdown]);

    // Reset retry state
    const handleReset = useCallback(() => {
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
        stopCountdown();

        setRetryState({
            attempts: 0,
            isRetrying: false,
            isPaused: false,
            nextRetryIn: 0,
            lastError: null,
            retryHistory: []
        });

        if (onRetryStateChange) {
            onRetryStateChange({
                attempts: 0,
                isRetrying: false,
                reset: true
            });
        }
    }, [onRetryStateChange, stopCountdown]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
        };
    }, []);

    // Auto-start retry on error
    useEffect(() => {
        if (retryState.lastError && autoRetry && !retryState.isRetrying && retryState.attempts < maxRetries) {
            executeRetry(retryState.attempts, false);
        }
    }, [retryState.lastError, autoRetry, retryState.isRetrying, retryState.attempts, maxRetries, executeRetry]);

    const animationConfig = getAnimationConfig();
    const canRetry = retryState.attempts < maxRetries;
    const isWaiting = retryState.isRetrying && countdown > 0;

    // Animation variants
    const containerVariants = shouldReduceMotion() ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 }
    } : {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: animationConfig.duration }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: { duration: animationConfig.duration }
        }
    };

    const progressVariants = shouldReduceMotion() ? {
        initial: { width: '0%' },
        animate: { width: '100%' }
    } : {
        initial: { width: '0%' },
        animate: {
            width: '100%',
            transition: { duration: countdown, ease: 'linear' }
        }
    };

    if (!retryState.isRetrying && retryState.attempts === 0 && !retryState.lastError) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                className={`instagram-retry-manager bg-white border border-gray-200 rounded-lg shadow-lg p-4 ${getAccessibilityClasses()} ${className}`}
                style={getAccessibilityStyles()}
                variants={containerVariants}
                initial={shouldReduceMotion() ? false : "hidden"}
                animate={shouldReduceMotion() ? false : "visible"}
                exit={shouldReduceMotion() ? false : "exit"}
                role="region"
                aria-labelledby="retry-manager-title"
                aria-live="polite"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <h3 id="retry-manager-title" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {retryState.isRetrying ? (
                            <>
                                <RefreshCw className={`w-4 h-4 text-blue-600 ${!shouldReduceMotion() ? 'animate-spin' : ''}`} />
                                Retrying...
                            </>
                        ) : retryState.attempts >= maxRetries ? (
                            <>
                                <XCircle className="w-4 h-4 text-red-600" />
                                Max Retries Reached
                            </>
                        ) : retryState.lastError ? (
                            <>
                                <AlertTriangle className="w-4 h-4 text-orange-600" />
                                Retry Available
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Retry Complete
                            </>
                        )}
                    </h3>

                    <div className="text-xs text-gray-500">
                        {retryState.attempts}/{maxRetries} attempts
                    </div>
                </div>

                {/* Progress Bar */}
                {showProgress && isWaiting && (
                    <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Next retry in {countdown}s</span>
                            <span>{Math.round((1 - countdown / (calculateRetryDelay(retryState.attempts - 1) / 1000)) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <motion.div
                                className="h-full bg-blue-600 rounded-full"
                                variants={progressVariants}
                                initial="initial"
                                animate="animate"
                                key={retryState.attempts}
                            />
                        </div>
                    </div>
                )}

                {/* Controls */}
                {showControls && (
                    <div className="flex items-center gap-2 mb-3">
                        {canRetry && !retryState.isRetrying && (
                            <button
                                onClick={handleManualRetry}
                                className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                aria-label="Retry now"
                            >
                                <RefreshCw className="w-3 h-3" />
                                Retry Now
                            </button>
                        )}

                        {retryState.isRetrying && (
                            <>
                                <button
                                    onClick={handlePauseResume}
                                    className="flex items-center gap-1 px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
                                    aria-label={retryState.isPaused ? "Resume retries" : "Pause retries"}
                                >
                                    {retryState.isPaused ? (
                                        <>
                                            <Play className="w-3 h-3" />
                                            Resume
                                        </>
                                    ) : (
                                        <>
                                            <Pause className="w-3 h-3" />
                                            Pause
                                        </>
                                    )}
                                </button>

                                {isWaiting && (
                                    <button
                                        onClick={handleSkipDelay}
                                        className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                                        aria-label="Skip waiting time"
                                    >
                                        <SkipForward className="w-3 h-3" />
                                        Skip Wait
                                    </button>
                                )}
                            </>
                        )}

                        <button
                            onClick={handleReset}
                            className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                            aria-label="Reset retry state"
                        >
                            Reset
                        </button>
                    </div>
                )}

                {/* Status Message */}
                <div className="text-xs text-gray-600">
                    {retryState.isRetrying ? (
                        retryState.isPaused ? (
                            'Retries paused. Click Resume to continue.'
                        ) : isWaiting ? (
                            `Waiting ${countdown}s before next attempt...`
                        ) : (
                            'Executing retry...'
                        )
                    ) : retryState.attempts >= maxRetries ? (
                        'All retry attempts have been exhausted. Please try again later or contact support.'
                    ) : retryState.lastError ? (
                        `Last error: ${retryState.lastError.message}`
                    ) : (
                        'Operation completed successfully.'
                    )}
                </div>

                {/* Retry History */}
                {retryState.retryHistory.length > 0 && (
                    <details className="mt-3">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            Retry History ({retryState.retryHistory.length})
                        </summary>
                        <div className="mt-2 space-y-1">
                            {retryState.retryHistory.map((entry, index) => (
                                <div key={index} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono">#{entry.attempt}</span>
                                        <span className={`
                                            px-1 py-0.5 rounded text-xs font-medium
                                            ${entry.status === 'success' ? 'bg-green-100 text-green-800' :
                                                entry.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                    entry.status === 'executing' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'}
                                        `}>
                                            {entry.status}
                                        </span>
                                    </div>
                                    <div className="text-gray-500">
                                        {entry.delay ? `${Math.round(entry.delay / 1000)}s delay` : ''}
                                        {entry.error && ` - ${entry.error}`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </details>
                )}

                {/* Screen reader announcements */}
                <div className="sr-only" aria-live="assertive">
                    {retryState.isRetrying && `Retry attempt ${retryState.attempts} in progress`}
                    {!retryState.isRetrying && retryState.attempts > 0 && 'Retry completed'}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InstagramRetryManager;