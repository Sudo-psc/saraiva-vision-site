import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wifi,
    WifiOff,
    Download,
    Upload,
    Clock,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    Archive,
    Signal
} from 'lucide-react';
import instagramServiceWorker from '../../services/instagramServiceWorker';
import useAccessibilityPreferences from '../../hooks/useAccessibilityPreferences';

/**
 * InstagramOfflineIndicator - Shows connection status and offline capabilities
 * Provides visual feedback about network status and cached content availability
 */
const InstagramOfflineIndicator = ({
    showWhenOnline = false,
    showCacheStatus = true,
    showSyncStatus = true,
    position = 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
    compact = false,
    className = ''
}) => {
    // State management
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'success', 'error'
    const [cacheStatus, setCacheStatus] = useState(null);
    const [lastSync, setLastSync] = useState(null);
    const [networkInfo, setNetworkInfo] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [contentAvailableOffline, setContentAvailableOffline] = useState(false);

    // Accessibility preferences
    const {
        getAccessibilityClasses,
        getAccessibilityStyles,
        shouldReduceMotion,
        getAnimationConfig
    } = useAccessibilityPreferences();

    // Initialize and listen for service worker events
    useEffect(() => {
        const updateNetworkInfo = () => {
            setNetworkInfo(instagramServiceWorker.getNetworkStatus());
        };

        const handleOnline = () => {
            setIsOnline(true);
            updateNetworkInfo();
        };

        const handleOffline = () => {
            setIsOnline(false);
            updateNetworkInfo();
        };

        const handleSyncStart = () => {
            setSyncStatus('syncing');
        };

        const handleSyncSuccess = () => {
            setSyncStatus('success');
            setLastSync(new Date());
            setTimeout(() => setSyncStatus('idle'), 3000);
        };

        const handleSyncError = () => {
            setSyncStatus('error');
            setTimeout(() => setSyncStatus('idle'), 5000);
        };

        const handleCacheStatusUpdate = ({ status }) => {
            setCacheStatus(status);
            setContentAvailableOffline(status && status.entryCount > 0);
        };

        // Set up event listeners
        const unsubscribeOnline = instagramServiceWorker.on('online', handleOnline);
        const unsubscribeOffline = instagramServiceWorker.on('offline', handleOffline);
        const unsubscribeSyncStart = instagramServiceWorker.on('sync-start', handleSyncStart);
        const unsubscribeSyncSuccess = instagramServiceWorker.on('sync-success', handleSyncSuccess);
        const unsubscribeSyncError = instagramServiceWorker.on('sync-error', handleSyncError);
        const unsubscribeCacheStatus = instagramServiceWorker.on('cache-status-updated', handleCacheStatusUpdate);

        // Initial setup
        updateNetworkInfo();
        instagramServiceWorker.getCacheStatus();
        instagramServiceWorker.isContentAvailableOffline().then(setContentAvailableOffline);

        return () => {
            unsubscribeOnline();
            unsubscribeOffline();
            unsubscribeSyncStart();
            unsubscribeSyncSuccess();
            unsubscribeSyncError();
            unsubscribeCacheStatus();
        };
    }, []);

    // Don't show when online unless explicitly requested
    if (isOnline && !showWhenOnline && syncStatus === 'idle') {
        return null;
    }

    // Get position classes
    const getPositionClasses = () => {
        const baseClasses = 'fixed z-50';
        switch (position) {
            case 'top-left':
                return `${baseClasses} top-4 left-4`;
            case 'top-right':
                return `${baseClasses} top-4 right-4`;
            case 'bottom-left':
                return `${baseClasses} bottom-4 left-4`;
            case 'bottom-right':
                return `${baseClasses} bottom-4 right-4`;
            default:
                return `${baseClasses} top-4 right-4`;
        }
    };

    // Get status icon and color
    const getStatusInfo = () => {
        if (!isOnline) {
            return {
                icon: WifiOff,
                color: 'red',
                bgColor: 'bg-red-100 border-red-200',
                textColor: 'text-red-800',
                iconColor: 'text-red-600',
                title: 'Offline',
                message: contentAvailableOffline ? 'Cached content available' : 'No cached content'
            };
        }

        switch (syncStatus) {
            case 'syncing':
                return {
                    icon: RefreshCw,
                    color: 'blue',
                    bgColor: 'bg-blue-100 border-blue-200',
                    textColor: 'text-blue-800',
                    iconColor: 'text-blue-600',
                    title: 'Syncing',
                    message: 'Updating content...',
                    animate: true
                };
            case 'success':
                return {
                    icon: CheckCircle,
                    color: 'green',
                    bgColor: 'bg-green-100 border-green-200',
                    textColor: 'text-green-800',
                    iconColor: 'text-green-600',
                    title: 'Synced',
                    message: 'Content updated'
                };
            case 'error':
                return {
                    icon: AlertCircle,
                    color: 'orange',
                    bgColor: 'bg-orange-100 border-orange-200',
                    textColor: 'text-orange-800',
                    iconColor: 'text-orange-600',
                    title: 'Sync Failed',
                    message: 'Unable to update content'
                };
            default:
                return {
                    icon: Wifi,
                    color: 'green',
                    bgColor: 'bg-green-100 border-green-200',
                    textColor: 'text-green-800',
                    iconColor: 'text-green-600',
                    title: 'Online',
                    message: 'Connected'
                };
        }
    };

    // Get network quality indicator
    const getNetworkQuality = () => {
        if (!networkInfo || !isOnline) return null;

        const { effectiveType, downlink } = networkInfo;

        if (effectiveType === '4g' || downlink > 10) {
            return { quality: 'excellent', color: 'text-green-500', bars: 4 };
        } else if (effectiveType === '3g' || downlink > 1.5) {
            return { quality: 'good', color: 'text-yellow-500', bars: 3 };
        } else if (effectiveType === '2g' || downlink > 0.5) {
            return { quality: 'poor', color: 'text-orange-500', bars: 2 };
        } else {
            return { quality: 'very-poor', color: 'text-red-500', bars: 1 };
        }
    };

    const statusInfo = getStatusInfo();
    const StatusIcon = statusInfo.icon;
    const networkQuality = getNetworkQuality();
    const animationConfig = getAnimationConfig();

    // Animation variants
    const containerVariants = shouldReduceMotion() ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 }
    } : {
        hidden: { opacity: 0, scale: 0.8, y: -20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: animationConfig.duration,
                ease: animationConfig.ease
            }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            y: -20,
            transition: {
                duration: animationConfig.duration * 0.5
            }
        }
    };

    const detailsVariants = shouldReduceMotion() ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    } : {
        hidden: { opacity: 0, height: 0 },
        visible: {
            opacity: 1,
            height: 'auto',
            transition: {
                duration: animationConfig.duration,
                ease: animationConfig.ease
            }
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className={`
                    instagram-offline-indicator ${getPositionClasses()} 
                    ${getAccessibilityClasses()} ${className}
                `}
                style={getAccessibilityStyles()}
                variants={containerVariants}
                initial={shouldReduceMotion() ? false : "hidden"}
                animate={shouldReduceMotion() ? false : "visible"}
                exit={shouldReduceMotion() ? false : "exit"}
                role="status"
                aria-live="polite"
                aria-label={`Network status: ${statusInfo.title}`}
            >
                <div
                    className={`
                        ${statusInfo.bgColor} ${statusInfo.textColor} 
                        border rounded-lg shadow-lg backdrop-blur-sm
                        ${compact ? 'p-2' : 'p-3'}
                        ${showDetails ? 'rounded-b-none' : ''}
                        transition-all duration-200
                    `}
                >
                    <div className="flex items-center gap-2">
                        {/* Status Icon */}
                        <StatusIcon
                            className={`
                                ${compact ? 'w-4 h-4' : 'w-5 h-5'} ${statusInfo.iconColor}
                                ${statusInfo.animate && !shouldReduceMotion() ? 'animate-spin' : ''}
                            `}
                            aria-hidden="true"
                        />

                        {/* Status Text */}
                        {!compact && (
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                    {statusInfo.title}
                                </span>
                                <span className="text-xs opacity-75">
                                    {statusInfo.message}
                                </span>
                            </div>
                        )}

                        {/* Network Quality Indicator */}
                        {isOnline && networkQuality && !compact && (
                            <div className="flex items-center gap-1 ml-2">
                                <Signal className={`w-3 h-3 ${networkQuality.color}`} />
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4].map(bar => (
                                        <div
                                            key={bar}
                                            className={`
                                                w-1 h-3 rounded-sm
                                                ${bar <= networkQuality.bars
                                                    ? networkQuality.color.replace('text-', 'bg-')
                                                    : 'bg-gray-300'
                                                }
                                            `}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Details Toggle */}
                        {(showCacheStatus || showSyncStatus) && !compact && (
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className={`
                                    ml-2 p-1 rounded hover:bg-black/10 transition-colors
                                    focus:outline-none focus:ring-1 focus:ring-current
                                `}
                                aria-expanded={showDetails}
                                aria-label="Toggle connection details"
                            >
                                <motion.div
                                    animate={{ rotate: showDetails ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    ▼
                                </motion.div>
                            </button>
                        )}
                    </div>
                </div>

                {/* Detailed Information */}
                <AnimatePresence>
                    {showDetails && (
                        <motion.div
                            className={`
                                ${statusInfo.bgColor} ${statusInfo.textColor}
                                border border-t-0 rounded-b-lg shadow-lg backdrop-blur-sm
                                p-3 text-xs space-y-2
                            `}
                            variants={detailsVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            {/* Network Information */}
                            {isOnline && networkInfo && (
                                <div>
                                    <div className="font-medium mb-1">Network</div>
                                    <div className="space-y-1 text-xs opacity-75">
                                        <div>Type: {networkInfo.effectiveType?.toUpperCase() || 'Unknown'}</div>
                                        {networkInfo.downlink && (
                                            <div>Speed: {networkInfo.downlink} Mbps</div>
                                        )}
                                        {networkInfo.rtt && (
                                            <div>Latency: {networkInfo.rtt}ms</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Cache Status */}
                            {showCacheStatus && cacheStatus && (
                                <div>
                                    <div className="font-medium mb-1 flex items-center gap-1">
                                        <Archive className="w-3 h-3" />
                                        Cache Status
                                    </div>
                                    <div className="space-y-1 text-xs opacity-75">
                                        <div>Entries: {cacheStatus.entryCount}</div>
                                        <div>Caches: {cacheStatus.caches.length}</div>
                                        <div>
                                            Offline Content: {contentAvailableOffline ? 'Available' : 'None'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sync Status */}
                            {showSyncStatus && (
                                <div>
                                    <div className="font-medium mb-1 flex items-center gap-1">
                                        <RefreshCw className="w-3 h-3" />
                                        Sync Status
                                    </div>
                                    <div className="space-y-1 text-xs opacity-75">
                                        <div>Status: {syncStatus}</div>
                                        {lastSync && (
                                            <div>
                                                Last Sync: {lastSync.toLocaleTimeString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Offline Content Indicator */}
                            {!isOnline && contentAvailableOffline && (
                                <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Cached content available</span>
                                </div>
                            )}

                            {/* No Offline Content Warning */}
                            {!isOnline && !contentAvailableOffline && (
                                <div className="flex items-center gap-1 text-orange-600">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>No offline content</span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Screen Reader Content */}
                <div className="sr-only">
                    <div>
                        Network status: {isOnline ? 'Online' : 'Offline'}
                        {syncStatus !== 'idle' && `, Sync status: ${syncStatus}`}
                        {!isOnline && contentAvailableOffline && ', Cached content available for offline viewing'}
                        {!isOnline && !contentAvailableOffline && ', No cached content available'}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InstagramOfflineIndicator;