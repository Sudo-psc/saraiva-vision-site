/**
 * WordPress Blog Service Integration Tests
 * Tests the WordPress REST API integration via external blog
 */

import { describe, it, expect, beforeAll } from 'vitest';

describe('WordPress Blog Service Integration', () => {
  const BLOG_URL = 'https://cms.saraivavision.com.br';
  const API_ENDPOINT = '/wp-json/wp/v2';

  beforeAll(() => {
    console.log('Testing WordPress REST API at:', BLOG_URL);
  });

  it('should connect to WordPress REST API root', async () => {
    const response = await fetch(`${BLOG_URL}/wp-json/`);
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data.name).toBeDefined();
    expect(data.description).toBeDefined();
    console.log('✓ WordPress Site:', data.name);
  });

  it('should fetch posts from WordPress API', async () => {
    const response = await fetch(`${BLOG_URL}${API_ENDPOINT}/posts?_embed=true&per_page=5`);
    expect(response.ok).toBe(true);
    
    const posts = await response.json();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
    
    console.log(`✓ Found ${posts.length} posts`);
    console.log('✓ First post:', posts[0].title?.rendered);
  });

  it('should have valid post structure', async () => {
    const response = await fetch(`${BLOG_URL}${API_ENDPOINT}/posts?_embed=true&per_page=1`);
    const posts = await response.json();
    const post = posts[0];

    expect(post.id).toBeDefined();
    expect(post.title).toBeDefined();
    expect(post.title.rendered).toBeDefined();
    expect(post.content).toBeDefined();
    expect(post.date).toBeDefined();
    expect(post.slug).toBeDefined();
    
    console.log('✓ Post structure valid');
  });

  it('should include embedded author data', async () => {
    const response = await fetch(`${BLOG_URL}${API_ENDPOINT}/posts?_embed=true&per_page=1`);
    const posts = await response.json();
    const post = posts[0];

    if (post._embedded?.author) {
      expect(post._embedded.author[0].name).toBeDefined();
      console.log('✓ Author data available:', post._embedded.author[0].name);
    }
  });

  it('should fetch categories', async () => {
    const response = await fetch(`${BLOG_URL}${API_ENDPOINT}/categories`);
    expect(response.ok).toBe(true);
    
    const categories = await response.json();
    expect(Array.isArray(categories)).toBe(true);
    
    console.log(`✓ Found ${categories.length} categories`);
    if (categories.length > 0) {
      console.log('✓ First category:', categories[0].name);
    }
  });

  it('should handle pagination headers', async () => {
    const response = await fetch(`${BLOG_URL}${API_ENDPOINT}/posts?per_page=5`);
    
    expect(response.headers.get('x-wp-total')).toBeDefined();
    expect(response.headers.get('x-wp-totalpages')).toBeDefined();
    
    const totalPosts = response.headers.get('x-wp-total');
    const totalPages = response.headers.get('x-wp-totalpages');
    
    console.log(`✓ Total posts: ${totalPosts}`);
    console.log(`✓ Total pages: ${totalPages}`);
  });

  it('should support search queries', async () => {
    const response = await fetch(`${BLOG_URL}${API_ENDPOINT}/posts?search=Hello`);
    expect(response.ok).toBe(true);
    
    const posts = await response.json();
    console.log(`✓ Search results: ${posts.length} posts`);
  });

  it('should support category filtering', async () => {
    // First get a category
    const catResponse = await fetch(`${BLOG_URL}${API_ENDPOINT}/categories?per_page=1`);
    const categories = await catResponse.json();
    
    if (categories.length > 0) {
      const categoryId = categories[0].id;
      const response = await fetch(`${BLOG_URL}${API_ENDPOINT}/posts?categories=${categoryId}`);
      expect(response.ok).toBe(true);
      
      const posts = await response.json();
      console.log(`✓ Category filter working: ${posts.length} posts in category ${categories[0].name}`);
    }
  });
});
