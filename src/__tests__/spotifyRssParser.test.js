/**
 * Spotify RSS Parser Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import SpotifyRssParser from '../lib/spotifyRssParser.js';

// Mock fetch
global.fetch = vi.fn();

describe('SpotifyRssParser', () => {
    let parser;

    beforeEach(() => {
        parser = new SpotifyRssParser();
        vi.clearAllMocks();
    });

    describe('parseXml', () => {
        it('should parse valid RSS XML', () => {
            const xmlData = `
        <?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Test Podcast</title>
            <description>Test Description</description>
            <link>https://example.com</link>
            <item>
              <title>Episode 1</title>
              <description>Episode 1 description</description>
              <pubDate>Mon, 01 Jan 2024 10:00:00 GMT</pubDate>
              <guid>https://open.spotify.com/episode/abc123</guid>
              <itunes:duration>1800</itunes:duration>
            </item>
          </channel>
        </rss>
      `;

            const result = parser.parseXml(xmlData);

            expect(result.podcast.title).toBe('Test Podcast');
            expect(result.podcast.description).toBe('Test Description');
            expect(result.episodes).toHaveLength(1);
            expect(result.episodes[0].title).toBe('Episode 1');
            expect(result.episodes[0].spotifyId).toBe('abc123');
        });

        it('should handle invalid XML', () => {
            const invalidXml = 'not xml';

            expect(() => parser.parseXml(invalidXml)).toThrow();
        });

        it('should handle missing channel', () => {
            const xmlData = `
        <?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
        </rss>
      `;

            expect(() => parser.parseXml(xmlData)).toThrow('Invalid RSS format: missing channel');
        });
    });

    describe('extractSpotifyId', () => {
        it('should extract Spotify ID from episode URL', () => {
            const guid = 'https://open.spotify.com/episode/abc123def456';
            const result = parser.extractSpotifyId(guid, '');
            expect(result).toBe('abc123def456');
        });

        it('should extract Spotify ID from link if GUID fails', () => {
            const guid = 'some-other-guid';
            const link = 'https://open.spotify.com/episode/xyz789';
            const result = parser.extractSpotifyId(guid, link);
            expect(result).toBe('xyz789');
        });

        it('should return null if no Spotify ID found', () => {
            const result = parser.extractSpotifyId('invalid-guid', 'invalid-link');
            expect(result).toBeNull();
        });

        it('should handle 22-character Spotify IDs', () => {
            const guid = '1234567890123456789012';
            const result = parser.extractSpotifyId(guid, '');
            expect(result).toBe('1234567890123456789012');
        });
    });

    describe('parseDuration', () => {
        it('should parse HH:MM:SS format', () => {
            expect(parser.parseDuration('1:30:45')).toBe(5445000); // 1h 30m 45s in ms
        });

        it('should parse MM:SS format', () => {
            expect(parser.parseDuration('5:30')).toBe(330000); // 5m 30s in ms
        });

        it('should parse seconds only', () => {
            expect(parser.parseDuration('180')).toBe(180000); // 3m in ms
        });

        it('should handle numeric input', () => {
            expect(parser.parseDuration(180)).toBe(180000); // 3m in ms
        });

        it('should return null for invalid input', () => {
            expect(parser.parseDuration('invalid')).toBeNull();
            expect(parser.parseDuration('')).toBeNull();
            expect(parser.parseDuration(null)).toBeNull();
        });
    });

    describe('parseDate', () => {
        it('should parse valid date string', () => {
            const dateString = 'Mon, 01 Jan 2024 10:00:00 GMT';
            const result = parser.parseDate(dateString);
            expect(result).toBe('2024-01-01T10:00:00.000Z');
        });

        it('should return null for invalid date', () => {
            expect(parser.parseDate('invalid-date')).toBeNull();
            expect(parser.parseDate('')).toBeNull();
            expect(parser.parseDate(null)).toBeNull();
        });
    });

    describe('cleanText', () => {
        it('should remove HTML tags', () => {
            const text = '<p>Hello <strong>world</strong></p>';
            expect(parser.cleanText(text)).toBe('Hello world');
        });

        it('should decode HTML entities', () => {
            const text = 'Hello &amp; goodbye &lt;test&gt;';
            expect(parser.cleanText(text)).toBe('Hello & goodbye <test>');
        });

        it('should handle empty input', () => {
            expect(parser.cleanText('')).toBe('');
            expect(parser.cleanText(null)).toBe('');
            expect(parser.cleanText(undefined)).toBe('');
        });
    });

    describe('generateEmbedUrl', () => {
        it('should generate correct embed URL', () => {
            const spotifyId = 'abc123';
            const result = parser.generateEmbedUrl(spotifyId);
            expect(result).toBe('https://open.spotify.com/embed/episode/abc123?utm_source=generator&theme=0');
        });
    });

    describe('validateEpisode', () => {
        it('should validate complete episode', () => {
            const episode = {
                spotifyId: 'abc123',
                title: 'Test Episode',
                publishedAt: '2024-01-01T10:00:00.000Z'
            };
            expect(parser.validateEpisode(episode)).toBe(true);
        });

        it('should reject incomplete episode', () => {
            const episode = {
                title: 'Test Episode'
                // Missing spotifyId and publishedAt
            };
            expect(parser.validateEpisode(episode)).toBe(false);
        });
    });

    describe('parseFromUrl', () => {
        it('should fetch and parse RSS from URL', async () => {
            const mockXml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Test Podcast</title>
            <description>Test Description</description>
            <item>
              <title>Episode 1</title>
              <guid>https://open.spotify.com/episode/abc123</guid>
              <pubDate>Mon, 01 Jan 2024 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>
      `;

            fetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(mockXml)
            });

            const result = await parser.parseFromUrl('https://example.com/rss');

            expect(fetch).toHaveBeenCalledWith('https://example.com/rss', {
                headers: {
                    'User-Agent': 'SaraivaVision-PodcastSync/1.0'
                }
            });

            expect(result.podcast.title).toBe('Test Podcast');
            expect(result.episodes).toHaveLength(1);
        });

        it('should handle fetch errors', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found'
            });

            await expect(parser.parseFromUrl('https://example.com/rss'))
                .rejects.toThrow('Failed to fetch RSS feed: HTTP 404: Not Found');
        });

        it('should handle network errors', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(parser.parseFromUrl('https://example.com/rss'))
                .rejects.toThrow('Failed to fetch RSS feed: Network error');
        });
    });

    describe('extractEpisodes', () => {
        it('should handle single item', () => {
            const item = {
                title: 'Episode 1',
                guid: 'https://open.spotify.com/episode/abc123',
                pubDate: 'Mon, 01 Jan 2024 10:00:00 GMT'
            };

            const result = parser.extractEpisodes(item);
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe('Episode 1');
        });

        it('should handle array of items', () => {
            const items = [
                {
                    title: 'Episode 1',
                    guid: 'https://open.spotify.com/episode/abc123',
                    pubDate: 'Mon, 01 Jan 2024 10:00:00 GMT'
                },
                {
                    title: 'Episode 2',
                    guid: 'https://open.spotify.com/episode/def456',
                    pubDate: 'Tue, 02 Jan 2024 10:00:00 GMT'
                }
            ];

            const result = parser.extractEpisodes(items);
            expect(result).toHaveLength(2);
            // Should be sorted by date descending
            expect(result[0].title).toBe('Episode 2');
            expect(result[1].title).toBe('Episode 1');
        });

        it('should filter out invalid episodes', () => {
            const items = [
                {
                    title: 'Valid Episode',
                    guid: 'https://open.spotify.com/episode/abc123',
                    pubDate: 'Mon, 01 Jan 2024 10:00:00 GMT'
                },
                {
                    title: 'Invalid Episode',
                    // Missing guid/spotifyId
                    pubDate: 'Tue, 02 Jan 2024 10:00:00 GMT'
                }
            ];

            const result = parser.extractEpisodes(items);
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe('Valid Episode');
        });
    });
});