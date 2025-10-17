/**
 * Instagram Service Worker Manager
 * Handles service worker registration, communication, and offline functionality
 */

class InstagramServiceWorkerManager {
    constructor(globalScope = (typeof window !== 'undefined' ? window : globalThis)) {
        this.globalScope = globalScope;
        this.registration = null;
        this.isOnline = this.getNavigator()?.onLine ?? false;
        this.listeners = new Map();
        this.syncQueue = [];
        this.cacheStatus = null;

        // Bind methods
        this.handleOnline = this.handleOnline.bind(this);
        this.handleOffline = this.handleOffline.bind(this);
        this.handleMessage = this.handleMessage.bind(this);

        this.initializationPromise = null;
        this.initialized = false;
    }

    /**
     * Initialize service worker manager
     */
    async init() {
        const navigatorRef = this.getNavigator();
        const windowRef = this.getWindow();

        if (!navigatorRef || !windowRef || !('serviceWorker' in navigatorRef)) {
            console.warn('Service workers not supported');
            return;
        }

        windowRef.addEventListener('online', this.handleOnline);
        windowRef.addEventListener('offline', this.handleOffline);

        navigatorRef.serviceWorker.addEventListener('message', this.handleMessage);

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
        const navigatorRef = this.getNavigator();

        if (!navigatorRef || !('serviceWorker' in navigatorRef)) {
            console.warn('Service workers not supported');
            return null;
        }

        try {
            this.registration = await navigatorRef.serviceWorker.register('/instagram-sw.js', {
                scope: '/'
            });

            console.log('Instagram service worker registered:', this.registration);

            // Handle service worker updates
            this.registration.addEventListener('updatefound', () => {
                const newWorker = this.registration.installing;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigatorRef.serviceWorker.controller) {
                        // New service worker available
                        this.emit('update-available', { registration: this.registration });
                    }
                });
            });

            // Wait for service worker to be ready
            await navigatorRef.serviceWorker.ready;
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
        this.ensureInitialized().catch(() => { });
        return this.registration && this.registration.active;
    }

    /**
     * Send message to service worker
     */
    async sendMessage(message) {
        const ready = await this.ensureInitialized();

        if (!ready || !this.isActive()) {
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
        const ready = await this.ensureInitialized();

        if (!ready || !this.isActive()) {
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
        const ready = await this.ensureInitialized();

        if (!ready || !this.isActive()) {
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
        const ready = await this.ensureInitialized();

        if (!ready) {
            return null;
        }

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
        const ready = await this.ensureInitialized();

        if (!ready) {
            console.warn('Service worker not active, cannot request sync');
            return;
        }

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
        const ready = await this.ensureInitialized();

        if (!ready) {
            return false;
        }

        if (!this.cacheStatus) {
            await this.getCacheStatus();
        }

        return this.cacheStatus && this.cacheStatus.entryCount > 0;
    }

    /**
     * Get offline content
     */
    async getOfflineContent() {
        const ready = await this.ensureInitialized();

        if (!ready) {
            return null;
        }

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
        const ready = await this.ensureInitialized();

        if (!ready) {
            return;
        }

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
        this.ensureInitialized().catch(() => { });
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
        const navigatorRef = this.getNavigator();
        const connection = navigatorRef?.connection;
        return {
            online: this.isOnline,
            effectiveType: connection?.effectiveType ?? null,
            downlink: connection?.downlink ?? null,
            rtt: connection?.rtt ?? null
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        const windowRef = this.getWindow();
        const navigatorRef = this.getNavigator();

        windowRef?.removeEventListener('online', this.handleOnline);
        windowRef?.removeEventListener('offline', this.handleOffline);
        navigatorRef?.serviceWorker?.removeEventListener('message', this.handleMessage);
        this.listeners.clear();
        this.syncQueue = [];
    }

    async ensureInitialized() {
        if (!this.canUseServiceWorkers()) {
            return false;
        }

        if (this.initialized) {
            return true;
        }

        if (!this.initializationPromise) {
            this.initializationPromise = this.init().then(() => {
                this.initialized = true;
                return true;
            }).catch(error => {
                this.initializationPromise = null;
                throw error;
            });
        }

        try {
            await this.initializationPromise;
            return true;
        } catch (error) {
            console.error('Failed to initialize Instagram Service Worker Manager:', error);
            return false;
        }
    }

    getNavigator() {
        if (!this.globalScope || typeof this.globalScope.navigator === 'undefined') {
            return null;
        }

        return this.globalScope.navigator;
    }

    getWindow() {
        if (!this.globalScope || typeof this.globalScope.addEventListener !== 'function') {
            return null;
        }

        return this.globalScope;
    }

    canUseServiceWorkers() {
        const navigatorRef = this.getNavigator();
        return !!navigatorRef && 'serviceWorker' in navigatorRef;
    }
}

const createFallbackManager = () => ({
    init: async () => { },
    ensureInitialized: async () => false,
    register: async () => null,
    unregister: async () => { },
    isActive: () => false,
    sendMessage: async () => { throw new Error('Service worker not active'); },
    cacheInstagramPosts: async () => { },
    clearCache: async () => { },
    getCacheStatus: async () => null,
    requestSync: async () => { },
    handleOnline: () => { },
    handleOffline: () => { },
    handleMessage: () => { },
    addToSyncQueue: () => { },
    processSyncQueue: async () => { },
    executeAction: async () => { },
    isContentAvailableOffline: async () => false,
    getOfflineContent: async () => null,
    updateServiceWorker: async () => { },
    on: () => () => { },
    off: () => { },
    emit: () => { },
    getNetworkStatus: () => ({
        online: false,
        effectiveType: null,
        downlink: null,
        rtt: null
    }),
    destroy: () => { }
});

let sharedManager = null;

export const getInstagramServiceWorkerManager = () => {
    if (sharedManager) {
        return sharedManager;
    }

    const hasWindow = typeof window !== 'undefined';
    const navigatorRef = hasWindow ? window.navigator : undefined;

    if (navigatorRef && 'serviceWorker' in navigatorRef) {
        sharedManager = new InstagramServiceWorkerManager(window);
    } else {
        sharedManager = createFallbackManager();
    }

    return sharedManager;
};

const instagramServiceWorker = new Proxy({}, {
    get: (_target, property) => {
        const manager = getInstagramServiceWorkerManager();
        const value = manager[property];
        if (typeof value === 'function') {
            return value.bind(manager);
        }
        return value;
    }
});

export default instagramServiceWorker;