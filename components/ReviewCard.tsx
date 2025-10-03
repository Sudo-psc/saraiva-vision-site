'use client';

import React, { useState } from 'react';
import { Star, Clock, MessageSquare, ThumbsUp, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { createLogger } from '@/utils/structuredLogger';
import type { GoogleReview } from '@/types/google-reviews';

const logger = createLogger('ReviewCard');

interface ReviewCardProps {
  review: GoogleReview;
  showReply?: boolean;
  showDate?: boolean;
  showActions?: boolean;
  maxTextLength?: number;
  className?: string;
  onShare?: (review: GoogleReview) => void;
  onLike?: (review: GoogleReview, liked: boolean) => void;
  isFeatured?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  showReply = true,
  showDate = true,
  showActions = true,
  maxTextLength = 150,
  className = '',
  onShare,
  onLike,
  isFeatured = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  if (!review || typeof review !== 'object') {
    logger.warn('Invalid review object received', { review, type: typeof review });
    return (
      <div className="bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-center text-slate-500 dark:text-slate-400">
          <div className="text-center">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mx-auto mb-2">
              <Star className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-sm">Avaliação não disponível</p>
          </div>
        </div>
      </div>
    );
  }

  const {
    id,
    reviewer = {} as any,
    starRating = 0,
    comment = '',
    createTime,
    reviewReply,
    isRecent = false,
    wordCount = 0
  } = review;

  logger.logReviewProcessing(id, 'render', {
    hasReviewer: !!reviewer,
    starRating,
    hasComment: !!comment,
    wordCount,
    isRecent,
    hasResponse: !!reviewReply
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      logger.debug('Empty date string provided', { reviewId: id });
      return '';
    }

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return 'há 1 dia';
      if (diffDays < 7) return `há ${diffDays} dias`;
      if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`;
      if (diffDays < 365) return `há ${Math.floor(diffDays / 30)} meses`;
      return `há ${Math.floor(diffDays / 365)} anos`;
    } catch (error) {
      logger.error('Date formatting error', { reviewId: id, dateString, error: (error as Error).message });
      return '';
    }
  };

  const shouldTruncate = comment && comment.length > maxTextLength && !isExpanded;
  const displayText = shouldTruncate
    ? comment.substring(0, maxTextLength) + '...'
    : comment || '';

  const renderStars = (rating: number, size: 'small' | 'medium' | 'large' = 'medium') => {
    const starSize = size === 'small' ? 14 : size === 'large' ? 20 : 16;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= (rating || 0);
      stars.push(
        <Star
          key={i}
          size={starSize}
          className={isFilled
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-gray-300 dark:text-gray-600'
          }
        />
      );
    }

    return <div className="flex gap-0.5">{stars}</div>;
  };

  const handleShare = async () => {
    logger.logUserInteraction('share_button', 'click', { reviewId: id });

    if (onShare) {
      logger.debug('Using custom onShare callback', { reviewId: id });
      onShare(review);
    } else {
      if (navigator?.share) {
        try {
          await navigator.share({
            title: `Avaliação de ${reviewer?.displayName || 'Anônimo'}`,
            text: comment || '',
            url: window?.location?.href || ''
          });
          logger.info('Review shared successfully', { reviewId: id, method: 'navigator.share' });
        } catch (error) {
          logger.warn('Share failed, falling back to clipboard', { reviewId: id, error: (error as Error).message });
          navigator?.clipboard?.writeText(comment || '');
        }
      } else {
        logger.debug('Navigator share not available, using clipboard', { reviewId: id });
        navigator?.clipboard?.writeText(comment || '');
      }
    }
  };

  const handleLike = () => {
    const newLikeState = !isLiked;
    logger.logUserInteraction('like_button', 'click', {
      reviewId: id,
      previousState: isLiked,
      newState: newLikeState
    });

    setIsLiked(newLikeState);
    if (onLike) {
      onLike(review, newLikeState);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        relative bg-white dark:bg-slate-800/40 rounded-xl border
        ${isFeatured
          ? 'border-yellow-200 dark:border-yellow-800/50 ring-2 ring-yellow-100 dark:ring-yellow-900/20'
          : 'border-slate-200 dark:border-slate-700'
        }
        ${isFeatured ? 'shadow-lg' : 'shadow-sm'}
        ${className}
      `}
    >
      {isFeatured && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-md">
            Destaque
          </div>
        </div>
      )}

      {isRecent && (
        <div className="absolute top-3 left-3">
          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <Clock size={12} />
            Recente
          </div>
        </div>
      )}

      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {reviewer?.profilePhotoUrl ? (
              <img
                src={reviewer.profilePhotoUrl}
                alt={reviewer?.displayName || 'Anônimo'}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                loading="lazy"
                onError={(e) => {
                  logger.warn('Profile image failed to load', {
                    reviewId: id,
                    imageUrl: reviewer.profilePhotoUrl,
                    error: e.type
                  });
                  (e.target as HTMLImageElement).style.display = 'none';
                  const nextElement = (e.target as HTMLElement).nextElementSibling;
                  if (nextElement instanceof HTMLElement) {
                    nextElement.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm"
              style={{ display: reviewer?.profilePhotoUrl ? 'none' : 'flex' }}
            >
              {reviewer?.displayName?.charAt(0)?.toUpperCase() || 'A'}
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                {reviewer?.displayName || 'Anônimo'}
                {reviewer?.isAnonymous && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">(Anônimo)</span>
                )}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {renderStars(starRating || 0, 'small')}
                {showDate && createTime && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    • {formatDate(createTime)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {comment && (
          <div className="space-y-2">
            <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
              {displayText}
            </p>

            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 dark:text-blue-400 text-xs font-medium hover:underline flex items-center gap-1"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp size={14} />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    Ler mais
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {showReply && reviewReply?.comment && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <MessageSquare size={12} className="text-white" />
              </div>
              <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                Resposta do estabelecimento
              </span>
              {reviewReply?.updateTime && (
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  • {formatDate(reviewReply.updateTime)}
                </span>
              )}
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
              {reviewReply?.comment}
            </p>
          </div>
        )}

        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`
                  flex items-center gap-1 text-xs font-medium transition-colors
                  ${isLiked
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400'
                  }
                `}
              >
                <ThumbsUp size={14} className={isLiked ? 'fill-current' : ''} />
                Útil
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Share2 size={14} />
                Compartilhar
              </button>
            </div>

            {wordCount && wordCount > 0 && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {wordCount} palavras
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReviewCard;
