// src/lib/wordpress-cache.js
// Sistema de cache estático para WordPress Headless CMS

/**
 * Cache estático para posts do WordPress com fallback gracioso
 * Implementa TTL, invalidação por eventos e persistência local
 */
export class WordPressStaticCache {
  constructor(config = {}) {
    this.config = {
      ttl: config.ttl || 24 * 60 * 60 * 1000, // 24 horas
      maxSize: config.maxSize || 1000, // Máximo de posts em cache
      storageKey: config.storageKey || 'wp_cache_saraiva',
      version: config.version || '1.0',
      ...config
    };

    // Usar localStorage quando disponível, senão Map em memória
    this.storage = this.getStorageAdapter();
    this.memoryCache = new Map();
  }

  /**
   * Obter adaptador de storage (localStorage ou memória)
   */
  getStorageAdapter() {
    try {
      if (typeof localStorage !== 'undefined') {
        // Testar se localStorage está funcionando
        localStorage.setItem('test_wp_cache', 'test');
        localStorage.removeItem('test_wp_cache');
        return localStorage;
      }
    } catch (error) {
      console.warn('⚠️ localStorage não disponível, usando cache em memória');
    }

    // Fallback para cache em memória
    return {
      getItem: (key) => this.memoryCache.get(key) || null,
      setItem: (key, value) => this.memoryCache.set(key, value),
      removeItem: (key) => this.memoryCache.delete(key),
      clear: () => this.memoryCache.clear()
    };
  }

  /**
   * Obter chave de cache formatada
   */
  getCacheKey(key) {
    return `${this.config.storageKey}_${key}`;
  }

  /**
   * Verificar se cache é válido (não expirou)
   */
  isCacheValid(cacheData) {
    if (!cacheData || !cacheData.timestamp || !cacheData.data) {
      return false;
    }

    const now = Date.now();
    const age = now - cacheData.timestamp;

    return age < this.config.ttl;
  }

  /**
   * Salvar dados no cache com timestamp
   */
  async setCacheItem(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        version: this.config.version,
        size: JSON.stringify(data).length
      };

      this.storage.setItem(
        this.getCacheKey(key),
        JSON.stringify(cacheData)
      );

      console.log(`💾 Cache salvo: ${key} (${Math.round(cacheData.size / 1024)}KB)`);

    } catch (error) {
      console.error('❌ Erro ao salvar cache:', error);

      // Se erro de quota, tentar limpar cache antigo
      if (error.name === 'QuotaExceededError') {
        await this.cleanupOldCache();

        // Tentar novamente
        try {
          this.storage.setItem(
            this.getCacheKey(key),
            JSON.stringify({
              data,
              timestamp: Date.now(),
              version: this.config.version
            })
          );
        } catch (retryError) {
          console.error('❌ Falha ao salvar cache após limpeza:', retryError);
        }
      }
    }
  }

  /**
   * Obter dados do cache
   */
  async getCacheItem(key) {
    try {
      const cached = this.storage.getItem(this.getCacheKey(key));

      if (!cached) {
        return null;
      }

      const cacheData = JSON.parse(cached);

      // Verificar versão do cache
      if (cacheData.version !== this.config.version) {
        console.log(`🔄 Cache desatualizado para ${key}, removendo...`);
        this.storage.removeItem(this.getCacheKey(key));
        return null;
      }

      // Verificar se ainda é válido
      if (!this.isCacheValid(cacheData)) {
        console.log(`⏰ Cache expirado para ${key}`);
        this.storage.removeItem(this.getCacheKey(key));
        return null;
      }

      console.log(`📦 Cache encontrado para ${key} (idade: ${Math.round((Date.now() - cacheData.timestamp) / 1000 / 60)}min)`);

      return cacheData.data;

    } catch (error) {
      console.error(`❌ Erro ao ler cache ${key}:`, error);
      return null;
    }
  }

  /**
   * Salvar lista de posts no cache
   */
  async saveCachedPosts(posts) {
    if (!Array.isArray(posts) || posts.length === 0) {
      return;
    }

    const cacheData = {
      posts,
      totalPosts: posts.length,
      cachedAt: new Date().toISOString(),
      metadata: {
        firstPost: posts[0]?.publishedAt,
        lastPost: posts[posts.length - 1]?.publishedAt,
        categories: [...new Set(posts.flatMap(p => p.categories?.map(c => c.name) || []))],
        tags: [...new Set(posts.flatMap(p => p.tags?.map(t => t.name) || []))]
      }
    };

    await this.setCacheItem('posts', cacheData);

    // Salvar posts individuais também
    for (const post of posts) {
      await this.setCacheItem(`post_${post.id}`, post);
      if (post.slug) {
        await this.setCacheItem(`post_slug_${post.slug}`, post);
      }
    }
  }

  /**
   * Obter lista de posts do cache
   */
  async getCachedPosts() {
    const cacheData = await this.getCacheItem('posts');

    if (!cacheData || !cacheData.posts) {
      return null;
    }

    console.log(`📦 ${cacheData.totalPosts} posts carregados do cache`);
    console.log(`📅 Cache criado em: ${cacheData.cachedAt}`);

    return cacheData.posts;
  }

  /**
   * Obter post específico do cache
   */
  async getCachedPost(identifier, isSlug = false) {
    const cacheKey = isSlug ? `post_slug_${identifier}` : `post_${identifier}`;
    return await this.getCacheItem(cacheKey);
  }

  /**
   * Salvar post específico no cache
   */
  async saveCachedPost(post) {
    if (!post || !post.id) {
      return;
    }

    await this.setCacheItem(`post_${post.id}`, post);

    if (post.slug) {
      await this.setCacheItem(`post_slug_${post.slug}`, post);
    }

    console.log(`💾 Post ${post.id} salvo no cache`);
  }

  /**
   * Remover post do cache
   */
  async removeCachedPost(postId, slug = null) {
    this.storage.removeItem(this.getCacheKey(`post_${postId}`));

    if (slug) {
      this.storage.removeItem(this.getCacheKey(`post_slug_${slug}`));
    }

    console.log(`🗑️ Post ${postId} removido do cache`);
  }

  /**
   * Salvar taxonomias (categorias/tags) no cache
   */
  async saveCachedTaxonomies(categories = [], tags = []) {
    if (categories.length > 0) {
      await this.setCacheItem('categories', {
        categories,
        count: categories.length,
        cachedAt: new Date().toISOString()
      });
    }

    if (tags.length > 0) {
      await this.setCacheItem('tags', {
        tags,
        count: tags.length,
        cachedAt: new Date().toISOString()
      });
    }
  }

  /**
   * Obter taxonomias do cache
   */
  async getCachedCategories() {
    const cacheData = await this.getCacheItem('categories');
    return cacheData?.categories || [];
  }

  async getCachedTags() {
    const cacheData = await this.getCacheItem('tags');
    return cacheData?.tags || [];
  }

  /**
   * Salvar timestamp da última sincronização
   */
  async setLastSyncTimestamp(timestamp) {
    await this.setCacheItem('last_sync', {
      timestamp,
      date: new Date(timestamp).toISOString()
    });
  }

  /**
   * Obter timestamp da última sincronização
   */
  async getLastSyncTimestamp() {
    const cacheData = await this.getCacheItem('last_sync');
    return cacheData?.timestamp || null;
  }

  /**
   * Obter tempo da última sincronização formatado
   */
  async getLastSyncTime() {
    const timestamp = await this.getLastSyncTimestamp();
    return timestamp ? new Date(timestamp).toISOString() : null;
  }

  /**
   * Invalidar cache específico
   */
  async invalidateCache(key) {
    this.storage.removeItem(this.getCacheKey(key));
    console.log(`🔄 Cache invalidado: ${key}`);
  }

  /**
   * Invalidar cache relacionado a um post
   */
  async invalidatePostCache(postId, slug = null) {
    // Remover post específico
    await this.removeCachedPost(postId, slug);

    // Invalidar lista de posts (forçar nova busca)
    await this.invalidateCache('posts');

    console.log(`🔄 Cache do post ${postId} invalidado`);
  }

  /**
   * Limpeza de cache antigo
   */
  async cleanupOldCache() {
    try {
      const keysToRemove = [];

      // Verificar todas as chaves de cache
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);

        if (key && key.startsWith(this.config.storageKey)) {
          try {
            const cached = this.storage.getItem(key);
            const cacheData = JSON.parse(cached);

            // Remover se expirado ou versão antiga
            if (!this.isCacheValid(cacheData) || cacheData.version !== this.config.version) {
              keysToRemove.push(key);
            }
          } catch (error) {
            // Cache corrompido, remover
            keysToRemove.push(key);
          }
        }
      }

      // Remover chaves identificadas
      for (const key of keysToRemove) {
        this.storage.removeItem(key);
      }

      if (keysToRemove.length > 0) {
        console.log(`🧹 ${keysToRemove.length} itens de cache antigo removidos`);
      }

    } catch (error) {
      console.error('❌ Erro na limpeza de cache:', error);
    }
  }

  /**
   * Limpar todo o cache
   */
  async clearCache() {
    try {
      const keysToRemove = [];

      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key && key.startsWith(this.config.storageKey)) {
          keysToRemove.push(key);
        }
      }

      for (const key of keysToRemove) {
        this.storage.removeItem(key);
      }

      // Limpar cache em memória também
      this.memoryCache.clear();

      console.log(`🗑️ Cache WordPress limpo (${keysToRemove.length} itens)`);

    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    }
  }

  /**
   * Obter estatísticas do cache
   */
  async getCacheStats() {
    try {
      const stats = {
        totalItems: 0,
        totalSize: 0,
        oldestItem: null,
        newestItem: null,
        expiredItems: 0,
        validItems: 0
      };

      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);

        if (key && key.startsWith(this.config.storageKey)) {
          stats.totalItems++;

          try {
            const cached = this.storage.getItem(key);
            const cacheData = JSON.parse(cached);

            stats.totalSize += cached.length;

            if (this.isCacheValid(cacheData)) {
              stats.validItems++;
            } else {
              stats.expiredItems++;
            }

            if (!stats.oldestItem || cacheData.timestamp < stats.oldestItem) {
              stats.oldestItem = cacheData.timestamp;
            }

            if (!stats.newestItem || cacheData.timestamp > stats.newestItem) {
              stats.newestItem = cacheData.timestamp;
            }

          } catch (error) {
            stats.expiredItems++; // Cache corrompido
          }
        }
      }

      return {
        ...stats,
        totalSizeMB: Math.round(stats.totalSize / 1024 / 1024 * 100) / 100,
        oldestItemDate: stats.oldestItem ? new Date(stats.oldestItem).toISOString() : null,
        newestItemDate: stats.newestItem ? new Date(stats.newestItem).toISOString() : null,
        hitRate: stats.totalItems > 0 ? Math.round(stats.validItems / stats.totalItems * 100) : 0
      };

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas do cache:', error);
      return null;
    }
  }

  /**
   * Verificar se posts estão em cache
   */
  async hasCachedPosts() {
    const posts = await this.getCachedPosts();
    return posts && posts.length > 0;
  }

  /**
   * Obter posts de fallback estático (quando tudo mais falha)
   */
  getStaticFallbackPosts() {
    return [
      {
        id: 'fallback-1',
        slug: 'blog-temporariamente-indisponivel',
        title: 'Blog Temporariamente Indisponível',
        excerpt: 'Nosso blog está passando por manutenção. Em breve, novos conteúdos sobre saúde ocular estarão disponíveis.',
        content: `
          <div class="fallback-content">
            <h2>Blog em Manutenção</h2>
            <p>Nosso blog está temporariamente indisponível para manutenção e atualizações.</p>
            <p>Em breve, você encontrará aqui:</p>
            <ul>
              <li>Artigos sobre saúde ocular</li>
              <li>Dicas de prevenção</li>
              <li>Novidades em oftalmologia</li>
              <li>Cuidados com a visão</li>
            </ul>
            <p>Agradecemos a compreensão!</p>
          </div>
        `,
        publishedAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        status: 'publish',
        author: {
          id: 1,
          name: 'Equipe Saraiva Vision',
          slug: 'equipe-saraiva-vision',
          avatar: '/img/logo-saraiva-vision.png'
        },
        categories: [
          { id: 1, name: 'Avisos', slug: 'avisos' }
        ],
        tags: [
          { id: 1, name: 'Manutenção', slug: 'manutencao' }
        ],
        featuredImage: {
          id: 1,
          url: '/img/manutencao-blog.jpg',
          alt: 'Blog em manutenção - Saraiva Vision'
        },
        customFields: {
          is_fallback: true,
          maintenance_mode: true
        },
        seo: {
          title: 'Blog Temporariamente Indisponível - Saraiva Vision',
          description: 'Nosso blog está em manutenção. Novos conteúdos sobre saúde ocular em breve.',
          canonical: 'https://saraivavision.com.br/blog/blog-temporariamente-indisponivel'
        },
        _metadata: {
          importedAt: new Date().toISOString(),
          isFallback: true,
          source: 'static_fallback'
        }
      },
      {
        id: 'fallback-2',
        slug: 'saude-ocular-importancia',
        title: 'A Importância da Saúde Ocular',
        excerpt: 'Cuide bem dos seus olhos com dicas essenciais de prevenção e cuidados regulares.',
        content: `
          <div class="fallback-content">
            <h2>Cuide Bem dos Seus Olhos</h2>
            <p>Manter a saúde ocular em dia é fundamental para uma boa qualidade de vida.</p>
            <h3>Dicas Importantes:</h3>
            <ul>
              <li>Realize exames oftalmológicos regularmente</li>
              <li>Use óculos de sol com proteção UV</li>
              <li>Mantenha uma alimentação rica em vitaminas</li>
              <li>Descanse os olhos durante uso de telas</li>
            </ul>
            <p><strong>Agende sua consulta:</strong> (33) 3321-3235</p>
          </div>
        `,
        publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
        modifiedAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'publish',
        author: {
          id: 2,
          name: 'Dr. João Saraiva',
          slug: 'dr-joao-saraiva',
          avatar: '/img/dr-joao-saraiva.jpg'
        },
        categories: [
          { id: 2, name: 'Saúde Ocular', slug: 'saude-ocular' },
          { id: 3, name: 'Prevenção', slug: 'prevencao' }
        ],
        tags: [
          { id: 2, name: 'Cuidados', slug: 'cuidados' },
          { id: 3, name: 'Prevenção', slug: 'prevencao' }
        ],
        featuredImage: {
          id: 2,
          url: '/img/saude-ocular-geral.jpg',
          alt: 'Saúde ocular - Cuidados essenciais'
        },
        customFields: {
          is_fallback: true,
          medical_disclaimer: true,
          crm_responsible: 'CRM/MG 12345'
        },
        seo: {
          title: 'A Importância da Saúde Ocular - Saraiva Vision',
          description: 'Dicas essenciais para manter a saúde dos seus olhos em dia. Prevenção e cuidados regulares.',
          canonical: 'https://saraivavision.com.br/blog/saude-ocular-importancia'
        },
        _metadata: {
          importedAt: new Date().toISOString(),
          isFallback: true,
          source: 'static_fallback'
        }
      }
    ];
  }
}

// Instância singleton
export const wordPressCache = new WordPressStaticCache();

export default wordPressCache;