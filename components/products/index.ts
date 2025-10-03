/**
 * Products Components Barrel Export
 * Centralized export for all product-related components
 */

export { default as ContactLenses } from './ContactLenses';
export { default as ProductHero } from './ProductHero';
export { default as LensCard } from './LensCard';
export { default as LensComparisonTable } from './LensComparison';

// Re-export types for convenience
export type {
  ContactLensProduct,
  LensCategory,
  LensBrand,
  LensComparison,
  FittingProcessStep,
  SafetyProtocol,
  LensFAQ,
  TrustBadge,
  ProductHeroProps,
  LensCardProps,
  LensComparisonProps,
  ContactLensesPageProps,
} from '@/types/products';
