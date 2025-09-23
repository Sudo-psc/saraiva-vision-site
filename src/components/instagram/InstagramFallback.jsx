import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Instagram,
    RefreshCw,
    Wifi,
    WifiOff,
    Clock,
    AlertCircle,
    ExternalLink,
    Image as ImageIcon,
    Heart,
    MessageCircle
} from 'lucide-react';
import useAccessibilityPreferences from '../../hooks/useAccessibilityPreferences';

/**
 * InstagramFallback - Fallback content system for Instagram components
 * Provides graceful degradation when Instagram content cannot be loaded
 */
const InstagramFallback = ({
    type = 'generic', // 'generic', 'network', 'auth', 'rate-limit', 'server'
    fallbackPosts = [],
    showRetry = true,
    showOfflineMessage = true,
    showCachedContent = true,
    onRetry = null,
    retryCount = 0,
    maxRetries = 3,
    isRetrying = false,
    errorMessage = null,
    lastUpdated = null,
    className = ''
}) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showDetails, setShowDetails] = useState(false);

    // Accessibility preferences
    const {
        shouldReduceMotion,
        getAnimationConfig,
        getAccessibilityClasses,
        getAccessibilityStyles
    } = useAccessibilityPreferences();

    // Monitor online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Handle retry
    const handleRetry = useCallback(() => {
        if (onRetry && !isRetrying && retryCount < maxRetries) {
            onRetry();
        }
    }, [onRetry, isRetrying, retryCount, maxRetries]);

    // Get fallback message based on error type
    const getFallbackMessage = () => {
        switch (type) {
            case 'network':
                return {
                    title: 'Connection Issue',
                    message: 'Unable to load Instagram content due to network issues.',
                    suggestion: 'Please check your internet connection and try again.',
                    icon: isOnline ? Wifi : WifiOff
                };
            case 'auth':
                return {
                    title: 'Authentication Error',
                    message: 'There was an issue accessing Instagram content.',
                    suggestion: 'This is usually temporary. Please try again in a few minutes.',
                    icon: AlertCircle
                };
            case 'rate-limit':
                return {
                    title: 'Rate Limit Reached',
                    message: 'Instagram has temporarily limited our access.',
                    suggestion: 'Please wait a few minutes before trying again.',
                    icon: Clock
                };
            case 'server':
                return {
                    title: 'Server Error',
                    message: 'Instagram servers are experiencing issues.',
                    suggestion: 'This is usually temporary. Please try again later.',
                    icon: AlertCircle
                };
            default:
                return {
                    title: 'Content Unavailable',
                    message: 'Instagram content is temporarily unavailable.',
                    suggestion: 'Please try refreshing the page or check back later.',
                    icon: Instagram
                };
        }
    };

    const fallbackInfo = getFallbackMessage();
    const IconComponent = fallbackInfo.icon;
    const animationConfig = getAnimationConfig();

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
        }
    };

    const pulseVariants = shouldReduceMotion() ? {
        pulse: { opacity: 1 }
    } : {
        pulse: {
            opacity: [1, 0.7, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
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
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                {/* Header */}
                <div className="text-center mb-6">
                    <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4"
                        variants={pulseVariants}
                        animate={shouldReduceMotion() ? false : "pulse"}
                    >
                        <IconComponent className="w-8 h-8 text-gray-600" />
                    </motion.div>

                    <h3 id="fallback-title" className="text-lg font-medium text-gray-900 mb-2">
                        {fallbackInfo.title}
                    </h3>

                    <p id="fallback-description" className="text-gray-600 mb-2">
                        {fallbackInfo.message}
                    </p>

                    <p className="text-sm text-gray-500">
                        {fallbackInfo.suggestion}
                    </p>
                </div>

                {/* Network status indicator */}
                {showOfflineMessage && !isOnline && (
                    <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-orange-100 border border-orange-200 rounded-md">
                        <WifiOff className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-orange-800">
                            You appear to be offline
                        </span>
                    </div>
                )}

                {/* Error details */}
                {errorMessage && (
                    <div className="mb-4">
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-sm text-gray-600 hover:text-gray-800 underline focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
                        >
                            {showDetails ? 'Hide' : 'Show'} error details
                        </button>

                        <AnimatePresence>
                            {showDetails && (
                                <motion.div
                                    className="mt-2 p-3 bg-gray-100 rounded-md"
                                    initial={shouldReduceMotion() ? false : { opacity: 0, height: 0 }}
                                    animate={shouldReduceMotion() ? false : { opacity: 1, height: 'auto' }}
                                    exit={shouldReduceMotion() ? false : { opacity: 0, height: 0 }}
                                >
                                    <p className="text-sm text-gray-700 font-mono">
                                        {errorMessage}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Last updated info */}
                {lastUpdated && (
                    <div className="text-center mb-4">
                        <p className="text-xs text-gray-500">
                            Last updated: {new Date(lastUpdated).toLocaleString()}
                        </p>
                    </div>
                )}

                {/* Cached content */}
                {showCachedContent && fallbackPosts.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Cached Instagram Posts
                        </h4>

                        <div className="grid grid-cols-2 gap-3">
                            {fallbackPosts.slice(0, 4).map((post, index) => (
                                <div
                                    key={post.id || index}
                                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    {/* Post image */}
                                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                        {post.media_url ? (
                                            <img
                                                src={post.media_url}
                                                alt={post.caption ? `Instagram post: ${post.caption.substring(0, 50)}...` : 'Instagram post'}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className="w-full h-full flex items-center justify-center text-gray-400" style={{ display: post.media_url ? 'none' : 'flex' }}>
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                    </div>

                                    {/* Post info */}
                                    <div className="p-3">
                                        {post.caption && (
                                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                                {post.caption.length > 60
                                                    ? `${post.caption.substring(0, 60)}...`
                                                    : post.caption
                                                }
                                            </p>
                                        )}

                                        {/* Engagement stats */}
                                        {post.stats && (
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                {post.stats.likes && (
                                                    <span className="flex items-center gap-1">
                                                        <Heart className="w-3 h-3" />
                                                        {post.stats.likes}
                                                    </span>
                                                )}
                                                {post.stats.comments && (
                                                    <span className="flex items-center gap-1">
                                                        <MessageCircle className="w-3 h-3" />
                                                        {post.stats.comments}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* View on Instagram link */}
                                        {post.permalink && (
                                            <a
                                                href={post.permalink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                                            >
                                                View on Instagram
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-gray-500 mt-3 text-center">
                            Showing cached content from previous visit
                        </p>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {showRetry && onRetry && retryCount < maxRetries && (
                        <button
                            onClick={handleRetry}
                            disabled={isRetrying}
                            className={`
                                inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium
                                focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
                                ${isRetrying
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                                }
                            `}
                            aria-label={isRetrying ? 'Retrying...' : 'Retry loading Instagram content'}
                        >
                            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                            {isRetrying ? 'Retrying...' : 'Try Again'}
                        </button>
                    )}

                    {/* Visit Instagram directly */}
                    <a
                        href="https://www.instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                    >
                        <Instagram className="w-4 h-4" />
                        Visit Instagram
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>

                {/* Retry count indicator */}
                {retryCount > 0 && (
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                            Retry attempts: {retryCount}/{maxRetries}
                        </p>
                    </div>
                )}

                {/* Accessibility note */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-400">
                        Having trouble? Try refreshing the page or contact support.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default InstagramFallback;