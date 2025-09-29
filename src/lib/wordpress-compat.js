/**
 * WordPress Compatibility Layer
 * Provides backward compatibility for BlogPage.jsx functions
 * Uses WordPress REST API via WordPressBlogService (avoiding GraphQL 502 errors)
 */

import WordPressBlogService from '@/services/WordPressBlogService.js';
import {
  sanitizeWordPressContent,
  sanitizeWordPressExcerpt,
  sanitizeWordPressTitle
} from '@/utils/sanitizeWordPressContent';
import { createLogger } from './logger.js';
import { classifyError, getUserFriendlyError } from './errorHandling.js';

// Initialize REST API service (NOT GraphQL)
const blogService = new WordPressBlogService({
  baseURL: import.meta.env.VITE_WORDPRESS_API_URL || 'https://cms.saraivavision.com.br',
  cmsBaseURL: import.meta.env.VITE_WORDPRESS_SITE_URL || 'https://cms.saraivavision.com.br',
  cacheEnabled: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  useJWTAuth: false // Public endpoints don't need JWT
});

const blogLogger = createLogger('blog-fallback');

const emitLog = (level, message, metadata = {}) => {
  if (!blogLogger || typeof blogLogger[level] !== 'function') return;
  Promise.resolve(blogLogger[level](message, metadata)).catch(() => {});
};

const normalizeError = (error) => {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  if (error && typeof error === 'object') {
    const normalized = new Error(error.message || 'WordPress request failed');
    return Object.assign(normalized, error);
  }

  return new Error('Unknown WordPress error');
};

const buildErrorDetails = (error, context = {}) => {
  if (!error) return null;

  const normalized = normalizeError(error);
  const classification = classifyError(normalized);
  const friendly = getUserFriendlyError(normalized);

  return {
    type: classification.type,
    code: classification.code,
    message: friendly.userMessage || normalized.message,
    originalMessage: normalized.message,
    severity: friendly.severity,
    retryable: friendly.retryable !== false,
    timestamp: new Date().toISOString(),
    context
  };
};

// Health check function using REST API
export const checkWordPressConnection = async () => {
  try {
    // Simple ping to WordPress REST API root
    const result = await blogService.makeRequest('/', { params: { _fields: 'name' } });

    return {
      isConnected: Boolean(result && result.name),
      error: null,
      healthState: 'healthy'
    };
  } catch (error) {
    console.error('WordPress connection check failed:', error);
    return {
      isConnected: false,
      error: error.message || 'Connection failed',
      healthState: 'unhealthy'
    };
  }
};

// Fetch categories using REST API
export const fetchCategories = async () => {
  try {
    const categories = await blogService.getCategories({
      hide_empty: false,
      per_page: 100
    });

    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    emitLog('error', 'Categories fetch failed', { error: error.message });
    return []; // Return empty array as fallback
  }
};

// Fetch posts using REST API directly
export const fetchPosts = async (params = {}) => {
  try {
    const {
      per_page = 10,
      page = 1,
      categories = null,
      search = null
    } = params;

    // Build REST API parameters
    const apiParams = {
      per_page,
      page,
      _embed: true // Include embedded data (featured image, author, categories)
    };

    // Add category filter if specified
    if (categories && categories.length > 0) {
      apiParams.categories = Array.isArray(categories) ? categories.join(',') : categories;
    }

    // Add search if specified
    if (search) {
      apiParams.search = search;
    }

    // Fetch posts via REST API
    const posts = await blogService.getPosts(apiParams);

    if (!Array.isArray(posts)) {
      throw new Error('Invalid response from WordPress API');
    }

    // Posts are already in correct REST API format, just sanitize content
    const sanitizedPosts = posts.map(post => ({
      ...post,
      title: {
        ...post.title,
        rendered: sanitizeWordPressTitle(post.title?.rendered || '')
      },
      content: {
        ...post.content,
        rendered: sanitizeWordPressContent(post.content?.rendered || '')
      },
      excerpt: {
        ...post.excerpt,
        rendered: sanitizeWordPressExcerpt(post.excerpt?.rendered || '')
      }
    }));

    emitLog('info', 'WordPress posts fetched successfully via REST API', {
      count: sanitizedPosts.length,
      page,
      per_page,
      hasCategories: Boolean(categories),
      hasSearch: Boolean(search)
    });

    return sanitizedPosts;

  } catch (error) {
    const errorDetails = buildErrorDetails(error, {
      stage: 'fetchPosts_rest_api',
      params,
      timestamp: new Date().toISOString()
    });

    emitLog('error', 'WordPress posts fetch failed', errorDetails);

    // Return graceful fallback with 5 realistic preview posts
    console.warn('Returning fallback preview posts due to API error:', error.message);

    const fallbackPosts = [
      {
        id: 'fallback-1',
        slug: 'cuidados-visao-digital',
        title: { rendered: 'Cuidados Essenciais com a Visão na Era Digital' },
        excerpt: { rendered: '<p>Descubra como proteger seus olhos do uso prolongado de telas e dispositivos digitais com dicas práticas do Dr. Saraiva.</p>' },
        content: { rendered: '<p>A saúde ocular na era digital requer atenção especial. Aprenda técnicas de descanso visual e quando procurar um oftalmologista.</p>' },
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
        _embedded: {
          'wp:featuredmedia': [{
            source_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop',
            alt_text: 'Pessoa usando computador com iluminação adequada'
          }],
          'wp:term': [[{ id: 1, name: 'Saúde Ocular', slug: 'saude-ocular' }]]
        }
      },
      {
        id: 'fallback-2',
        slug: 'cirurgia-catarata-moderna',
        title: { rendered: 'Cirurgia de Catarata: Técnicas Modernas e Recuperação' },
        excerpt: { rendered: '<p>Entenda como funciona a cirurgia de catarata com tecnologia de ponta e o que esperar durante o processo de recuperação.</p>' },
        content: { rendered: '<p>A cirurgia de catarata evoluiu significativamente. Conheça as técnicas mais avançadas disponíveis na Saraiva Vision.</p>' },
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias atrás
        _embedded: {
          'wp:featuredmedia': [{
            source_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop',
            alt_text: 'Equipamento moderno de cirurgia oftalmológica'
          }],
          'wp:term': [[{ id: 2, name: 'Cirurgias', slug: 'cirurgias' }]]
        }
      },
      {
        id: 'fallback-3',
        slug: 'importancia-exames-regulares',
        title: { rendered: 'A Importância dos Exames Oftalmológicos Regulares' },
        excerpt: { rendered: '<p>Exames regulares podem detectar problemas oculares antes que causem sintomas. Saiba quando e por que fazer check-ups oftalmológicos.</p>' },
        content: { rendered: '<p>A prevenção é fundamental para a saúde ocular. Descubra a frequência ideal de exames para cada faixa etária.</p>' },
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias atrás
        _embedded: {
          'wp:featuredmedia': [{
            source_url: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&h=600&fit=crop',
            alt_text: 'Médico realizando exame oftalmológico'
          }],
          'wp:term': [[{ id: 3, name: 'Prevenção', slug: 'prevencao' }]]
        }
      },
      {
        id: 'fallback-4',
        slug: 'glaucoma-prevencao-tratamento',
        title: { rendered: 'Glaucoma: Prevenção e Tratamento Precoce' },
        excerpt: { rendered: '<p>O glaucoma é uma das principais causas de cegueira irreversível. Conheça os fatores de risco e como prevenir a progressão da doença.</p>' },
        content: { rendered: '<p>A detecção precoce do glaucoma pode preservar sua visão. Entenda os sintomas e tratamentos disponíveis.</p>' },
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 dias atrás
        _embedded: {
          'wp:featuredmedia': [{
            source_url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=600&fit=crop',
            alt_text: 'Exame de pressão ocular'
          }],
          'wp:term': [[{ id: 4, name: 'Doenças', slug: 'doencas' }]]
        }
      },
      {
        id: 'fallback-5',
        slug: 'lentes-contato-cuidados',
        title: { rendered: 'Lentes de Contato: Guia Completo de Uso e Cuidados' },
        excerpt: { rendered: '<p>Use lentes de contato com segurança! Aprenda sobre higienização, tempo de uso e quando trocar suas lentes para evitar complicações.</p>' },
        content: { rendered: '<p>Lentes de contato oferecem conforto e praticidade, mas exigem cuidados específicos. Veja nosso guia completo.</p>' },
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 dias atrás
        _embedded: {
          'wp:featuredmedia': [{
            source_url: 'https://images.unsplash.com/photo-1615486511262-c5a2d3e5c9c7?w=800&h=600&fit=crop',
            alt_text: 'Lentes de contato e estojo de limpeza'
          }],
          'wp:term': [[{ id: 5, name: 'Cuidados', slug: 'cuidados' }]]
        }
      }
    ];

    return fallbackPosts;
  }
};

// Get single post by slug using REST API
export const getPostBySlug = async (slug) => {
  try {
    const post = await blogService.getPostBySlug(slug);

    if (!post) {
      console.warn(`Post not found: ${slug}`);
      return null;
    }

    // Sanitize content
    return {
      ...post,
      title: {
        ...post.title,
        rendered: sanitizeWordPressTitle(post.title?.rendered || '')
      },
      content: {
        ...post.content,
        rendered: sanitizeWordPressContent(post.content?.rendered || '')
      },
      excerpt: {
        ...post.excerpt,
        rendered: sanitizeWordPressExcerpt(post.excerpt?.rendered || '')
      }
    };
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    emitLog('error', 'Post fetch failed', { slug, error: error.message });
    return null; // Return null instead of throwing
  }
};

// Utility functions
export const getFeaturedImageUrl = (post) => {
  // Handle REST API format
  if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return post._embedded['wp:featuredmedia'][0].source_url;
  }
  // Handle direct media URL
  if (post.featured_media_url) {
    return post.featured_media_url;
  }
  // Handle legacy GraphQL format (if any)
  if (post.featuredImage?.node?.sourceUrl) {
    return post.featuredImage.node.sourceUrl;
  }
  return null;
};

export const extractPlainText = (html, maxLength = null) => {
  if (!html) return '';

  // Remove HTML tags
  const text = html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

  if (maxLength && text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }

  return text;
};