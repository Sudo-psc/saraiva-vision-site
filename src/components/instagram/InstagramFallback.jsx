import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    WifiOff,
    Clock,
    AlertCircle,
    RefreshCw,
    Archive,
    Calendar,
    User,
    ExternalLink
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import OptimizedImage from './OptimizedImage';
import useAccessibilityPreferences from '../../hooks/useAccessibilityPreferences';

/**
 * InstagramFallback - Fallback content system for Instagram feed
 * Displays cached content, offline messages, and recovery options
 */
const InstagramFallback = ({
    fallbackPosts = [],
    errorMessage = '',
    errorType = 'network', // 'network', 'api', 'auth', 'rate-limit', 'unknown'
    lastSuccessfulFetch = null,
    cacheAge = 0,
    onRetry = null,
    onClearCache = null,
    showCachedContent = true,
    showRetryOptions = true,
    className = ''
}) => {
    const [showDetails, setShowDetails] = useState(false);
    const [retryAttempts, setRetryAttempts] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);

    // Accessibility preferences
    const {
        getAccessibilityClasses,
        getAccessibilityStyles,
        shouldReduceMotion,
        getAnimationConfig
    } = useAccessibilityPreferences();

    // Format cache age for display
    const formatCacheAge = (ageMs) => {
        if (!ageMs) return 'Unknown';

        const minutes = Math.floor(ageMs / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    // Get error details based on type
    const getErrorDetails = () => {
        switch (errorType) {
            case 'network':
                return {
                    icon: WifiOff,
                    title: 'No Internet Connection',
                    message: 'Unable to connect to Instagram. Check your internet connection.',
                    color: 'orange',
                    canRetry: true,
                    showCached: true
                };
            case 'api':
                return {
                    icon: AlertCircle,
                    title: 'Instagram API Error',
                    message: 'Instagram services are temporarily unavailable.',
                    color: 'red',
                    canRetry: true,
                    showCached: true
                };
            case 'auth':
                return {
                    icon: AlertCircle,
                    title: 'Authentication Issue',
                    message: 'Unable to authenticate with Instagram.',
                    color: 'red',
                    canRetry: false,
                    showCached: true
                };
            case 'rate-limit':
                return {
                    icon: Clock,
                    title: 'Rate Limit Exceeded',
                    message: 'Too many requests to Instagram. Please wait before trying again.',
                    color: 'yellow',
                    canRetry: true,
                    showCached: true
                };
            default:
                return {
                    icon: AlertCircle,
                    title: 'Content Unavailable',
                    message: 'Unable to load Instagram content at this time.',
                    color: 'gray',
                    canRetry: true,
                    showCached: true
                };
        }
    };

    // Handle retry with exponential backoff
    const handleRetry = async () => {
        if (!onRetry || isRetrying) return;

        setIsRetrying(true);

        try {
            // Implement exponential backoff
            const delay = Math.min(1000 * Math.pow(2, retryAttempts), 30000); // Max 30 seconds

            if (retryAttempts > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            await onRetry();
            setRetryAttempts(0); // Reset on success
        } catch (error) {
            setRetryAttempts(prev => prev + 1);
        } finally {
            setIsRetrying(false);
        }
    };

    // Handle cache clearing
    const handleClearCache = () => {
        if (onClearCache) {
            onClearCache();
        }
    };

    const errorDetails = getErrorDetails();
    const ErrorIcon = errorDetails.icon;
    const hasValidCache = fallbackPosts && fallbackPosts.length > 0;
    const animationConfig = getAnimationConfig();

    // Animation variants
    const containerVariants = shouldReduceMotion() ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 }
    } : {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: animationConfig.duration,
                staggerChildren: animationConfig.stagger
            }
        }
    };

    const itemVariants = shouldReduceMotion() ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 }
    } : {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: animationConfig.duration }
        }
    };

    return (
        <motion.div
            className={`instagram-fallback ${getAccessibilityClasses()} ${className}`}
            style={getAccessibilityStyles()}
            variants={containerVariants}
            initial={shouldReduceMotion() ? false : "hidden"}
            animate={shouldReduceMotion() ? false : "visible"}
            role="region"
            aria-labelledby="fallback-title"
            aria-describedby="fallback-description"
        >
            {/* Error Message */}
            <motion.div
                className={`
                    flex flex-col items-center text-center p-6 rounded-lg border-2
                    ${errorDetails.color === 'orange' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                        errorDetails.color === 'red' ? 'bg-red-50 border-red-200 text-red-800' :
                            errorDetails.color === 'yellow' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                                'bg-gray-50 border-gray-200 text-gray-800'}
                `}
                variants={itemVariants}
            >
                <ErrorIcon className="w-12 h-12 mb-4" aria-hidden="true" />

                <h2 id="fallback-title" className="text-xl font-semibold mb-2">
                    {errorDetails.title}
                </h2>

                <p id="fallback-description" className="text-sm mb-4 max-w-md">
                    {errorDetails.message}
                </p>

                {errorMessage && (
                    <details className="text-xs text-left w-full max-w-md">
                        <summary className="cursor-pointer hover:underline">
                            Technical Details
                        </summary>
                        <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs font-mono">
                            {errorMessage}
                        </div>
                    </details>
                )}

                {/* Cache Information */}
                {hasValidCache && (
                    <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg text-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <Archive className="w-4 h-4" />
                            <span className="font-medium">Cached Content Available</span>
                        </div>
                        <div className="text-xs space-y-1">
                            <div>Posts: {fallbackPosts.length}</div>
                            <div>Last updated: {formatCacheAge(cacheAge)}</div>
                            {lastSuccessfulFetch && (
                                <div>
                                    Last fetch: {format(new Date(lastSuccessfulFetch), 'PPp', { locale: ptBR })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {showRetryOptions && (
                    <div className="flex flex-wrap gap-3 mt-6">
                        {errorDetails.canRetry && onRetry && (
                            <button
                                onClick={handleRetry}
                                disabled={isRetrying || retryAttempts >= 3}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                                    focus:outline-none focus:ring-2 focus:ring-offset-2
                                    ${isRetrying || retryAttempts >= 3
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                                    }
                                `}
                                aria-describedby="retry-description"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                                {isRetrying ? 'Retrying...' : 'Try Again'}
                            </button>
                        )}

                        {onClearCache && (
                            <button
                                onClick={handleClearCache}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                <Archive className="w-4 h-4" />
                                Clear Cache
                            </button>
                        )}

                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                            aria-expanded={showDetails}
                        >
                            More Info
                        </button>
                    </div>
                )}

                {/* Retry limit message */}
                {retryAttempts >= 3 && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-800 text-sm">
                        Maximum retry attempts reached. Please refresh the page or try again later.
                    </div>
                )}

                {/* Hidden descriptions for screen readers */}
                <div className="sr-only">
                    <div id="retry-description">
                        Attempt to reload Instagram content. Current retry attempts: {retryAttempts}/3
                    </div>
                </div>
            </motion.div>

            {/* Detailed Information */}
            {showDetails && (
                <motion.div
                    className="mt-6 p-4 bg-gray-100 rounded-lg text-sm"
                    variants={itemVariants}
                    initial={shouldReduceMotion() ? false : "hidden"}
                    animate={shouldReduceMotion() ? false : "visible"}
                >
                    <h3 className="font-medium mb-3">Troubleshooting Information</h3>
                    <div className="space-y-2 text-xs">
                        <div><strong>Error Type:</strong> {errorType}</div>
                        <div><strong>Timestamp:</strong> {new Date().toLocaleString()}</div>
                        <div><strong>Cache Status:</strong> {hasValidCache ? 'Available' : 'Empty'}</div>
                        <div><strong>Retry Attempts:</strong> {retryAttempts}/3</div>
                        {lastSuccessfulFetch && (
                            <div><strong>Last Successful Fetch:</strong> {new Date(lastSuccessfulFetch).toLocaleString()}</div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Cached Content Display */}
            {showCachedContent && hasValidCache && errorDetails.showCached && (
                <motion.div
                    className="mt-8"
                    variants={itemVariants}
                >
                    <div className="flex items-center gap-2 mb-4 text-gray-700">
                        <Archive className="w-5 h-5" />
                        <h3 className="text-lg font-medium">Cached Content</h3>
                        <span className="text-sm text-gray-500">
                            (Last updated {formatCacheAge(cacheAge)})
                        </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {fallbackPosts.map((post, index) => (
                            <motion.article
                                key={post.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 opacity-75"
                                variants={itemVariants}
                                role="article"
                                aria-label={`Cached Instagram post by ${post.username}`}
                            >
                                {/* Cached indicator */}
                                <div className="bg-yellow-100 border-b border-yellow-200 px-3 py-1 text-xs text-yellow-800 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Cached Content
                                </div>

                                {/* Post image */}
                                <div className="aspect-square bg-gray-100">
                                    <OptimizedImage
                                        src={post.media_url || post.thumbnail_url || '/img/placeholder.svg'}
                                        alt={`Cached Instagram post: ${post.caption?.substring(0, 100) || 'No caption'}`}
                                        className="w-full h-full object-cover"
                                        enableLazyLoading={false}
                                        enableFormatOptimization={false}
                                    />
                                </div>

                                {/* Post content */}
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                                        <User className="w-4 h-4" />
                                        <span>@{post.username}</span>
                                        {post.timestamp && (
                                            <>
                                                <Calendar className="w-4 h-4 ml-2" />
                                                <time dateTime={post.timestamp}>
                                                    {formatDistanceToNow(new Date(post.timestamp), {
                                                        addSuffix: true,
                                                        locale: ptBR
                                                    })}
                                                </time>
                                            </>
                                        )}
                                    </div>

                                    {post.caption && (
                                        <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                                            {post.caption}
                                        </p>
                                    )}

                                    {post.stats && (
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                            <span>❤️ {post.stats.likes || 0}</span>
                                            <span>💬 {post.stats.comments || 0}</span>
                                            {post.stats.engagement_rate && (
                                                <span>📊 {post.stats.engagement_rate}%</span>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => post.permalink && window.open(post.permalink, '_blank')}
                                        disabled={!post.permalink}
                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        View on Instagram
                                    </button>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default InstagramFallback;