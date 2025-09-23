/**
 * Podcast Integration Tests
 * Tests the complete podcast functionality end-to-end
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import SpotifyRssParser from '../lib/spotifyRssParser.js';

describe('Podcast Integration', () => {
    let parser;

    beforeEach(() => {
        parser = new SpotifyRssParser();
    });

    it('should parse a complete RSS feed and extract episodes', () => {
        const sampleRssXml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
        <channel>
          <title>Saúde Ocular com Dr. Philipe</title>
          <description>Podcast sobre saúde ocular e oftalmologia</description>
          <link>https://saraivavision.com.br</link>
          <language>pt-BR</language>
          <itunes:image href="https://example.com/podcast-cover.jpg" />
          
          <item>
            <title>Catarata: Sintomas e Tratamentos</title>
            <description>Neste episódio, falamos sobre catarata, seus sintomas e as opções de tratamento disponíveis.</description>
            <pubDate>Mon, 01 Jan 2024 10:00:00 GMT</pubDate>
            <guid>https://open.spotify.com/episode/abc123def456</guid>
            <itunes:duration>1800</itunes:duration>
            <itunes:image href="https://example.com/episode1.jpg" />
            <enclosure url="https://example.com/episode1.mp3" length="25600000" type="audio/mpeg" />
          </item>
          
          <item>
            <title>Glaucoma: Prevenção é Fundamental</title>
            <description>Discutimos a importância da prevenção do glaucoma e os exames necessários.</description>
            <pubDate>Sun, 31 Dec 2023 10:00:00 GMT</pubDate>
            <guid>https://open.spotify.com/episode/xyz789ghi012</guid>
            <itunes:duration>2100</itunes:duration>
            <itunes:image href="https://example.com/episode2.jpg" />
            <enclosure url="https://example.com/episode2.mp3" length="30720000" type="audio/mpeg" />
          </item>
        </channel>
      </rss>
    `;

        const result = parser.parseXml(sampleRssXml);

        // Verify podcast metadata
        expect(result.podcast.title).toBe('Saúde Ocular com Dr. Philipe');
        expect(result.podcast.description).toBe('Podcast sobre saúde ocular e oftalmologia');
        expect(result.podcast.language).toBe('pt-BR');

        // Verify episodes
        expect(result.episodes).toHaveLength(2);

        // Verify first episode (should be sorted by date descending)
        const firstEpisode = result.episodes[0];
        expect(firstEpisode.title).toBe('Catarata: Sintomas e Tratamentos');
        expect(firstEpisode.spotifyId).toBe('abc123def456');
        expect(firstEpisode.duration).toBe(1800000); // 30 minutes in milliseconds
        expect(firstEpisode.publishedAt).toBe('2024-01-01T10:00:00.000Z');
        expect(firstEpisode.embedUrl).toBe('https://open.spotify.com/embed/episode/abc123def456?utm_source=generator&theme=0');

        // Verify second episode
        const secondEpisode = result.episodes[1];
        expect(secondEpisode.title).toBe('Glaucoma: Prevenção é Fundamental');
        expect(secondEpisode.spotifyId).toBe('xyz789ghi012');
        expect(secondEpisode.duration).toBe(2100000); // 35 minutes in milliseconds
        expect(secondEpisode.publishedAt).toBe('2023-12-31T10:00:00.000Z');
    });

    it('should handle various duration formats', () => {
        expect(parser.parseDuration('30:45')).toBe(1845000); // 30m 45s
        expect(parser.parseDuration('1:15:30')).toBe(4530000); // 1h 15m 30s
        expect(parser.parseDuration('1800')).toBe(1800000); // 30m in seconds
        expect(parser.parseDuration(1800)).toBe(1800000); // 30m as number
    });

    it('should clean HTML content from descriptions', () => {
        const htmlContent = '<p>Este é um <strong>episódio importante</strong> sobre <em>saúde ocular</em>.</p>';
        const cleanContent = parser.cleanText(htmlContent);
        expect(cleanContent).toBe('Este é um episódio importante sobre saúde ocular.');
    });

    it('should generate correct Spotify embed URLs', () => {
        const spotifyId = 'abc123def456';
        const embedUrl = parser.generateEmbedUrl(spotifyId);
        expect(embedUrl).toBe('https://open.spotify.com/embed/episode/abc123def456?utm_source=generator&theme=0');
    });

    it('should validate episode data correctly', () => {
        const validEpisode = {
            spotifyId: 'abc123',
            title: 'Test Episode',
            publishedAt: '2024-01-01T10:00:00.000Z'
        };
        expect(parser.validateEpisode(validEpisode)).toBe(true);

        const invalidEpisode = {
            title: 'Test Episode'
            // Missing spotifyId and publishedAt
        };
        expect(parser.validateEpisode(invalidEpisode)).toBe(false);
    });

    it('should extract Spotify IDs from various formats', () => {
        // Standard Spotify episode URL
        expect(parser.extractSpotifyId('https://open.spotify.com/episode/abc123def456', '')).toBe('abc123def456');

        // From link parameter
        expect(parser.extractSpotifyId('other-guid', 'https://open.spotify.com/episode/xyz789')).toBe('xyz789');

        // 22-character ID
        expect(parser.extractSpotifyId('1234567890123456789012', '')).toBe('1234567890123456789012');

        // Invalid formats
        expect(parser.extractSpotifyId('invalid-guid', 'invalid-link')).toBeNull();
    });

    it('should handle empty or invalid RSS feeds gracefully', () => {
        // Empty channel
        const emptyRss = `
      <?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Empty Podcast</title>
          <description>No episodes</description>
        </channel>
      </rss>
    `;

        const result = parser.parseXml(emptyRss);
        expect(result.podcast.title).toBe('Empty Podcast');
        expect(result.episodes).toHaveLength(0);

        // Invalid XML should throw
        expect(() => parser.parseXml('not xml')).toThrow();
        expect(() => parser.parseXml('<rss></rss>')).toThrow('Invalid RSS format: missing channel');
    });

    it('should filter out episodes without Spotify IDs', () => {
        const mixedRss = `
      <?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Mixed Podcast</title>
          <description>Some valid, some invalid episodes</description>
          
          <item>
            <title>Valid Episode</title>
            <description>Has Spotify ID</description>
            <pubDate>Mon, 01 Jan 2024 10:00:00 GMT</pubDate>
            <guid>https://open.spotify.com/episode/valid123</guid>
          </item>
          
          <item>
            <title>Invalid Episode</title>
            <description>No Spotify ID</description>
            <pubDate>Sun, 31 Dec 2023 10:00:00 GMT</pubDate>
            <guid>some-other-guid-format</guid>
          </item>
        </channel>
      </rss>
    `;

        const result = parser.parseXml(mixedRss);
        expect(result.episodes).toHaveLength(1);
        expect(result.episodes[0].title).toBe('Valid Episode');
        expect(result.episodes[0].spotifyId).toBe('valid123');
    });

    it('should sort episodes by publication date descending', () => {
        const multiEpisodeRss = `
      <?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Test Podcast</title>
          <description>Multiple episodes</description>
          
          <item>
            <title>Older Episode</title>
            <pubDate>Mon, 01 Jan 2024 10:00:00 GMT</pubDate>
            <guid>https://open.spotify.com/episode/older123</guid>
          </item>
          
          <item>
            <title>Newer Episode</title>
            <pubDate>Wed, 03 Jan 2024 10:00:00 GMT</pubDate>
            <guid>https://open.spotify.com/episode/newer123</guid>
          </item>
          
          <item>
            <title>Middle Episode</title>
            <pubDate>Tue, 02 Jan 2024 10:00:00 GMT</pubDate>
            <guid>https://open.spotify.com/episode/middle123</guid>
          </item>
        </channel>
      </rss>
    `;

        const result = parser.parseXml(multiEpisodeRss);
        expect(result.episodes).toHaveLength(3);

        // Should be sorted newest first
        expect(result.episodes[0].title).toBe('Newer Episode');
        expect(result.episodes[1].title).toBe('Middle Episode');
        expect(result.episodes[2].title).toBe('Older Episode');
    });
});