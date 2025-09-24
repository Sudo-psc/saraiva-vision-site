/**
 * Podcast Sync API
 * Synchronizes Spotify podcast episodes with local database
 */

import { createClient } from '@supabase/supabase-js';
import SpotifyRssParser from '../../src/lib/spotifyRssParser.js';

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configuration
const MAX_EPISODES_PER_SYNC = 50;
const SYNC_TIMEOUT = 25000; // 25 seconds (under Vercel's 30s limit)

export default async function handler(req, res) {
    // Set timeout for the entire operation
    const timeoutId = setTimeout(() => {
        if (!res.headersSent) {
            res.status(504).json({
                success: false,
                error: {
                    code: 'SYNC_TIMEOUT',
                    message: 'Podcast sync operation timed out',
                    timestamp: new Date().toISOString()
                }
            });
        }
    }, SYNC_TIMEOUT);

    try {
        // Only allow POST requests and cron jobs
        if (req.method !== 'POST') {
            clearTimeout(timeoutId);
            return res.status(405).json({
                success: false,
                error: {
                    code: 'METHOD_NOT_ALLOWED',
                    message: 'Only POST method is allowed',
                    timestamp: new Date().toISOString()
                }
            });
        }

        // Get RSS URL at runtime
        const SPOTIFY_RSS_URL = process.env.SPOTIFY_RSS_URL;

        // Validate environment variables
        if (!SPOTIFY_RSS_URL) {
            clearTimeout(timeoutId);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'MISSING_CONFIG',
                    message: 'Spotify RSS URL not configured',
                    timestamp: new Date().toISOString()
                }
            });
        }

        // Log sync start
        await logEvent('podcast_sync_started', {
            rssUrl: SPOTIFY_RSS_URL,
            maxEpisodes: MAX_EPISODES_PER_SYNC
        });

        // Parse RSS feed
        const parser = new SpotifyRssParser();
        const { podcast, episodes } = await parser.parseFromUrl(SPOTIFY_RSS_URL);

        if (!episodes || episodes.length === 0) {
            clearTimeout(timeoutId);
            await logEvent('podcast_sync_no_episodes', { podcast });
            return res.status(200).json({
                success: true,
                message: 'No episodes found in RSS feed',
                data: {
                    podcast,
                    episodesProcessed: 0,
                    episodesUpdated: 0,
                    episodesCreated: 0
                }
            });
        }

        // Limit episodes to process
        const episodesToProcess = episodes.slice(0, MAX_EPISODES_PER_SYNC);

        // Get existing episodes from database
        const { data: existingEpisodes, error: fetchError } = await supabase
            .from('podcast_episodes')
            .select('spotify_id, updated_at')
            .in('spotify_id', episodesToProcess.map(ep => ep.spotifyId));

        if (fetchError) {
            throw new Error(`Failed to fetch existing episodes: ${fetchError.message}`);
        }

        // Create lookup map for existing episodes
        const existingMap = new Map(
            existingEpisodes.map(ep => [ep.spotify_id, ep.updated_at])
        );

        // Process episodes
        const results = {
            episodesProcessed: 0,
            episodesCreated: 0,
            episodesUpdated: 0,
            errors: []
        };

        for (const episode of episodesToProcess) {
            try {
                const episodeData = {
                    spotify_id: episode.spotifyId,
                    title: episode.title,
                    description: episode.description,
                    duration_ms: episode.duration,
                    published_at: episode.publishedAt,
                    spotify_url: episode.spotifyUrl,
                    embed_url: episode.embedUrl,
                    image_url: episode.imageUrl,
                    updated_at: new Date().toISOString()
                };

                const isExisting = existingMap.has(episode.spotifyId);

                if (isExisting) {
                    // Update existing episode
                    const { error: updateError } = await supabase
                        .from('podcast_episodes')
                        .update(episodeData)
                        .eq('spotify_id', episode.spotifyId);

                    if (updateError) {
                        throw new Error(`Update failed: ${updateError.message}`);
                    }

                    results.episodesUpdated++;
                } else {
                    // Create new episode
                    episodeData.created_at = new Date().toISOString();

                    const { error: insertError } = await supabase
                        .from('podcast_episodes')
                        .insert([episodeData]);

                    if (insertError) {
                        throw new Error(`Insert failed: ${insertError.message}`);
                    }

                    results.episodesCreated++;
                }

                results.episodesProcessed++;

            } catch (error) {
                console.error(`Error processing episode ${episode.spotifyId}:`, error);
                results.errors.push({
                    spotifyId: episode.spotifyId,
                    title: episode.title,
                    error: error.message
                });
            }
        }

        // Log sync completion
        await logEvent('podcast_sync_completed', {
            ...results,
            podcast: {
                title: podcast.title,
                totalEpisodes: episodes.length
            }
        });

        clearTimeout(timeoutId);

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Podcast sync completed successfully',
            data: {
                podcast: {
                    title: podcast.title,
                    description: podcast.description,
                    totalEpisodes: episodes.length
                },
                ...results
            }
        });

    } catch (error) {
        clearTimeout(timeoutId);

        console.error('Podcast sync error:', error);

        // Log error
        await logEvent('podcast_sync_error', {
            error: error.message,
            stack: error.stack
        }, 'error');

        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: {
                    code: 'SYNC_FAILED',
                    message: error.message,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
}

/**
 * Log event to database
 * @param {string} eventType - Type of event
 * @param {Object} eventData - Event data
 * @param {string} severity - Log severity level
 */
async function logEvent(eventType, eventData, severity = 'info') {
    try {
        await supabase
            .from('event_log')
            .insert([{
                event_type: eventType,
                event_data: eventData,
                severity,
                source: 'podcast_sync_api',
                created_at: new Date().toISOString()
            }]);
    } catch (error) {
        console.error('Failed to log event:', error);
    }
}