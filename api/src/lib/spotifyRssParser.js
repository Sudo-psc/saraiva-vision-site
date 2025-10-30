/**
 * Spotify RSS Feed Parser
 * Parses Spotify podcast RSS feeds and extracts episode metadata
 */

import { XMLParser } from 'fast-xml-parser';

/**
 * A parser for Spotify podcast RSS feeds.
 */
export class SpotifyRssParser {
    /**
     * Creates an instance of SpotifyRssParser.
     */
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
     * Parses a podcast RSS feed from a given URL.
     *
     * @param {string} rssUrl The URL of the RSS feed.
     * @returns {Promise<object>} A promise that resolves with the parsed podcast data.
     * @throws {Error} An error if the feed cannot be fetched or parsed.
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
     * Parses a podcast RSS feed from an XML string.
     *
     * @param {string} xmlData The XML data of the RSS feed.
     * @returns {object} The parsed podcast data.
     * @throws {Error} An error if the XML cannot be parsed.
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
     * Extracts podcast metadata from the RSS channel object.
     *
     * @param {object} channel The RSS channel object.
     * @returns {object} An object containing the podcast information.
     * @private
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
     * Extracts and processes episodes from the RSS item array.
     *
     * @param {Array<object>} items An array of RSS item objects.
     * @returns {Array<object>} An array of processed episode objects.
     * @private
     */
    extractEpisodes(items) {
        const itemsArray = Array.isArray(items) ? items : [items];

        return itemsArray
            .map(item => this.extractEpisodeData(item))
            .filter(episode => episode !== null)
            .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    }

    /**
     * Extracts and processes individual episode data from an RSS item object.
     *
     * @param {object} item The RSS item object.
     * @returns {object|null} An object containing the episode data, or `null` if the item is invalid.
     * @private
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
     * Extracts the Spotify episode ID from a GUID or link.
     *
     * @param {string} guid The episode GUID.
     * @param {string} link The episode link.
     * @returns {string|null} The Spotify episode ID, or `null` if not found.
     * @private
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
     * Extracts the Spotify URL for an episode.
     *
     * @param {string} link The episode link.
     * @param {string} guid The episode GUID.
     * @returns {string|null} The Spotify URL, or `null` if not found.
     * @private
     */
    extractSpotifyUrl(link, guid) {
        if (link && link.includes('spotify.com')) {
            return link;
        }

        const spotifyId = this.extractSpotifyId(guid, link);
        return spotifyId ? `https://open.spotify.com/episode/${spotifyId}` : null;
    }

    /**
     * Generates a Spotify embed URL for an episode.
     *
     * @param {string} spotifyId The Spotify episode ID.
     * @returns {string} The Spotify embed URL.
     * @private
     */
    generateEmbedUrl(spotifyId) {
        return `https://open.spotify.com/embed/episode/${spotifyId}?utm_source=generator&theme=0`;
    }

    /**
     * Extracts an image URL from an RSS data object.
     *
     * @param {object} data The RSS data object.
     * @returns {string|null} The image URL, or `null` if not found.
     * @private
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
     * Extracts the image URL for an episode.
     *
     * @param {object} item The RSS item object.
     * @returns {string|null} The episode image URL, or `null` if not found.
     * @private
     */
    extractEpisodeImage(item) {
        return this.extractImage(item) || null;
    }

    /**
     * Parses a duration string (e.g., "HH:MM:SS", "MM:SS", or seconds) into milliseconds.
     *
     * @param {string|number} duration The duration string or number of seconds.
     * @returns {number|null} The duration in milliseconds, or `null` if parsing fails.
     * @private
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
     * Parses a date string into an ISO 8601 formatted string.
     *
     * @param {string} dateString The date string to parse.
     * @returns {string|null} The ISO 8601 formatted date string, or `null` if parsing fails.
     * @private
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
     * Cleans and sanitizes text content by removing HTML tags and decoding HTML entities.
     *
     * @param {string} text The raw text to clean.
     * @returns {string} The cleaned text.
     * @private
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
     * Validates that an episode object has the required properties.
     *
     * @param {object} episode The episode object to validate.
     * @returns {boolean} `true` if the episode is valid, `false` otherwise.
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