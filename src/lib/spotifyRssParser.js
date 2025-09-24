/**
 * Spotify RSS Feed Parser
 * Parses Spotify podcast RSS feeds and extracts episode metadata
 */

import { XMLParser } from 'fast-xml-parser';

export class SpotifyRssParser {
    constructor() {
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            textNodeName: '#text',
            parseAttributeValue: true,
            trimValues: true
        });
    }

    /**
     * Parse RSS feed from URL
     * @param {string} rssUrl - The RSS feed URL
     * @returns {Promise<Object>} Parsed podcast data
     */
    async parseFromUrl(rssUrl) {
        try {
            const response = await fetch(rssUrl, {
                headers: {
                    'User-Agent': 'SaraivaVision-PodcastSync/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const xmlData = await response.text();
            return this.parseXml(xmlData);
        } catch (error) {
            throw new Error(`Failed to fetch RSS feed: ${error.message}`);
        }
    }

    /**
     * Parse XML string
     * @param {string} xmlData - Raw XML data
     * @returns {Object} Parsed podcast data
     */
    parseXml(xmlData) {
        try {
            const parsed = this.parser.parse(xmlData);
            const channel = parsed.rss?.channel;

            if (!channel) {
                throw new Error('Invalid RSS format: missing channel');
            }

            return {
                podcast: this.extractPodcastInfo(channel),
                episodes: this.extractEpisodes(channel.item || [])
            };
        } catch (error) {
            throw new Error(`Failed to parse XML: ${error.message}`);
        }
    }

    /**
     * Extract podcast metadata
     * @param {Object} channel - RSS channel object
     * @returns {Object} Podcast information
     */
    extractPodcastInfo(channel) {
        return {
            title: channel.title || '',
            description: channel.description || '',
            link: channel.link || '',
            language: channel.language || 'pt-BR',
            image: this.extractImage(channel),
            lastBuildDate: channel.lastBuildDate || channel.pubDate || null
        };
    }

    /**
     * Extract episodes from RSS items
     * @param {Array} items - RSS item array
     * @returns {Array} Processed episodes
     */
    extractEpisodes(items) {
        const itemsArray = Array.isArray(items) ? items : [items];

        return itemsArray
            .map(item => this.extractEpisodeData(item))
            .filter(episode => episode !== null)
            .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    }

    /**
     * Extract individual episode data
     * @param {Object} item - RSS item object
     * @returns {Object|null} Episode data or null if invalid
     */
    extractEpisodeData(item) {
        try {
            const guid = item.guid?.['#text'] || item.guid || '';
            const spotifyId = this.extractSpotifyId(guid, item.link);

            if (!spotifyId) {
                console.warn('Episode missing Spotify ID, skipping:', item.title);
                return null;
            }

            const enclosure = item.enclosure;
            const itunesData = item['itunes:duration'] || item.duration;

            return {
                spotifyId,
                title: this.cleanText(item.title || ''),
                description: this.cleanText(item.description || item['itunes:summary'] || ''),
                publishedAt: this.parseDate(item.pubDate),
                duration: this.parseDuration(itunesData),
                spotifyUrl: this.extractSpotifyUrl(item.link, guid),
                embedUrl: this.generateEmbedUrl(spotifyId),
                imageUrl: this.extractEpisodeImage(item),
                audioUrl: enclosure?.['@_url'] || null,
                fileSize: enclosure?.['@_length'] || null,
                mimeType: enclosure?.['@_type'] || null
            };
        } catch (error) {
            console.error('Error extracting episode data:', error, item);
            return null;
        }
    }

    /**
     * Extract Spotify ID from GUID or link
     * @param {string} guid - Episode GUID
     * @param {string} link - Episode link
     * @returns {string|null} Spotify episode ID
     */
    extractSpotifyId(guid, link) {
        // Try to extract from GUID first
        const guidMatch = guid.match(/episode\/([a-zA-Z0-9]+)/);
        if (guidMatch) return guidMatch[1];

        // Try to extract from link
        const linkMatch = (link || '').match(/episode\/([a-zA-Z0-9]+)/);
        if (linkMatch) return linkMatch[1];

        // Try alternative patterns
        const altMatch = guid.match(/([a-zA-Z0-9]{22})/);
        if (altMatch) return altMatch[1];

        return null;
    }

    /**
     * Extract Spotify URL
     * @param {string} link - Episode link
     * @param {string} guid - Episode GUID
     * @returns {string|null} Spotify URL
     */
    extractSpotifyUrl(link, guid) {
        if (link && link.includes('spotify.com')) {
            return link;
        }

        const spotifyId = this.extractSpotifyId(guid, link);
        return spotifyId ? `https://open.spotify.com/episode/${spotifyId}` : null;
    }

    /**
     * Generate Spotify embed URL
     * @param {string} spotifyId - Spotify episode ID
     * @returns {string} Embed URL
     */
    generateEmbedUrl(spotifyId) {
        return `https://open.spotify.com/embed/episode/${spotifyId}?utm_source=generator&theme=0`;
    }

    /**
     * Extract image URL
     * @param {Object} data - RSS data object
     * @returns {string|null} Image URL
     */
    extractImage(data) {
        // Try iTunes image first
        if (data['itunes:image']?.['@_href']) {
            return data['itunes:image']['@_href'];
        }

        // Try standard image
        if (data.image?.url) {
            return data.image.url;
        }

        // Try image as direct URL
        if (typeof data.image === 'string') {
            return data.image;
        }

        return null;
    }

    /**
     * Extract episode-specific image
     * @param {Object} item - RSS item
     * @returns {string|null} Episode image URL
     */
    extractEpisodeImage(item) {
        return this.extractImage(item) || null;
    }

    /**
     * Parse duration from various formats
     * @param {string|number} duration - Duration string or number
     * @returns {number|null} Duration in milliseconds
     */
    parseDuration(duration) {
        if (!duration) return null;

        // If already a number, assume seconds
        if (typeof duration === 'number') {
            return duration * 1000;
        }

        // Parse HH:MM:SS or MM:SS format
        const timeMatch = duration.match(/^(?:(\d+):)?(\d+):(\d+)$/);
        if (timeMatch) {
            const hours = parseInt(timeMatch[1] || '0', 10);
            const minutes = parseInt(timeMatch[2], 10);
            const seconds = parseInt(timeMatch[3], 10);
            return (hours * 3600 + minutes * 60 + seconds) * 1000;
        }

        // Parse seconds only
        const secondsMatch = duration.match(/^(\d+)$/);
        if (secondsMatch) {
            return parseInt(secondsMatch[1], 10) * 1000;
        }

        return null;
    }

    /**
     * Parse date string to ISO format
     * @param {string} dateString - Date string
     * @returns {string|null} ISO date string
     */
    parseDate(dateString) {
        if (!dateString) return null;

        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? null : date.toISOString();
        } catch (error) {
            console.warn('Failed to parse date:', dateString);
            return null;
        }
    }

    /**
     * Clean and sanitize text content
     * @param {string} text - Raw text
     * @returns {string} Cleaned text
     */
    cleanText(text) {
        if (!text) return '';

        return text
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
            .replace(/&amp;/g, '&') // Replace &amp; with &
            .replace(/&lt;/g, '<') // Replace &lt; with <
            .replace(/&gt;/g, '>') // Replace &gt; with >
            .replace(/&quot;/g, '"') // Replace &quot; with "
            .replace(/&#39;/g, "'") // Replace &#39; with '
            .trim();
    }

    /**
     * Validate episode data
     * @param {Object} episode - Episode object
     * @returns {boolean} Is valid episode
     */
    validateEpisode(episode) {
        return !!(
            episode.spotifyId &&
            episode.title &&
            episode.publishedAt
        );
    }
}

export default SpotifyRssParser;