/**
 * WordPress REST API Service
 * Handles all WordPress headless CMS API interactions
 * Implements caching, error handling, and security best practices
 */

// Get WordPress API URL from environment with robust normalization
// Accepts:
// - Site base (e.g., https://example.com or https://example.com/cms)
// - API base (e.g., https://example.com/wp-json/wp/v2 or https://example.com/wp-json)
// - Relative (preferred for same-origin): /wp-json/wp/v2
const RAW_WORDPRESS_URL =
  import.meta.env.VITE_WORDPRESS_API_URL ||
  import.meta.env.VITE_WORDPRESS_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '';

function deriveApiBase(raw) {
  const fallback = 'http://localhost:8081/wp-json/wp/v2'; // WordPress mock server in development
  if (!raw || typeof raw !== 'string') return fallback;
  let base = raw.trim().replace(/\/$/, '');

  // FIXED: Always use configured URL, never fallback to same-origin in development
  // In development with WordPress mock server, use the configured URL directly
  // The CORS is properly configured in mock-wordpress-server.js
  
  // If already points to v2 API
  if (/\/wp-json\/wp\/v2$/i.test(base)) return base;

  // If points to wp-json root, append /wp/v2
  if (/\/wp-json$/i.test(base)) return `${base}/wp/v2`;

  // Otherwise treat as site base (optionally in subdir like /cms)
  try {
    // Absolute URL
    const url = new URL(base);
    return `${url.origin}${url.pathname.replace(/\/$/, '')}/wp-json/wp/v2`;
  } catch {
    // Relative path base - but in development, convert to absolute
    if (base.startsWith('/')) {
      // In development, convert relative paths to localhost:8081
      if (typeof window !== 'undefined' && import.meta?.env?.DEV) {
        return `http://localhost:8081${base.replace(/\/$/, '')}/wp-json/wp/v2`;
      }
      return `${base.replace(/\/$/, '')}/wp-json/wp/v2`;
    }
    // Unknown format, use fallback
    return fallback;
  }
}

const API_BASE_URL = deriveApiBase(RAW_WORDPRESS_URL);

// Optional dev-only logging of final API base URL (disabled by default)
try {
  const shouldLog = typeof window !== 'undefined'
    && (import.meta?.env?.VITE_LOG_WP_API === '1')
    && (import.meta?.env?.MODE !== 'production');
  if (shouldLog && !window.__WP_API_LOGGED__) {
    // eslint-disable-next-line no-console
    console.info('[WP] API base URL:', API_BASE_URL, '(raw:', RAW_WORDPRESS_URL || 'unset', ')');
    window.__WP_API_LOGGED__ = true;
  }
} catch {}

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

/**
 * Generic API fetch with error handling and caching
 * Enhanced for Clínica Saraiva Vision with robust HTML/JSON detection
 */
async function wpApiFetch(endpoint, options = {}) {
  // Suporte para ambiente de desenvolvimento e produção da Clínica Saraiva Vision
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? API_BASE_URL // Usar servidor mock local
    : 'https://clinicasaraivavision.com.br/wp-json/wp/v2'; // Produção
  
  const url = `${baseUrl}${endpoint}`;
  const cacheKey = `${url}-${JSON.stringify(options)}`;

  // Debug: Log the exact URL being requested
  console.log('[Clínica Saraiva Vision] Requesting URL:', url);
  console.log('[WordPress] Environment:', process.env.NODE_ENV);
  console.log('[WordPress] Base URL:', baseUrl);

  // Check cache first
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('[WordPress] Cache hit for:', endpoint);
      return cached.data;
    }
    cache.delete(cacheKey);
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-WP-Nonce': '', // Para futuras implementações de autenticação
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      // Debug: Log response details for non-OK responses
      const responseText = await response.text();
      console.error('[Clínica Saraiva Vision] Non-OK Response:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        responsePreview: responseText.substring(0, 200)
      });
      throw new Error(`WordPress API Error: ${response.status} ${response.statusText} @ ${url}`);
    }

    const responseText = await response.text();
    
    // CORREÇÃO PRINCIPAL: Verificar se o servidor retornou HTML em vez de JSON
    if (responseText.startsWith('<!doctype') || 
        responseText.startsWith('<html') || 
        responseText.startsWith('<!DOCTYPE') ||
        responseText.includes('<title>') ||
        responseText.includes('vite/client')) {
      
      const errorMsg = `[Clínica Saraiva Vision] Servidor retornou HTML em vez de JSON. 
      Isso pode indicar:
      1. Problema de roteamento no servidor WordPress
      2. Plugin conflitante interferindo na API
      3. Configuração incorreta do .htaccess
      4. Servidor de desenvolvimento (Vite) interceptando requests
      
      URL problemática: ${url}
      Resposta recebida: ${responseText.substring(0, 300)}...`;
      
      console.error(errorMsg);
      throw new Error('Servidor WordPress retornou HTML em vez de JSON. Verificar configuração do WordPress.');
    }
    
    // Debug: Log response preview to check if it's valid JSON
    console.log('[WordPress] Response preview:', responseText.substring(0, 100));
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('[Clínica Saraiva Vision] JSON Parse Error:', jsonError);
      console.error('[WordPress] Response was:', responseText.substring(0, 500));
      
      // Detalhes específicos sobre o erro para depuração
      const errorDetails = {
        url,
        responseLength: responseText.length,
        responseStart: responseText.substring(0, 200),
        isHTML: responseText.includes('<html') || responseText.includes('<!doctype'),
        hasViteClient: responseText.includes('vite/client'),
        jsonError: jsonError.message
      };
      
      console.error('[Clínica Saraiva Vision] Detalhes do erro:', errorDetails);
      throw new Error(`Invalid JSON response from ${url}: ${jsonError.message}`);
    }

    // Cache successful responses
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    console.log(`[Clínica Saraiva Vision] API success: ${endpoint} (${Array.isArray(data) ? data.length : 1} items)`);
    return data;
  } catch (error) {
    console.error('[Clínica Saraiva Vision] WordPress API fetch error:', error);
    throw error;
  }
}

/**
 * Fetch posts with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.per_page - Posts per page (default: 10)
 * @param {number} params.page - Page number (default: 1)
 * @param {string} params.search - Search query
 * @param {Array} params.categories - Category IDs to filter by
 * @param {Array} params.tags - Tag IDs to filter by
 * @param {string} params.orderby - Order by field (default: date)
 * @param {string} params.order - Order direction (default: desc)
 */
export async function fetchPosts(params = {}) {
  const defaultParams = {
    per_page: 10,
    page: 1,
    orderby: 'date',
    order: 'desc',
    _embed: true, // Include embedded data (featured media, author, etc.)
    status: 'publish'
  };

  const queryParams = { ...defaultParams, ...params };
  const queryString = new URLSearchParams(queryParams).toString();

  try {
    return await wpApiFetch(`/posts?${queryString}`);
  } catch (error) {
    console.warn('[Clínica Saraiva Vision] Erro ao carregar posts do WordPress, usando dados de fallback:', error.message);
    
    // Aplicar filtros nos posts de fallback
    let filteredPosts = [...fallbackPosts];
    
    // Filtrar por categorias se especificado
    if (params.categories && params.categories.length > 0) {
      filteredPosts = filteredPosts.filter(post => 
        params.categories.some(catId => post.categories.includes(catId))
      );
    }
    
    // Filtrar por busca se especificado
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredPosts = filteredPosts.filter(post =>
        post.title.rendered.toLowerCase().includes(searchTerm) ||
        post.content.rendered.toLowerCase().includes(searchTerm)
      );
    }
    
    // Aplicar ordenação
    if (params.orderby === 'date') {
      filteredPosts.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return params.order === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }
    
    // Aplicar paginação
    const page = params.page || 1;
    const perPage = params.per_page || 10;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    
    return filteredPosts.slice(startIndex, endIndex);
  }
}

/**
 * Fetch a single post by slug
 * @param {string} slug - Post slug
 */
export async function fetchPostBySlug(slug) {
  if (!slug) {
    throw new Error('Post slug is required');
  }

  try {
    const posts = await wpApiFetch(`/posts?slug=${encodeURIComponent(slug)}&_embed=true&status=publish`);

    if (!posts || posts.length === 0) {
      throw new Error('Post not found');
    }

    return posts[0];
  } catch (error) {
    console.warn('[Clínica Saraiva Vision] Erro ao carregar post do WordPress, verificando dados de fallback:', error.message);
    
    // Buscar nos posts de fallback
    const fallbackPost = fallbackPosts.find(post => post.slug === slug);
    
    if (!fallbackPost) {
      throw new Error(`Post não encontrado: ${slug}`);
    }
    
    console.log('[Clínica Saraiva Vision] Retornando post de fallback:', fallbackPost.title.rendered);
    return fallbackPost;
  }
}

/**
 * Fetch a single post by ID
 * @param {number} id - Post ID
 */
export async function fetchPostById(id) {
  if (!id) {
    throw new Error('Post ID is required');
  }

  return await wpApiFetch(`/posts/${id}?_embed=true`);
}

// DADOS DE FALLBACK DA CLÍNICA SARAIVA VISION
// Categorias dos serviços oftalmológicos oferecidos pela clínica
const fallbackCategories = [
  { 
    id: 1, 
    name: 'Consultas Oftalmológicas', 
    slug: 'consultas',
    description: 'Consultas especializadas com Dr. Philipe Saraiva Cruz (CRM-MG 69.870)',
    count: 15
  },
  { 
    id: 2, 
    name: 'Exames Especializados', 
    slug: 'exames',
    description: 'Exames oftalmológicos avançados na Clínica Saraiva Vision',
    count: 12
  },
  { 
    id: 3, 
    name: 'Refração', 
    slug: 'refracao',
    description: 'Teste de refração para correção visual precisa',
    count: 8
  },
  { 
    id: 4, 
    name: 'Paquimetria', 
    slug: 'paquimetria',
    description: 'Medição da espessura da córnea',
    count: 6
  },
  { 
    id: 5, 
    name: 'Mapeamento de Retina', 
    slug: 'mapeamento-retina',
    description: 'Exame detalhado da retina e fundo do olho',
    count: 10
  },
  { 
    id: 6, 
    name: 'Biometria', 
    slug: 'biometria',
    description: 'Medições oculares para cirurgias e adaptação de lentes',
    count: 5
  },
  { 
    id: 7, 
    name: 'Retinografia', 
    slug: 'retinografia',
    description: 'Fotografias da retina para diagnóstico',
    count: 7
  },
  { 
    id: 8, 
    name: 'Topografia Corneana', 
    slug: 'topografia-corneana',
    description: 'Mapeamento da superfície da córnea',
    count: 4
  },
  { 
    id: 9, 
    name: 'Lentes de Contato', 
    slug: 'lentes-contato',
    description: 'Adaptação e acompanhamento de lentes de contato',
    count: 9
  },
  { 
    id: 10, 
    name: 'Testes Especiais', 
    slug: 'testes-especiais',
    description: 'Testes de Jones, Schirmer, Meiobografia e outros',
    count: 6
  }
];

// Posts de fallback com conteúdo médico da Clínica Saraiva Vision
const fallbackPosts = [
  {
    id: 1,
    title: { rendered: 'A Importância do Exame de Fundo de Olho' },
    slug: 'importancia-exame-fundo-de-olho',
    excerpt: { rendered: 'O exame de fundo de olho é fundamental para detectar doenças que podem comprometer sua visão. Na Clínica Saraiva Vision, realizamos este exame com equipamentos de última geração.' },
    content: { rendered: '<p>O exame de fundo de olho, também conhecido como fundoscopia, é um dos procedimentos mais importantes na oftalmologia. Dr. Philipe Saraiva Cruz explica que este exame permite visualizar estruturas internas do olho, incluindo retina, nervo óptico e vasos sanguíneos.</p><p>Na Clínica Saraiva Vision em Caratinga-MG, utilizamos tecnologia avançada para garantir diagnósticos precisos e tratamentos eficazes.</p>' },
    date: new Date().toISOString(),
    categories: [1, 2],
    tags: [1, 2],
    author: 1,
    featured_media: 1,
    _embedded: {
      author: [{
        id: 1,
        name: 'Dr. Philipe Saraiva Cruz',
        slug: 'dr-philipe-saraiva-cruz',
        description: 'Oftalmologista CRM-MG 69.870',
        avatar_urls: { 96: '/images/dr-philipe-avatar.jpg' }
      }]
    }
  },
  {
    id: 2,
    title: { rendered: 'Cirurgia Refrativa a Laser: Tecnologia e Segurança' },
    slug: 'cirurgia-refrativa-laser',
    excerpt: { rendered: 'Conheça as técnicas mais modernas de cirurgia refrativa disponíveis na região de Caratinga. Consulte-se com especialistas experientes.' },
    content: { rendered: '<p>A cirurgia refrativa a laser representa uma das maiores evoluções na correção de problemas visuais como miopia, hipermetropia e astigmatismo.</p><p>Com parcerias estratégicas, a Clínica Saraiva Vision oferece acesso às técnicas mais modernas e seguras de cirurgia refrativa.</p>' },
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    categories: [1, 3],
    tags: [1, 3],
    author: 1,
    featured_media: 2,
    _embedded: {
      author: [{
        id: 1,
        name: 'Dr. Philipe Saraiva Cruz',
        slug: 'dr-philipe-saraiva-cruz',
        description: 'Oftalmologista CRM-MG 69.870',
        avatar_urls: { 96: '/images/dr-philipe-avatar.jpg' }
      }]
    }
  },
  {
    id: 3,
    title: { rendered: 'Cuidados Essenciais com Lentes de Contato' },
    slug: 'cuidados-lentes-contato',
    excerpt: { rendered: 'Aprenda os cuidados fundamentais para usar lentes de contato com segurança. Dicas da equipe especializada da Clínica Saraiva Vision.' },
    content: { rendered: '<p>O uso correto de lentes de contato é essencial para manter a saúde ocular. A enfermeira Ana Lúcia, da nossa equipe, compartilha orientações importantes para usuários de lentes.</p><p>Na Clínica Saraiva Vision, oferecemos acompanhamento completo desde a adaptação até o uso diário das lentes de contato.</p>' },
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    categories: [9, 2],
    tags: [2, 4],
    author: 2,
    featured_media: 3,
    _embedded: {
      author: [{
        id: 2,
        name: 'Ana Lúcia',
        slug: 'ana-lucia',
        description: 'Enfermeira Especializada em Oftalmologia',
        avatar_urls: { 96: '/images/ana-lucia-avatar.jpg' }
      }]
    }
  }
];

/**
 * Fetch categories
 * @param {Object} params - Query parameters
 */
export async function fetchCategories(params = {}) {
  const defaultParams = {
    per_page: 100,
    orderby: 'count',
    order: 'desc',
    hide_empty: true
  };

  const queryParams = { ...defaultParams, ...params };
  const queryString = new URLSearchParams(queryParams).toString();

  try {
    return await wpApiFetch(`/categories?${queryString}`);
  } catch (error) {
    console.warn('[Clínica Saraiva Vision] Erro ao carregar categorias do WordPress, usando dados de fallback:', error.message);
    
    // Aplicar filtros nos dados de fallback se necessário
    let filteredCategories = [...fallbackCategories];
    
    if (params.slug) {
      filteredCategories = filteredCategories.filter(cat => cat.slug === params.slug);
    }
    
    if (params.per_page && params.per_page < filteredCategories.length) {
      filteredCategories = filteredCategories.slice(0, params.per_page);
    }
    
    return filteredCategories;
  }
}

/**
 * Fetch posts by category
 * @param {string} categorySlug - Category slug
 * @param {Object} params - Additional query parameters
 */
export async function fetchPostsByCategory(categorySlug, params = {}) {
  if (!categorySlug) {
    throw new Error('Category slug is required');
  }

  // First, get the category ID from the slug
  const categories = await fetchCategories({ slug: categorySlug });
  if (!categories || categories.length === 0) {
    throw new Error('Category not found');
  }

  const categoryId = categories[0].id;

  return await fetchPosts({
    categories: [categoryId],
    ...params
  });
}

/**
 * Fetch tags
 * @param {Object} params - Query parameters
 */
export async function fetchTags(params = {}) {
  const defaultParams = {
    per_page: 100,
    orderby: 'count',
    order: 'desc',
    hide_empty: true
  };

  const queryParams = { ...defaultParams, ...params };
  const queryString = new URLSearchParams(queryParams).toString();

  return await wpApiFetch(`/tags?${queryString}`);
}

/**
 * Search posts
 * @param {string} searchTerm - Search query
 * @param {Object} params - Additional query parameters
 */
export async function searchPosts(searchTerm, params = {}) {
  if (!searchTerm) {
    return [];
  }

  return await fetchPosts({
    search: searchTerm,
    ...params
  });
}

/**
 * Get featured posts (posts with specific meta or category)
 * @param {Object} params - Query parameters
 */
export async function fetchFeaturedPosts(params = {}) {
  return await fetchPosts({
    per_page: 5,
    orderby: 'date',
    order: 'desc',
    ...params
  });
}

/**
 * Get recent posts
 * @param {number} count - Number of recent posts to fetch
 */
export async function fetchRecentPosts(count = 5) {
  return await fetchPosts({
    per_page: count,
    orderby: 'date',
    order: 'desc'
  });
}

/**
 * Get related posts based on categories and tags
 * @param {Object} post - Current post object
 * @param {number} count - Number of related posts to fetch
 */
export async function fetchRelatedPosts(post, count = 3) {
  if (!post) {
    return [];
  }

  const categories = post.categories || [];
  const tags = post.tags || [];

  // Fetch posts with same categories or tags, excluding current post
  const relatedByCategory = categories.length > 0
    ? await fetchPosts({
      categories,
      per_page: count + 1, // +1 to account for current post
      exclude: [post.id]
    })
    : [];

  if (relatedByCategory.length >= count) {
    return relatedByCategory.slice(0, count);
  }

  // If not enough related by category, try tags
  if (tags.length > 0) {
    const relatedByTags = await fetchPosts({
      tags,
      per_page: count,
      exclude: [post.id, ...relatedByCategory.map(p => p.id)]
    });

    return [...relatedByCategory, ...relatedByTags].slice(0, count);
  }

  return relatedByCategory.slice(0, count);
}

/**
 * Utility functions for post data processing
 */

/**
 * Clean HTML content for safe display
 * @param {string} htmlContent - HTML content to clean
 */
export function cleanHtmlContent(htmlContent) {
  if (!htmlContent) return '';

  // Remove script tags and potentially dangerous content
  return htmlContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');
}

/**
 * Extract plain text from HTML content
 * @param {string} htmlContent - HTML content
 * @param {number} maxLength - Maximum length of extracted text
 */
export function extractPlainText(htmlContent, maxLength = 150) {
  if (!htmlContent) return '';

  const div = document.createElement('div');
  div.innerHTML = htmlContent;
  const text = div.textContent || div.innerText || '';

  if (maxLength && text.length > maxLength) {
    return text.substring(0, maxLength).trimEnd() + '...';
  }

  return text;
}

/**
 * Get featured image URL from post
 * @param {Object} post - Post object with _embedded data
 * @param {string} size - Image size (thumbnail, medium, large, full)
 */
export function getFeaturedImageUrl(post, size = 'large') {
  if (!post?._embedded?.['wp:featuredmedia']?.[0]) {
    return null;
  }

  const media = post._embedded['wp:featuredmedia'][0];

  // Try to get specific size, fallback to full size
  if (media.media_details?.sizes?.[size]) {
    return media.media_details.sizes[size].source_url;
  }

  return media.source_url;
}

/**
 * Get author information from post
 * @param {Object} post - Post object with _embedded data
 */
export function getAuthorInfo(post) {
  if (!post?._embedded?.author?.[0]) {
    return null;
  }

  const author = post._embedded.author[0];

  return {
    id: author.id,
    name: author.name,
    slug: author.slug,
    description: author.description,
    avatar: author.avatar_urls || {},
    link: author.link
  };
}

/**
 * Clear cache (useful for development or when content is updated)
 */
export function clearWordPressCache() {
  cache.clear();
}

/**
 * Check if WordPress API is available
 * Diagnóstico detalhado para Clínica Saraiva Vision
 */
export async function checkWordPressConnection() {
  const diagnosticResults = {
    isConnected: false,
    environment: process.env.NODE_ENV,
    baseUrl: API_BASE_URL,
    errors: [],
    recommendations: []
  };

  try {
    const testUrl = `${API_BASE_URL}/posts?per_page=1`;
    console.log('[Clínica Saraiva Vision] Testando conexão com:', testUrl);
    
    const response = await fetch(testUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    const responseText = await response.text();
    
    // Verificar se é HTML em vez de JSON
    if (responseText.startsWith('<!doctype') || responseText.startsWith('<html')) {
      diagnosticResults.errors.push('Servidor retornou HTML em vez de JSON');
      diagnosticResults.recommendations.push('Verificar configuração do .htaccess no WordPress');
      diagnosticResults.recommendations.push('Desativar plugins que possam interferir na API REST');
      diagnosticResults.recommendations.push('Verificar se as regras de rewrite estão funcionando');
      
      if (responseText.includes('vite')) {
        diagnosticResults.errors.push('Servidor de desenvolvimento interceptando requests');
        diagnosticResults.recommendations.push('Configurar proxy corretamente no Vite');
      }
      
      return diagnosticResults;
    }
    
    // Tentar fazer parse do JSON
    try {
      const data = JSON.parse(responseText);
      diagnosticResults.isConnected = true;
      diagnosticResults.postsFound = Array.isArray(data) ? data.length : 1;
      console.log('[Clínica Saraiva Vision] Conexão bem-sucedida!');
    } catch (jsonError) {
      diagnosticResults.errors.push(`Erro de JSON: ${jsonError.message}`);
      diagnosticResults.recommendations.push('Verificar formato de resposta da API');
    }
    
  } catch (error) {
    diagnosticResults.errors.push(`Erro de conexão: ${error.message}`);
    
    if (error.message.includes('CORS')) {
      diagnosticResults.recommendations.push('Configurar CORS no servidor WordPress');
    }
    
    if (error.message.includes('fetch')) {
      diagnosticResults.recommendations.push('Verificar conectividade de rede');
      diagnosticResults.recommendations.push('Verificar se o servidor WordPress está ativo');
    }
    
    console.error('[Clínica Saraiva Vision] Falha na verificação de conectividade:', error);
  }

  return diagnosticResults;
}

/**
 * Diagnóstico completo do WordPress para resolução de problemas
 */
export async function diagnosisWordPress() {
  console.log('🏥 [Clínica Saraiva Vision] Iniciando diagnóstico completo do WordPress...');
  
  const diagnosis = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    configuration: {
      rawUrl: RAW_WORDPRESS_URL,
      apiBaseUrl: API_BASE_URL,
      cacheDuration: CACHE_DURATION
    },
    tests: {}
  };

  // Teste 1: Conectividade básica
  console.log('📡 Testando conectividade...');
  diagnosis.tests.connectivity = await checkWordPressConnection();

  // Teste 2: Endpoints específicos
  console.log('🔍 Testando endpoints específicos...');
  const endpoints = ['/posts', '/categories', '/tags'];
  
  for (const endpoint of endpoints) {
    try {
      const result = await wpApiFetch(`${endpoint}?per_page=1`);
      diagnosis.tests[`endpoint_${endpoint.replace('/', '')}`] = {
        success: true,
        itemsFound: Array.isArray(result) ? result.length : 1
      };
    } catch (error) {
      diagnosis.tests[`endpoint_${endpoint.replace('/', '')}`] = {
        success: false,
        error: error.message
      };
    }
  }

  // Teste 3: Fallbacks
  console.log('🛡️ Testando sistema de fallback...');
  diagnosis.tests.fallback = {
    categories: fallbackCategories.length,
    posts: fallbackPosts.length,
    active: true
  };

  console.log('✅ Diagnóstico concluído:', diagnosis);
  return diagnosis;
}

// Export configuration for debugging
export const wordpressConfig = {
  RAW_WORDPRESS_URL,
  API_BASE_URL,
  CACHE_DURATION
};
