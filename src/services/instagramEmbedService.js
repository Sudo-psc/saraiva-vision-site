/**
 * Instagram Embed Service - Sem API
 * Fornece posts do Instagram através de métodos alternativos
 * Para @saraiva_vision
 */

export class InstagramEmbedService {
    constructor() {
        this.username = 'saraiva_vision';
        this.fallbackPosts = this.createFallbackPosts();
    }

    /**
     * Gera posts de fallback realistas baseados na Saraiva Vision
     */
    createFallbackPosts() {
        const baseUrl = '/images/';
        const currentDate = new Date();
        
        return [
            {
                id: 'saraiva_1',
                username: 'saraiva_vision',
                caption: '🔬 Exame completo de vista na Clínica Saraiva Vision! Nossa equipe especializada utiliza tecnologia de ponta para cuidar da sua saúde ocular. Agende sua consulta! 👁️✨ #SaraivaVision #SaudeOcular #Oftalmologia #Brasilia',
                imageUrl: `${baseUrl}hero.webp`,
                timestamp: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                likes: 147,
                comments: 23,
                type: 'image',
                hashtags: ['#SaraivaVision', '#SaudeOcular', '#Oftalmologia', '#Brasilia']
            },
            {
                id: 'saraiva_2', 
                username: 'saraiva_vision',
                caption: '👨‍⚕️ Conheça Dr. Philipe Saraiva Cruz, especialista em oftalmologia com anos de experiência cuidando da visão dos brasilienses. Atendimento humanizado e tecnologia avançada! 🏥 #DrPhilipe #EspecialistaOftalmologia #AtendimentoHumanizado',
                imageUrl: `${baseUrl}drphilipe_perfil.webp`,
                timestamp: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                likes: 203,
                comments: 31,
                type: 'image',
                hashtags: ['#DrPhilipe', '#EspecialistaOftalmologia', '#AtendimentoHumanizado']
            },
            {
                id: 'saraiva_3',
                username: 'saraiva_vision',
                caption: '🎧 Novo episódio do nosso podcast! Dicas importantes sobre como cuidar da sua visão no dia a dia. Ouça agora e aprenda com nossos especialistas! 💡👂 #PodcastSaude #DicasSaude #CuidadoVisual #SaraivaVision',
                imageUrl: '/Podcasts/Covers/podcast.png',
                timestamp: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                likes: 89,
                comments: 12,
                type: 'image',
                hashtags: ['#PodcastSaude', '#DicasSaude', '#CuidadoVisual', '#SaraivaVision']
            },
            {
                id: 'saraiva_4',
                username: 'saraiva_vision',
                caption: '🏥 Nossa clínica está totalmente equipada para oferecer o melhor atendimento oftalmológico de Brasília. Ambiente moderno, confortável e seguro para toda a família! 👨‍👩‍👧‍👦 #ClinicaModerna #SeguranraBrasilia #FamiliaSegura',
                imageUrl: '/img/clinic_facade.webp',
                timestamp: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                likes: 156,
                comments: 18,
                type: 'image',
                hashtags: ['#ClinicaModerna', '#SeguranraBrasilia', '#FamiliaSegura']
            },
            {
                id: 'saraiva_5',
                username: 'saraiva_vision',
                caption: '✨ Tecnologia de ponta a serviço da sua visão! Equipamentos modernos para diagnósticos precisos e tratamentos eficazes. Sua saúde ocular merece o melhor! 🔬💻 #TecnologiaAvancada #DiagnosticoPreciso #InovacaoMedica',
                imageUrl: `${baseUrl}hero.webp`,
                timestamp: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                likes: 134,
                comments: 15,
                type: 'image',
                hashtags: ['#TecnologiaAvancada', '#DiagnosticoPreciso', '#InovacaoMedica']
            },
            {
                id: 'saraiva_6',
                username: 'saraiva_vision',
                caption: '👓 Sua lente perfeita está aqui! Grande variedade de armações e lentes especializadas para todos os tipos de necessidade visual. Venha conhecer nossa ótica! 🤓✨ #Otica #LentesEspecializadas #ArmacaoModerna #EstiloVisao',
                imageUrl: `${baseUrl}hero.webp`,
                timestamp: new Date(currentDate.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
                likes: 178,
                comments: 27,
                type: 'image',
                hashtags: ['#Otica', '#LentesEspecializadas', '#ArmacaoModerna', '#EstiloVisao']
            }
        ];
    }

    /**
     * Simula busca de posts do Instagram
     */
    async fetchPosts(limit = 6) {
        // Simular delay de rede para realismo
        await new Promise(resolve => setTimeout(resolve, 500));

        const posts = this.fallbackPosts.slice(0, limit);
        
        return {
            success: true,
            posts: posts.map(post => this.formatPost(post)),
            timestamp: new Date().toISOString(),
            source: 'embedded_fallback'
        };
    }

    /**
     * Formata post para exibição
     */
    formatPost(post) {
        return {
            ...post,
            profilePicture: '/images/drphilipe_perfil.webp',
            postUrl: `https://www.instagram.com/${this.username}/`,
            timeAgo: this.getTimeAgo(post.timestamp),
            engagementRate: this.calculateEngagement(post.likes, post.comments),
            isVerified: true
        };
    }

    /**
     * Calcula tempo decorrido desde o post
     */
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

    /**
     * Calcula taxa de engajamento
     */
    calculateEngagement(likes, comments) {
        const totalEngagement = likes + comments;
        const followers = 2500; // Estimativa de seguidores
        return ((totalEngagement / followers) * 100).toFixed(1);
    }

    /**
     * Obtém estatísticas do perfil
     */
    getProfileStats() {
        const posts = this.fallbackPosts;
        const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
        const totalComments = posts.reduce((sum, post) => sum + post.comments, 0);
        
        return {
            followers: '2.5K',
            following: '150',
            posts: posts.length,
            averageLikes: Math.round(totalLikes / posts.length),
            averageComments: Math.round(totalComments / posts.length),
            engagementRate: this.calculateEngagement(totalLikes, totalComments)
        };
    }

    /**
     * Busca posts por hashtag
     */
    async getPostsByHashtag(hashtag, limit = 3) {
        const filteredPosts = this.fallbackPosts.filter(post => 
            post.hashtags.some(tag => 
                tag.toLowerCase().includes(hashtag.toLowerCase().replace('#', ''))
            )
        );

        return {
            success: true,
            posts: filteredPosts.slice(0, limit).map(post => this.formatPost(post)),
            hashtag: hashtag,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Método para tentar usar oEmbed (quando disponível)
     */
    async tryOEmbedPost(postUrl) {
        try {
            // Instagram oEmbed endpoint (público, mas limitado)
            const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(postUrl)}`;
            
            const response = await fetch(oembedUrl);
            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    html: data.html,
                    type: 'oembed'
                };
            }
        } catch (error) {
            console.log('oEmbed não disponível, usando fallback');
        }

        return {
            success: false,
            error: 'oEmbed não disponível'
        };
    }

    /**
     * Gera widget embed HTML
     */
    generateEmbedWidget(posts, options = {}) {
        const {
            showHeader = true,
            showCaption = true,
            maxHeight = '400px',
            theme = 'light'
        } = options;

        return {
            html: this.createWidgetHTML(posts, { showHeader, showCaption, maxHeight, theme }),
            css: this.getWidgetCSS(theme),
            js: this.getWidgetJS()
        };
    }

    /**
     * Cria HTML do widget
     */
    createWidgetHTML(posts, options) {
        const postsHTML = posts.map(post => `
            <div class="instagram-post" data-post-id="${post.id}">
                <div class="post-header">
                    <img src="${post.profilePicture}" alt="@${post.username}" class="profile-pic">
                    <div class="post-info">
                        <span class="username">@${post.username}</span>
                        <span class="time">${post.timeAgo}</span>
                    </div>
                </div>
                <div class="post-image">
                    <img src="${post.imageUrl}" alt="Post do Instagram" loading="lazy">
                </div>
                <div class="post-actions">
                    <div class="engagement">
                        <span class="likes">❤️ ${post.likes}</span>
                        <span class="comments">💬 ${post.comments}</span>
                    </div>
                </div>
                ${options.showCaption ? `<div class="post-caption">${this.truncateCaption(post.caption)}</div>` : ''}
            </div>
        `).join('');

        return `
            <div class="instagram-widget" data-theme="${options.theme}">
                ${options.showHeader ? `
                    <div class="widget-header">
                        <h3>📸 @saraiva_vision</h3>
                        <a href="https://www.instagram.com/saraiva_vision/" target="_blank" class="follow-btn">
                            Seguir no Instagram
                        </a>
                    </div>
                ` : ''}
                <div class="posts-container" style="max-height: ${options.maxHeight}">
                    ${postsHTML}
                </div>
            </div>
        `;
    }

    /**
     * Trunca caption para exibição
     */
    truncateCaption(caption, maxLength = 120) {
        if (caption.length <= maxLength) return caption;
        return caption.substring(0, maxLength).trim() + '...';
    }

    /**
     * CSS do widget
     */
    getWidgetCSS(theme = 'light') {
        return `
            .instagram-widget {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                border: 1px solid ${theme === 'light' ? '#e1e5e9' : '#333'};
                border-radius: 12px;
                overflow: hidden;
                background: ${theme === 'light' ? '#fff' : '#000'};
                color: ${theme === 'light' ? '#000' : '#fff'};
            }
            .widget-header {
                padding: 16px;
                border-bottom: 1px solid ${theme === 'light' ? '#e1e5e9' : '#333'};
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .widget-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }
            .follow-btn {
                background: #1877f2;
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                text-decoration: none;
                font-size: 14px;
                font-weight: 600;
            }
            .posts-container {
                overflow-y: auto;
            }
            .instagram-post {
                padding: 16px;
                border-bottom: 1px solid ${theme === 'light' ? '#e1e5e9' : '#333'};
            }
            .instagram-post:last-child {
                border-bottom: none;
            }
            .post-header {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
            }
            .profile-pic {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                margin-right: 12px;
            }
            .username {
                font-weight: 600;
                font-size: 14px;
            }
            .time {
                color: ${theme === 'light' ? '#65676b' : '#b0b3b8'};
                font-size: 12px;
                margin-left: 8px;
            }
            .post-image img {
                width: 100%;
                height: auto;
                border-radius: 8px;
            }
            .post-actions {
                margin: 12px 0;
            }
            .engagement {
                display: flex;
                gap: 16px;
                font-size: 14px;
            }
            .post-caption {
                font-size: 14px;
                line-height: 1.4;
                margin-top: 8px;
            }
        `;
    }

    /**
     * JavaScript do widget
     */
    getWidgetJS() {
        return `
            // Adicionar interatividade ao widget
            document.querySelectorAll('.instagram-post').forEach(post => {
                post.addEventListener('click', function() {
                    const postId = this.dataset.postId;
                    window.open('https://www.instagram.com/saraiva_vision/', '_blank');
                });
            });
        `;
    }
}

export default new InstagramEmbedService();