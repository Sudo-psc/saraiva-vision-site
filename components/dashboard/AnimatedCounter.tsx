/**
 * AnimatedCounter Component
 * Displays animated number counting with formatting options
 * Used in stat cards and dashboard metrics
 */

'use client';

import React from 'react';
import { useCountUp, easingFunctions } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

export interface AnimatedCounterProps {
  /** End value to count to */
  end: number;
  /** Starting value (default: 0) */
  start?: number;
  /** Animation duration in milliseconds (default: 2000) */
  duration?: number;
  /** Number of decimal places (default: 0) */
  decimals?: number;
  /** Thousand separator (default: '.') */
  separator?: string;
  /** Prefix string (e.g., 'R$') */
  prefix?: string;
  /** Suffix string (e.g., '%', '+') */
  suffix?: string;
  /** Delay before animation starts in ms (default: 0) */
  delay?: number;
  /** Easing function name */
  easing?: keyof typeof easingFunctions;
  /** Custom CSS class */
  className?: string;
  /** Auto-start animation (default: true) */
  autoStart?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Text size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  /** Font weight */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  /** Text color (Tailwind class) */
  color?: string;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
};

const weightClasses = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

/**
 * AnimatedCounter Component
 */
export function AnimatedCounter({
  end,
  start = 0,
  duration = 2000,
  decimals = 0,
  separator = '.',
  prefix = '',
  suffix = '',
  delay = 0,
  easing = 'easeOutCubic',
  className,
  autoStart = true,
  onComplete,
  size = '2xl',
  weight = 'bold',
  color = 'text-slate-800 dark:text-slate-100',
}: AnimatedCounterProps) {
  const { value } = useCountUp({
    start,
    end,
    duration,
    decimals,
    separator,
    prefix,
    suffix,
    delay,
    easingFn: easingFunctions[easing],
    autoStart,
    onComplete,
  });

  return (
    <span
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        color,
        'tabular-nums',
        className
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {value}
    </span>
  );
}

/**
 * Pre-configured counter variants
 */

export function PercentageCounter(props: Omit<AnimatedCounterProps, 'suffix' | 'decimals'>) {
  return <AnimatedCounter {...props} suffix="%" decimals={1} />;
}

export function CurrencyCounter(props: Omit<AnimatedCounterProps, 'prefix' | 'separator'>) {
  return <AnimatedCounter {...props} prefix="R$ " separator="." />;
}

export function RatingCounter(props: Omit<AnimatedCounterProps, 'decimals'>) {
  return <AnimatedCounter {...props} decimals={1} />;
}

export function CompactNumberCounter(props: AnimatedCounterProps) {
  // Format large numbers (1000 -> 1K, 1000000 -> 1M)
  const formatCompact = (num: number): { value: number; suffix: string } => {
    if (num >= 1000000) {
      return { value: num / 1000000, suffix: 'M' };
    } else if (num >= 1000) {
      return { value: num / 1000, suffix: 'K' };
    }
    return { value: num, suffix: '' };
  };

  const { value: compactValue, suffix: compactSuffix } = formatCompact(props.end);
  const startCompact = props.start ? formatCompact(props.start).value : 0;

  return (
    <AnimatedCounter
      {...props}
      start={startCompact}
      end={compactValue}
      suffix={compactSuffix}
      decimals={1}
    />
  );
}

export default AnimatedCounter;
