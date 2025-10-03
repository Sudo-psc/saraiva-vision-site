/**
 * Product Type Definitions
 * Saraiva Vision - Contact Lenses & Medical Products
 */

import { LucideIcon } from 'lucide-react';

/**
 * Contact Lens Types
 */
export type LensType = 'soft' | 'rigid' | 'multifocal' | 'toric' | 'colored' | 'daily' | 'monthly';

/**
 * Lens Material Categories
 */
export type LensMaterial = 'hydrogel' | 'silicone-hydrogel' | 'rgp' | 'hybrid';

/**
 * Replacement Schedule
 */
export type ReplacementSchedule = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Usage Purpose
 */
export type LensPurpose = 'vision-correction' | 'astigmatism' | 'presbyopia' | 'cosmetic' | 'therapeutic';

/**
 * Individual Contact Lens Product
 */
export interface ContactLensProduct {
  id: string;
  name: string;
  brand: string;
  type: LensType;
  material: LensMaterial;
  replacementSchedule: ReplacementSchedule;
  purposes: LensPurpose[];
  waterContent: number; // percentage
  oxygenPermeability: number; // Dk/t value
  uvProtection: boolean;
  description: string;
  features: string[];
  benefits: string[];
  idealFor: string[];
  contraindications?: string[];
  price?: {
    value: number;
    currency: string;
    unit: string; // e.g., "per box", "per lens"
  };
  images: {
    main: string;
    gallery?: string[];
    thumbnail?: string;
  };
  available: boolean;
  prescriptionRequired: boolean;
  metadata?: {
    manufacturer?: string;
    country?: string;
    fda_approved?: boolean;
    anvisa_approved?: boolean;
  };
}

/**
 * Contact Lens Category
 */
export interface LensCategory {
  type: LensType;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  color: string; // Tailwind color classes
  features: string[];
  products: ContactLensProduct[];
  popular?: boolean;
}

/**
 * Brand Information
 */
export interface LensBrand {
  name: string;
  logo?: string;
  description: string;
  image: string;
  features: string[];
  specialty: string;
  country: string;
  website?: string;
  certifications?: string[];
}

/**
 * Lens Comparison Data
 */
export interface LensComparison {
  productId: string;
  name: string;
  brand: string;
  type: LensType;
  price?: string;
  replacementSchedule: ReplacementSchedule;
  waterContent: number;
  oxygenPermeability: number;
  uvProtection: boolean;
  features: string[];
  rating?: number;
  bestFor: string[];
}

/**
 * Lens Fitting Process Step
 */
export interface FittingProcessStep {
  step: number;
  title: string;
  description: string;
  duration?: string;
  icon?: LucideIcon;
}

/**
 * Safety Protocol Item
 */
export interface SafetyProtocol {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  required: boolean;
}

/**
 * FAQ Item for Contact Lenses
 */
export interface LensFAQ {
  id: string;
  question: string;
  answer: string;
  category: 'care' | 'fitting' | 'usage' | 'safety' | 'cost' | 'general';
}

/**
 * Trust Badge
 */
export interface TrustBadge {
  key: string;
  value: string;
  icon: LucideIcon;
  description?: string;
}

/**
 * Product Showcase Section Props
 */
export interface ProductShowcaseProps {
  title: string;
  subtitle?: string;
  categories: LensCategory[];
  brands?: LensBrand[];
  comparisonEnabled?: boolean;
  ctaText?: string;
  ctaLink?: string;
  showPricing?: boolean;
}

/**
 * Lens Card Component Props
 */
export interface LensCardProps {
  product: ContactLensProduct;
  variant?: 'compact' | 'standard' | 'detailed';
  showPrice?: boolean;
  showCTA?: boolean;
  onSelect?: (product: ContactLensProduct) => void;
  className?: string;
}

/**
 * Lens Comparison Component Props
 */
export interface LensComparisonProps {
  products: LensComparison[];
  maxProducts?: number;
  enableSelection?: boolean;
  onCompare?: (products: LensComparison[]) => void;
  className?: string;
}

/**
 * Product Hero Component Props
 */
export interface ProductHeroProps {
  title: string;
  subtitle: string;
  badge?: string;
  image?: string;
  ctaPrimary?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  ctaSecondary?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  trustBadges?: TrustBadge[];
  className?: string;
}

/**
 * Contact Lenses Page Props
 */
export interface ContactLensesPageProps {
  categories: LensCategory[];
  brands: LensBrand[];
  fittingProcess: FittingProcessStep[];
  safetyProtocols: SafetyProtocol[];
  faqs: LensFAQ[];
  trustBadges: TrustBadge[];
}

/**
 * Filter Options for Product Catalog
 */
export interface LensFilterOptions {
  types?: LensType[];
  materials?: LensMaterial[];
  replacementSchedules?: ReplacementSchedule[];
  purposes?: LensPurpose[];
  brands?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  uvProtection?: boolean;
  availableOnly?: boolean;
}

/**
 * Sort Options
 */
export type LensSortOption = 'popular' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest';

/**
 * Product Catalog State
 */
export interface ProductCatalogState {
  products: ContactLensProduct[];
  filteredProducts: ContactLensProduct[];
  filters: LensFilterOptions;
  sortBy: LensSortOption;
  isLoading: boolean;
  error?: string;
}
