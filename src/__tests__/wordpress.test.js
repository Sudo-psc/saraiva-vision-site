import { 
  fetchPosts, 
  fetchPostBySlug, 
  cleanHtmlContent, 
  extractPlainText, 
  getFeaturedImageUrl,
  getAuthorInfo,
  clearWordPressCache 
} from '@/lib/wordpress';
import { vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

describe('WordPress API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearWordPressCache();
  });

  describe('fetchPosts', () => {
    it('fetches posts successfully', async () => {
      const mockPosts = [
        { id: 1, title: { rendered: 'Test Post' }, slug: 'test-post' }
      ];
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts
      });

      const posts = await fetchPosts();
      expect(posts).toEqual(mockPosts);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/wp-json/wp/v2/posts'),
        expect.any(Object)
      );
    });

    it('handles fetch errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(fetchPosts()).rejects.toThrow('WordPress API Error: 404 Not Found');
    });

    it('accepts query parameters', async () => {
      const mockPosts = [];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts
      });

      await fetchPosts({ per_page: 5, categories: [1] });
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('per_page=5'),
        expect.any(Object)
      );
    });
  });

  describe('fetchPostBySlug', () => {
    it('fetches post by slug successfully', async () => {
      const mockPost = { id: 1, title: { rendered: 'Test Post' }, slug: 'test-post' };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPost]
      });

      const post = await fetchPostBySlug('test-post');
      expect(post).toEqual(mockPost);
    });

    it('throws error when post not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      await expect(fetchPostBySlug('nonexistent')).rejects.toThrow('Post not found');
    });

    it('throws error when slug is missing', async () => {
      await expect(fetchPostBySlug()).rejects.toThrow('Post slug is required');
    });
  });

  describe('Utility Functions', () => {
    describe('cleanHtmlContent', () => {
      it('removes script tags', () => {
        const html = '<p>Safe content</p><script>alert("xss")</script>';
        const cleaned = cleanHtmlContent(html);
        expect(cleaned).toBe('<p>Safe content</p>');
      });

      it('removes javascript: protocols', () => {
        const html = '<a href="javascript:alert()">Link</a>';
        const cleaned = cleanHtmlContent(html);
        expect(cleaned).not.toContain('javascript:');
      }); // eslint-disable-line no-script-url

      it('removes event handlers', () => {
        const html = '<div onclick="alert()">Content</div>';
        const cleaned = cleanHtmlContent(html);
        expect(cleaned).not.toContain('onclick=');
      });

      it('returns empty string for falsy input', () => {
        expect(cleanHtmlContent(null)).toBe('');
        expect(cleanHtmlContent('')).toBe('');
        expect(cleanHtmlContent(undefined)).toBe('');
      });
    });

    describe('extractPlainText', () => {
      it('extracts plain text from HTML', () => {
        const html = '<p>Hello <strong>world</strong>!</p>';
        const text = extractPlainText(html);
        expect(text).toBe('Hello world!');
      });

      it('truncates text to maxLength', () => {
        const html = '<p>This is a very long text that should be truncated</p>';
        const text = extractPlainText(html, 20);
        expect(text).toBe('This is a very long...');
      });

      it('handles empty or null input', () => {
        expect(extractPlainText('')).toBe('');
        expect(extractPlainText(null)).toBe('');
        expect(extractPlainText(undefined)).toBe('');
      });
    });

    describe('getFeaturedImageUrl', () => {
      it('returns image URL for specified size', () => {
        const post = {
          _embedded: {
            'wp:featuredmedia': [{
              media_details: {
                sizes: {
                  large: { source_url: 'https://example.com/large.jpg' },
                  medium: { source_url: 'https://example.com/medium.jpg' }
                }
              },
              source_url: 'https://example.com/full.jpg'
            }]
          }
        };

        expect(getFeaturedImageUrl(post, 'large')).toBe('https://example.com/large.jpg');
        expect(getFeaturedImageUrl(post, 'medium')).toBe('https://example.com/medium.jpg');
      });

      it('falls back to full size when specific size not available', () => {
        const post = {
          _embedded: {
            'wp:featuredmedia': [{
              source_url: 'https://example.com/full.jpg'
            }]
          }
        };

        expect(getFeaturedImageUrl(post, 'large')).toBe('https://example.com/full.jpg');
      });

      it('returns null for posts without featured media', () => {
        const post = { _embedded: {} };
        expect(getFeaturedImageUrl(post)).toBeNull();
        
        const emptyPost = {};
        expect(getFeaturedImageUrl(emptyPost)).toBeNull();
      });
    });

    describe('getAuthorInfo', () => {
      it('extracts author information', () => {
        const post = {
          _embedded: {
            author: [{
              id: 1,
              name: 'John Doe',
              slug: 'john-doe',
              description: 'Author bio',
              avatar_urls: { '96': 'https://example.com/avatar.jpg' },
              link: 'https://example.com/author/john-doe'
            }]
          }
        };

        const author = getAuthorInfo(post);
        expect(author).toEqual({
          id: 1,
          name: 'John Doe',
          slug: 'john-doe',
          description: 'Author bio',
          avatar: { '96': 'https://example.com/avatar.jpg' },
          link: 'https://example.com/author/john-doe'
        });
      });

      it('returns null for posts without author data', () => {
        const post = { _embedded: {} };
        expect(getAuthorInfo(post)).toBeNull();
        
        const emptyPost = {};
        expect(getAuthorInfo(emptyPost)).toBeNull();
      });
    });
  });

  describe('Caching', () => {
    it('caches successful API responses', async () => {
      const mockPosts = [{ id: 1, title: { rendered: 'Test Post' } }];
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts
      });

      // First call
      await fetchPosts();
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await fetchPosts();
      expect(fetch).toHaveBeenCalledTimes(1); // Still only 1 call
    });

    it('clears cache when requested', async () => {
      const mockPosts = [{ id: 1, title: { rendered: 'Test Post' } }];
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockPosts
      });

      // First call
      await fetchPosts();
      expect(fetch).toHaveBeenCalledTimes(1);

      // Clear cache
      clearWordPressCache();

      // Second call should make new request
      await fetchPosts();
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});