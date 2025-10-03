/**
 * Service Types
 * TypeScript definitions for Saraiva Vision services
 */

import { ReactNode } from 'react';

/**
 * Core service item data structure
 */
export interface ServiceItem {
  id: string;
  title: string;
  benefit: string;
  description?: string;
  icon?: ReactNode;
  category?: ServiceCategory;
  featured?: boolean;
}

/**
 * Service categories for organization
 */
export type ServiceCategory =
  | 'consultations'
  | 'exams'
  | 'treatments'
  | 'surgeries'
  | 'pediatric'
  | 'specialized';

/**
 * Props for ServiceCard component
 */
export interface ServiceCardProps {
  service: ServiceItem;
  index?: number;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

/**
 * Props for ServicesGrid component
 */
export interface ServicesGridProps {
  services?: ServiceItem[];
  title?: string;
  subtitle?: string;
  showBadge?: boolean;
  maxVisible?: number;
  variant?: 'grid' | 'carousel';
  className?: string;
}

/**
 * Service icon mapping type
 */
export interface ServiceIconMap {
  [key: string]: ReactNode;
}

/**
 * Gradient configuration for service cards
 */
export interface ServiceGradient {
  background: string;
  hover: string;
}
