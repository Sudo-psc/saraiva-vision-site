/**
 * SEO Types - Next.js 15 Migration
 * Comprehensive type definitions for SEO, metadata, and schema.org markup
 */

import { Metadata } from 'next';

// ============================================================================
// Base SEO Types
// ============================================================================

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  ogType?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  nofollow?: boolean;
  canonicalPath?: string;
  structuredData?: SchemaOrgType | SchemaOrgType[];
}

export interface SEOHeadProps extends SEOConfig {
  // Additional props specific to SEOHead component
  alternateLanguages?: AlternateLanguage[];
}

export interface AlternateLanguage {
  hreflang: string;
  href: string;
}

// ============================================================================
// Open Graph Types
// ============================================================================

export interface OpenGraphConfig {
  title: string;
  description: string;
  url: string;
  siteName: string;
  locale: string;
  type: 'website' | 'article' | 'profile';
  image: OpenGraphImage;
  article?: OpenGraphArticle;
}

export interface OpenGraphImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  type?: string;
}

export interface OpenGraphArticle {
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

// ============================================================================
// Twitter Card Types
// ============================================================================

export interface TwitterCardConfig {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

// ============================================================================
// Schema.org Base Types
// ============================================================================

export type SchemaOrgType =
  | SchemaOrgObject
  | SchemaOrgMedicalClinic
  | SchemaOrgPhysician
  | SchemaOrgFAQPage
  | SchemaOrgBlogPosting
  | SchemaOrgBreadcrumbList
  | SchemaOrgWebSite
  | SchemaOrgOrganization
  | SchemaOrgMedicalWebPage
  | SchemaOrgMedicalProcedure
  | SchemaOrgPodcastSeries
  | SchemaOrgPodcastEpisode;

export interface SchemaOrgObject {
  '@context'?: string;
  '@type': string;
  '@id'?: string;
  [key: string]: unknown;
}

// ============================================================================
// Schema.org Medical Types
// ============================================================================

export interface SchemaOrgMedicalClinic extends SchemaOrgObject {
  '@type': 'MedicalClinic' | 'MedicalBusiness' | ['LocalBusiness', 'MedicalBusiness', 'MedicalClinic'];
  name: string;
  legalName?: string;
  alternateName?: string;
  description: string;
  image: string | string[];
  logo?: SchemaOrgImageObject;
  url: string;
  telephone: string;
  email?: string;
  priceRange?: string;
  taxID?: string;
  foundingDate?: string;
  medicalSpecialty: string | string[];
  address: SchemaOrgPostalAddress;
  geo: SchemaOrgGeoCoordinates;
  openingHoursSpecification: SchemaOrgOpeningHours[];
  areaServed?: SchemaOrgPlace;
  employee?: SchemaOrgPhysician[];
  availableService?: SchemaOrgMedicalProcedure[];
  medicalConditionTreated?: string[];
  aggregateRating?: SchemaOrgAggregateRating;
  sameAs?: string[];
  contactPoint?: SchemaOrgContactPoint[];
  amenityFeature?: SchemaOrgLocationFeature[];
  accreditation?: SchemaOrgOrganization[];
  hasMap?: string;
  potentialAction?: SchemaOrgAction[];
}

export interface SchemaOrgPhysician extends SchemaOrgObject {
  '@type': 'Physician';
  name: string;
  alternateName?: string;
  jobTitle: string;
  description?: string;
  image?: string;
  url?: string;
  medicalSpecialty: string | string[];
  knowsAbout?: string[];
  identifier?: SchemaOrgPropertyValue | SchemaOrgPropertyValue[];
  hasCredential?: SchemaOrgCredential[];
  worksFor?: SchemaOrgOrganization | { '@id': string };
  memberOf?: SchemaOrgOrganization[];
  telephone?: string;
  email?: string;
  contactPoint?: SchemaOrgContactPoint;
  address?: SchemaOrgPostalAddress;
  sameAs?: string[];
}

export interface SchemaOrgMedicalProcedure extends SchemaOrgObject {
  '@type': 'MedicalProcedure';
  name: string;
  description?: string;
  category?: string;
  performer?: SchemaOrgPhysician | { '@id': string };
  location?: SchemaOrgPlace | { '@id': string };
}

export interface SchemaOrgMedicalWebPage extends SchemaOrgObject {
  '@type': 'MedicalWebPage';
  name: string;
  description: string;
  url: string;
  inLanguage: string;
  isPartOf: SchemaOrgWebSite | { '@id': string };
  about?: SchemaOrgObject | { '@id': string };
  audience?: SchemaOrgAudience;
  medicalAudience?: { '@type': 'Patient' };
  lastReviewed?: string;
  reviewedBy?: SchemaOrgPhysician;
}

// ============================================================================
// Schema.org Content Types
// ============================================================================

export interface SchemaOrgBlogPosting extends SchemaOrgObject {
  '@type': 'BlogPosting';
  headline: string;
  description: string;
  image: SchemaOrgImageObject;
  datePublished: string;
  dateModified?: string;
  author: SchemaOrgPerson | SchemaOrgOrganization;
  publisher: SchemaOrgOrganization;
  mainEntityOfPage: { '@type': 'WebPage'; '@id': string };
  articleSection?: string;
  keywords?: string;
  wordCount?: number;
  timeRequired?: string;
  inLanguage?: string;
  isAccessibleForFree?: boolean;
}

export interface SchemaOrgFAQPage extends SchemaOrgObject {
  '@type': 'FAQPage';
  about?: SchemaOrgObject;
  specialty?: string;
  audience?: SchemaOrgAudience;
  inLanguage?: string;
  mainEntity: SchemaOrgQuestion[];
}

export interface SchemaOrgQuestion extends SchemaOrgObject {
  '@type': 'Question';
  name: string;
  acceptedAnswer: SchemaOrgAnswer;
}

export interface SchemaOrgAnswer extends SchemaOrgObject {
  '@type': 'Answer';
  text: string;
  dateCreated?: string;
  author?: SchemaOrgPerson | SchemaOrgPhysician;
}

export interface SchemaOrgBreadcrumbList extends SchemaOrgObject {
  '@type': 'BreadcrumbList';
  itemListElement: SchemaOrgListItem[];
}

export interface SchemaOrgListItem extends SchemaOrgObject {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

export interface SchemaOrgWebSite extends SchemaOrgObject {
  '@type': 'WebSite';
  name: string;
  alternateName?: string;
  description: string;
  url: string;
  inLanguage: string;
  publisher?: SchemaOrgOrganization | { '@id': string };
  potentialAction?: SchemaOrgSearchAction;
}

export interface SchemaOrgOrganization extends SchemaOrgObject {
  '@type': 'Organization';
  name: string;
  legalName?: string;
  url?: string;
  logo?: SchemaOrgImageObject;
  image?: string | string[];
  telephone?: string;
  email?: string;
  address?: SchemaOrgPostalAddress;
  sameAs?: string[];
}

// ============================================================================
// Schema.org Podcast Types
// ============================================================================

export interface SchemaOrgPodcastSeries extends SchemaOrgObject {
  '@type': 'PodcastSeries';
  name: string;
  description: string;
  url: string;
  image?: string;
  author?: SchemaOrgPerson;
  genre?: string;
  inLanguage?: string;
  publisher?: SchemaOrgOrganization;
  webFeed?: string;
  episode?: SchemaOrgPodcastEpisode[];
}

export interface SchemaOrgPodcastEpisode extends SchemaOrgObject {
  '@type': 'PodcastEpisode';
  name: string;
  description: string;
  url: string;
  episodeNumber?: number;
  datePublished?: string;
  duration?: string;
  image?: string;
  audio?: SchemaOrgAudioObject;
  partOfSeries?: { '@id': string };
  keywords?: string;
  genre?: string;
  transcript?: string;
}

// ============================================================================
// Schema.org Supporting Types
// ============================================================================

export interface SchemaOrgPostalAddress extends SchemaOrgObject {
  '@type': 'PostalAddress';
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}

export interface SchemaOrgGeoCoordinates extends SchemaOrgObject {
  '@type': 'GeoCoordinates';
  latitude: number;
  longitude: number;
}

export interface SchemaOrgOpeningHours extends SchemaOrgObject {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
}

export interface SchemaOrgContactPoint extends SchemaOrgObject {
  '@type': 'ContactPoint';
  telephone: string;
  contactType: string;
  contactOption?: string;
  areaServed?: string;
  availableLanguage?: string | string[];
  hoursAvailable?: SchemaOrgOpeningHours;
}

export interface SchemaOrgImageObject extends SchemaOrgObject {
  '@type': 'ImageObject';
  url: string;
  contentUrl?: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface SchemaOrgAudioObject extends SchemaOrgObject {
  '@type': 'AudioObject';
  contentUrl: string;
  encodingFormat?: string;
}

export interface SchemaOrgPerson extends SchemaOrgObject {
  '@type': 'Person';
  name: string;
  jobTitle?: string;
  url?: string;
  sameAs?: string[];
  worksFor?: SchemaOrgOrganization;
}

export interface SchemaOrgPlace extends SchemaOrgObject {
  '@type': 'City' | 'State' | 'Country';
  name: string;
  containedIn?: SchemaOrgPlace;
  containsPlace?: SchemaOrgPlace[];
}

export interface SchemaOrgAggregateRating extends SchemaOrgObject {
  '@type': 'AggregateRating';
  ratingValue: string | number;
  reviewCount: string | number;
  bestRating: string | number;
  worstRating?: string | number;
}

export interface SchemaOrgPropertyValue extends SchemaOrgObject {
  '@type': 'PropertyValue';
  propertyID: string;
  value: string;
}

export interface SchemaOrgCredential extends SchemaOrgObject {
  '@type': 'EducationalOccupationalCredential';
  credentialCategory: string;
  name: string;
  issuedBy?: SchemaOrgOrganization;
}

export interface SchemaOrgLocationFeature extends SchemaOrgObject {
  '@type': 'LocationFeatureSpecification';
  name: string;
  value: boolean;
}

export interface SchemaOrgAudience extends SchemaOrgObject {
  '@type': 'MedicalAudience' | 'PeopleAudience';
  audienceType?: string;
  healthCondition?: string;
}

export interface SchemaOrgAction extends SchemaOrgObject {
  '@type': 'ReserveAction' | 'SearchAction';
  target?: SchemaOrgEntryPoint | { '@type': 'EntryPoint'; urlTemplate: string };
  result?: SchemaOrgObject;
  'query-input'?: string;
}

export interface SchemaOrgEntryPoint extends SchemaOrgObject {
  '@type': 'EntryPoint';
  urlTemplate: string;
  actionPlatform?: string[];
}

export interface SchemaOrgSearchAction extends SchemaOrgObject {
  '@type': 'SearchAction';
  target: SchemaOrgEntryPoint | { '@type': 'EntryPoint'; urlTemplate: string };
  'query-input': string;
}

// ============================================================================
// Schema.org Graph Type
// ============================================================================

export interface SchemaOrgGraph {
  '@context': 'https://schema.org';
  '@graph': SchemaOrgType[];
}

// ============================================================================
// Blog SEO Types
// ============================================================================

export interface BlogSEOProps {
  post: BlogPostSEO;
}

export interface BlogPostSEO {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  updatedAt?: string;
  author?: {
    name?: string;
    title?: string;
  };
  category: string;
  tags?: string[];
  wordCount?: number;
  readTime?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

// ============================================================================
// Schema Markup Component Props
// ============================================================================

export interface SchemaMarkupProps {
  type?: 'clinic' | 'webpage' | 'podcast';
  pageInfo?: PageInfo;
  faqItems?: FAQItem[];
  breadcrumbs?: BreadcrumbItem[];
  data?: Record<string, unknown>;
  additionalSchemas?: SchemaOrgType[];
}

export interface PageInfo {
  title: string;
  description: string;
  url?: string;
  lastReviewed?: string;
  reviewedBy?: {
    name: string;
    crm: string;
  };
}

export interface FAQItem {
  question: string;
  answer: string;
  dateCreated?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

// ============================================================================
// Metadata Generation Types
// ============================================================================

export interface GenerateMetadataParams {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  alternates?: {
    languages?: Record<string, string>;
    canonical?: string;
  };
}

// ============================================================================
// Schema Validation Types
// ============================================================================

export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaValidationError[];
  warnings: SchemaValidationWarning[];
}

export interface SchemaValidationError {
  path: string;
  message: string;
  type: 'required' | 'type' | 'format' | 'constraint';
}

export interface SchemaValidationWarning {
  path: string;
  message: string;
  suggestion?: string;
}

// ============================================================================
// Hreflang Types
// ============================================================================

export interface HreflangTag {
  hreflang: string;
  href: string;
}

export interface HreflangConfig {
  languages: string[];
  defaultLanguage: string;
  currentPath: string;
  baseUrl: string;
}

// ============================================================================
// Medical Compliance Types
// ============================================================================

export interface MedicalMetaTags {
  'geo.region': string;
  'geo.placename': string;
  'geo.position': string;
  ICBM: string;
  'medical-category': string;
  specialty: string;
  'doctor-name': string;
  crm: string;
}

// ============================================================================
// Export utility type for Next.js Metadata
// ============================================================================

export type NextMetadata = Metadata;
