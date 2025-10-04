'use client';

import { useMicrocopy } from '@/hooks/useMicrocopy';
import { HTMLAttributes, createElement } from 'react';

interface PersonalizedTextProps extends HTMLAttributes<HTMLElement> {
  variantId: string;
  as?: keyof JSX.IntrinsicElements;
  fallback?: string;
}

export function PersonalizedText({
  variantId,
  as: Component = 'span',
  fallback,
  ...props
}: PersonalizedTextProps) {
  const text = useMicrocopy(variantId, fallback);
  
  return createElement(Component, props, text);
}

interface PersonalizedCTAProps {
  variantId: string;
  href: string;
  className?: string;
  onClick?: () => void;
}

export function PersonalizedCTA({
  variantId,
  href,
  className,
  onClick,
}: PersonalizedCTAProps) {
  const ctaText = useMicrocopy(variantId);
  
  return (
    <a
      href={href}
      className={className}
      onClick={onClick}
      data-variant-id={variantId}
    >
      {ctaText}
    </a>
  );
}

interface PersonalizedButtonProps extends HTMLAttributes<HTMLButtonElement> {
  variantId: string;
  fallback?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function PersonalizedButton({
  variantId,
  fallback,
  type = 'button',
  ...props
}: PersonalizedButtonProps) {
  const text = useMicrocopy(variantId, fallback);
  
  return (
    <button type={type} {...props} data-variant-id={variantId}>
      {text}
    </button>
  );
}
