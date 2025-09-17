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
  const fallback = 'http://localhost:8083/wp-json/wp/v2'; // WordPress mock server in development
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
      // In development, convert relative paths to localhost:8083
      if (typeof window !== 'undefined' && import.meta?.env?.DEV) {
        return `http://localhost:8083${base.replace(/\/$/, '')}/wp-json/wp/v2`;
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
 * Enhanced for Clínica Saraiva Vision with robust HTML/JSON detection and 404 recovery
 */
async function wpApiFetch(endpoint, options = {}) {
  // Defina a URL base da API com uma lógica mais flexível
  // 1. Use API_BASE_URL (do .env) se estiver definido.
  // 2. Caso contrário, use a URL de produção como fallback.
  const baseUrl = API_BASE_URL && API_BASE_URL.trim() !== ''
    ? API_BASE_URL
    : 'https://clinicasaraivavision.com.br/wp-json/wp/v2';
  
  const primaryUrl = `${baseUrl}${endpoint}`;
  const cacheKey = `${primaryUrl}-${JSON.stringify(options)}`;

  // Debug: Log the exact URL being requested
  console.log('[Clínica Saraiva Vision] Primary URL:', primaryUrl);
  console.log('[WordPress] Environment:', import.meta.env.MODE || 'unknown');

  // Check cache first
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('[WordPress] Cache hit for:', endpoint);
      return cached.data;
    }
    cache.delete(cacheKey);
  }

  // Função para tentar múltiplas URLs (fallback para erro 404)
  const tryMultipleUrls = async () => {
    const urlsToTry = [];
    
    // URL primária (padrão)
    urlsToTry.push({
      url: primaryUrl,
      description: 'URL primária da API REST'
    });

    // Fallback 1: Usar query parameter rest_route (para permalinks não funcionais)
    if (baseUrl.includes('/wp-json/wp/v2')) {
      const siteBase = baseUrl.replace('/wp-json/wp/v2', '');
      urlsToTry.push({
        url: `${siteBase}/?rest_route=/wp/v2${endpoint}`,
        description: 'Fallback usando rest_route query parameter'
      });
    }

    // Fallback 2: Tentar com index.php se mod_rewrite estiver desabilitado
    if (baseUrl.includes('/wp-json/wp/v2')) {
      const siteBase = baseUrl.replace('/wp-json/wp/v2', '');
      urlsToTry.push({
        url: `${siteBase}/index.php?rest_route=/wp/v2${endpoint}`,
        description: 'Fallback usando index.php (sem mod_rewrite)'
      });
    }

    for (const { url, description } of urlsToTry) {
      try {
        console.log(`[Clínica Saraiva Vision] Tentando ${description}:`, url);
        
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Clinica-Saraiva-Vision/2.0',
            ...options.headers
          },
          ...options
        });

        const responseText = await response.text();

        if (response.ok) {
          // Verificar se é HTML em vez de JSON
          if (responseText.startsWith('<!doctype') || 
              responseText.startsWith('<html') || 
              responseText.includes('<title>')) {
            console.warn(`[Clínica Saraiva Vision] ${description} retornou HTML:`, url);
            continue; // Tentar próxima URL
          }

          // Tentar fazer parse do JSON
          try {
            const data = JSON.parse(responseText);
            console.log(`[Clínica Saraiva Vision] ✅ Sucesso com ${description}`);
            return { data, successUrl: url };
          } catch (jsonError) {
            console.warn(`[Clínica Saraiva Vision] ${description} - JSON inválido:`, jsonError.message);
            continue; // Tentar próxima URL
          }
        } else {
          console.warn(`[Clínica Saraiva Vision] ${description} - Status ${response.status}:`, url);
          
          // Log detalhado para 404 especificamente
          if (response.status === 404) {
            console.error(`[Clínica Saraiva Vision] 404 Error Details:`, {
              url,
              status: response.status,
              statusText: response.statusText,
              responsePreview: responseText.substring(0, 200),
              possibleCauses: [
                'WordPress REST API desabilitada',
                'Permalinks mal configurados',
                'Arquivo .htaccess problemático',
                'Plugin interferindo na API',
                'mod_rewrite não habilitado'
              ]
            });
          }
        }
      } catch (networkError) {
        console.warn(`[Clínica Saraiva Vision] ${description} - Erro de rede:`, networkError.message);
      }
    }

    // Se chegou até aqui, nenhuma URL funcionou
    throw new Error(`[Clínica Saraiva Vision] Todas as URLs falharam para endpoint: ${endpoint}`);
  };

  try {
    const result = await tryMultipleUrls();
    
    // Cache successful responses
    cache.set(cacheKey, {
      data: result.data,
      timestamp: Date.now()
    });

    console.log(`[Clínica Saraiva Vision] API success: ${endpoint} (${Array.isArray(result.data) ? result.data.length : 1} items)`);
    return result.data;
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
    id: 4, // New unique ID
    title: { rendered: "Importância dos Exames Oftalmológicos Preventivos" },
    slug: "importancia-exames-oftalmologicos-preventivos",
    excerpt: { rendered: "Dr. Philipe e Ana Lúcia orientam sobre refração, paquimetria..." },
    content: { rendered: "<p>Dr. Philipe e Ana Lúcia orientam sobre refração, paquimetria...</p>" },
    date: new Date().toISOString(),
    categories: [2], // ID for "Exames Especializados"
    tags: [], // No tags provided
    author: 1, // Dr. Philipe
    featured_media: 4, // Placeholder
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
 * Diagnóstico detalhado para Clínica Saraiva Vision com correção de 404
 */
export async function checkWordPressConnection() {
  const diagnosticResults = {
    isConnected: false,
    environment: import.meta.env.MODE || 'unknown',
    baseUrl: API_BASE_URL,
    workingUrl: null,
    errors: [],
    recommendations: [],
    testedUrls: []
  };

  // URLs para testar (mesmo sistema de fallback da wpApiFetch)
  const baseUrl = API_BASE_URL && API_BASE_URL.trim() !== ''
    ? API_BASE_URL
    : 'https://clinicasaraivavision.com.br/wp-json/wp/v2';

  const urlsToTest = [];
  
  // URL primária
  urlsToTest.push({
    url: `${baseUrl}/posts?per_page=1`,
    description: 'API REST padrão'
  });

  // Fallback 1: rest_route query parameter
  if (baseUrl.includes('/wp-json/wp/v2')) {
    const siteBase = baseUrl.replace('/wp-json/wp/v2', '');
    urlsToTest.push({
      url: `${siteBase}/?rest_route=/wp/v2/posts&per_page=1`,
      description: 'Fallback com rest_route'
    });
  }

  // Fallback 2: index.php
  if (baseUrl.includes('/wp-json/wp/v2')) {
    const siteBase = baseUrl.replace('/wp-json/wp/v2', '');
    urlsToTest.push({
      url: `${siteBase}/index.php?rest_route=/wp/v2/posts&per_page=1`,
      description: 'Fallback com index.php'
    });
  }

  for (const { url, description } of urlsToTest) {
    try {
      console.log(`[Clínica Saraiva Vision] Testando ${description}:`, url);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Clinica-Saraiva-Vision-Diagnostics/2.0'
        }
      });
      
      const responseText = await response.text();
      
      diagnosticResults.testedUrls.push({
        url,
        description,
        status: response.status,
        success: response.ok,
        isHtml: responseText.includes('<html') || responseText.includes('<!doctype')
      });

      if (response.ok) {
        // Verificar se é HTML em vez de JSON
        if (responseText.startsWith('<!doctype') || responseText.startsWith('<html')) {
          diagnosticResults.errors.push(`${description}: Servidor retornou HTML em vez de JSON`);
          
          if (responseText.includes('vite')) {
            diagnosticResults.errors.push('Servidor de desenvolvimento interceptando requests');
            diagnosticResults.recommendations.push('Configurar proxy corretamente no Vite');
          }
          continue;
        }
        
        // Tentar fazer parse do JSON
        try {
          const data = JSON.parse(responseText);
          diagnosticResults.isConnected = true;
          diagnosticResults.workingUrl = url;
          diagnosticResults.postsFound = Array.isArray(data) ? data.length : 1;
          console.log(`[Clínica Saraiva Vision] ✅ Conexão bem-sucedida com ${description}!`);
          break; // Sucesso! Parar de testar outras URLs
        } catch (jsonError) {
          diagnosticResults.errors.push(`${description}: Erro de JSON - ${jsonError.message}`);
        }
      } else if (response.status === 404) {
        diagnosticResults.errors.push(`${description}: 404 Not Found - API REST não disponível nesta URL`);
        
        if (description === 'API REST padrão') {
          diagnosticResults.recommendations.push('Verificar se permalinks estão configurados corretamente');
          diagnosticResults.recommendations.push('Verificar se mod_rewrite está habilitado no servidor');
          diagnosticResults.recommendations.push('Verificar arquivo .htaccess do WordPress');
          diagnosticResults.recommendations.push('Verificar se a API REST está habilitada no WordPress');
        }
      } else {
        diagnosticResults.errors.push(`${description}: HTTP ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      diagnosticResults.errors.push(`${description}: Erro de rede - ${error.message}`);
      diagnosticResults.testedUrls.push({
        url,
        description,
        success: false,
        error: error.message
      });
      
      if (error.message.includes('CORS')) {
        diagnosticResults.recommendations.push('Configurar CORS no servidor WordPress');
      }
      
      console.error(`[Clínica Saraiva Vision] Erro testando ${description}:`, error);
    }
  }

  // Se nenhuma URL funcionou, adicionar recomendações gerais
  if (!diagnosticResults.isConnected) {
    diagnosticResults.recommendations.push('Verificar se WordPress está instalado e ativo');
    diagnosticResults.recommendations.push('Verificar se não há plugins desabilitando a API REST');
    diagnosticResults.recommendations.push('Contatar administrador do servidor para verificar configurações');
  }

  return diagnosticResults;
}

/**
 * Monitoramento da saúde da API WordPress - Clínica Saraiva Vision
 */
export async function logApiHealth() {
  console.log('🏥 [Clínica Saraiva Vision] Verificando saúde da API WordPress...');
  
  const healthCheck = {
    timestamp: new Date().toISOString(),
    clinic: 'Saraiva Vision - Caratinga, MG',
    doctor: 'Dr. Philipe Saraiva Cruz (CRM-MG 69.870)',
    status: 'checking'
  };

  try {
    const connectionResult = await checkWordPressConnection();
    
    healthCheck.status = connectionResult.isConnected ? 'healthy' : 'unhealthy';
    healthCheck.workingUrl = connectionResult.workingUrl;
    healthCheck.errors = connectionResult.errors;
    healthCheck.testedUrls = connectionResult.testedUrls;

    if (connectionResult.isConnected) {
      console.log('✅ [Clínica Saraiva Vision] API WordPress funcionando corretamente');
      console.log(`📍 URL ativa: ${connectionResult.workingUrl}`);
    } else {
      console.warn('⚠️ [Clínica Saraiva Vision] Problemas detectados na API WordPress');
      console.log('🔧 Recomendações:', connectionResult.recommendations);
    }

    return healthCheck;
  } catch (error) {
    healthCheck.status = 'error';
    healthCheck.error = error.message;
    console.error('❌ [Clínica Saraiva Vision] Erro no monitoramento da API:', error);
    return healthCheck;
  }
}

/**
 * Diagnóstico completo do WordPress para resolução de problemas
 */
export async function diagnosisWordPress() {
  console.log('🏥 [Clínica Saraiva Vision] Iniciando diagnóstico completo do WordPress...');
  
  const diagnosis = {
    timestamp: new Date().toISOString(),
    environment: import.meta.env.MODE || 'unknown',
    clinic: {
      name: 'Clínica Saraiva Vision',
      location: 'Caratinga, MG',
      doctor: 'Dr. Philipe Saraiva Cruz (CRM-MG 69.870)',
      nurse: 'Ana Lúcia',
      partnership: 'Clínica Amor e Saúde'
    },
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
