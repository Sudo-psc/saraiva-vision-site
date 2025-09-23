/**
 * Instagram Service Worker Manager
 * Handles service worker registration, communication, and offline functionality
 */

class InstagramServiceWorkerManager {
    constructor() {
        this.registration = null;
        this.isOnline = navigator.onLine;
        this.listeners = new Map();
        this.syncQueue = [];
        this.cacheStatus = null;

        // Bind methods
        this.handleOnline = this.handleOnline.bind(this);
        this.handleOffline = this.handleOffline.bind(this);
        this.handleMessage = this.handleMessage.bind(this);

        // Initialize
        this.init();
    }

    /**
     * Initialize service worker manager
     */
    async init() {
        // Check if service workers are supported
        if (!('serviceWorker' in navigator)) {
            console.warn('Service workers not supported');
            return;
        }

        // Listen for online/offline events
        window.addEventListener('online', this.handleOnline);
        window.addEventListener('offline', this.handleOffline);

        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', this.handleMessage);

        try {
            await this.register();
            await this.getCacheStatus();
        } catch (error) {
            console.error('Failed to initialize service worker:', error);
        }
    }

    /**
     * Register the service worker
     */
    async register() {
        try {
            this.registration = await navigator.serviceWorker.register('/instagram-sw.js', {
                scope: '/'
            });

            console.log('Instagram service worker registered:', this.registration);

            // Handle service worker updates
            this.registration.addEventListener('updatefound', () => {
                const newWorker = this.registration.installing;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New service worker available
                        this.emit('update-available', { registration: this.registration });
                    }
                });
            });

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;
            console.log('Instagram service worker ready');

            return this.registration;
        } catch (error) {
            console.error('Service worker registration failed:', error);
            throw error;
        }
    }

    /**
     * Unregister the service worker
     */
    async unregister() {
        if (this.registration) {
            await this.registration.unregister();
            this.registration = null;
            console.log('Instagram service worker unregistered');
        }
    }

    /**
     * Check if service worker is active
     */
    isActive() {
        return this.registration && this.registration.active;
    }

    /**
     * Send message to service worker
     */
    async sendMessage(message) {
        if (!this.isActive()) {
            throw new Error('Service worker not active');
        }

        return new Promise((resolve, reject) => {
            const messageChannel = new MessageChannel();

            messageChannel.port1.onmessage = (event) => {
                if (event.data.error) {
                    reject(new Error(event.data.error));
                } else {
                    resolve(event.data);
                }
            };

            this.registration.active.postMessage(message, [messageChannel.port2]);
        });
    }

    /**
     * Cache Instagram posts for offline use
     */
    async cacheInstagramPosts(posts) {
        if (!this.isActive()) {
            console.warn('Service worker not active, cannot cache posts');
            return;
        }

        try {
            await this.sendMessage({
                type: 'CACHE_INSTAGRAM_POSTS',
                data: posts
            });

            console.log('Instagram posts cached for offline use');
            this.emit('posts-cached', { posts });
        } catch (error) {
            console.error('Failed to cache Instagram posts:', error);
            throw error;
        }
    }

    /**
     * Clear Instagram cache
     */
    async clearCache() {
        if (!this.isActive()) {
            console.warn('Service worker not active, cannot clear cache');
            return;
        }

        try {
            await this.sendMessage({
                type: 'CLEAR_INSTAGRAM_CACHE'
            });

            console.log('Instagram cache cleared');
            this.emit('cache-cleared');
            await this.getCacheStatus();
        } catch (error) {
            console.error('Failed to clear cache:', error);
            throw error;
        }
    }

    /**
     * Get cache status
     */
    async getCacheStatus() {
        if (!this.isActive()) {
            return null;
        }

        try {
            const status = await this.sendMessage({
                type: 'GET_CACHE_STATUS'
            });

            this.cacheStatus = status.status;
            this.emit('cache-status-updated', { status: this.cacheStatus });
            return this.cacheStatus;
        } catch (error) {
            console.error('Failed to get cache status:', error);
            return null;
        }
    }

    /**
     * Request background sync
     */
    async requestSync(tag = 'instagram-sync') {
        if (!this.registration || !this.registration.sync) {
            console.warn('Background sync not supported');
            return;
        }

        try {
            await this.registration.sync.register(tag);
            console.log('Background sync requested:', tag);
        } catch (error) {
            console.error('Failed to request background sync:', error);
        }
    }

    /**
     * Handle online event
     */
    handleOnline() {
        console.log('Instagram SW: Back online');
        this.isOnline = true;
        this.emit('online');

        // Request sync when back online
        this.requestSync('instagram-sync');

        // Process sync queue
        this.processSyncQueue();
    }

    /**
     * Handle offline event
     */
    handleOffline() {
        console.log('Instagram SW: Gone offline');
        this.isOnline = false;
        this.emit('offline');
    }

    /**
     * Handle service worker messages
     */
    handleMessage(event) {
        const { type, data, error } = event.data;

        switch (type) {
            case 'INSTAGRAM_SYNC_START':
                this.emit('sync-start');
                break;

            case 'INSTAGRAM_SYNC_SUCCESS':
                this.emit('sync-success', { data });
                break;

            case 'INSTAGRAM_SYNC_ERROR':
                this.emit('sync-error', { error });
                break;

            case 'CACHE_STATUS_RESPONSE':
                this.cacheStatus = data.status;
                this.emit('cache-status-updated', { status: this.cacheStatus });
                break;

            default:
                console.log('Unknown service worker message:', type, data);
        }
    }

    /**
     * Add action to sync queue for when back online
     */
    addToSyncQueue(action) {
        this.syncQueue.push({
            ...action,
            timestamp: Date.now()
        });
    }

    /**
     * Process queued actions when back online
     */
    async processSyncQueue() {
        if (!this.isOnline || this.syncQueue.length === 0) {
            return;
        }

        console.log('Processing sync queue:', this.syncQueue.length, 'items');

        const queue = [...this.syncQueue];
        this.syncQueue = [];

        for (const action of queue) {
            try {
                await this.executeAction(action);
            } catch (error) {
                console.error('Failed to execute queued action:', error);
                // Re-queue failed actions
                this.syncQueue.push(action);
            }
        }
    }

    /**
     * Execute a queued action
     */
    async executeAction(action) {
        switch (action.type) {
            case 'cache-posts':
                await this.cacheInstagramPosts(action.data);
                break;

            case 'clear-cache':
                await this.clearCache();
                break;

            default:
                console.warn('Unknown action type:', action.type);
        }
    }

    /**
     * Check if content is available offline
     */
    async isContentAvailableOffline() {
        if (!this.cacheStatus) {
            await this.getCacheStatus();
        }

        return this.cacheStatus && this.cacheStatus.entryCount > 0;
    }

    /**
     * Get offline content
     */
    async getOfflineContent() {
        try {
            const response = await fetch('/api/instagram/posts/offline');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to get offline content:', error);
        }
        return null;
    }

    /**
     * Update service worker
     */
    async updateServiceWorker() {
        if (!this.registration) {
            return;
        }

        try {
            await this.registration.update();

            if (this.registration.waiting) {
                // Tell the waiting service worker to skip waiting
                this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
        } catch (error) {
            console.error('Failed to update service worker:', error);
        }
    }

    /**
     * Add event listener
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(event);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit event
     */
    emit(event, data = {}) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in event callback:', error);
                }
            });
        }
    }

    /**
     * Get network status
     */
    getNetworkStatus() {
        return {
            online: this.isOnline,
            effectiveType: navigator.connection?.effectiveType,
            downlink: navigator.connection?.downlink,
            rtt: navigator.connection?.rtt
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        window.removeEventListener('online', this.handleOnline);
        window.removeEventListener('offline', this.handleOffline);
        navigator.serviceWorker.removeEventListener('message', this.handleMessage);
        this.listeners.clear();
        this.syncQueue = [];
    }
}

// Create singleton instance
const instagramServiceWorker = new InstagramServiceWorkerManager();

export default instagramServiceWorker;