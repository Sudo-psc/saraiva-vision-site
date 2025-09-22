import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Instagram, RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import instagramService from '../../services/instagramService';
import instagramErrorHandler from '../../services/instagramErrorHandler';
import InstagramErrorBoundary from './InstagramErrorBoundary';
import InstagramFallback from './InstagramFallback';
import InstagramPost from './InstagramPost';
import InstagramStats from './InstagramStats';
import InstagramResponsiveGrid from './InstagramResponsiveGrid';
import { InstagramFeedSkeleton } from './InstagramSkeleton';
import useResponsiveLayout from '../../hooks/useResponsiveLayout';
import useInstagramPerformance from '../../hooks/useInstagramPerformance';
import useInstagramAccessibility from '../../hooks/useInstagramAccessibility';
import useAccessibilityPreferences from '../../hooks/useAccessibilityPreferences';
import useInstagramAccessibilityEnhanced from '../../hooks/useInstagramAccessibilityEnhanced';
import '../../styles/responsiveGrid.css';
import '../../styles/accessibility.css';

/**
 * InstagramFeedContainer - Main container component for Instagram feed
 * Manages state, data fetching, caching, and real-time updates
 */
const InstagramFeedContainer = ({
    maxPosts = 4,
    showStats = true,
    refreshInterval = 300000, // 5 minutes
    layout = 'grid',
    theme = 'light',
    enableLazyLoading = true,
    enableAccessibility = true,
    className = '',
    onPostClick = null,
    onError = null,
    onSuccess = null
}) => {
    // State management
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);
    const [cached, setCached] = useState(false);
    const [cacheAge, setCacheAge] = useState(0);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [refreshing, setRefreshing] = useState(false);
    const [fallbackPosts, setFallbackPosts] = useState([]);
    const [errorType, setErrorType] = useState('unknown');
    const [showFallback, setShowFallback] = useState(false);

    // Refs
    const containerRef = useRef(null);
    const refreshButtonRef = useRef(null);
    const unsubscribeRef = useRef(null);
    const postElementsRef = useRef([]);
    const skipLinkRef = useRef(null);

    // Responsive layout hook
    const {
        currentBreakpoint,
        deviceCapabilities,
        getGridColumns,
        createTouchHandler
    } = useResponsiveLayout();

    // Performance optimization hook
    const {
        preloadImages,
        getLoadingProgress,
        getPerformanceReport
    } = useInstagramPerformance({
        enableLazyLoading,
        enableImageOptimization: true,
        enablePerformanceMonitoring: true
    });

    // Accessibility hook
    const {
        focusedIndex,
        keyboardMode,
        screenReaderActive,
        announcements,
        announce,
        generateAriaLabel,
        handleKeyNavigation,
        registerFocusableElements,
        focusFirst,
        createLiveRegion
    } = useInstagramAccessibility({
        enableKeyboardNavigation: enableAccessibility,
        enableScreenReader: enableAccessibility,
        enableFocusManagement: enableAccessibility,
        announceUpdates: enableAccessibility
    });

    // Accessibility preferences hook
    const {
        getAccessibilityClasses,
        getAccessibilityStyles,
        getAnimationConfig,
        shouldReduceMotion,
        isHighContrast,
        getAccessibleColors
    } = useAccessibilityPreferences();

    // Enhanced Instagram accessibility hook
    const {
        instagramHighContrast,
        instagramReducedMotion,
        getInstagramHighContrastColors,
        getInstagramAnimationConfig,
        getInstagramAccessibilityClasses,
        getInstagramAccessibilityStyles,
        getInstagramFocusStyles,
        shouldDisableInstagramFeature
    } = useInstagramAccessibilityEnhanced({
        enableHighContrast: enableAccessibility,
        enableReducedMotion: enableAccessibility,
        enableSystemDetection: true
    });

    // Cache management
    const getCacheKey = useCallback(() => {
        return `instagram_posts_${maxPosts}_${showStats}`;
    }, [maxPosts, showStats]);

    const getCachedData = useCallback(() => {
        try {
            const cached = localStorage.getItem(getCacheKey());
            if (cached) {
                const data = JSON.parse(cached);
                const now = Date.now();
                const age = now - data.timestamp;

                // Return cached data if less than 5 minutes old
                if (age < refreshInterval) {
                    return {
                        posts: data.posts,
                        timestamp: new Date(data.timestamp),
                        age
                    };
                }
            }
        } catch (error) {
            console.warn('Failed to read cached Instagram data:', error);
        }
        return null;
    }, [getCacheKey, refreshInterval]);

    const setCachedData = useCallback((posts) => {
        try {
            const data = {
                posts,
                timestamp: Date.now()
            };
            localStorage.setItem(getCacheKey(), JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to cache Instagram data:', error);
        }
    }, [getCacheKey]);

    // Fetch posts from API with comprehensive error handling
    const fetchPosts = useCallback(async (force = false) => {
        const operationContext = instagramErrorHandler.createContext(
            'fetchPosts',
            '/api/instagram/posts'
        );

        try {
            setError(null);
            setShowFallback(false);

            // Check cache first if not forcing refresh
            if (!force) {
                const cachedData = getCachedData();
                if (cachedData) {
                    setPosts(cachedData.posts);
                    setFallbackPosts(cachedData.posts); // Store as fallback
                    setLastFetch(cachedData.timestamp);
                    setCached(true);
                    setCacheAge(cachedData.age);
                    setLoading(false);

                    if (onSuccess) {
                        onSuccess(cachedData.posts, { cached: true, age: cachedData.age });
                    }
                    return { success: true, cached: true };
                }
            }

            setLoading(true);

            // Wrap the API call with error handling
            const wrappedFetch = instagramErrorHandler.withErrorHandling(
                () => instagramService.fetchPosts({
                    limit: maxPosts,
                    includeStats: showStats
                }),
                operationContext
            );

            const result = await wrappedFetch();

            if (result.success && result.posts) {
                setPosts(result.posts);
                setFallbackPosts(result.posts); // Update fallback cache
                setLastFetch(new Date());
                setCached(result.cached || false);
                setCacheAge(result.cacheAge || 0);

                // Cache the data locally
                setCachedData(result.posts);

                // Preload images for better performance
                const imageUrls = result.posts
                    .map(post => post.media_url || post.thumbnail_url)
                    .filter(Boolean);

                if (imageUrls.length > 0) {
                    preloadImages(imageUrls, 'high');
                }

                // Announce successful load to screen readers
                if (enableAccessibility) {
                    announce(`${result.posts.length} Instagram posts loaded successfully`);
                }

                if (onSuccess) {
                    onSuccess(result.posts, result);
                }

                return result;
            } else if (result.error) {
                // Handle error response from error handler
                throw new Error(result.error.message || 'Failed to fetch posts');
            } else {
                throw new Error('No posts received from API');
            }

        } catch (err) {
            console.error('Failed to fetch Instagram posts:', err);

            // Use error handler to process the error
            const errorResult = await instagramErrorHandler.handleError(err, operationContext);

            setError(errorResult.userMessage?.message || err.message);
            setErrorType(errorResult.error?.type || 'unknown');
            setShowFallback(errorResult.shouldShowFallback);

            // Try to use cached data as fallback
            const cachedData = getCachedData();
            if (cachedData && cachedData.posts.length > 0) {
                setFallbackPosts(cachedData.posts);

                // If we should show fallback, don't set the main posts
                if (!errorResult.shouldShowFallback) {
                    setPosts(cachedData.posts);
                    setLastFetch(cachedData.timestamp);
                    setCached(true);
                    setCacheAge(cachedData.age);
                }
            }

            // Announce error to screen readers
            if (enableAccessibility) {
                const message = errorResult.userMessage?.message || err.message;
                announce(`Error loading Instagram posts: ${message}`, 'assertive');
            }

            if (onError) {
                onError(err);
            }

            return errorResult;
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [maxPosts, showStats, getCachedData, setCachedData, onSuccess, onError, preloadImages, enableAccessibility, announce]);

    // Manual refresh
    const handleRefresh = useCallback(async () => {
        if (refreshing) return;

        setRefreshing(true);

        // Announce refresh to screen readers
        if (enableAccessibility) {
            announce('Refreshing Instagram posts...');
        }

        // Add visual feedback
        if (refreshButtonRef.current) {
            refreshButtonRef.current.classList.add('animate-spin');
        }

        try {
            await fetchPosts(true);
        } finally {
            if (refreshButtonRef.current) {
                setTimeout(() => {
                    refreshButtonRef.current?.classList.remove('animate-spin');
                }, 500);
            }
        }
    }, [fetchPosts, refreshing, enableAccessibility, announce]);

    // Handle post click
    const handlePostClick = useCallback((post, index) => {
        // Announce action to screen readers
        if (enableAccessibility) {
            announce(`Opening Instagram post by ${post.username || 'user'} in new tab`);
        }

        if (onPostClick) {
            onPostClick(post);
        } else {
            // Default behavior: open Instagram post in new tab
            if (post.permalink) {
                window.open(post.permalink, '_blank', 'noopener,noreferrer');
            }
        }
    }, [onPostClick, enableAccessibility, announce]);

    // Network status monitoring
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Refresh data when coming back online
            if (posts.length === 0 || error) {
                fetchPosts();
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [fetchPosts, posts.length, error]);

    // Initial data fetch
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // Auto-refresh interval
    useEffect(() => {
        if (refreshInterval <= 0) return;

        const interval = setInterval(() => {
            if (isOnline && !loading && !refreshing) {
                fetchPosts();
            }
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [refreshInterval, isOnline, loading, refreshing, fetchPosts]);

    // Real-time statistics subscription
    useEffect(() => {
        if (!showStats || posts.length === 0) return;

        const postIds = posts.map(post => post.id);

        const unsubscribe = instagramService.subscribeToStats(
            postIds,
            (update) => {
                setPosts(prevPosts =>
                    prevPosts.map(post =>
                        post.id === update.postId
                            ? { ...post, stats: update.stats }
                            : post
                    )
                );
            },
            { interval: refreshInterval }
        );

        unsubscribeRef.current = unsubscribe;

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [showStats, posts, refreshInterval]);

    // Page visibility handling
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && lastFetch) {
                const timeSinceLastFetch = Date.now() - lastFetch.getTime();

                // Refresh if it's been more than refresh interval since last fetch
                if (timeSinceLastFetch > refreshInterval) {
                    fetchPosts();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [lastFetch, refreshInterval, fetchPosts]);

    // Keyboard navigation for posts
    const handleContainerKeyDown = useCallback((event) => {
        if (!enableAccessibility || posts.length === 0) return;

        const handled = handleKeyNavigation(
            event,
            posts,
            (post, index) => handlePostClick(post, index)
        );

        // Additional keyboard shortcuts
        if (!handled) {
            switch (event.key) {
                case 'r':
                case 'R':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        handleRefresh();
                    }
                    break;
                case 'f':
                case 'F':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        focusFirst();
                    }
                    break;
            }
        }
    }, [enableAccessibility, posts, handleKeyNavigation, handlePostClick, handleRefresh, focusFirst]);

    // Register post elements for keyboard navigation
    useEffect(() => {
        if (enableAccessibility && postElementsRef.current.length > 0) {
            registerFocusableElements(postElementsRef.current);
        }
    }, [posts, enableAccessibility, registerFocusableElements]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, []);

    // Handle layout changes
    const handleLayoutChange = useCallback((layoutInfo) => {
        console.log('Layout changed:', layoutInfo);
        // Optional: emit event for analytics or other components
    }, []);

    // Handle swipe gestures
    const handleSwipe = useCallback((swipeInfo) => {
        console.log('Swipe detected:', swipeInfo);
        // Optional: implement carousel navigation or other swipe actions
    }, []);

    // Theme classes
    const getThemeClasses = () => {
        switch (theme) {
            case 'dark':
                return 'bg-gray-900 text-white';
            case 'auto':
                return 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white';
            case 'light':
            default:
                return 'bg-white text-gray-900';
        }
    };

    // Animation variants with accessibility support
    const animationConfig = getInstagramAnimationConfig();
    const containerVariants = instagramReducedMotion ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 }
    } : {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: animationConfig.duration,
                staggerChildren: animationConfig.stagger
            }
        }
    };

    return (
        <InstagramErrorBoundary onRetry={() => fetchPosts(true)}>
            <motion.div
                ref={containerRef}
                className={`instagram-feed-container ${getThemeClasses()} ${className} ${keyboardMode ? 'keyboard-navigation' : ''
                    } ${getInstagramAccessibilityClasses()}`}
                style={{
                    ...getInstagramAccessibilityStyles(),
                    ...(instagramHighContrast ? getInstagramHighContrastColors() : {}),
                    ...(instagramHighContrast ? getInstagramFocusStyles() : {})
                }}
                variants={containerVariants}
                initial={instagramReducedMotion ? false : "hidden"}
                animate={instagramReducedMotion ? false : "visible"}
                role="region"
                aria-labelledby="instagram-feed-title"
                aria-describedby="instagram-feed-description"
                {...createLiveRegion('polite')}
                aria-busy={loading}
                onKeyDown={handleContainerKeyDown}
                tabIndex={enableAccessibility ? 0 : -1}
            >
                {/* Skip link for keyboard users */}
                {enableAccessibility && (
                    <a
                        ref={skipLinkRef}
                        href="#instagram-posts-grid"
                        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onFocus={() => announce('Skip link focused. Press Enter to jump to Instagram posts.')}
                        aria-describedby="skip-link-description"
                    >
                        Skip to Instagram posts
                        <span id="skip-link-description" className="sr-only">
                            Bypass navigation and go directly to Instagram posts grid
                        </span>
                    </a>
                )}
                {/* Header */}
                <header className="flex items-center justify-between mb-6" role="banner">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-2 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg"
                            role="img"
                            aria-label="Instagram logo"
                        >
                            <Instagram className="w-5 h-5 text-white" aria-hidden="true" />
                        </div>
                        <h2 id="instagram-feed-title" className="text-xl font-semibold">
                            Instagram Feed
                        </h2>
                        {enableAccessibility && (
                            <p id="instagram-feed-description" className="sr-only">
                                Latest Instagram posts from our account. Use arrow keys to navigate between posts,
                                Enter or Space to open posts, R to refresh, F to focus first post, Escape to exit navigation.
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Network status */}
                        <div
                            className="flex items-center gap-1 text-sm text-gray-500"
                            role="status"
                            aria-label={isOnline ? "Online" : "Offline"}
                            aria-describedby="network-status-description"
                        >
                            {isOnline ? (
                                <Wifi className="w-4 h-4 text-green-500" aria-hidden="true" />
                            ) : (
                                <WifiOff className="w-4 h-4 text-red-500" aria-hidden="true" />
                            )}
                            {enableAccessibility && (
                                <span id="network-status-description" className="sr-only">
                                    {isOnline ? "Connected to internet" : "No internet connection"}
                                </span>
                            )}
                        </div>

                        {/* Cache indicator */}
                        {cached && (
                            <div
                                className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
                                role="status"
                                aria-label="Content is cached"
                                title="This content is loaded from cache for faster performance"
                            >
                                Cached
                            </div>
                        )}

                        {/* Refresh button */}
                        <button
                            ref={refreshButtonRef}
                            onClick={handleRefresh}
                            disabled={loading || refreshing || !isOnline}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            aria-label={generateAriaLabel('refresh')}
                            aria-describedby="refresh-status refresh-shortcut"
                            title="Refresh Instagram posts (Ctrl+R)"
                            type="button"
                            aria-pressed={refreshing}
                        >
                            <RefreshCw className="w-4 h-4" aria-hidden="true" />
                            {enableAccessibility && (
                                <>
                                    <span id="refresh-status" className="sr-only">
                                        {refreshing ? 'Refreshing posts...' :
                                            loading ? 'Loading posts...' :
                                                !isOnline ? 'Offline - refresh unavailable' :
                                                    'Click to refresh posts'}
                                    </span>
                                    <span id="refresh-shortcut" className="sr-only">
                                        Keyboard shortcut: Control plus R
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </header>

                {/* Loading state with skeleton */}
                {loading && posts.length === 0 && (
                    <InstagramFeedSkeleton
                        postCount={maxPosts}
                        showStats={showStats}
                        showHeader={false}
                        layout={layout}
                    />
                )}

                {/* Error state with fallback */}
                {(error || showFallback) && posts.length === 0 && (
                    <InstagramFallback
                        fallbackPosts={fallbackPosts}
                        errorMessage={error}
                        errorType={errorType}
                        lastSuccessfulFetch={lastFetch}
                        cacheAge={cacheAge}
                        onRetry={handleRefresh}
                        onClearCache={() => {
                            localStorage.removeItem(getCacheKey());
                            setFallbackPosts([]);
                            setCacheAge(0);
                        }}
                        showCachedContent={true}
                        showRetryOptions={true}
                    />
                )}

                {/* Posts responsive grid */}
                {posts.length > 0 && (
                    <div
                        id="instagram-posts-grid"
                        role="grid"
                        aria-label={`Instagram posts grid with ${posts.length} posts`}
                        aria-rowcount={Math.ceil(posts.length / getGridColumns())}
                        aria-colcount={getGridColumns()}
                    >
                        <InstagramResponsiveGrid
                            maxPosts={maxPosts}
                            layout={layout}
                            enableTouchGestures={deviceCapabilities.isTouchDevice}
                            onLayoutChange={handleLayoutChange}
                            className={loading ? 'loading' : ''}
                            {...createTouchHandler(handleSwipe)}
                        >
                            {posts.map((post, index) => (
                                <div
                                    key={post.id}
                                    className="instagram-post-wrapper"
                                    role="gridcell"
                                    aria-rowindex={Math.floor(index / getGridColumns()) + 1}
                                    aria-colindex={(index % getGridColumns()) + 1}
                                    ref={el => {
                                        if (el) postElementsRef.current[index] = el;
                                    }}
                                >
                                    <InstagramPost
                                        post={post}
                                        onClick={(post) => handlePostClick(post, index)}
                                        enableLazyLoading={enableLazyLoading}
                                        enableAccessibility={enableAccessibility}
                                        className="h-full"
                                        tabIndex={enableAccessibility ? (focusedIndex === index ? 0 : -1) : 0}
                                        aria-setsize={posts.length}
                                        aria-posinset={index + 1}
                                    />
                                    {showStats && post.stats && (
                                        <InstagramStats
                                            postId={post.id}
                                            initialStats={post.stats}
                                            realtime={true}
                                            className="mt-2"
                                            enableAccessibility={enableAccessibility}
                                        />
                                    )}
                                </div>
                            ))}
                        </InstagramResponsiveGrid>
                    </div>
                )}

                {/* Live announcements for screen readers */}
                {enableAccessibility && (
                    <>
                        <div className="sr-only" {...createLiveRegion('polite')} id="instagram-status">
                            {loading && posts.length === 0 && 'Loading Instagram posts...'}
                            {error && posts.length === 0 && `Error loading posts: ${error}`}
                            {posts.length > 0 && !loading && `${posts.length} Instagram posts available. Use arrow keys to navigate.`}
                            {cached && 'Displaying cached content'}
                            {!isOnline && 'Currently offline'}
                        </div>

                        {/* Dynamic announcements */}
                        <div className="sr-only" {...createLiveRegion('assertive')} id="instagram-announcements">
                            {announcements.map(announcement => (
                                <div key={announcement.id}>
                                    {announcement.message}
                                </div>
                            ))}
                        </div>

                        {/* Keyboard shortcuts help */}
                        <div className="sr-only" id="instagram-keyboard-help">
                            Keyboard shortcuts: Arrow keys to navigate posts, Enter to open post,
                            R to refresh, F to focus first post, Escape to exit navigation.
                        </div>
                    </>
                )}
            </motion.div>
        </InstagramErrorBoundary>
    );
};

export default InstagramFeedContainer;