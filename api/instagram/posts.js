import { z } from 'zod';

// Environment variables
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

// Validation schemas
const postsRequestSchema = z.object({
  limit: z.number().min(1).max(25).default(4),
  fields: z.string().optional().default('id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username')
});

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
let cache = {
  data: null,
  timestamp: null
};

export default async function handler(req, res) {
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
      limit: parseInt(req.query.limit) || 4,
      fields: req.query.fields
    });

    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid request parameters',
        details: validation.error.errors 
      });
    }

    const { limit, fields } = validation.data;

    // Check if we have valid cached data
    if (cache.data && cache.timestamp && (Date.now() - cache.timestamp < CACHE_DURATION)) {
      return res.status(200).json({
        success: true,
        data: cache.data.slice(0, limit),
        cached: true,
        cache_age: Math.floor((Date.now() - cache.timestamp) / 1000)
      });
    }

    // Check if access token is configured
    if (!INSTAGRAM_ACCESS_TOKEN) {
      return res.status(500).json({ 
        error: 'Instagram access token not configured',
        fallback: getFallbackPosts(limit)
      });
    }

    // Fetch posts from Instagram API
    const posts = await fetchInstagramPosts(fields, limit);

    // Update cache
    cache.data = posts;
    cache.timestamp = Date.now();

    res.status(200).json({
      success: true,
      data: posts,
      cached: false,
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
}

// Fetch posts from Instagram Basic Display API
async function fetchInstagramPosts(fields, limit) {
  const url = new URL('https://graph.instagram.com/me/media');
  url.searchParams.set('fields', fields);
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
    caption: post.caption || '',
    media_type: post.media_type,
    media_url: post.media_url,
    thumbnail_url: post.thumbnail_url || post.media_url,
    permalink: post.permalink,
    timestamp: post.timestamp,
    username: post.username || 'saraivavision'
  }));
}

// Fallback posts for when API is unavailable
function getFallbackPosts(limit = 4) {
  const fallbackPosts = [
    {
      id: 'fallback_1',
      caption: '🔬 Exame de vista completo na Clínica Saraiva Vision. Agende sua consulta! #SaraivaVision #OftalmologiaBrasilia',
      media_type: 'IMAGE',
      media_url: '/images/hero.webp',
      thumbnail_url: '/images/hero.webp',
      permalink: 'https://www.instagram.com/saraivavision',
      timestamp: new Date().toISOString(),
      username: 'saraivavision',
      fallback: true
    },
    {
      id: 'fallback_2',
      caption: '👁️ Cuidando da sua visão com tecnologia de ponta. Venha nos conhecer! #SaudeOcular #Brasilia',
      media_type: 'IMAGE',
      media_url: '/images/drphilipe_perfil.webp',
      thumbnail_url: '/images/drphilipe_perfil.webp',
      permalink: 'https://www.instagram.com/saraivavision',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      username: 'saraivavision',
      fallback: true
    },
    {
      id: 'fallback_3',
      caption: '💡 Dicas importantes sobre saúde ocular no nosso podcast! Ouça agora 🎧 #PodcastSaude #SaraivaVision',
      media_type: 'IMAGE',
      media_url: '/Podcasts/Covers/podcast.png',
      thumbnail_url: '/Podcasts/Covers/podcast.png',
      permalink: 'https://www.instagram.com/saraivavision',
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      username: 'saraivavision',
      fallback: true
    },
    {
      id: 'fallback_4',
      caption: '🏥 Nossa clínica está preparada para cuidar de você e sua família. #ClinicaSaraivaVision #AtendimentoHumanizado',
      media_type: 'IMAGE',
      media_url: '/img/clinic_facade.webp',
      thumbnail_url: '/img/clinic_facade.webp',
      permalink: 'https://www.instagram.com/saraivavision',
      timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      username: 'saraivavision',
      fallback: true
    }
  ];

  return fallbackPosts.slice(0, limit);
}

// API route for cache management (optional)
export async function clearCache() {
  cache.data = null;
  cache.timestamp = null;
  return { success: true, message: 'Cache cleared' };
}