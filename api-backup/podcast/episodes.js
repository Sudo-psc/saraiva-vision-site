/**
 * Podcast Episodes API
 * Fetches podcast episodes from database with pagination and filtering
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

export default async function handler(req, res) {
    try {
        // Only allow GET requests
        if (req.method !== 'GET') {
            return res.status(405).json({
                success: false,
                error: {
                    code: 'METHOD_NOT_ALLOWED',
                    message: 'Only GET method is allowed',
                    timestamp: new Date().toISOString()
                }
            });
        }

        // Parse query parameters
        const {
            page = '1',
            limit = DEFAULT_LIMIT.toString(),
            search = '',
            sortBy = 'published_at',
            sortOrder = 'desc'
        } = req.query;

        // Validate and sanitize parameters
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT));
        const offset = (pageNum - 1) * limitNum;

        // Validate sort parameters
        const validSortFields = ['published_at', 'title', 'duration_ms', 'created_at'];
        const validSortOrders = ['asc', 'desc'];

        const sortField = validSortFields.includes(sortBy) ? sortBy : 'published_at';
        const sortDirection = validSortOrders.includes(sortOrder) ? sortOrder : 'desc';

        // Build query
        let query = supabase
            .from('podcast_episodes')
            .select(`
        id,
        spotify_id,
        title,
        description,
        duration_ms,
        published_at,
        spotify_url,
        embed_url,
        image_url,
        created_at
      `, { count: 'exact' });

        // Add search filter if provided
        if (search.trim()) {
            const searchTerm = search.trim();
            query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        // Add sorting
        query = query.order(sortField, { ascending: sortDirection === 'asc' });

        // Add pagination
        query = query.range(offset, offset + limitNum - 1);

        // Execute query
        const { data: episodes, error, count } = await query;

        if (error) {
            throw new Error(`Database query failed: ${error.message}`);
        }

        // Calculate pagination metadata
        const totalPages = Math.ceil((count || 0) / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        // Format episodes data
        const formattedEpisodes = episodes.map(episode => ({
            id: episode.id,
            spotifyId: episode.spotify_id,
            title: episode.title,
            description: episode.description,
            duration: episode.duration_ms,
            publishedAt: episode.published_at,
            spotifyUrl: episode.spotify_url,
            embedUrl: episode.embed_url,
            imageUrl: episode.image_url,
            createdAt: episode.created_at,
            // Add formatted duration for display
            formattedDuration: formatDuration(episode.duration_ms)
        }));

        // Return success response
        res.status(200).json({
            success: true,
            data: {
                episodes: formattedEpisodes,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalCount: count || 0,
                    limit: limitNum,
                    hasNextPage,
                    hasPrevPage
                },
                meta: {
                    search: search.trim() || null,
                    sortBy: sortField,
                    sortOrder: sortDirection
                }
            }
        });

    } catch (error) {
        console.error('Podcast episodes API error:', error);

        res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_FAILED',
                message: error.message,
                timestamp: new Date().toISOString()
            }
        });
    }
}

/**
 * Format duration from milliseconds to human-readable string
 * @param {number|null} durationMs - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
function formatDuration(durationMs) {
    if (!durationMs || durationMs <= 0) {
        return '0:00';
    }

    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}