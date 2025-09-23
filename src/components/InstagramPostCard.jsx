import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Heart, MessageCircle, Calendar, User } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const InstagramPostCard = ({ 
  post, 
  className = '', 
  onClick = null,
  showUsername = true,
  showTimestamp = true,
  maxCaptionLength = 120,
  animate = true 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!post) return null;

  const {
    id,
    caption = '',
    media_type,
    media_url,
    thumbnail_url,
    permalink,
    timestamp,
    username = 'saraivavision',
    fallback = false
  } = post;

  // Format caption with proper truncation
  const formatCaption = (text, maxLength) => {
    if (!text) return '';
    
    // Remove excessive whitespace and line breaks
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    if (cleanText.length <= maxLength) return cleanText;
    
    const truncated = cleanText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return (lastSpace > maxLength * 0.8 ? truncated.substring(0, lastSpace) : truncated) + '...';
  };

  // Format timestamp
  const formatTimestamp = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch (error) {
      return '';
    }
  };

  // Get display image URL
  const getImageUrl = () => {
    if (imageError || !media_url) {
      return '/img/placeholder.svg';
    }
    
    return media_type === 'VIDEO' ? (thumbnail_url || media_url) : media_url;
  };

  // Handle image load events
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  // Handle card click
  const handleClick = () => {
    if (onClick) {
      onClick(post);
    } else if (permalink) {
      window.open(permalink, '_blank', 'noopener,noreferrer');
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    hover: { 
      y: -4,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const imageVariants = {
    loading: { opacity: 0.7 },
    loaded: { opacity: 1 }
  };

  const CardWrapper = animate ? motion.div : 'div';
  const ImageWrapper = animate ? motion.img : 'img';

  return (
    <CardWrapper
      className={`
        group relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer
        border border-gray-100 hover:border-gray-200 transition-all duration-300
        ${className}
      `}
      variants={animate ? cardVariants : undefined}
      initial={animate ? "hidden" : undefined}
      animate={animate ? "visible" : undefined}
      whileHover={animate ? "hover" : undefined}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Post do Instagram: ${formatCaption(caption, 50)}`}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {/* Loading skeleton */}
        {imageLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
        )}

        {/* Main image */}
        <ImageWrapper
          src={getImageUrl()}
          alt={formatCaption(caption, 100) || `Post do Instagram de ${username}`}
          className={`
            w-full h-full object-cover transition-all duration-300
            group-hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'}
          `}
          variants={animate ? imageVariants : undefined}
          animate={animate ? (imageLoading ? "loading" : "loaded") : undefined}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />

        {/* Media type indicator */}
        {media_type === 'VIDEO' && (
          <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
            VIDEO
          </div>
        )}

        {/* Fallback indicator */}
        {fallback && (
          <div className="absolute top-3 left-3 bg-orange-500/80 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
            Demo
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

        {/* External link icon */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/90 p-2 rounded-full shadow-lg backdrop-blur-sm">
            <ExternalLink className="w-4 h-4 text-gray-700" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Username and timestamp */}
        {(showUsername || showTimestamp) && (
          <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
            {showUsername && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium">@{username}</span>
              </div>
            )}
            
            {showTimestamp && timestamp && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatTimestamp(timestamp)}</span>
              </div>
            )}
          </div>
        )}

        {/* Caption */}
        {caption && (
          <p className="text-gray-800 text-sm leading-relaxed mb-3 min-h-[2.5rem]">
            {formatCaption(caption, maxCaptionLength)}
          </p>
        )}

        {/* Action indicators */}
        <div className="flex items-center gap-4 text-gray-500">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span className="text-xs">Curtir</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">Comentar</span>
          </div>
        </div>
      </div>

      {/* Focus outline for accessibility */}
      <div className="absolute inset-0 ring-2 ring-blue-500 ring-opacity-0 focus-within:ring-opacity-100 rounded-xl transition-all duration-200 pointer-events-none" />
    </CardWrapper>
  );
};

export default InstagramPostCard;