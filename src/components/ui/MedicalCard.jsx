import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SafeImage from '@/components/ui/SafeImage';
import { Button } from '@/components/ui/button';
import { useAnimationConfig, useMediaLoader } from '@/hooks/useUnifiedComponents';
import {
  cn,
  getSizeClasses,
  getVariantClasses,
  getThemeClasses,
  getBorderRadiusClasses,
  getHoverEffectClasses,
  getMotionPreset,
  getInteractiveClasses,
  getAccessibilityProps,
  getMedicalComplianceClasses,
  getResponsiveClasses
} from '@/utils/componentUtils';

/**
 * Unified MedicalCard component supporting multiple variants and medical compliance
 * Implements the BaseCardProps interface with comprehensive styling and accessibility
 */
const MedicalCard = forwardRef(({
  // Core Properties
  variant,
  size = 'standard',
  
  // Visual Design
  glassMorphism = false,
  shadow3D = false,
  gradient = 'none',
  borderRadius = 'xl',
  
  // Interactive Behavior
  interactive = false,
  draggable = false,
  clickable = false,
  hoverEffects = 'subtle',
  
  // Accessibility & Compliance
  'aria-label': ariaLabel,
  cfmCompliant = false,
  'data-testid': testId,
  reducedMotion = false,
  
  // Content Structure
  header,
  media,
  body,
  footer,
  actions = [],
  
  // Animation Configuration
  animationDelay = 0,
  motionPreset = 'entrance',
  stagger = false,
  
  // Event Handlers
  onClick,
  onKeyDown,
  
  // HTML props
  className,
  children,
  ...props
}, ref) => {
  // Animation configuration
  const animationConfig = useAnimationConfig({ 
    reduceMotion: reducedMotion,
    delay: animationDelay 
  });
  
  // Media loading state
  const {
    isLoading,
    hasError,
    isVisible,
    elementRef: mediaRef,
    handleLoad,
    handleError
  } = useMediaLoader(media);

  // Build className
  const cardClasses = cn(
    // Base classes
    'group relative flex flex-col overflow-hidden will-change-transform transform-gpu preserve-3d',
    
    // Size-based classes
    getSizeClasses(size),
    
    // Variant styling
    getVariantClasses(variant),
    
    // Theme colors
    getThemeClasses(gradient),
    
    // Border radius
    getBorderRadiusClasses(borderRadius),
    
    // Hover effects
    getHoverEffectClasses(hoverEffects),
    
    // Interactive behavior
    getInteractiveClasses(interactive, clickable),
    
    // Responsive classes
    getResponsiveClasses(size),
    
    // Medical compliance
    getMedicalComplianceClasses(cfmCompliant),
    
    // Special effects
    {
      'glass-morphism': glassMorphism && variant === 'service',
      'shadow-3d hover:shadow-3d-hover': shadow3D,
      'cursor-pointer': clickable,
      'cursor-grab active:cursor-grabbing select-none': draggable,
      'focus-within:ring-2 focus-within:ring-blue-500/20': interactive
    },
    
    className
  );

  // Motion configuration
  const motionConfig = getMotionPreset(motionPreset);
  const shouldAnimate = !animationConfig.reduceMotion;

  // Accessibility props
  const accessibilityProps = getAccessibilityProps(ariaLabel, testId, reducedMotion);

  // Handle click events
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
    
    // Handle Enter and Space for clickable cards
    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleClick(e);
    }
  };

  // Render media content
  const renderMedia = () => {
    if (!media) return null;

    const mediaClasses = cn(
      'relative overflow-hidden',
      {
        'aspect-square': media.aspectRatio === '1:1',
        'aspect-video': media.aspectRatio === '16:9',
        'aspect-[4/3]': media.aspectRatio === '4:3',
        'w-32 h-32 mx-auto': variant === 'service',
        'w-full h-48': variant === 'episode' || variant === 'article',
        'w-16 h-16': variant === 'testimonial'
      }
    );

    switch (media.type) {
      case 'image':
        return (
          <div className={mediaClasses} ref={mediaRef}>
            <SafeImage
              src={isVisible ? media.src : media.placeholder || ''}
              alt={media.alt}
              className={cn(
                'w-full h-full object-cover transition-transform group-hover:scale-105',
                media.className
              )}
              onLoad={handleLoad}
              onError={handleError}
            />
            {isLoading && (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100 animate-pulse" />
            )}
            {hasError && (
              <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                <span className="text-slate-400 text-sm">Imagem não disponível</span>
              </div>
            )}
          </div>
        );

      case 'icon':
        return (
          <motion.div
            className={cn(
              mediaClasses,
              'flex items-center justify-center mb-6'
            )}
            whileHover={shouldAnimate ? { scale: 1.1, rotate: 3 } : {}}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative drop-shadow-lg select-none">
              {media.src || children}
            </div>
          </motion.div>
        );

      case 'audio':
      case 'video':
        return (
          <div className={mediaClasses}>
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center rounded-lg">
              <span className="text-slate-500 text-sm capitalize">{media.type}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render actions
  const renderActions = () => {
    if (!actions.length) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-auto pt-4">
        {actions.map((action, index) => {
          const ActionComponent = action.href ? Link : Button;
          const actionProps = action.href 
            ? { 
                to: action.href,
                ...(action.external && { 
                  as: 'a', 
                  href: action.href, 
                  target: '_blank', 
                  rel: 'noopener noreferrer' 
                })
              }
            : { onClick: action.onClick, disabled: action.disabled };

          return (
            <ActionComponent
              key={index}
              variant={action.variant}
              size="sm"
              className={cn(
                'transition-all group/button overflow-hidden',
                {
                  'opacity-50 cursor-not-allowed': action.disabled,
                  'animate-pulse': action.loading
                }
              )}
              aria-label={action['aria-label'] || action.label}
              {...actionProps}
            >
              {action.icon && (
                <span className="mr-2 transition-transform group-hover/button:translate-x-0.5">
                  {action.icon}
                </span>
              )}
              {action.label}
            </ActionComponent>
          );
        })}
      </div>
    );
  };

  // Card content
  const cardContent = (
    <>
      {/* Background effects */}
      {variant === 'service' && (
        <>
          <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-700" 
               style={{ background: 'radial-gradient(circle at 30% 20%, rgba(96,165,250,0.35), transparent 60%)' }} />
          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 mix-blend-overlay" 
               style={{ background: 'linear-gradient(140deg, rgba(147,51,234,0.15), rgba(236,72,153,0.12), rgba(59,130,246,0.12))' }} />
        </>
      )}

      {/* Header */}
      {header && (
        <div className="mb-4">
          {header}
        </div>
      )}

      {/* Media */}
      {renderMedia()}

      {/* Body */}
      {body && (
        <div className="flex-grow">
          {body}
        </div>
      )}

      {/* Default children if no structured content */}
      {!header && !body && !footer && children}

      {/* Actions */}
      {renderActions()}

      {/* Footer */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-slate-200/50">
          {footer}
        </div>
      )}

      {/* Gradient bottom edge for service cards */}
      {variant === 'service' && (
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-400/0 via-purple-500/40 to-pink-400/0 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </>
  );

  // Render as motion component if animation is enabled
  if (shouldAnimate && motionPreset !== 'none') {
    return (
      <motion.div
        ref={ref}
        className={cardClasses}
        data-card
        data-testid={testId}
        tabIndex={interactive ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...motionConfig}
        {...(stagger && { 
          custom: animationDelay,
          transition: { ...motionConfig.transition, delay: animationDelay }
        })}
        {...accessibilityProps}
        {...props}
      >
        {cardContent}
      </motion.div>
    );
  }

  // Render as regular div
  return (
    <div
      ref={ref}
      className={cardClasses}
      data-card
      data-testid={testId}
      tabIndex={interactive ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...accessibilityProps}
      {...props}
    >
      {cardContent}
    </div>
  );
});

MedicalCard.displayName = 'MedicalCard';

export default MedicalCard;