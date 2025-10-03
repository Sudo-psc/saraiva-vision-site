'use client';

import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'rectangular' | 'text';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    variant = 'default', 
    width, 
    height, 
    animation = 'pulse',
    className = '', 
    style,
    ...props 
  }, ref) => {
    const variantClasses = {
      default: 'rounded-md',
      circular: 'rounded-full',
      rectangular: 'rounded-none',
      text: 'rounded-sm h-4'
    };

    const animationClasses = {
      pulse: 'animate-pulse',
      wave: 'animate-shimmer',
      none: ''
    };

    const combinedStyle = {
      width: width || undefined,
      height: height || undefined,
      ...style
    };

    return (
      <div
        ref={ref}
        className={`bg-slate-200 ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
        style={combinedStyle}
        aria-label="Loading..."
        role="status"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    <Skeleton className="h-48 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        variant="text" 
        className={i === lines - 1 ? 'w-2/3' : 'w-full'} 
      />
    ))}
  </div>
);

export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <Skeleton 
      variant="circular" 
      className={`${sizeClasses[size]} ${className}`} 
    />
  );
};

export default Skeleton;
