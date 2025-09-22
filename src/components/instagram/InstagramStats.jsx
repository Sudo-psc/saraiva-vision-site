import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart,
    MessageCircle,
    Eye,
    TrendingUp,
    RefreshCw,
    Info,
    Activity,
    Users,
    BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import instagramService from '../../services/instagramService';
import instagramErrorHandler from '../../services/instagramErrorHandler';
import useInstagramAccessibility from '../../hooks/useInstagramAccessibility';
import useAccessibilityPreferences from '../../hooks/useAccessibilityPreferences';
import useInstagramAccessibilityEnhanced from '../../hooks/useInstagramAccessibilityEnhanced';

/**
 * InstagramStats - Real-time statistics display component
 * Features tooltip functionality, auto-refresh, and detailed metrics
 */
const InstagramStats = ({
    postId,
    initialStats = null,
    realtime = true,
    refreshInterval = 300000, // 5 minutes
    showTooltip = true,
    showTrends = true,
    compact = false,
    className = '',
    enableAccessibility = true
}) => {
    // State management
    const [stats, setStats] = useState(initialStats);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [showTooltipContent, setShowTooltipContent] = useState(false);
    const [previousStats, setPreviousStats] = useState(null);
    const [trends, setTrends] = useState({});

    // Refs
    const tooltipRef = useRef(null);
    const unsubscribeRef = useRef(null);
    const refreshTimeoutRef = useRef(null);
    const statsContainerRef = useRef(null);

    // Accessibility hook
    const {
        announce,
        generateAriaLabel,
        createLiveRegion
    } = useInstagramAccessibility({
        enableScreenReader: enableAccessibility,
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
        shouldDisableInstagramFeature
    } = useInstagramAccessibilityEnhanced({
        enableHighContrast: enableAccessibility,
        enableReducedMotion: enableAccessibility,
        enableSystemDetection: true
    });

    // Validate required props
    if (!postId) {
        console.warn('InstagramStats: postId is required');
        return null;
    }

    // Calculate trends
    const calculateTrends = (current, previous) => {
        if (!current || !previous) return {};

        const trends = {};

        ['likes', 'comments', 'engagement_rate', 'reach', 'impressions'].forEach(metric => {
            if (current[metric] !== undefined && previous[metric] !== undefined) {
                const change = current[metric] - previous[metric];
                const percentChange = previous[metric] > 0
                    ? ((change / previous[metric]) * 100).toFixed(1)
                    : 0;

                trends[metric] = {
                    change,
                    percentChange: parseFloat(percentChange),
                    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
                };
            }
        });

        return trends;
    };

    // Format numbers for display
    const formatNumber = (num) => {
        if (num === undefined || num === null) return '—';

        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }

        return num.toString();
    };

    // Format engagement rate
    const formatEngagementRate = (rate) => {
        if (rate === undefined || rate === null) return '—';
        return `${rate.toFixed(1)}%`;
    };

    // Fetch statistics from API with error handling
    const fetchStats = async () => {
        const operationContext = instagramErrorHandler.createContext(
            'fetchStats',
            `/api/instagram/stats/${postId}`
        );

        try {
            setLoading(true);
            setError(null);

            // Wrap the API call with error handling
            const wrappedFetch = instagramErrorHandler.withErrorHandling(
                () => instagramService.fetchPostStats(postId, true),
                operationContext
            );

            const result = await wrappedFetch();

            if (result.success && result.stats) {
                // Store previous stats for trend calculation
                if (stats) {
                    setPreviousStats(stats);
                }

                setStats(result.stats);
                setLastUpdated(new Date(result.timestamp));

                // Calculate trends if we have previous data
                if (stats && showTrends) {
                    const newTrends = calculateTrends(result.stats, stats);
                    setTrends(newTrends);
                }

                // Announce stats update to screen readers
                if (enableAccessibility) {
                    announce(`Statistics updated: ${result.stats.likes} likes, ${result.stats.comments} comments`);
                }
            } else if (result.error) {
                // Handle error response from error handler
                const errorMessage = result.userMessage?.message || 'Failed to fetch statistics';
                setError(errorMessage);

                // Keep displaying last known stats with timestamp
                if (stats && enableAccessibility) {
                    announce(`Statistics update failed: ${errorMessage}. Showing last known data.`, 'assertive');
                }
            } else {
                throw new Error('No statistics received');
            }
        } catch (err) {
            console.error(`Failed to fetch stats for post ${postId}:`, err);

            // Use error handler to process the error
            const errorResult = await instagramErrorHandler.handleError(err, operationContext);
            const errorMessage = errorResult.userMessage?.message || err.message;

            setError(errorMessage);

            // Keep displaying last known stats if available
            if (stats && enableAccessibility) {
                announce(`Statistics unavailable: ${errorMessage}. Showing last known data.`, 'assertive');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle real-time updates
    useEffect(() => {
        if (!realtime || !postId) return;

        const unsubscribe = instagramService.subscribeToStats(
            [postId],
            (update) => {
                if (update.postId === postId) {
                    // Store previous stats for trend calculation
                    if (stats) {
                        setPreviousStats(stats);
                    }

                    setStats(update.stats);
                    setLastUpdated(new Date(update.timestamp));

                    // Calculate trends
                    if (stats && showTrends) {
                        const newTrends = calculateTrends(update.stats, stats);
                        setTrends(newTrends);
                    }
                }
            },
            { interval: refreshInterval }
        );

        unsubscribeRef.current = unsubscribe;

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [postId, realtime, refreshInterval, stats, showTrends]);

    // Auto-refresh for non-realtime mode
    useEffect(() => {
        if (realtime || refreshInterval <= 0) return;

        const refresh = () => {
            fetchStats();
            refreshTimeoutRef.current = setTimeout(refresh, refreshInterval);
        };

        refreshTimeoutRef.current = setTimeout(refresh, refreshInterval);

        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, [realtime, refreshInterval]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, []);

    // Tooltip handlers
    const handleMouseEnter = () => {
        if (showTooltip) {
            setShowTooltipContent(true);
        }
    };

    const handleMouseLeave = () => {
        setShowTooltipContent(false);
    };

    // Keyboard handlers for tooltip
    const handleKeyDown = (event) => {
        if (!enableAccessibility) return;

        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                setShowTooltipContent(!showTooltipContent);
                if (!showTooltipContent) {
                    announce('Statistics details opened');
                } else {
                    announce('Statistics details closed');
                }
                break;
            case 'Escape':
                if (showTooltipContent) {
                    event.preventDefault();
                    setShowTooltipContent(false);
                    announce('Statistics details closed');
                }
                break;
        }
    };

    // Get trend icon and color
    const getTrendIndicator = (metric) => {
        const trend = trends[metric];
        if (!trend || !showTrends) return null;

        const { direction, percentChange } = trend;

        if (direction === 'up') {
            return (
                <span className="text-green-500 text-xs flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{Math.abs(percentChange)}%
                </span>
            );
        } else if (direction === 'down') {
            return (
                <span className="text-red-500 text-xs flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 rotate-180" />
                    -{Math.abs(percentChange)}%
                </span>
            );
        }

        return null;
    };

    // Render loading state
    if (loading && !stats) {
        return (
            <div className={`instagram-stats ${className}`}>
                <div className="flex items-center gap-2 text-gray-500">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading stats...</span>
                </div>
            </div>
        );
    }

    // Render error state
    if (error && !stats) {
        return (
            <div className={`instagram-stats ${className}`}>
                <div className="flex items-center gap-2 text-red-500">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm">Stats unavailable</span>
                </div>
            </div>
        );
    }

    // Don't render if no stats
    if (!stats) {
        return null;
    }

    const {
        likes = 0,
        comments = 0,
        engagement_rate = 0,
        reach = null,
        impressions = null
    } = stats;

    // Animation variants with accessibility support
    const animationConfig = getInstagramAnimationConfig();
    const containerVariants = instagramReducedMotion ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 }
    } : {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: animationConfig.duration,
                staggerChildren: animationConfig.stagger
            }
        }
    };

    const statVariants = instagramReducedMotion || shouldDisableInstagramFeature('scaleAnimations') ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 }
    } : {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: animationConfig.duration }
        }
    };

    const tooltipVariants = instagramReducedMotion || shouldDisableInstagramFeature('tooltipAnimations') ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    } : {
        hidden: { opacity: 0, scale: 0.95, y: 10 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: animationConfig.duration }
        }
    };

    return (
        <motion.div
            ref={statsContainerRef}
            className={`instagram-stats relative ${getInstagramAccessibilityClasses()} ${className}
                ${instagramHighContrast ? 'high-contrast' : ''}
                ${instagramReducedMotion ? 'reduced-motion' : ''}`}
            style={{
                ...getInstagramAccessibilityStyles(),
                ...(instagramHighContrast ? {
                    backgroundColor: getInstagramHighContrastColors()?.postBg,
                    color: getInstagramHighContrastColors()?.postText,
                    border: `1px solid ${getInstagramHighContrastColors()?.postBorder}`,
                    padding: '8px'
                } : {})
            }}
            variants={containerVariants}
            initial={instagramReducedMotion ? false : "hidden"}
            animate={instagramReducedMotion ? false : "visible"}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onKeyDown={handleKeyDown}
            tabIndex={enableAccessibility && showTooltip ? 0 : -1}
            role={enableAccessibility ? "region" : undefined}
            aria-label={enableAccessibility ? "Instagram post statistics" : undefined}
            aria-describedby={enableAccessibility ? `stats-${postId}-description` : undefined}
        >
            {/* Main stats display */}
            <div className={`
        flex items-center gap-3 text-sm text-gray-600
        ${compact ? 'gap-2' : 'gap-3'}
      `}>
                {/* Likes */}
                <motion.div
                    className="flex items-center gap-1"
                    variants={statVariants}
                    role="text"
                    aria-label={enableAccessibility ? `${formatNumber(likes)} likes` : undefined}
                >
                    <Heart className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-red-500`} aria-hidden="true" />
                    <span className="font-medium" aria-label={enableAccessibility ? `${likes} likes` : undefined}>
                        {formatNumber(likes)}
                    </span>
                    {getTrendIndicator('likes')}
                </motion.div>

                {/* Comments */}
                <motion.div
                    className="flex items-center gap-1"
                    variants={statVariants}
                    role="text"
                    aria-label={enableAccessibility ? `${formatNumber(comments)} comments` : undefined}
                >
                    <MessageCircle className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-blue-500`} aria-hidden="true" />
                    <span className="font-medium" aria-label={enableAccessibility ? `${comments} comments` : undefined}>
                        {formatNumber(comments)}
                    </span>
                    {getTrendIndicator('comments')}
                </motion.div>

                {/* Engagement rate */}
                {engagement_rate > 0 && (
                    <motion.div
                        className="flex items-center gap-1"
                        variants={statVariants}
                        role="text"
                        aria-label={enableAccessibility ? `${formatEngagementRate(engagement_rate)} engagement rate` : undefined}
                    >
                        <BarChart3 className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-green-500`} aria-hidden="true" />
                        <span className="font-medium" aria-label={enableAccessibility ? `${engagement_rate}% engagement rate` : undefined}>
                            {formatEngagementRate(engagement_rate)}
                        </span>
                        {getTrendIndicator('engagement_rate')}
                    </motion.div>
                )}

                {/* Info icon for tooltip */}
                {showTooltip && !compact && enableAccessibility && (
                    <motion.div variants={statVariants}>
                        <button
                            className="p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            aria-label={generateAriaLabel('stats-tooltip')}
                            aria-describedby="stats-tooltip-description"
                            aria-expanded={showTooltipContent}
                            onClick={() => setShowTooltipContent(!showTooltipContent)}
                            type="button"
                        >
                            <Info className="w-3 h-3 text-gray-400" aria-hidden="true" />
                            <span id="stats-tooltip-description" className="sr-only">
                                View detailed engagement statistics and metrics
                            </span>
                        </button>
                    </motion.div>
                )}

                {/* Loading indicator */}
                {loading && (
                    <motion.div
                        variants={statVariants}
                        role="status"
                        aria-label="Loading statistics"
                    >
                        <RefreshCw className="w-3 h-3 text-gray-400 animate-spin" aria-hidden="true" />
                        <span className="sr-only">Updating statistics...</span>
                    </motion.div>
                )}
            </div>

            {/* Tooltip */}
            <AnimatePresence>
                {showTooltipContent && showTooltip && (
                    <motion.div
                        ref={tooltipRef}
                        className="absolute bottom-full left-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 min-w-48"
                        variants={tooltipVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        role="tooltip"
                        aria-labelledby="tooltip-title"
                        aria-describedby="tooltip-content"
                    >
                        <div className="space-y-2">
                            <h4 id="tooltip-title" className="sr-only">Detailed Statistics</h4>
                            <div id="tooltip-content">
                                {/* Basic metrics */}
                                <div className="grid grid-cols-2 gap-2" role="table" aria-label="Basic engagement metrics">
                                    <div role="row">
                                        <div className="flex items-center gap-1 text-gray-300" role="rowheader">
                                            <Heart className="w-3 h-3" aria-hidden="true" />
                                            <span>Likes</span>
                                        </div>
                                        <div className="font-medium" role="cell" aria-label={`${likes} likes`}>
                                            {formatNumber(likes)}
                                        </div>
                                    </div>
                                    <div role="row">
                                        <div className="flex items-center gap-1 text-gray-300" role="rowheader">
                                            <MessageCircle className="w-3 h-3" aria-hidden="true" />
                                            <span>Comments</span>
                                        </div>
                                        <div className="font-medium" role="cell" aria-label={`${comments} comments`}>
                                            {formatNumber(comments)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Advanced metrics */}
                            {(reach || impressions || engagement_rate > 0) && (
                                <div className="border-t border-gray-700 pt-2 space-y-1" role="table" aria-label="Advanced engagement metrics">
                                    {engagement_rate > 0 && (
                                        <div className="flex justify-between" role="row">
                                            <span className="text-gray-300" role="rowheader">Engagement:</span>
                                            <span className="font-medium" role="cell" aria-label={`${engagement_rate}% engagement rate`}>
                                                {formatEngagementRate(engagement_rate)}
                                            </span>
                                        </div>
                                    )}
                                    {reach && (
                                        <div className="flex justify-between" role="row">
                                            <span className="text-gray-300" role="rowheader">Reach:</span>
                                            <span className="font-medium" role="cell" aria-label={`${reach} people reached`}>
                                                {formatNumber(reach)}
                                            </span>
                                        </div>
                                    )}
                                    {impressions && (
                                        <div className="flex justify-between" role="row">
                                            <span className="text-gray-300" role="rowheader">Impressions:</span>
                                            <span className="font-medium" role="cell" aria-label={`${impressions} total impressions`}>
                                                {formatNumber(impressions)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Last updated */}
                            {lastUpdated && (
                                <div className="border-t border-gray-700 pt-2 text-gray-400">
                                    <div className="flex items-center gap-1" role="status">
                                        <Activity className="w-3 h-3" aria-hidden="true" />
                                        <time
                                            dateTime={lastUpdated.toISOString()}
                                            aria-label={`Statistics last updated at ${lastUpdated.toLocaleString()}`}
                                        >
                                            Updated: {format(lastUpdated, 'HH:mm', { locale: ptBR })}
                                        </time>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Comprehensive screen reader content */}
            {enableAccessibility && (
                <>
                    <div id={`stats-${postId}-description`} className="sr-only">
                        Instagram post statistics: {formatNumber(likes)} likes, {formatNumber(comments)} comments
                        {engagement_rate > 0 && `, ${formatEngagementRate(engagement_rate)} engagement rate`}
                        {reach && `, ${formatNumber(reach)} reach`}
                        {impressions && `, ${formatNumber(impressions)} impressions`}
                        {lastUpdated && `. Last updated ${lastUpdated.toLocaleString()}`}
                        {showTooltip && '. Press Enter or Space for detailed statistics.'}
                    </div>

                    {/* Live updates announcement */}
                    <div className="sr-only" {...createLiveRegion('polite')}>
                        {loading && 'Updating statistics...'}
                        {error && `Statistics error: ${error}`}
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default InstagramStats;