/**
 * Instagram Components - Core Instagram feed components
 * 
 * This module exports the main Instagram feed components for the embedded system:
 * - InstagramFeedContainer: Main container with state management and data fetching
 * - InstagramPost: Individual post display with image optimization and accessibility
 * - InstagramStats: Real-time statistics display with tooltips and trends
 */

export { default as InstagramFeedContainer } from './InstagramFeedContainer';
export { default as InstagramPost } from './InstagramPost';
export { default as InstagramStats } from './InstagramStats';

// Re-export for backward compatibility with existing components
export { default as InstagramFeed } from '../InstagramFeed';
export { default as InstagramPostCard } from '../InstagramPostCard';