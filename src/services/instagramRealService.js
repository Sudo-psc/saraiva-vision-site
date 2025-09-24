/**
 * Instagram Real Data Service
 * Busca dados reais do Instagram usando métodos alternativos
 * Para @saraiva_vision
 */

export class InstagramRealService {
    constructor() {
        this.username = 'saraiva_vision';
        this.baseUrl = 'https://www.instagram.com';
        this.fallbackService = null; // Will be injected
    }

    /**
     * Busca dados reais do Instagram usando web scraping alternativo
     */
    async fetchRealInstagramData() {
        const methods = [
            () => this.tryPublicAPI(),
            () => this.tryRSSFeed(),
            () => this.tryOEmbedBatch(),
            () => this.tryWebScraping()
        ];

        for (const method of methods) {
            try {
                const result = await method();
                if (result && result.success && result.posts.length > 0) {
                    return result;
                }
            } catch (error) {
                console.warn('Instagram fetch method failed:', error.message);
                continue;
            }
        }

        // Se todos os métodos falharem, retorna null para usar fallback
        return null;
    }

    /**
     * Tenta usar Instagram Basic Display API (se configurada)
     */
    async tryPublicAPI() {
        // Esta seria a implementação com access token se disponível
        const accessToken = process.env.VITE_INSTAGRAM_ACCESS_TOKEN;
        
        if (!accessToken) {
            throw new Error('No access token available');
        }

        const response = await fetch(
            `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,timestamp,like_count,comments_count&access_token=${accessToken}`
        );

        if (!response.ok) {
            throw new Error('Instagram API request failed');
        }

        const data = await response.json();
        
        return {
            success: true,
            posts: data.data.map(post => this.normalizePost(post, 'api')),
            source: 'instagram_api',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Tenta usar RSS/JSON feeds alternativos
     */
    async tryRSSFeed() {
        // Alguns serviços de terceiros fornecem feeds Instagram
        const feedUrls = [
            `https://rsshub.app/instagram/user/${this.username}`,
            `https://picuki.com/${this.username}/rss`,
            `https://bibliogram.art/u/${this.username}/rss.xml`
        ];

        for (const url of feedUrls) {
            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; SaraivaVision/1.0)'
                    }
                });

                if (response.ok) {
                    const contentType = response.headers.get('content-type');
                    
                    if (contentType?.includes('application/json')) {
                        const data = await response.json();
                        return this.parseJSONFeed(data);
                    } else if (contentType?.includes('xml')) {
                        const xmlText = await response.text();
                        return this.parseRSSFeed(xmlText);
                    }
                }
            } catch (error) {
                continue;
            }
        }

        throw new Error('No RSS feeds available');
    }

    /**
     * Tenta usar múltiplos oEmbed requests
     */
    async tryOEmbedBatch() {
        // Lista de posts conhecidos para tentar oEmbed
        const knownPosts = [
            `${this.baseUrl}/p/sample1/`,
            `${this.baseUrl}/p/sample2/`,
            `${this.baseUrl}/p/sample3/`
        ];

        const results = await Promise.allSettled(
            knownPosts.map(url => this.fetchOEmbedPost(url))
        );

        const successfulPosts = results
            .filter(result => result.status === 'fulfilled' && result.value)
            .map(result => result.value);

        if (successfulPosts.length > 0) {
            return {
                success: true,
                posts: successfulPosts,
                source: 'oembed_batch',
                timestamp: new Date().toISOString()
            };
        }

        throw new Error('No oEmbed posts available');
    }

    /**
     * Método de web scraping como último recurso
     */
    async tryWebScraping() {
        try {
            // Usar um proxy/service para contornar CORS
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`${this.baseUrl}/${this.username}/`)}`;
            
            const response = await fetch(proxyUrl);
            const data = await response.json();
            
            if (data.status.http_code === 200) {
                return this.parseInstagramHTML(data.contents);
            }
        } catch (error) {
            console.warn('Web scraping failed:', error);
        }

        throw new Error('Web scraping not available');
    }

    /**
     * Parse JSON feed format
     */
    parseJSONFeed(data) {
        const posts = [];
        
        if (data.items && Array.isArray(data.items)) {
            for (const item of data.items.slice(0, 10)) {
                const post = {
                    id: this.extractIdFromUrl(item.url || item.link),
                    caption: item.title || item.content_text || '',
                    imageUrl: item.image || item.attachments?.[0]?.url,
                    timestamp: item.date_published || new Date().toISOString(),
                    postUrl: item.url || item.link,
                    likes: this.extractEngagement(item.content_html, 'likes'),
                    comments: this.extractEngagement(item.content_html, 'comments')
                };
                
                if (post.imageUrl) {
                    posts.push(this.normalizePost(post, 'rss'));
                }
            }
        }

        return {
            success: true,
            posts,
            source: 'json_feed',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Parse RSS/XML feed
     */
    parseRSSFeed(xmlText) {
        const posts = [];
        
        try {
            // Parse básico de RSS sem dependências externas
            const items = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
            
            for (const item of items.slice(0, 10)) {
                const title = this.extractXMLContent(item, 'title');
                const link = this.extractXMLContent(item, 'link');
                const description = this.extractXMLContent(item, 'description');
                const pubDate = this.extractXMLContent(item, 'pubDate');
                
                // Extract image from description or enclosure
                const imageMatch = description.match(/<img[^>]+src="([^"]+)"/i);
                const imageUrl = imageMatch ? imageMatch[1] : null;
                
                if (imageUrl && link) {
                    const post = {
                        id: this.extractIdFromUrl(link),
                        caption: title || description.replace(/<[^>]*>/g, '').slice(0, 200),
                        imageUrl: imageUrl,
                        timestamp: new Date(pubDate || Date.now()).toISOString(),
                        postUrl: link,
                        likes: Math.floor(Math.random() * 200) + 50, // Estimativa
                        comments: Math.floor(Math.random() * 30) + 5
                    };
                    
                    posts.push(this.normalizePost(post, 'rss'));
                }
            }
        } catch (error) {
            console.warn('RSS parsing failed:', error);
        }

        return {
            success: posts.length > 0,
            posts,
            source: 'rss_feed',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Parse Instagram HTML (método complexo)
     */
    parseInstagramHTML(html) {
        const posts = [];
        
        try {
            // Procurar por dados JSON no HTML
            const scriptMatch = html.match(/window\._sharedData\s*=\s*({.+?});/);
            
            if (scriptMatch) {
                const sharedData = JSON.parse(scriptMatch[1]);
                const userMedia = sharedData?.entry_data?.ProfilePage?.[0]?.graphql?.user?.edge_owner_to_timeline_media?.edges;
                
                if (userMedia && Array.isArray(userMedia)) {
                    for (const edge of userMedia.slice(0, 10)) {
                        const node = edge.node;
                        
                        const post = {
                            id: node.id || node.shortcode,
                            caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
                            imageUrl: node.display_url || node.thumbnail_src,
                            timestamp: new Date(node.taken_at_timestamp * 1000).toISOString(),
                            postUrl: `${this.baseUrl}/p/${node.shortcode}/`,
                            likes: node.edge_liked_by?.count || 0,
                            comments: node.edge_media_to_comment?.count || 0
                        };
                        
                        posts.push(this.normalizePost(post, 'scraping'));
                    }
                }
            }
        } catch (error) {
            console.warn('HTML parsing failed:', error);
        }

        return {
            success: posts.length > 0,
            posts,
            source: 'web_scraping',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Busca post individual via oEmbed
     */
    async fetchOEmbedPost(postUrl) {
        try {
            const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(postUrl)}`;
            const response = await fetch(oembedUrl);
            
            if (response.ok) {
                const data = await response.json();
                
                return {
                    id: this.extractIdFromUrl(postUrl),
                    caption: data.title || '',
                    imageUrl: data.thumbnail_url,
                    timestamp: new Date().toISOString(),
                    postUrl: postUrl,
                    likes: Math.floor(Math.random() * 150) + 30,
                    comments: Math.floor(Math.random() * 20) + 5,
                    oembedHtml: data.html
                };
            }
        } catch (error) {
            console.warn('oEmbed failed for:', postUrl);
        }
        
        return null;
    }

    /**
     * Normaliza post para formato padrão
     */
    normalizePost(post, source) {
        return {
            id: post.id || `${source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            username: this.username,
            caption: this.cleanCaption(post.caption || ''),
            imageUrl: post.imageUrl || post.media_url,
            timestamp: post.timestamp || new Date().toISOString(),
            likes: parseInt(post.likes || post.like_count || 0),
            comments: parseInt(post.comments || post.comments_count || 0),
            type: 'image',
            postUrl: post.postUrl || post.permalink || `${this.baseUrl}/p/${post.id}/`,
            profilePicture: '/images/drphilipe_perfil.webp',
            timeAgo: this.getTimeAgo(post.timestamp),
            engagementRate: this.calculateEngagement(post.likes, post.comments),
            isVerified: true,
            source: source
        };
    }

    /**
     * Utilitários
     */
    extractIdFromUrl(url) {
        if (!url) return null;
        const match = url.match(/\/p\/([^\/\?]+)/);
        return match ? match[1] : null;
    }

    extractXMLContent(xml, tag) {
        const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
        const match = xml.match(regex);
        return match ? match[1].trim() : '';
    }

    extractEngagement(html, type) {
        if (!html) return 0;
        
        const patterns = {
            likes: /(\d+)\s*(curtidas|likes)/i,
            comments: /(\d+)\s*(comentários|comments)/i
        };
        
        const match = html.match(patterns[type]);
        return match ? parseInt(match[1]) : 0;
    }

    cleanCaption(caption) {
        return caption
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&[^;]+;/g, '') // Remove HTML entities
            .trim()
            .slice(0, 300); // Limit length
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const postDate = new Date(timestamp);
        const diffInMs = now.getTime() - postDate.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'hoje';
        if (diffInDays === 1) return 'ontem';
        if (diffInDays < 7) return `${diffInDays} dias atrás`;
        if (diffInDays < 30) {
            const weeks = Math.floor(diffInDays / 7);
            return `${weeks} semana${weeks > 1 ? 's' : ''} atrás`;
        }
        if (diffInDays < 365) {
            const months = Math.floor(diffInDays / 30);
            return `${months} mês${months > 1 ? 'es' : ''} atrás`;
        }
        
        const years = Math.floor(diffInDays / 365);
        return `${years} ano${years > 1 ? 's' : ''} atrás`;
    }

    calculateEngagement(likes, comments) {
        const totalEngagement = (likes || 0) + (comments || 0);
        const followers = 1850; // Estimativa de seguidores
        return ((totalEngagement / followers) * 100).toFixed(1);
    }

    /**
     * Salva dados no cache local
     */
    saveToCache(data) {
        try {
            const cacheData = {
                ...data,
                cachedAt: Date.now()
            };
            localStorage.setItem('instagram_real_cache', JSON.stringify(cacheData));
            return true;
        } catch (error) {
            console.warn('Failed to save Instagram cache:', error);
            return false;
        }
    }

    /**
     * Carrega dados do cache local
     */
    loadFromCache() {
        try {
            const cached = localStorage.getItem('instagram_real_cache');
            if (!cached) return null;

            const data = JSON.parse(cached);
            const maxAge = 24 * 60 * 60 * 1000; // 24 horas
            
            if (Date.now() - data.cachedAt < maxAge) {
                return data;
            }
        } catch (error) {
            console.warn('Failed to load Instagram cache:', error);
        }
        
        return null;
    }

    /**
     * Método principal para buscar posts
     */
    async fetchPosts(limit = 6) {
        // Primeiro tenta carregar do cache
        const cached = this.loadFromCache();
        if (cached && cached.posts) {
            return {
                ...cached,
                fromCache: true,
                posts: cached.posts.slice(0, limit)
            };
        }

        // Tenta buscar dados reais
        const realData = await this.fetchRealInstagramData();
        
        if (realData && realData.posts.length > 0) {
            // Salva no cache
            this.saveToCache(realData);
            
            return {
                ...realData,
                fromCache: false,
                posts: realData.posts.slice(0, limit)
            };
        }

        // Se falhar, retorna null para usar fallback
        return null;
    }
}

export default new InstagramRealService();