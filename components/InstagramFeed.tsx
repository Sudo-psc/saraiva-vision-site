'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Instagram, ExternalLink, Play, Calendar, User, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import type { InstagramPost, InstagramFeedProps, InstagramApiResponse } from '@/types/instagram';

const InstagramFeed: React.FC<InstagramFeedProps> = ({
  maxPosts = 4,
  layout = 'grid',
  showStats = false,
  showCaption = true,
  className = '',
}) => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async (force = false) => {
    try {
      if (!force) setLoading(true);
      setError(null);

      const response = await fetch(`/api/instagram?limit=${maxPosts}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data: InstagramApiResponse = await response.json();

      if (data.success && data.posts) {
        setPosts(data.posts);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Instagram fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [maxPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts(true);
  };

  const formatTimestamp = (dateString?: string) => {
    if (!dateString) return 'Recentemente';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Hoje';
      if (diffDays === 1) return 'Ontem';
      if (diffDays < 7) return `${diffDays}d atrás`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem atrás`;
      return `${Math.floor(diffDays / 30)}m atrás`;
    } catch {
      return 'Recentemente';
    }
  };

  const truncateCaption = (text: string, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const handlePostClick = (post: InstagramPost) => {
    if (post.permalink) {
      window.open(post.permalink, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <section className={`py-12 bg-gray-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4`}>
              {[...Array(maxPosts)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error && posts.length === 0) {
    return (
      <section className={`py-12 bg-gray-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <Instagram className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Erro ao Carregar Posts
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-12 bg-gradient-to-br from-gray-50 to-blue-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Nos Siga no Instagram
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  Acompanhe nossas novidades e dicas de saúde ocular
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-all disabled:opacity-50"
              aria-label="Atualizar posts"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>

        <div className={`grid ${layout === 'grid' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => handlePostClick(post)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handlePostClick(post);
                }
              }}
              aria-label={`Post do Instagram: ${post.caption ? truncateCaption(post.caption, 50) : 'Sem legenda'}`}
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Image
                  src={post.media_type === 'VIDEO' && post.thumbnail_url ? post.thumbnail_url : post.media_url || '/img/placeholder.svg'}
                  alt={post.caption ? truncateCaption(post.caption, 100) : `Post por ${post.username}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />

                {post.media_type === 'VIDEO' && (
                  <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    <span>VÍDEO</span>
                  </div>
                )}

                {post.media_type === 'CAROUSEL_ALBUM' && (
                  <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                    <span>ÁLBUM</span>
                  </div>
                )}

                {post.fallback && (
                  <div className="absolute top-3 left-3 bg-orange-500/90 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                    DEMO
                  </div>
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 p-2 rounded-full shadow-lg backdrop-blur-sm">
                    <ExternalLink className="w-4 h-4 text-gray-700" />
                  </div>
                </div>
              </div>

              {(showCaption || showStats) && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">@{post.username || 'saraivavision'}</span>
                    </div>

                    {post.timestamp && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <time className="text-xs">{formatTimestamp(post.timestamp)}</time>
                      </div>
                    )}
                  </div>

                  {showCaption && post.caption && (
                    <p className="text-gray-800 text-sm leading-relaxed line-clamp-2">
                      {truncateCaption(post.caption, 80)}
                    </p>
                  )}
                </div>
              )}

              <div className="absolute inset-0 ring-2 ring-blue-500 ring-opacity-0 focus-within:ring-opacity-100 rounded-xl transition-all duration-200 pointer-events-none" />
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <a
            href="https://instagram.com/saraivavision"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            <Instagram className="w-5 h-5" />
            Seguir no Instagram
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default InstagramFeed;
