import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import createInstagramSecurityMiddleware from '../../src/middleware/instagramSecurityMiddleware.js';

// Environment variables
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Supabase client
const supabase = supabaseUrl && supabaseServiceKey ? 
  createClient(supabaseUrl, supabaseServiceKey) : null;

// Validation schemas
const postsRequestSchema = z.object({
  limit: z.number().min(1).max(25).default(6),
  hashtag: z.string().optional(),
  includeStats: z.boolean().optional().default(true)
});

// Cache configuration
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
let cache = {
  data: null,
  timestamp: null
};

// Create security middleware for this endpoint
const securityMiddleware = createInstagramSecurityMiddleware('/api/instagram/posts');

export default async function handler(req, res) {
  // Apply security middleware
  securityMiddleware(req, res, async () => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // Validate request parameters
      const validation = postsRequestSchema.safeParse({
        limit: parseInt(req.query.limit) || 6,
        hashtag: req.query.hashtag,
        includeStats: req.query.includeStats !== 'false'
      });

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request parameters',
          details: validation.error.errors
        });
      }

      const { limit, hashtag, includeStats } = validation.data;

      // First try to get real cached data from database
      let result = await getCachedRealPosts();
      
      // If no real data available, try to fetch from Instagram API
      if (!result && INSTAGRAM_ACCESS_TOKEN) {
        try {
          const posts = await fetchInstagramPosts(limit);
          const enhancedPosts = includeStats ? await enhancePostsWithStats(posts) : posts;
          
          if (enhancedPosts.length > 0) {
            result = {
              success: true,
              posts: enhancedPosts,
              source: 'instagram_api',
              timestamp: new Date().toISOString(),
              fromCache: false
            };
            
            // Save to database cache
            await saveCachedPosts(result);
          }
        } catch (apiError) {
          console.warn('Instagram API failed:', apiError.message);
        }
      }

      // If still no data, use fallback
      if (!result) {
        result = {
          success: true,
          posts: getFallbackPosts(),
          source: 'fallback',
          timestamp: new Date().toISOString(),
          fromCache: false
        };
      }

      // Filter by hashtag if specified
      let posts = result.posts;
      if (hashtag && hashtag !== 'all') {
        const searchTag = hashtag.toLowerCase().replace('#', '');
        posts = posts.filter(post => 
          (post.hashtags && post.hashtags.some(tag => 
            tag.toLowerCase().includes(searchTag)
          )) ||
          post.caption.toLowerCase().includes(searchTag)
        );
      }

      // Limit posts
      posts = posts.slice(0, limit);

      // Calculate profile stats
      const profileStats = {
        followers: '1.8K',
        following: '89',
        posts: 127,
        averageLikes: Math.round(posts.reduce((sum, post) => sum + (post.likes || 0), 0) / posts.length) || 0,
        averageComments: Math.round(posts.reduce((sum, post) => sum + (post.comments || 0), 0) / posts.length) || 0,
        engagementRate: calculateEngagementRate({
          like_count: posts.reduce((sum, post) => sum + (post.likes || 0), 0),
          comments_count: posts.reduce((sum, post) => sum + (post.comments || 0), 0)
        })
      };

      res.status(200).json({
        success: true,
        posts: posts.map(formatPost),
        profileStats,
        source: result.source,
        fromCache: result.fromCache,
        timestamp: result.timestamp,
        total: posts.length
      });

    } catch (error) {
      console.error('Instagram posts fetch error:', error);

      // Return cached data if available, otherwise fallback
      if (cache.data) {
        return res.status(200).json({
          success: true,
          data: cache.data.slice(0, validation.data?.limit || 4),
          cached: true,
          error: 'API temporarily unavailable, serving cached data'
        });
      }

      res.status(500).json({
        error: 'Failed to fetch Instagram posts',
        message: error.message,
        fallback: getFallbackPosts(validation.data?.limit || 4)
      });
    }
  }); // Close securityMiddleware callback
}

// Get cached real posts from database
async function getCachedRealPosts() {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('instagram_cache')
      .select('*')
      .eq('id', 'saraiva_vision_cache')
      .single();

    if (error) throw error;

    // Check if cache is still valid (24h)
    const expiresAt = new Date(data.expires_at);
    const now = new Date();

    if (now < expiresAt && data.posts && data.posts.length > 0) {
      return {
        success: true,
        posts: data.posts,
        source: data.source || 'cached_real',
        timestamp: data.fetched_at,
        fromCache: true
      };
    }
  } catch (error) {
    console.warn('Failed to get cached real posts:', error);
  }
  
  return null;
}

// Save posts to database cache
async function saveCachedPosts(data) {
  if (!supabase) return false;
  
  try {
    const { error } = await supabase
      .from('instagram_cache')
      .upsert({
        id: 'saraiva_vision_cache',
        username: 'saraiva_vision',
        posts: data.posts,
        source: data.source,
        fetched_at: data.timestamp,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.warn('Failed to save posts to cache:', error);
    return false;
  }
}

// Fetch posts from Instagram Basic Display API
async function fetchInstagramPosts(limit = 10) {
  const url = new URL('https://graph.instagram.com/me/media');
  url.searchParams.set('fields', 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username');
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('access_token', INSTAGRAM_ACCESS_TOKEN);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || `Instagram API error: ${response.status}`);
  }

  // Transform and validate the data
  return data.data.map(post => ({
    id: post.id,
    username: 'saraiva_vision',
    caption: post.caption || '',
    imageUrl: post.media_url,
    timestamp: post.timestamp,
    likes: 0, // Will be enhanced with stats
    comments: 0, // Will be enhanced with stats  
    type: 'image',
    postUrl: post.permalink,
    profilePicture: '/images/drphilipe_perfil.webp',
    isVerified: true,
    source: 'instagram_api'
  }));
}

// Enhance posts with engagement statistics
async function enhancePostsWithStats(posts) {
  const enhancedPosts = [];

  for (const post of posts) {
    try {
      const stats = await fetchPostStats(post.id);
      enhancedPosts.push({
        ...post,
        stats: {
          likes: stats.like_count || 0,
          comments: stats.comments_count || 0,
          engagement_rate: calculateEngagementRate(stats),
          last_updated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error(`Failed to fetch stats for post ${post.id}:`, error);
      // Include post without stats if stats fetch fails
      enhancedPosts.push({
        ...post,
        stats: {
          likes: 0,
          comments: 0,
          engagement_rate: 0,
          last_updated: new Date().toISOString(),
          error: 'Stats unavailable'
        }
      });
    }
  }

  return enhancedPosts;
}

// Fetch individual post statistics
async function fetchPostStats(postId) {
  const url = new URL(`https://graph.instagram.com/${postId}`);
  url.searchParams.set('fields', 'like_count,comments_count,timestamp');
  url.searchParams.set('access_token', INSTAGRAM_ACCESS_TOKEN);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || `Stats API error: ${response.status}`);
  }

  return data;
}

// Calculate engagement rate based on likes and comments
function calculateEngagementRate(stats) {
  const totalEngagement = (stats.like_count || 0) + (stats.comments_count || 0);
  // Using a base follower count estimate for calculation
  // In production, this should be fetched from user profile
  const estimatedFollowers = 1000; // This should be dynamic
  return totalEngagement > 0 ? parseFloat(((totalEngagement / estimatedFollowers) * 100).toFixed(2)) : 0;
}

// Format post for response
function formatPost(post) {
  return {
    ...post,
    timeAgo: getTimeAgo(post.timestamp),
    engagementRate: calculateEngagementRate({
      like_count: post.likes || 0,
      comments_count: post.comments || 0
    }),
    profilePicture: post.profilePicture || '/images/drphilipe_perfil.webp',
    isVerified: true
  };
}

// Get time ago string
function getTimeAgo(timestamp) {
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

// Fallback posts for when API is unavailable
function getFallbackPosts() {
  const currentDate = new Date();
  
  return [
    {
      id: 'post_020924_exam',
      username: 'saraiva_vision',
      caption: '🔬 Exame completo realizado hoje! É incrível como a tecnologia nos permite ver cada detalhe da sua saúde ocular. Prevenção é sempre o melhor remédio! 👁️ Obrigado pela confiança, paciente! #SaraivaVision #SaudeOcular #PrevencaoVisual #Brasilia',
      imageUrl: '/images/hero.webp',
      timestamp: new Date(currentDate.getTime() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 87,
      comments: 12,
      type: 'image',
      hashtags: ['#SaraivaVision', '#SaudeOcular', '#PrevencaoVisual', '#Brasilia'],
      postUrl: 'https://www.instagram.com/saraiva_vision/',
      profilePicture: '/images/drphilipe_perfil.webp',
      isVerified: true,
      source: 'fallback'
    },
    {
      id: 'post_010924_drphilipe',
      username: 'saraiva_vision',
      caption: 'Dr. Philipe Saraiva Cruz atendendo com dedicação e carinho cada paciente. "Ver o sorriso de satisfação ao final de cada consulta é o que me motiva todos os dias!" 👨‍⚕️❤️ #DrPhilipe #AtendimentoHumanizado #OftalmologiaBSB #CuidadoComAmor',
      imageUrl: '/images/drphilipe_perfil.webp',
      timestamp: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 156,
      comments: 28,
      type: 'image',
      hashtags: ['#DrPhilipe', '#AtendimentoHumanizado', '#OftalmologiaBSB', '#CuidadoComAmor'],
      postUrl: 'https://www.instagram.com/saraiva_vision/',
      profilePicture: '/images/drphilipe_perfil.webp',
      isVerified: true,
      source: 'fallback'
    },
    {
      id: 'post_300824_podcast',
      username: 'saraiva_vision',
      caption: '🎧 NOVO EPISÓDIO NO AR! "Como proteger sua visão no trabalho remoto" - episódio especial com dicas práticas para quem passa muitas horas na tela. Link na bio! 💻👀 #PodcastSaude #TrabalhoRemoto #SaudeDigital #DicasPraticas',
      imageUrl: '/Podcasts/Covers/podcast.png',
      timestamp: new Date(currentDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 134,
      comments: 19,
      type: 'image',
      hashtags: ['#PodcastSaude', '#TrabalhoRemoto', '#SaudeDigital', '#DicasPraticas'],
      postUrl: 'https://www.instagram.com/saraiva_vision/',
      profilePicture: '/images/drphilipe_perfil.webp',
      isVerified: true,
      source: 'fallback'
    },
    {
      id: 'post_280824_equipment',
      username: 'saraiva_vision',
      caption: '🏥 Novos equipamentos chegaram! Investimos constantemente em tecnologia para oferecer diagnósticos ainda mais precisos. Sua visão merece o que há de melhor! ✨ #TecnologiaAvancada #EquipamentosModernos #InovacaoMedica #QualidadeSaraiva',
      imageUrl: '/images/hero.webp',
      timestamp: new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 203,
      comments: 31,
      type: 'image',
      hashtags: ['#TecnologiaAvancada', '#EquipamentosModernos', '#InovacaoMedica', '#QualidadeSaraiva'],
      postUrl: 'https://www.instagram.com/saraiva_vision/',
      profilePicture: '/images/drphilipe_perfil.webp',
      isVerified: true,
      source: 'fallback'
    },
    {
      id: 'post_250824_success',
      username: 'saraiva_vision',
      caption: '😊 "Depois de anos com dificuldade para enxergar, hoje posso ver minha família claramente!" Depoimento emocionante da Sra. Maria. Momentos como este nos lembram por que escolhemos a medicina! 👨‍👩‍👧‍👦💕 #TestemunhoReal #VidaMelhor #GratidaoMutua #FamiliaSaraiva',
      imageUrl: '/images/hero.webp',
      timestamp: new Date(currentDate.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 289,
      comments: 47,
      type: 'image',
      hashtags: ['#TestemunhoReal', '#VidaMelhor', '#GratidaoMutua', '#FamiliaSaraiva'],
      postUrl: 'https://www.instagram.com/saraiva_vision/',
      profilePicture: '/images/drphilipe_perfil.webp',
      isVerified: true,
      source: 'fallback'
    },
    {
      id: 'post_220824_team',
      username: 'saraiva_vision',
      caption: '👩‍⚕️👨‍⚕️ Nossa equipe em ação! Cada profissional da Saraiva Vision é dedicado e apaixonado pelo que faz. Juntos, cuidamos da sua visão com excelência! 🤝✨ #EquipeSaraiva #TrabalhoEmEquipe #ProfissionaisDedicados #ExcelenciaNoAtendimento',
      imageUrl: '/images/hero.webp',
      timestamp: new Date(currentDate.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 167,
      comments: 23,
      type: 'image',
      hashtags: ['#EquipeSaraiva', '#TrabalhoEmEquipe', '#ProfissionaisDedicados', '#ExcelenciaNoAtendimento'],
      postUrl: 'https://www.instagram.com/saraiva_vision/',
      profilePicture: '/images/drphilipe_perfil.webp',
      isVerified: true,
      source: 'fallback'
    }
  ];
}

// API route for cache management (optional)
export async function clearCache() {
  cache.data = null;
  cache.timestamp = null;
  return { success: true, message: 'Cache cleared' };
}
