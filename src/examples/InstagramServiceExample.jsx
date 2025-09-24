import React, { useState, useEffect } from 'react';
import instagramService from '../services/instagramService.js';

/**
 * Example component demonstrating the enhanced Instagram service usage
 * Shows how to fetch posts with statistics and subscribe to real-time updates
 */
const InstagramServiceExample = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [realtimeUpdates, setRealtimeUpdates] = useState({});

    useEffect(() => {
        fetchPosts();

        // Update connection status periodically
        const statusInterval = setInterval(() => {
            setConnectionStatus(instagramService.getConnectionStatus());
        }, 1000);

        return () => {
            clearInterval(statusInterval);
            instagramService.disconnect();
        };
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch posts with statistics
            const result = await instagramService.fetchPosts({
                limit: 4,
                includeStats: true
            });

            setPosts(result.posts);

            // Subscribe to real-time statistics updates
            if (result.posts.length > 0) {
                const postIds = result.posts.map(post => post.id);

                instagramService.subscribeToStats(postIds, (update) => {
                    console.log('Real-time stats update:', update);

                    setRealtimeUpdates(prev => ({
                        ...prev,
                        [update.postId]: {
                            ...update.stats,
                            timestamp: update.timestamp,
                            realtime: true
                        }
                    }));
                }, {
                    interval: 60000 // Update every minute for demo
                });
            }

        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch Instagram posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const refreshStats = async (postId) => {
        try {
            const result = await instagramService.fetchPostStats(postId, false);

            setRealtimeUpdates(prev => ({
                ...prev,
                [postId]: {
                    ...result.stats,
                    timestamp: result.timestamp,
                    realtime: false
                }
            }));
        } catch (err) {
            console.error(`Failed to refresh stats for post ${postId}:`, err);
        }
    };

    const getDisplayStats = (post) => {
        const realtimeStats = realtimeUpdates[post.id];
        return realtimeStats || post.stats;
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-gray-200 h-64 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-semibold">Error Loading Instagram Posts</h3>
                    <p className="text-red-600 mt-2">{error}</p>
                    <button
                        onClick={fetchPosts}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Instagram Feed with Real-time Statistics
                </h2>
                <p className="text-gray-600">
                    Demonstrating enhanced Instagram API with engagement metrics and live updates
                </p>

                {/* Connection Status */}
                {connectionStatus && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">WebSocket Status:</span>
                            <span className={`px-2 py-1 rounded ${connectionStatus.connected
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {connectionStatus.connected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            Subscribed to {connectionStatus.subscribedPosts.length} posts •
                            {connectionStatus.totalSubscribers} active subscriptions
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => {
                    const stats = getDisplayStats(post);
                    const isRealtime = realtimeUpdates[post.id]?.realtime;

                    return (
                        <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Post Image */}
                            <div className="aspect-square bg-gray-100">
                                <img
                                    src={post.media_url}
                                    alt={post.caption || 'Instagram post'}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>

                            {/* Post Content */}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-900">
                                        @{post.username}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(post.timestamp).toLocaleDateString()}
                                    </span>
                                </div>

                                <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                                    {post.caption}
                                </p>

                                {/* Statistics */}
                                {stats && (
                                    <div className="border-t pt-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                Engagement Statistics
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                {isRealtime && (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                                        Live
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => refreshStats(post.id)}
                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                >
                                                    Refresh
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 text-center">
                                            <div>
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {stats.likes || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">Likes</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {stats.comments || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">Comments</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {stats.engagement_rate || 0}%
                                                </div>
                                                <div className="text-xs text-gray-500">Engagement</div>
                                            </div>
                                        </div>

                                        <div className="mt-2 text-xs text-gray-400">
                                            Last updated: {new Date(stats.last_updated).toLocaleTimeString()}
                                        </div>
                                    </div>
                                )}

                                {/* View on Instagram */}
                                <div className="mt-3 pt-3 border-t">
                                    <a
                                        href={post.permalink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        View on Instagram
                                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {posts.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-lg">No Instagram posts available</div>
                    <button
                        onClick={fetchPosts}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Reload
                    </button>
                </div>
            )}
        </div>
    );
};

export default InstagramServiceExample;