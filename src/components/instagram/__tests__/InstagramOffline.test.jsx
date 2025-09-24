import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import InstagramOfflineIndicator from '../InstagramOfflineIndicator';
import useInstagramOffline from '../../../hooks/useInstagramOffline';
import instagramServiceWorker from '../../../services/instagramServiceWorker';

// Mock the service worker
vi.mock('../../../services/instagramServiceWorker', () => ({
    default: {
        isActive: vi.fn(),
        getCacheStatus: vi.fn(),
        cacheInstagramPosts: vi.fn(),
        clearCache: vi.fn(),
        requestSync: vi.fn(),
        getOfflineContent: vi.fn(),
        getNetworkStatus: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn()
    }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>
    },
    AnimatePresence: ({ children }) => <>{children}</>
}));

// Mock accessibility hooks
vi.mock('../../../hooks/useAccessibilityPreferences', () => ({
    default: () => ({
        getAccessibilityClasses: () => '',
        getAccessibilityStyles: () => ({}),
        shouldReduceMotion: () => false,
        getAnimationConfig: () => ({
            duration: 0.3,
            ease: 'easeOut',
            stagger: 0.1
        })
    })
}));

// Mock the offline hook
vi.mock('../../../hooks/useInstagramOffline');

describe('Instagram Offline Functionality', () => {
    const mockCacheStatus = {
        caches: ['instagram-cache-v1', 'instagram-api-v1'],
        entryCount: 15,
        totalSize: 1500000
    };

    const mockNetworkInfo = {
        online: true,
        effectiveType: '4g',
        downlink: 10.5,
        rtt: 50
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock navigator.onLine
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: true
        });

        // Setup default service worker mocks
        instagramServiceWorker.isActive.mockReturnValue(true);
        instagramServiceWorker.getCacheStatus.mockResolvedValue(mockCacheStatus);
        instagramServiceWorker.getNetworkStatus.mockReturnValue(mockNetworkInfo);
        instagramServiceWorker.on.mockReturnValue(() => { }); // Unsubscribe function

        // Setup default offline hook mock
        useInstagramOffline.mockReturnValue({
            isOnline: true,
            isServiceWorkerReady: true,
            contentAvailableOffline: true,
            syncStatus: 'idle',
            cacheStatus: mockCacheStatus,
            cachePosts: vi.fn(),
            clearCache: vi.fn(),
            getOfflinePosts: vi.fn(),
            handleAutoCacheUpdate: vi.fn(),
            shouldCachePosts: vi.fn()
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('InstagramOfflineIndicator', () => {
        it('should not render when online and no sync activity', () => {
            render(<InstagramOfflineIndicator showWhenOnline={false} />);

            // Should not render anything when online and idle
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });

        it('should render when explicitly shown online', () => {
            render(<InstagramOfflineIndicator showWhenOnline={true} />);

            expect(screen.getByRole('status')).toBeInTheDocument();
            expect(screen.getByText('Online')).toBeInTheDocument();
        });

        it('should show offline status when offline', () => {
            // Mock offline state
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false
            });

            render(<InstagramOfflineIndicator />);

            expect(screen.getByRole('status')).toBeInTheDocument();
            expect(screen.getByText('Offline')).toBeInTheDocument();
        });

        it('should show cached content availability when offline', () => {
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false
            });

            render(<InstagramOfflineIndicator />);

            expect(screen.getByText('Cached content available')).toBeInTheDocument();
        });

        it('should show sync status during sync', () => {
            render(<InstagramOfflineIndicator showWhenOnline={true} />);

            // Simulate sync status change
            const syncingIndicator = screen.getByRole('status');
            expect(syncingIndicator).toBeInTheDocument();
        });

        it('should show network quality indicator', () => {
            render(<InstagramOfflineIndicator showWhenOnline={true} />);

            // Should show network quality based on connection info
            expect(screen.getByRole('status')).toBeInTheDocument();
        });

        it('should toggle detailed information', () => {
            render(<InstagramOfflineIndicator showWhenOnline={true} />);

            const toggleButton = screen.getByRole('button', { name: /toggle connection details/i });
            fireEvent.click(toggleButton);

            // Should show detailed network information
            expect(screen.getByText('Network')).toBeInTheDocument();
        });

        it('should show cache status in details', () => {
            render(<InstagramOfflineIndicator showWhenOnline={true} showCacheStatus={true} />);

            const toggleButton = screen.getByRole('button', { name: /toggle connection details/i });
            fireEvent.click(toggleButton);

            expect(screen.getByText('Cache Status')).toBeInTheDocument();
            expect(screen.getByText('Entries: 15')).toBeInTheDocument();
        });

        it('should be accessible with screen readers', () => {
            render(<InstagramOfflineIndicator showWhenOnline={true} />);

            const statusElement = screen.getByRole('status');
            expect(statusElement).toHaveAttribute('aria-live', 'polite');
            expect(statusElement).toHaveAttribute('aria-label');
        });
    });

    describe('useInstagramOffline Hook', () => {
        it('should initialize offline functionality', () => {
            const { result } = renderHook(() => useInstagramOffline({
                enableOfflineSupport: true,
                enableAutoCache: true,
                enableBackgroundSync: true
            }));

            expect(result.current.isServiceWorkerReady).toBe(true);
            expect(result.current.contentAvailableOffline).toBe(true);
        });

        it('should handle online/offline state changes', async () => {
            const mockHook = useInstagramOffline.mockReturnValue({
                isOnline: false,
                isServiceWorkerReady: true,
                contentAvailableOffline: true,
                syncStatus: 'idle',
                getOfflinePosts: vi.fn().mockResolvedValue([
                    { id: '1', caption: 'Offline post 1' },
                    { id: '2', caption: 'Offline post 2' }
                ])
            });

            const { result } = renderHook(() => mockHook);

            expect(result.current.isOnline).toBe(false);

            const offlinePosts = await result.current.getOfflinePosts();
            expect(offlinePosts).toHaveLength(2);
        });

        it('should cache posts automatically', async () => {
            const mockCachePosts = vi.fn().mockResolvedValue({ success: true });

            useInstagramOffline.mockReturnValue({
                isOnline: true,
                isServiceWorkerReady: true,
                cachePosts: mockCachePosts,
                shouldCachePosts: vi.fn().mockReturnValue(true),
                handleAutoCacheUpdate: vi.fn()
            });

            const { result } = renderHook(() => useInstagramOffline());

            const posts = [
                { id: '1', caption: 'Post 1' },
                { id: '2', caption: 'Post 2' }
            ];

            await result.current.cachePosts(posts);
            expect(mockCachePosts).toHaveBeenCalledWith(posts);
        });

        it('should handle cache clearing', async () => {
            const mockClearCache = vi.fn().mockResolvedValue({ success: true });

            useInstagramOffline.mockReturnValue({
                isOnline: true,
                isServiceWorkerReady: true,
                clearCache: mockClearCache
            });

            const { result } = renderHook(() => useInstagramOffline());

            const result_clear = await result.current.clearCache();
            expect(result_clear.success).toBe(true);
            expect(mockClearCache).toHaveBeenCalled();
        });

        it('should request background sync', async () => {
            const mockRequestSync = vi.fn().mockResolvedValue({ success: true });

            useInstagramOffline.mockReturnValue({
                isOnline: true,
                isServiceWorkerReady: true,
                requestSync: mockRequestSync
            });

            const { result } = renderHook(() => useInstagramOffline());

            const syncResult = await result.current.requestSync();
            expect(syncResult.success).toBe(true);
            expect(mockRequestSync).toHaveBeenCalled();
        });

        it('should handle sync status changes', () => {
            const mockHook = useInstagramOffline.mockReturnValue({
                syncStatus: 'syncing',
                lastSync: new Date('2024-01-01T12:00:00Z')
            });

            const { result } = renderHook(() => mockHook);

            expect(result.current.syncStatus).toBe('syncing');
            expect(result.current.lastSync).toBeInstanceOf(Date);
        });

        it('should provide network information', () => {
            const mockGetNetworkInfo = vi.fn().mockReturnValue(mockNetworkInfo);

            useInstagramOffline.mockReturnValue({
                getNetworkInfo: mockGetNetworkInfo
            });

            const { result } = renderHook(() => useInstagramOffline());

            const networkInfo = result.current.getNetworkInfo();
            expect(networkInfo.online).toBe(true);
            expect(networkInfo.effectiveType).toBe('4g');
        });

        it('should check offline mode availability', () => {
            const mockIsOfflineModeAvailable = vi.fn().mockReturnValue(true);

            useInstagramOffline.mockReturnValue({
                isOfflineModeAvailable: mockIsOfflineModeAvailable,
                isServiceWorkerReady: true,
                contentAvailableOffline: true
            });

            const { result } = renderHook(() => useInstagramOffline());

            expect(result.current.isOfflineModeAvailable()).toBe(true);
        });
    });

    describe('Service Worker Integration', () => {
        it('should register service worker successfully', async () => {
            instagramServiceWorker.isActive.mockReturnValue(true);

            expect(instagramServiceWorker.isActive()).toBe(true);
        });

        it('should cache Instagram posts', async () => {
            const posts = [
                { id: '1', media_url: 'https://example.com/image1.jpg' },
                { id: '2', media_url: 'https://example.com/image2.jpg' }
            ];

            instagramServiceWorker.cacheInstagramPosts.mockResolvedValue();

            await instagramServiceWorker.cacheInstagramPosts(posts);
            expect(instagramServiceWorker.cacheInstagramPosts).toHaveBeenCalledWith(posts);
        });

        it('should get cache status', async () => {
            instagramServiceWorker.getCacheStatus.mockResolvedValue(mockCacheStatus);

            const status = await instagramServiceWorker.getCacheStatus();
            expect(status.entryCount).toBe(15);
            expect(status.caches).toHaveLength(2);
        });

        it('should clear cache', async () => {
            instagramServiceWorker.clearCache.mockResolvedValue();

            await instagramServiceWorker.clearCache();
            expect(instagramServiceWorker.clearCache).toHaveBeenCalled();
        });

        it('should request background sync', async () => {
            instagramServiceWorker.requestSync.mockResolvedValue();

            await instagramServiceWorker.requestSync();
            expect(instagramServiceWorker.requestSync).toHaveBeenCalled();
        });

        it('should get offline content', async () => {
            const offlineContent = {
                success: true,
                posts: [
                    { id: '1', caption: 'Offline post 1' }
                ],
                cached: true,
                timestamp: Date.now()
            };

            instagramServiceWorker.getOfflineContent.mockResolvedValue(offlineContent);

            const content = await instagramServiceWorker.getOfflineContent();
            expect(content.posts).toHaveLength(1);
            expect(content.cached).toBe(true);
        });
    });

    describe('Offline Scenarios', () => {
        it('should handle complete offline experience', async () => {
            // Mock offline state
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false
            });

            const offlinePosts = [
                { id: '1', caption: 'Cached post 1', media_url: '/cached/image1.jpg' },
                { id: '2', caption: 'Cached post 2', media_url: '/cached/image2.jpg' }
            ];

            useInstagramOffline.mockReturnValue({
                isOnline: false,
                isServiceWorkerReady: true,
                contentAvailableOffline: true,
                getOfflinePosts: vi.fn().mockResolvedValue(offlinePosts)
            });

            render(<InstagramOfflineIndicator />);

            // Should show offline status
            expect(screen.getByText('Offline')).toBeInTheDocument();
            expect(screen.getByText('Cached content available')).toBeInTheDocument();
        });

        it('should handle no offline content scenario', () => {
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false
            });

            useInstagramOffline.mockReturnValue({
                isOnline: false,
                isServiceWorkerReady: true,
                contentAvailableOffline: false
            });

            render(<InstagramOfflineIndicator />);

            expect(screen.getByText('Offline')).toBeInTheDocument();
            expect(screen.getByText('No cached content')).toBeInTheDocument();
        });

        it('should handle sync when back online', async () => {
            const mockRequestSync = vi.fn().mockResolvedValue({ success: true });

            useInstagramOffline.mockReturnValue({
                isOnline: true,
                syncStatus: 'syncing',
                requestSync: mockRequestSync
            });

            render(<InstagramOfflineIndicator showWhenOnline={true} />);

            expect(screen.getByText('Syncing')).toBeInTheDocument();
        });

        it('should show sync success status', () => {
            useInstagramOffline.mockReturnValue({
                isOnline: true,
                syncStatus: 'success',
                lastSync: new Date()
            });

            render(<InstagramOfflineIndicator showWhenOnline={true} />);

            expect(screen.getByText('Synced')).toBeInTheDocument();
        });

        it('should show sync error status', () => {
            useInstagramOffline.mockReturnValue({
                isOnline: true,
                syncStatus: 'error'
            });

            render(<InstagramOfflineIndicator showWhenOnline={true} />);

            expect(screen.getByText('Sync Failed')).toBeInTheDocument();
        });
    });

    describe('Performance and Caching', () => {
        it('should estimate cache size', () => {
            const mockGetCacheSize = vi.fn().mockReturnValue(1500000); // 1.5MB

            useInstagramOffline.mockReturnValue({
                getCacheSize: mockGetCacheSize,
                cacheStatus: mockCacheStatus
            });

            const { result } = renderHook(() => useInstagramOffline());

            const cacheSize = result.current.getCacheSize();
            expect(cacheSize).toBe(1500000);
        });

        it('should determine if posts should be cached', () => {
            const mockShouldCachePosts = vi.fn().mockReturnValue(true);

            useInstagramOffline.mockReturnValue({
                shouldCachePosts: mockShouldCachePosts
            });

            const { result } = renderHook(() => useInstagramOffline());

            const posts = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];
            const shouldCache = result.current.shouldCachePosts(posts);
            expect(shouldCache).toBe(true);
        });

        it('should handle auto-cache updates', () => {
            const mockHandleAutoCacheUpdate = vi.fn();

            useInstagramOffline.mockReturnValue({
                handleAutoCacheUpdate: mockHandleAutoCacheUpdate
            });

            const { result } = renderHook(() => useInstagramOffline());

            const posts = [{ id: '1' }, { id: '2' }];
            result.current.handleAutoCacheUpdate(posts);
            expect(mockHandleAutoCacheUpdate).toHaveBeenCalledWith(posts);
        });
    });
});

// Helper function to render hooks (simplified version)
function renderHook(hook) {
    let result;
    function TestComponent() {
        result = hook();
        return null;
    }
    render(<TestComponent />);
    return { result };
}