// src/lib/wordpress-headless-api.js
// WordPress Headless CMS API Client para Saraiva Vision

import { WordPressCircuitBreaker } from './wordpress-circuit-breaker.js';
import { WordPressStaticCache } from './wordpress-cache.js';

/**
 * Cliente completo para WordPress Headless CMS
 * Implementa autenticação JWT, cache, fallbacks e monitoramento
 */
export class WordPressHeadlessAPI {
  constructor(config = {}) {
    this.config = {
      baseUrl: config.baseUrl || process.env.VITE_WORDPRESS_API_URL || 'https://cms.saraivavision.com.br',
      username: config.username || process.env.WP_USERNAME,
      password: config.password || process.env.WP_APP_PASSWORD,
      timeout: config.timeout || 15000,
      retries: config.retries || 3,
      cacheEnabled: config.cacheEnabled !== false,
      ...config
    };

    this.token = null;
    this.tokenExpiry = null;
    this.circuitBreaker = new WordPressCircuitBreaker();
    this.cache = new WordPressStaticCache();

    // Rate limiting
    this.requestQueue = [];
    this.requestsPerSecond = 10;
    this.lastRequestTime = 0;
  }

  /**
   * Autenticação JWT com renovação automática
   */
  async authenticate(force = false) {
    // Verificar se token ainda é válido
    if (!force && this.token && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) {
      return this.token;
    }

    try {
      console.log('🔐 Autenticando com WordPress JWT...');

      const response = await fetch(`${this.config.baseUrl}/wp-json/jwt-auth/v1/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: this.config.username,
          password: this.config.password
        }),
        timeout: this.config.timeout
      });

      if (!response.ok) {
        throw new Error(`Falha na autenticação: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.token) {
        throw new Error('Token JWT não retornado pela API');
      }

      this.token = data.token;
      this.tokenExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 dias padrão JWT

      console.log('✅ Autenticação JWT bem-sucedida');

      return this.token;

    } catch (error) {
      console.error('❌ Erro na autenticação JWT:', error);
      throw new Error(`Falha na autenticação: ${error.message}`);
    }
  }

  /**
   * Renovar token antes de expirar
   */
  async renewToken() {
    if (!this.token) {
      return this.authenticate();
    }

    try {
      console.log('🔄 Renovando token JWT...');

      const response = await fetch(`${this.config.baseUrl}/wp-json/jwt-auth/v1/token/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json'
        },
        timeout: this.config.timeout
      });

      if (!response.ok) {
        console.warn('⚠️ Falha na renovação, obtendo novo token...');
        return this.authenticate(true);
      }

      const data = await response.json();
      this.token = data.token;
      this.tokenExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000);

      console.log('✅ Token renovado com sucesso');

      return this.token;

    } catch (error) {
      console.warn('⚠️ Erro na renovação, obtendo novo token:', error);
      return this.authenticate(true);
    }
  }

  /**
   * Fazer requisição autenticada com circuit breaker
   */
  async authenticatedRequest(endpoint, options = {}) {
    // Garantir autenticação
    await this.authenticate();

    // Rate limiting
    await this.rateLimit();

    // Executar com circuit breaker
    return this.circuitBreaker.execute(async () => {
      const url = `${this.config.baseUrl}${endpoint}`;

      const requestOptions = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'SaraivaVision-Frontend/1.0',
          ...options.headers
        },
        timeout: this.config.timeout,
        ...options
      };

      console.log(`🌐 Requisição: ${requestOptions.method} ${url}`);

      const response = await fetch(url, requestOptions);

      // Verificar se token expirou
      if (response.status === 401 || response.status === 403) {
        console.log('🔄 Token expirado, renovando...');
        await this.renewToken();

        // Retry com novo token
        requestOptions.headers['Authorization'] = `Bearer ${this.token}`;
        return fetch(url, requestOptions);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    });
  }

  /**
   * Rate limiting simples
   */
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000 / this.requestsPerSecond;

    if (timeSinceLastRequest < minInterval) {
      const delay = minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Buscar posts com paginação e filtros
   */
  async fetchPosts(params = {}) {
    const queryParams = new URLSearchParams({
      per_page: params.perPage || 10,
      page: params.page || 1,
      status: params.status || 'publish',
      _embed: 'true',
      _fields: params.fields || 'id,slug,title,content,excerpt,date,modified,status,author,featured_media,categories,tags,acf,yoast_head_json,_embedded',
      ...params
    });

    // Remover parâmetros undefined
    for (const [key, value] of queryParams.entries()) {
      if (value === 'undefined' || value === undefined) {
        queryParams.delete(key);
      }
    }

    const endpoint = `/wp-json/wp/v2/posts?${queryParams.toString()}`;

    try {
      const data = await this.authenticatedRequest(endpoint);
      return data.map(post => this.normalizePost(post));

    } catch (error) {
      console.error('❌ Erro ao buscar posts:', error);

      // Fallback para cache
      if (this.config.cacheEnabled) {
        const cachedPosts = await this.cache.getCachedPosts();
        if (cachedPosts && cachedPosts.length > 0) {
          console.log('📦 Usando posts do cache como fallback');
          return cachedPosts;
        }
      }

      throw error;
    }
  }

  /**
   * Buscar post específico por ID ou slug
   */
  async fetchPost(identifier, isSlug = false) {
    const endpoint = isSlug
      ? `/wp-json/wp/v2/posts?slug=${identifier}&_embed=true`
      : `/wp-json/wp/v2/posts/${identifier}?_embed=true`;

    try {
      const data = await this.authenticatedRequest(endpoint);
      const post = Array.isArray(data) ? data[0] : data;

      if (!post) {
        throw new Error(`Post não encontrado: ${identifier}`);
      }

      return this.normalizePost(post);

    } catch (error) {
      console.error(`❌ Erro ao buscar post ${identifier}:`, error);
      throw error;
    }
  }

  /**
   * Buscar posts modificados após uma data (sincronização incremental)
   */
  async fetchModifiedPosts(afterDate, params = {}) {
    const queryParams = new URLSearchParams({
      modified_after: afterDate,
      per_page: params.perPage || 100,
      page: params.page || 1,
      status: 'publish,trash', // Incluir posts excluídos
      _embed: 'true',
      _fields: 'id,slug,title,content,excerpt,date,modified,status,author,featured_media,categories,tags,acf,yoast_head_json,_embedded',
      ...params
    });

    const endpoint = `/wp-json/wp/v2/posts?${queryParams.toString()}`;

    try {
      const data = await this.authenticatedRequest(endpoint);
      return data.map(post => this.normalizePost(post));

    } catch (error) {
      console.error('❌ Erro ao buscar posts modificados:', error);
      throw error;
    }
  }

  /**
   * Buscar categorias
   */
  async fetchCategories(params = {}) {
    const queryParams = new URLSearchParams({
      per_page: params.perPage || 100,
      hide_empty: params.hideEmpty !== false,
      ...params
    });

    const endpoint = `/wp-json/wp/v2/categories?${queryParams.toString()}`;

    try {
      return await this.authenticatedRequest(endpoint);
    } catch (error) {
      console.error('❌ Erro ao buscar categorias:', error);
      return [];
    }
  }

  /**
   * Buscar tags
   */
  async fetchTags(params = {}) {
    const queryParams = new URLSearchParams({
      per_page: params.perPage || 100,
      hide_empty: params.hideEmpty !== false,
      ...params
    });

    const endpoint = `/wp-json/wp/v2/tags?${queryParams.toString()}`;

    try {
      return await this.authenticatedRequest(endpoint);
    } catch (error) {
      console.error('❌ Erro ao buscar tags:', error);
      return [];
    }
  }

  /**
   * Buscar mídia/anexos
   */
  async fetchMedia(mediaId) {
    const endpoint = `/wp-json/wp/v2/media/${mediaId}`;

    try {
      return await this.authenticatedRequest(endpoint);
    } catch (error) {
      console.error(`❌ Erro ao buscar mídia ${mediaId}:`, error);
      return null;
    }
  }

  /**
   * Normalizar dados do post para formato interno
   */
  normalizePost(wpPost) {
    return {
      // Dados básicos
      id: wpPost.id,
      slug: wpPost.slug,
      title: wpPost.title?.rendered || '',
      content: wpPost.content?.rendered || '',
      excerpt: wpPost.excerpt?.rendered || '',

      // Status e datas
      status: wpPost.status,
      publishedAt: new Date(wpPost.date).toISOString(),
      modifiedAt: new Date(wpPost.modified).toISOString(),

      // URLs
      url: wpPost.link,
      canonicalUrl: wpPost.yoast_head_json?.canonical || wpPost.link,

      // Autor com fallback
      author: {
        id: wpPost._embedded?.['wp:author']?.[0]?.id || wpPost.author,
        name: wpPost._embedded?.['wp:author']?.[0]?.name || 'Autor Desconhecido',
        slug: wpPost._embedded?.['wp:author']?.[0]?.slug || 'autor',
        avatar: wpPost._embedded?.['wp:author']?.[0]?.avatar_urls?.['96'] || '/img/default-avatar.jpg',
        description: wpPost._embedded?.['wp:author']?.[0]?.description || ''
      },

      // Taxonomias normalizadas
      categories: this.normalizeTerms(wpPost._embedded?.['wp:term']?.[0] || []),
      tags: this.normalizeTerms(wpPost._embedded?.['wp:term']?.[1] || []),

      // Imagem destacada
      featuredImage: this.normalizeFeaturedMedia(wpPost._embedded?.['wp:featuredmedia']?.[0], wpPost.title?.rendered),

      // Campos personalizados (ACF)
      customFields: wpPost.acf || {},

      // SEO metadata
      seo: this.normalizeSeoData(wpPost.yoast_head_json, wpPost),

      // Metadados internos
      _metadata: {
        importedAt: new Date().toISOString(),
        wordpressId: wpPost.id,
        checksum: this.generateChecksum(wpPost),
        sourceUrl: wpPost.link
      }
    };
  }

  /**
   * Normalizar taxonomias (categorias/tags)
   */
  normalizeTerms(terms) {
    if (!Array.isArray(terms)) return [];

    return terms.map(term => ({
      id: term.id,
      name: term.name,
      slug: term.slug,
      description: term.description || '',
      count: term.count || 0
    }));
  }

  /**
   * Normalizar mídia destacada
   */
  normalizeFeaturedMedia(media, fallbackTitle = '') {
    if (!media) return null;

    return {
      id: media.id,
      url: media.source_url,
      alt: media.alt_text || fallbackTitle || 'Imagem do artigo',
      caption: media.caption?.rendered || '',
      title: media.title?.rendered || '',
      sizes: media.media_details?.sizes || {},
      mimeType: media.mime_type,
      width: media.media_details?.width,
      height: media.media_details?.height
    };
  }

  /**
   * Normalizar dados SEO
   */
  normalizeSeoData(yoastData, wpPost) {
    return {
      title: yoastData?.title || wpPost.title?.rendered,
      description: yoastData?.description || wpPost.excerpt?.rendered?.replace(/<[^>]*>/g, '').substring(0, 160),
      canonical: yoastData?.canonical || wpPost.link,
      robots: yoastData?.robots || 'index,follow',

      // Open Graph
      openGraph: {
        title: yoastData?.og_title || wpPost.title?.rendered,
        description: yoastData?.og_description || wpPost.excerpt?.rendered?.replace(/<[^>]*>/g, '').substring(0, 300),
        image: yoastData?.og_image?.[0]?.url,
        type: yoastData?.og_type || 'article',
        locale: yoastData?.og_locale || 'pt_BR'
      },

      // Twitter
      twitter: {
        card: yoastData?.twitter_card || 'summary_large_image',
        title: yoastData?.twitter_title || wpPost.title?.rendered,
        description: yoastData?.twitter_description,
        image: yoastData?.twitter_image,
        site: yoastData?.twitter_site || '@saraivavision'
      },

      // Schema.org
      schema: yoastData?.schema || null
    };
  }

  /**
   * Gerar checksum para detecção de mudanças
   */
  generateChecksum(post) {
    const dataToHash = {
      id: post.id,
      modified: post.modified,
      title: post.title?.rendered,
      content: post.content?.rendered,
      excerpt: post.excerpt?.rendered
    };

    // Hash simples baseado em JSON string
    const str = JSON.stringify(dataToHash);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  /**
   * Verificar status da API (health check)
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.config.baseUrl}/wp-json/wp/v2/posts?per_page=1`, {
        method: 'HEAD',
        timeout: 5000
      });

      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        statusCode: response.status,
        responseTime: performance.now(),
        authenticated: !!this.token,
        lastSync: await this.cache.getLastSyncTime()
      };

    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        responseTime: null,
        authenticated: false,
        lastSync: await this.cache.getLastSyncTime()
      };
    }
  }

  /**
   * Limpar cache e forçar nova autenticação
   */
  async reset() {
    this.token = null;
    this.tokenExpiry = null;
    this.circuitBreaker = new WordPressCircuitBreaker();

    if (this.config.cacheEnabled) {
      await this.cache.clearCache();
    }

    console.log('🔄 WordPress API client resetado');
  }
}

// Instância singleton para uso global
export const wordpressAPI = new WordPressHeadlessAPI();

// Exportar para uso direto
export default wordpressAPI;