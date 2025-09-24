import React from 'react';
import { motion } from 'framer-motion';

/**
 * InstagramSkeleton - Loading skeleton components for Instagram feed
 * Provides smooth loading states while content is being fetched
 */

// Individual post skeleton
export const InstagramPostSkeleton = ({ className = '' }) => {
    const shimmerVariants = {
        loading: {
            x: [-100, 100],
            transition: {
                x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 1.5,
                    ease: "linear"
                }
            }
        }
    };

    return (
        <div className={`instagram-post-skeleton bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 ${className}`}>
            {/* Image skeleton */}
            <div className="relative aspect-square bg-gray-200 overflow-hidden">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    variants={shimmerVariants}
                    animate="loading"
                />
            </div>

            {/* Content skeleton */}
            <div className="p-4 space-y-3">
                {/* Header skeleton */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded" />
                        <div className="w-20 h-4 bg-gray-200 rounded" />
                    </div>
                    <div className="w-16 h-3 bg-gray-200 rounded" />
                </div>

                {/* Caption skeleton */}
                <div className="space-y-2">
                    <div className="w-full h-3 bg-gray-200 rounded" />
                    <div className="w-3/4 h-3 bg-gray-200 rounded" />
                    <div className="w-1/2 h-3 bg-gray-200 rounded" />
                </div>
            </div>
        </div>
    );
};

// Stats skeleton
export const InstagramStatsSkeleton = ({ className = '' }) => {
    return (
        <div className={`instagram-stats-skeleton mt-2 ${className}`}>
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-200 rounded" />
                    <div className="w-8 h-3 bg-gray-200 rounded" />
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-200 rounded" />
                    <div className="w-6 h-3 bg-gray-200 rounded" />
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-200 rounded" />
                    <div className="w-10 h-3 bg-gray-200 rounded" />
                </div>
            </div>
        </div>
    );
};

// Grid skeleton
export const InstagramGridSkeleton = ({
    postCount = 4,
    showStats = true,
    layout = 'grid',
    className = ''
}) => {
    const getGridClasses = () => {
        switch (layout) {
            case 'carousel':
                return 'flex gap-4 overflow-hidden';
            case 'grid':
            default:
                return `grid gap-4 ${postCount === 1 ? 'grid-cols-1' :
                        postCount === 2 ? 'grid-cols-1 md:grid-cols-2' :
                            postCount === 3 ? 'grid-cols-1 md:grid-cols-3' :
                                'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                    }`;
        }
    };

    const containerVariants = {
        loading: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        loading: {
            opacity: [0.5, 1, 0.5],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <motion.div
            className={`instagram-grid-skeleton ${getGridClasses()} ${className}`}
            variants={containerVariants}
            animate="loading"
        >
            {Array.from({ length: postCount }, (_, index) => (
                <motion.div
                    key={index}
                    variants={itemVariants}
                    className={layout === 'carousel' ? 'flex-shrink-0 w-64' : ''}
                >
                    <InstagramPostSkeleton className="h-full" />
                    {showStats && <InstagramStatsSkeleton />}
                </motion.div>
            ))}
        </motion.div>
    );
};

// Feed header skeleton
export const InstagramHeaderSkeleton = ({ className = '' }) => {
    return (
        <div className={`instagram-header-skeleton flex items-center justify-between mb-6 ${className}`}>
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200 rounded-lg" />
                <div className="w-32 h-6 bg-gray-200 rounded" />
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="w-12 h-4 bg-gray-200 rounded" />
                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
            </div>
        </div>
    );
};

// Complete feed skeleton
export const InstagramFeedSkeleton = ({
    postCount = 4,
    showStats = true,
    showHeader = true,
    layout = 'grid',
    className = ''
}) => {
    return (
        <div className={`instagram-feed-skeleton ${className}`}>
            {showHeader && <InstagramHeaderSkeleton />}
            <InstagramGridSkeleton
                postCount={postCount}
                showStats={showStats}
                layout={layout}
            />
        </div>
    );
};

// Pulse skeleton for simple loading states
export const PulseSkeleton = ({
    width = '100%',
    height = '1rem',
    className = '',
    rounded = 'rounded'
}) => {
    return (
        <div
            className={`bg-gray-200 animate-pulse ${rounded} ${className}`}
            style={{ width, height }}
        />
    );
};

// Shimmer skeleton with gradient animation
export const ShimmerSkeleton = ({
    width = '100%',
    height = '1rem',
    className = '',
    rounded = 'rounded'
}) => {
    return (
        <div
            className={`relative bg-gray-200 overflow-hidden ${rounded} ${className}`}
            style={{ width, height }}
        >
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                animate={{
                    x: [-100, 100],
                }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 1.5,
                        ease: "linear"
                    }
                }}
            />
        </div>
    );
};

// Skeleton wrapper for conditional loading
export const SkeletonWrapper = ({
    loading = false,
    skeleton = null,
    children,
    fallback = null
}) => {
    if (loading) {
        return skeleton || fallback || <PulseSkeleton />;
    }

    return children;
};

export default {
    InstagramPostSkeleton,
    InstagramStatsSkeleton,
    InstagramGridSkeleton,
    InstagramHeaderSkeleton,
    InstagramFeedSkeleton,
    PulseSkeleton,
    ShimmerSkeleton,
    SkeletonWrapper
};