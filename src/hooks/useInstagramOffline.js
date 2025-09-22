import { useState, useEffect, useCallback, useRef } from 'react';
import instagramServiceWorker from '../services/instagramServiceWorker';

/**
 * Custom hook for Instagram offline functionality
 * Manages offline state, caching, and sync operations
 */
const useInstagramOffline = ({
    enableOfflineSupport = true,
    enableAutoCache = true,
    enableBackgroundSync = true,
    cacheThreshold = 4 // Minimum posts to cache
} = {}) => {
    // State management
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
    const [cacheStatus, setCacheStatus] = useState(null);
    const [syncStatus, setSyncStatus] = useState('idle');
    const [offlineContent, setOfflineContent] = useState(null);
    const [lastSync, setLastSync] = useState(null);
    const [contentAvailableOffline, setContentAvailableOffline] = useState(false);
    const [updateAvailable, setUpdateAvailable] = useState(false);

    // Refs
    const syncTimeoutRef = useRef(null);
    const cacheTimeoutRef = useRef(null);

    // Initialize offline functionality
    useEffect(() => {
        if (!enableOfflineSupport) return;

        const initializeOffline = async () => {
            try {
                // Check if service worker is ready
                if (instagramServiceWorker.isActive()) {
                    setIsServiceWorkerReady(true);
                    await updateCacheStatus();
                    await checkOfflineContent();
                }
            } catch (error) {
                console.error('Failed to initialize offline functionality:', error);
            }
        };

        initializeOffline();
    }, [enableOfflineSupport]);

    // Set up event listeners
    useEffect(() => {
        if (!enableOfflineSupport) return;

        const handleOnline = () => {
            setIsOnline(true);
            if (enableBackgroundSync) {
                scheduleSync();
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        const handleSyncStart = () => {
            setSyncStatus('syncing');
        };

        const handleSyncSuccess = ({ data }) => {
            setSyncStatus('success');
            setLastSync(new Date());

            // Auto-hide success status after 3 seconds
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
            syncTimeoutRef.current = setTimeout(() => {
                setSyncStatus('idle');
            }, 3000);

            // Update cache if auto-cache is enabled
            if (enableAutoCache && data) {
                handleAutoCacheUpdate(data);
            }
        };

        const handleSyncError = ({ error }) => {
            setSyncStatus('error');
            console.error('Background sync failed:', error);

            // Auto-hide error status after 5 seconds
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
            syncTimeoutRef.current = setTimeout(() => {
                setSyncStatus('idle');
            }, 5000);
        };

        const handleCacheStatusUpdate = ({ status }) => {
            setCacheStatus(status);
            setContentAvailableOffline(status && status.entryCount > 0);
        };

        const handlePostsCached = ({ posts }) => {
            console.log('Posts cached for offline use:', posts.length);
            updateCacheStatus();
        };

        const handleCacheCleared = () => {
            console.log('Cache cleared');
            setCacheStatus(null);
            setContentAvailableOffline(false);
            setOfflineContent(null);
        };

        const handleUpdateAvailable = () => {
            setUpdateAvailable(true);
        };

        // Set up service worker event listeners
        const unsubscribeOnline = instagramServiceWorker.on('online', handleOnline);
        const unsubscribeOffline = instagramServiceWorker.on('offline', handleOffline);
        const unsubscribeSyncStart = instagramServiceWorker.on('sync-start', handleSyncStart);
        const unsubscribeSyncSuccess = instagramServiceWorker.on('sync-success', handleSyncSuccess);
        const unsubscribeSyncError = instagramServiceWorker.on('sync-error', handleSyncError);
        const unsubscribeCacheStatus = instagramServiceWorker.on('cache-status-updated', handleCacheStatusUpdate);
        const unsubscribePostsCached = instagramServiceWorker.on('posts-cached', handlePostsCached);
        const unsubscribeCacheCleared = instagramServiceWorker.on('cache-cleared', handleCacheCleared);
        const unsubscribeUpdateAvailable = instagramServiceWorker.on('update-available', handleUpdateAvailable);

        return () => {
            unsubscribeOnline();
            unsubscribeOffline();
            unsubscribeSyncStart();
            unsubscribeSyncSuccess();
            unsubscribeSyncError();
            unsubscribeCacheStatus();
            unsubscribePostsCached();
            unsubscribeCacheCleared();
            unsubscribeUpdateAvailable();

            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
            if (cacheTimeoutRef.current) {
                clearTimeout(cacheTimeoutRef.current);
            }
        };
    }, [enableOfflineSupport, enableBackgroundSync, enableAutoCache]);

    // Update cache status
    const updateCacheStatus = useCallback(async () => {
        if (!isServiceWorkerReady) return;

        try {
            const status = await instagramServiceWorker.getCacheStatus();
            setCacheStatus(status);
            setContentAvailableOffline(status && status.entryCount > 0);
        } catch (error) {
            console.error('Failed to update cache status:', error);
        }
    }, [isServiceWorkerReady]);

    // Check for offline content
    const checkOfflineContent = useCallback(async () => {
        if (!isServiceWorkerReady) return;

        try {
            const content = await instagramServiceWorker.getOfflineContent();
            setOfflineContent(content);
        } catch (error) {
            console.error('Failed to check offline content:', error);
        }
    }, [isServiceWorkerReady]);

    // Cache posts for offline use
    const cachePosts = useCallback(async (posts) => {
        if (!isServiceWorkerReady || !posts || posts.length === 0) {
            return { success: false, error: 'Invalid posts or service worker not ready' };
        }

        try {
            await instagramServiceWorker.cacheInstagramPosts(posts);
            await updateCacheStatus();
            return { success: true };
        } catch (error) {
            console.error('Failed to cache posts:', error);
            return { success: false, error: error.message };
        }
    }, [isServiceWorkerReady, updateCacheStatus]);

    // Auto-cache posts when they're fetched
    const handleAutoCacheUpdate = useCallback(async (data) => {
        if (!enableAutoCache || !data) return;

        try {
            let posts = [];

            if (data.posts) {
                posts = data.posts;
            } else if (Array.isArray(data)) {
                posts = data;
            }

            if (posts.length >= cacheThreshold) {
                // Debounce cache updates
                if (cacheTimeoutRef.current) {
                    clearTimeout(cacheTimeoutRef.current);
                }

                cacheTimeoutRef.current = setTimeout(() => {
                    cachePosts(posts);
                }, 1000);
            }
        } catch (error) {
            console.error('Auto-cache update failed:', error);
        }
    }, [enableAutoCache, cacheThreshold, cachePosts]);

    // Clear cache
    const clearCache = useCallback(async () => {
        if (!isServiceWorkerReady) {
            return { success: false, error: 'Service worker not ready' };
        }

        try {
            await instagramServiceWorker.clearCache();
            return { success: true };
        } catch (error) {
            console.error('Failed to clear cache:', error);
            return { success: false, error: error.message };
        }
    }, [isServiceWorkerReady]);

    // Request background sync
    const requestSync = useCallback(async () => {
        if (!isServiceWorkerReady || !enableBackgroundSync) {
            return { success: false, error: 'Background sync not available' };
        }

        try {
            await instagramServiceWorker.requestSync();
            return { success: true };
        } catch (error) {
            console.error('Failed to request sync:', error);
            return { success: false, error: error.message };
        }
    }, [isServiceWorkerReady, enableBackgroundSync]);

    // Schedule sync with delay
    const scheduleSync = useCallback((delay = 1000) => {
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }

        syncTimeoutRef.current = setTimeout(() => {
            requestSync();
        }, delay);
    }, [requestSync]);

    // Update service worker
    const updateServiceWorker = useCallback(async () => {
        try {
            await instagramServiceWorker.updateServiceWorker();
            setUpdateAvailable(false);
            return { success: true };
        } catch (error) {
            console.error('Failed to update service worker:', error);
            return { success: false, error: error.message };
        }
    }, []);

    // Get network information
    const getNetworkInfo = useCallback(() => {
        return instagramServiceWorker.getNetworkStatus();
    }, []);

    // Check if offline mode is available
    const isOfflineModeAvailable = useCallback(() => {
        return isServiceWorkerReady && contentAvailableOffline;
    }, [isServiceWorkerReady, contentAvailableOffline]);

    // Get offline posts
    const getOfflinePosts = useCallback(async () => {
        if (!isOfflineModeAvailable()) {
            return null;
        }

        try {
            const content = await instagramServiceWorker.getOfflineContent();
            return content?.posts || null;
        } catch (error) {
            console.error('Failed to get offline posts:', error);
            return null;
        }
    }, [isOfflineModeAvailable]);

    // Force cache update for specific posts
    const forceCacheUpdate = useCallback(async (posts) => {
        if (!posts || posts.length === 0) return;

        const result = await cachePosts(posts);
        if (result.success) {
            await checkOfflineContent();
        }
        return result;
    }, [cachePosts, checkOfflineContent]);

    // Get cache size estimate
    const getCacheSize = useCallback(() => {
        if (!cacheStatus) return 0;

        // Rough estimate based on entry count
        // Assume average of 100KB per cached item (images + data)
        return cacheStatus.entryCount * 100 * 1024; // bytes
    }, [cacheStatus]);

    // Check if posts should be cached
    const shouldCachePosts = useCallback((posts) => {
        if (!enableAutoCache || !posts) return false;
        return posts.length >= cacheThreshold;
    }, [enableAutoCache, cacheThreshold]);

    return {
        // State
        isOnline,
        isServiceWorkerReady,
        cacheStatus,
        syncStatus,
        offlineContent,
        lastSync,
        contentAvailableOffline,
        updateAvailable,

        // Actions
        cachePosts,
        clearCache,
        requestSync,
        scheduleSync,
        updateServiceWorker,
        forceCacheUpdate,

        // Getters
        getNetworkInfo,
        getOfflinePosts,
        getCacheSize,
        isOfflineModeAvailable,
        shouldCachePosts,

        // Handlers
        handleAutoCacheUpdate,

        // Utils
        updateCacheStatus,
        checkOfflineContent
    };
};

export default useInstagramOffline;