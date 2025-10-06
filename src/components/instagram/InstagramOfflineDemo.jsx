import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Wifi,
    WifiOff,
    Download,
    Trash2,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    Archive,
    Clock,
    HardDrive
} from 'lucide-react';
import InstagramOfflineIndicator from './InstagramOfflineIndicator';
import InstagramFallback from './InstagramFallback';
import useInstagramOffline from '../../hooks/useInstagramOffline';
import useAccessibilityPreferences from '../../hooks/useAccessibilityPreferences';

/**
 * InstagramOfflineDemo - Comprehensive demo of offline functionality
 * Shows all offline features including caching, sync, and fallback content
 */
const InstagramOfflineDemo = () => {
    // Offline functionality
    const {
        isOnline,
        isServiceWorkerReady,
        cacheStatus,
        syncStatus,
        contentAvailableOffline,
        lastSync,
        updateAvailable,
        cachePosts,
        clearCache,
        requestSync,
        getOfflinePosts,
        getCacheSize,
        isOfflineModeAvailable,
        updateServiceWorker
    } = useInstagramOffline({
        enableOfflineSupport: true,
        enableAutoCache: true,
        enableBackgroundSync: true,
        cacheThreshold: 2
    });

    // Demo state
    const [demoMode, setDemoMode] = useState('online'); // 'online', 'offline', 'sync'
    const [cachedPosts, setCachedPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Accessibility
    const { getAccessibilityClasses, getAccessibilityStyles } = useAccessibilityPreferences();

    // Sample posts for demo
    const samplePosts = [
        {
            id: '1',
            caption: 'Beautiful sunset at the beach 🌅 #sunset #beach #nature',
            media_url: '/img/hero.webp',
            permalink: 'https://instagram.com/p/demo1',
            timestamp: new Date().toISOString(),
            stats: { likes: 245, comments: 18 }
        },
        {
            id: '2',
            caption: 'Coffee and code ☕️ #developer #coffee #coding',
            media_url: '/img/drphilipe_perfil.webp',
            permalink: 'https://instagram.com/p/demo2',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            stats: { likes: 156, comments: 12 }
        },
        {
            id: '3',
            caption: 'Weekend vibes 🎉 #weekend #fun #friends',
            media_url: '/img/clinic_facade.webp',
            permalink: 'https://instagram.com/p/demo3',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            stats: { likes: 89, comments: 7 }
        },
        {
            id: '4',
            caption: 'New project launch! 🚀 #project #launch #excited',
            media_url: '/img/placeholder.svg',
            permalink: 'https://instagram.com/p/demo4',
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            stats: { likes: 312, comments: 25 }
        }
    ];

    // Load cached posts on mount
    useEffect(() => {
        if (isOfflineModeAvailable()) {
            loadCachedPosts();
        }
    }, [isOfflineModeAvailable]);

    // Load cached posts
    const loadCachedPosts = async () => {
        try {
            const posts = await getOfflinePosts();
            if (posts) {
                setCachedPosts(posts);
            }
        } catch (error) {
            console.error('Failed to load cached posts:', error);
        }
    };

    // Handle cache posts
    const handleCachePosts = async () => {
        setIsLoading(true);
        setMessage('');

        try {
            const result = await cachePosts(samplePosts);
            if (result.success) {
                setMessage('Posts cached successfully for offline viewing!');
                await loadCachedPosts();
            } else {
                setMessage(`Failed to cache posts: ${result.error}`);
            }
        } catch (error) {
            setMessage(`Error caching posts: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle clear cache
    const handleClearCache = async () => {
        setIsLoading(true);
        setMessage('');

        try {
            const result = await clearCache();
            if (result.success) {
                setMessage('Cache cleared successfully!');
                setCachedPosts([]);
            } else {
                setMessage(`Failed to clear cache: ${result.error}`);
            }
        } catch (error) {
            setMessage(`Error clearing cache: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle sync request
    const handleRequestSync = async () => {
        setIsLoading(true);
        setMessage('');

        try {
            const result = await requestSync();
            if (result.success) {
                setMessage('Background sync requested successfully!');
            } else {
                setMessage(`Failed to request sync: ${result.error}`);
            }
        } catch (error) {
            setMessage(`Error requesting sync: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle service worker update
    const handleUpdateServiceWorker = async () => {
        setIsLoading(true);
        setMessage('');

        try {
            const result = await updateServiceWorker();
            if (result.success) {
                setMessage('Service worker updated successfully!');
            } else {
                setMessage(`Failed to update service worker: ${result.error}`);
            }
        } catch (error) {
            setMessage(`Error updating service worker: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Simulate offline mode
    const simulateOffline = () => {
        setDemoMode('offline');
        setMessage('Simulating offline mode - showing cached content');
    };

    // Simulate online mode
    const simulateOnline = () => {
        setDemoMode('online');
        setMessage('Back online - fresh content available');
    };

    // Format cache size
    const formatCacheSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'syncing':
                return 'text-cyan-600';
            case 'success':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className={`instagram-offline-demo p-6 max-w-4xl mx-auto ${getAccessibilityClasses()}`} style={getAccessibilityStyles()}>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Instagram Offline Functionality Demo
                </h1>
                <p className="text-gray-600">
                    This demo shows how Instagram content works offline with caching,
                    background sync, and fallback content.
                </p>
            </div>

            {/* Offline Indicator */}
            <div className="mb-8">
                <InstagramOfflineIndicator
                    showWhenOnline={true}
                    showCacheStatus={true}
                    showSyncStatus={true}
                    position="relative"
                    className="relative"
                />
            </div>

            {/* Status Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Connection Status */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                        {isOnline ? (
                            <Wifi className="w-5 h-5 text-green-600" />
                        ) : (
                            <WifiOff className="w-5 h-5 text-red-600" />
                        )}
                        <h3 className="font-medium text-gray-900">Connection</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Service Worker:</span>
                            <span className={isServiceWorkerReady ? 'text-green-600' : 'text-red-600'}>
                                {isServiceWorkerReady ? 'Ready' : 'Not Ready'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Demo Mode:</span>
                            <span className="text-cyan-600 capitalize">{demoMode}</span>
                        </div>
                    </div>
                </div>

                {/* Cache Status */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <Archive className="w-5 h-5 text-cyan-600" />
                        <h3 className="font-medium text-gray-900">Cache</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Entries:</span>
                            <span className="text-gray-900">
                                {cacheStatus?.entryCount || 0}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Size:</span>
                            <span className="text-gray-900">
                                {formatCacheSize(getCacheSize())}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Offline Content:</span>
                            <span className={contentAvailableOffline ? 'text-green-600' : 'text-red-600'}>
                                {contentAvailableOffline ? 'Available' : 'None'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sync Status */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <RefreshCw className={`w-5 h-5 ${getStatusColor(syncStatus)} ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                        <h3 className="font-medium text-gray-900">Sync</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={getStatusColor(syncStatus)}>
                                {syncStatus.charAt(0).toUpperCase() + syncStatus.slice(1)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Last Sync:</span>
                            <span className="text-gray-900">
                                {lastSync ? lastSync.toLocaleTimeString() : 'Never'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Update Available:</span>
                            <span className={updateAvailable ? 'text-orange-600' : 'text-gray-600'}>
                                {updateAvailable ? 'Yes' : 'No'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Controls</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {/* Cache Posts */}
                    <button
                        onClick={handleCachePosts}
                        disabled={isLoading || !isServiceWorkerReady}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Cache Posts
                    </button>

                    {/* Clear Cache */}
                    <button
                        onClick={handleClearCache}
                        disabled={isLoading || !isServiceWorkerReady}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear Cache
                    </button>

                    {/* Request Sync */}
                    <button
                        onClick={handleRequestSync}
                        disabled={isLoading || !isServiceWorkerReady}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Sync Now
                    </button>

                    {/* Update SW */}
                    {updateAvailable && (
                        <button
                            onClick={handleUpdateServiceWorker}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Update SW
                        </button>
                    )}
                </div>

                {/* Demo Mode Controls */}
                <div className="flex gap-4">
                    <button
                        onClick={simulateOnline}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${demoMode === 'online'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <Wifi className="w-4 h-4" />
                        Simulate Online
                    </button>

                    <button
                        onClick={simulateOffline}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${demoMode === 'offline'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <WifiOff className="w-4 h-4" />
                        Simulate Offline
                    </button>
                </div>

                {/* Status Message */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-blue-50 border border-cyan-200 rounded-md"
                    >
                        <p className="text-sm text-cyan-800">{message}</p>
                    </motion.div>
                )}
            </div>

            {/* Content Display */}
            <div className="space-y-8">
                {/* Online Content */}
                {demoMode === 'online' && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <Wifi className="w-5 h-5 text-green-600" />
                            Online Content
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {samplePosts.map((post) => (
                                <div key={post.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <img
                                        src={post.media_url}
                                        alt={post.caption}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4">
                                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                                            {post.caption}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>❤️ {post.stats.likes}</span>
                                            <span>💬 {post.stats.comments}</span>
                                            <span>🕒 {new Date(post.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Offline Content */}
                {demoMode === 'offline' && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <WifiOff className="w-5 h-5 text-red-600" />
                            Offline Mode
                        </h3>

                        {contentAvailableOffline && cachedPosts.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
                                    <CheckCircle className="w-4 h-4" />
                                    Showing cached content from your last visit
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {cachedPosts.map((post) => (
                                        <div key={post.id} className="border border-gray-200 rounded-lg overflow-hidden opacity-90">
                                            <img
                                                src={post.media_url}
                                                alt={post.caption}
                                                className="w-full h-48 object-cover"
                                            />
                                            <div className="p-4">
                                                <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                                                    {post.caption}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span>❤️ {post.stats?.likes || 0}</span>
                                                    <span>💬 {post.stats?.comments || 0}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Archive className="w-3 h-3" />
                                                        Cached
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <InstagramFallback
                                type="network"
                                fallbackPosts={samplePosts.slice(0, 2)}
                                showRetry={false}
                                showOfflineMessage={true}
                                showCachedContent={false}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Technical Details */}
            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-gray-600" />
                    Technical Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Service Worker Features</h4>
                        <ul className="space-y-1 text-gray-600">
                            <li>• Automatic content caching</li>
                            <li>• Background synchronization</li>
                            <li>• Offline fallback responses</li>
                            <li>• Cache management and cleanup</li>
                            <li>• Network-first strategy for API calls</li>
                            <li>• Cache-first strategy for images</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Offline Capabilities</h4>
                        <ul className="space-y-1 text-gray-600">
                            <li>• View cached Instagram posts</li>
                            <li>• Automatic sync when back online</li>
                            <li>• Graceful degradation</li>
                            <li>• Cache size monitoring</li>
                            <li>• Network status detection</li>
                            <li>• Progressive enhancement</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstagramOfflineDemo;