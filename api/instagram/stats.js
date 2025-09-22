import { z } from 'zod';

// Environment variables
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

// Validation schemas
const statsRequestSchema = z.object({
    postId: z.string().min(1),
    includeInsights: z.boolean().optional().default(false)
});

const bulkStatsRequestSchema = z.object({
    postIds: z.array(z.string()).min(1).max(25),
    includeInsights: z.boolean().optional().default(false)
});

// Cache configuration for stats (shorter TTL for realtime updates)
const STATS_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds
let statsCache = new Map();

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            return handleSinglePostStats(req, res);
        }

        if (req.method === 'POST') {
            return handleBulkPostStats(req, res);
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Instagram stats error:', error);
        res.status(500).json({
            error: 'Failed to fetch Instagram statistics',
            message: error.message
        });
    }
}

// Handle single post statistics request
async function handleSinglePostStats(req, res) {
    const validation = statsRequestSchema.safeParse({
        postId: req.query.postId,
        includeInsights: req.query.includeInsights === 'true'
    });

    if (!validation.success) {
        return res.status(400).json({
            error: 'Invalid request parameters',
            details: validation.error.errors
        });
    }

    const { postId, includeInsights } = validation.data;

    // Check cache first
    const cacheKey = `${postId}_${includeInsights}`;
    const cached = getCachedStats(cacheKey);
    if (cached) {
        return res.status(200).json({
            success: true,
            data: cached.data,
            cached: true,
            cache_age: Math.floor((Date.now() - cached.timestamp) / 1000)
        });
    }

    if (!INSTAGRAM_ACCESS_TOKEN) {
        return res.status(500).json({
            error: 'Instagram access token not configured',
            fallback: getFallbackStats(postId)
        });
    }

    try {
        const stats = await fetchPostStatistics(postId, includeInsights);

        // Cache the result
        setCachedStats(cacheKey, stats);

        res.status(200).json({
            success: true,
            data: stats,
            cached: false,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(`Failed to fetch stats for post ${postId}:`, error);

        // Return cached data if available, otherwise fallback
        const cached = getCachedStats(cacheKey, true); // Allow expired cache
        if (cached) {
            return res.status(200).json({
                success: true,
                data: cached.data,
                cached: true,
                error: 'API temporarily unavailable, serving cached data'
            });
        }

        res.status(500).json({
            error: 'Failed to fetch post statistics',
            fallback: getFallbackStats(postId)
        });
    }
}

// Handle bulk post statistics request
async function handleBulkPostStats(req, res) {
    const validation = bulkStatsRequestSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({
            error: 'Invalid request parameters',
            details: validation.error.errors
        });
    }

    const { postIds, includeInsights } = validation.data;

    if (!INSTAGRAM_ACCESS_TOKEN) {
        return res.status(500).json({
            error: 'Instagram access token not configured',
            fallback: postIds.map(id => getFallbackStats(id))
        });
    }

    try {
        const statsPromises = postIds.map(async (postId) => {
            const cacheKey = `${postId}_${includeInsights}`;
            const cached = getCachedStats(cacheKey);

            if (cached) {
                return {
                    postId,
                    stats: cached.data,
                    cached: true,
                    cache_age: Math.floor((Date.now() - cached.timestamp) / 1000)
                };
            }

            try {
                const stats = await fetchPostStatistics(postId, includeInsights);
                setCachedStats(cacheKey, stats);

                return {
                    postId,
                    stats,
                    cached: false
                };
            } catch (error) {
                console.error(`Failed to fetch stats for post ${postId}:`, error);
                return {
                    postId,
                    stats: getFallbackStats(postId),
                    error: error.message,
                    cached: false
                };
            }
        });

        const results = await Promise.all(statsPromises);

        res.status(200).json({
            success: true,
            data: results,
            timestamp: new Date().toISOString(),
            total: results.length
        });
    } catch (error) {
        console.error('Bulk stats fetch error:', error);
        res.status(500).json({
            error: 'Failed to fetch bulk statistics',
            message: error.message
        });
    }
}

// Fetch statistics for a single post
async function fetchPostStatistics(postId, includeInsights = false) {
    let fields = 'like_count,comments_count,timestamp';

    // Add insights fields if requested (requires business account)
    if (includeInsights) {
        fields += ',insights.metric(impressions,reach,engagement)';
    }

    const url = new URL(`https://graph.instagram.com/${postId}`);
    url.searchParams.set('fields', fields);
    url.searchParams.set('access_token', INSTAGRAM_ACCESS_TOKEN);

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || `Stats API error: ${response.status}`);
    }

    // Process insights data if available
    let insights = null;
    if (includeInsights && data.insights && data.insights.data) {
        insights = processInsightsData(data.insights.data);
    }

    return {
        postId,
        likes: data.like_count || 0,
        comments: data.comments_count || 0,
        engagement_rate: calculateEngagementRate({
            like_count: data.like_count || 0,
            comments_count: data.comments_count || 0
        }),
        timestamp: data.timestamp,
        insights,
        last_updated: new Date().toISOString()
    };
}

// Process Instagram Insights data
function processInsightsData(insightsData) {
    const insights = {};

    insightsData.forEach(metric => {
        if (metric.name === 'impressions') {
            insights.impressions = metric.values[0]?.value || 0;
        } else if (metric.name === 'reach') {
            insights.reach = metric.values[0]?.value || 0;
        } else if (metric.name === 'engagement') {
            insights.engagement = metric.values[0]?.value || 0;
        }
    });

    return insights;
}

// Calculate engagement rate
function calculateEngagementRate(stats) {
    const totalEngagement = (stats.like_count || 0) + (stats.comments_count || 0);
    // Using a base follower count estimate for calculation
    // In production, this should be fetched from user profile
    const estimatedFollowers = 1000; // This should be dynamic
    return totalEngagement > 0 ? parseFloat(((totalEngagement / estimatedFollowers) * 100).toFixed(2)) : 0;
}

// Cache management functions
function getCachedStats(key, allowExpired = false) {
    const cached = statsCache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > STATS_CACHE_DURATION;
    if (isExpired && !allowExpired) return null;

    return cached;
}

function setCachedStats(key, data) {
    statsCache.set(key, {
        data,
        timestamp: Date.now()
    });

    // Clean up old cache entries (simple LRU)
    if (statsCache.size > 100) {
        const firstKey = statsCache.keys().next().value;
        statsCache.delete(firstKey);
    }
}

// Fallback statistics for when API is unavailable
function getFallbackStats(postId) {
    // Generate consistent but varied fallback stats based on postId
    const hash = simpleHash(postId);
    const likes = 20 + (hash % 50);
    const comments = 2 + (hash % 15);

    return {
        postId,
        likes,
        comments,
        engagement_rate: calculateEngagementRate({
            like_count: likes,
            comments_count: comments
        }),
        timestamp: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        fallback: true
    };
}

// Simple hash function for consistent fallback data
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

// Clear stats cache (for admin use)
export async function clearStatsCache() {
    statsCache.clear();
    return { success: true, message: 'Stats cache cleared' };
}