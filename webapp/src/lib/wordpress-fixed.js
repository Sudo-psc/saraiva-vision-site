/**
 * WordPress REST API Service - FIXED VERSION
 * Robust integration with WordPress for Clínica Saraiva Vision
 */

// API Configuration
const WORDPRESS_API_URL = 'https://saraivavision.com.br/wp-json/wp/v2';
const WORDPRESS_BLOG_URL = 'https://saraivavision.com.br/blog';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

// Debug logging
const DEBUG = import.meta.env.DEV;
const log = (...args) => {
  if (DEBUG) console.log('[WordPress API]', ...args);
};

/**
 * Robust fetch with CORS handling and error recovery
 */
async function fetchWithRetry(url, options = {}, retries = 3) {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...options.headers
  };

  for (let i = 0; i < retries; i++) {
    try {
      log(`Attempt ${i + 1}/${retries} for:`, url);
      
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors',
        credentials: 'omit' // Important: don't send credentials for CORS
      });

      // Check if response is HTML (common error)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error('Received HTML instead of JSON - API endpoint may be incorrect');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      log(`Attempt ${i + 1} failed:`, error.message);
      
      if (i === retries - 1) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

/**
 * Check WordPress Connection
 */
export async function checkWordPressConnection() {
  try {
    const testUrl = `${WORDPRESS_API_URL}/posts?per_page=1&_fields=id,title`;
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (response.ok) {
      const data = await response.json();
      log('WordPress connection successful, posts found:', Array.isArray(data) ? data.length : 0);
      return true;
    }
    
    log('WordPress connection failed with status:', response.status);
    return false;
  } catch (error) {
    log('WordPress connection error:', error);
    return false;
  }
}

/**
 * Fetch posts with caching
 */
export async function fetchPosts(params = {}) {
  const queryParams = new URLSearchParams({
    per_page: params.per_page || 10,
    page: params.page || 1,
    _embed: 'true', // Include featured media
    ...params
  });

  const url = `${WORDPRESS_API_URL}/posts?${queryParams}`;
  const cacheKey = url;

  // Check cache
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      log('Cache hit for posts');
      return cached.data;
    }
  }

  try {
    const data = await fetchWithRetry(url);
    
    // Validate data
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format - expected array of posts');
    }
    
    // Cache successful response
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    log(`Fetched ${data.length} posts from WordPress`);
    return data;
    
  } catch (error) {
    log('Error fetching posts:', error);
    
    // Return fallback data if API fails
    return getFallbackPosts(params);
  }
}

/**
 * Fetch categories
 */
export async function fetchCategories(params = {}) {
  const queryParams = new URLSearchParams({
    per_page: params.per_page || 100,
    ...params
  });

  const url = `${WORDPRESS_API_URL}/categories?${queryParams}`;
  
  try {
    const data = await fetchWithRetry(url);
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format - expected array of categories');
    }
    
    log(`Fetched ${data.length} categories from WordPress`);
    return data;
    
  } catch (error) {
    log('Error fetching categories:', error);
    return getFallbackCategories();
  }
}

/**
 * Fetch single post by slug
 */
export async function fetchPostBySlug(slug) {
  if (!slug) {
    throw new Error('Slug is required');
  }

  const url = `${WORDPRESS_API_URL}/posts?slug=${encodeURIComponent(slug)}&_embed=true`;
  
  try {
    const data = await fetchWithRetry(url);
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Post not found: ${slug}`);
    }
    
    return data[0];
    
  } catch (error) {
    log('Error fetching post by slug:', error);
    
    // Try fallback
    const fallbackPost = getFallbackPosts().find(p => p.slug === slug);
    if (fallbackPost) {
      return fallbackPost;
    }
    
    throw error;
  }
}

/**
 * Get featured image URL
 */
export function getFeaturedImageUrl(post, size = 'full') {
  try {
    // Check embedded media
    if (post._embedded && post._embedded['wp:featuredmedia']) {
      const media = post._embedded['wp:featuredmedia'][0];
      
      if (media.media_details && media.media_details.sizes) {
        // Try requested size
        if (media.media_details.sizes[size]) {
          return media.media_details.sizes[size].source_url;
        }
        // Fallback to full size
        if (media.media_details.sizes.full) {
          return media.media_details.sizes.full.source_url;
        }
      }
      
      // Use source_url as last resort
      if (media.source_url) {
        return media.source_url;
      }
    }
    
    // Check direct featured_media_url
    if (post.featured_media_url) {
      return post.featured_media_url;
    }
    
  } catch (error) {
    log('Error getting featured image:', error);
  }
  
  // Return placeholder
  return '/img/drphilipe_perfil.png';
}

/**
 * Clean HTML content for safe rendering
 */
export function cleanHtmlContent(html) {
  if (!html) return '';
  
  // Basic HTML cleaning - remove script tags and dangerous elements
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
  
  return cleaned;
}

/**
 * Extract plain text from HTML
 */
export function extractPlainText(html, maxLength = 150) {
  if (!html) return '';
  
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&hellip;/g, '...');
  
  // Trim and limit length
  text = text.trim();
  if (maxLength && text.length > maxLength) {
    text = text.substring(0, maxLength).trim() + '...';
  }
  
  return text;
}

/**
 * Fallback data for when WordPress is unavailable
 */
function getFallbackCategories() {
  return [
    { id: 1, name: 'Saúde Ocular', slug: 'saude-ocular', count: 15 },
    { id: 2, name: 'Exames', slug: 'exames', count: 10 },
    { id: 3, name: 'Tratamentos', slug: 'tratamentos', count: 8 },
    { id: 4, name: 'Cirurgias', slug: 'cirurgias', count: 5 }
  ];
}

function getFallbackPosts(params = {}) {
  const posts = [
    {
      id: 1,
      slug: 'cuidados-com-a-visao',
      title: { rendered: 'Cuidados Essenciais com a Visão' },
      excerpt: { 
        rendered: '<p>Saiba como manter seus olhos saudáveis com dicas do Dr. Philipe Saraiva Cruz, oftalmologista em Caratinga.</p>' 
      },
      content: { 
        rendered: '<p>A saúde ocular é fundamental para qualidade de vida...</p>' 
      },
      date: '2024-01-15T10:00:00',
      link: `${WORDPRESS_BLOG_URL}/cuidados-com-a-visao`,
      categories: [1],
      _embedded: {
        'wp:featuredmedia': [{
          source_url: '/img/drphilipe_perfil.png'
        }]
      }
    },
    {
      id: 2,
      slug: 'importancia-exames-periodicos',
      title: { rendered: 'A Importância dos Exames Oftalmológicos Periódicos' },
      excerpt: { 
        rendered: '<p>Descubra por que realizar exames regulares pode prevenir doenças oculares graves.</p>' 
      },
      content: { 
        rendered: '<p>Exames oftalmológicos regulares são essenciais...</p>' 
      },
      date: '2024-01-10T10:00:00',
      link: `${WORDPRESS_BLOG_URL}/importancia-exames-periodicos`,
      categories: [2],
      _embedded: {
        'wp:featuredmedia': [{
          source_url: '/img/hero.png'
        }]
      }
    },
    {
      id: 3,
      slug: 'cirurgia-catarata-moderna',
      title: { rendered: 'Cirurgia de Catarata: Técnicas Modernas e Recuperação' },
      excerpt: { 
        rendered: '<p>Conheça as técnicas mais avançadas para tratamento de catarata disponíveis em nossa clínica.</p>' 
      },
      content: { 
        rendered: '<p>A catarata é uma das principais causas de cegueira reversível...</p>' 
      },
      date: '2024-01-05T10:00:00',
      link: `${WORDPRESS_BLOG_URL}/cirurgia-catarata-moderna`,
      categories: [4],
      _embedded: {
        'wp:featuredmedia': [{
          source_url: '/img/catartat.jpeg'
        }]
      }
    }
  ];
  
  // Apply pagination
  const page = params.page || 1;
  const perPage = params.per_page || 10;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  
  return posts.slice(start, end);
}

/**
 * Fetch related posts
 */
export async function fetchRelatedPosts(currentPostId, categories = [], limit = 3) {
  const params = {
    per_page: limit + 1, // Get one extra in case current post is included
    exclude: currentPostId
  };
  
  if (categories && categories.length > 0) {
    params.categories = categories.join(',');
  }
  
  try {
    const posts = await fetchPosts(params);
    return posts.filter(p => p.id !== currentPostId).slice(0, limit);
  } catch (error) {
    log('Error fetching related posts:', error);
    return getFallbackPosts({ per_page: limit });
  }
}

/**
 * Get author info
 */
export function getAuthorInfo(post) {
  if (!post) return null;
  
  // Check embedded author
  if (post._embedded && post._embedded.author && post._embedded.author[0]) {
    const author = post._embedded.author[0];
    return {
      name: author.name || 'Dr. Philipe Saraiva Cruz',
      description: author.description || 'Oftalmologista CRM-MG 69.870',
      avatar: author.avatar_urls ? author.avatar_urls['96'] : '/img/drphilipe_perfil.png'
    };
  }
  
  // Default author
  return {
    name: 'Dr. Philipe Saraiva Cruz',
    description: 'Oftalmologista CRM-MG 69.870 - Clínica Saraiva Vision',
    avatar: '/img/drphilipe_perfil.png'
  };
}

/**
 * Fetch post by ID
 */
export async function fetchPostById(id) {
  if (!id) {
    throw new Error('Post ID is required');
  }

  const url = `${WORDPRESS_API_URL}/posts/${id}?_embed=true`;
  
  try {
    return await fetchWithRetry(url);
  } catch (error) {
    log('Error fetching post by ID:', error);
    
    // Try fallback
    const fallbackPost = getFallbackPosts().find(p => p.id === id);
    if (fallbackPost) {
      return fallbackPost;
    }
    
    throw error;
  }
}

// Export all functions
export default {
  checkWordPressConnection,
  fetchPosts,
  fetchCategories,
  fetchPostBySlug,
  fetchPostById,
  fetchRelatedPosts,
  getFeaturedImageUrl,
  extractPlainText,
  cleanHtmlContent,
  getAuthorInfo
};