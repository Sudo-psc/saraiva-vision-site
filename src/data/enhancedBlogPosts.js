/**
 * Enhanced blog posts with educational content about contact lenses
 * This module injects subscription benefits and care protocols into relevant posts
 */

import { blogPosts } from './blogPosts.js';
import {
  subscriptionBenefitsSection,
  lensCareTips,
  subscriptionCTA,
  complianceFooter,
  emergencyWarning,
  multifocalLensesSubscriptionNote,
  toricLensesSubscriptionNote
} from './lensesEducationalContent.js';

// Enhance specific blog posts with educational content
export const enhancedBlogPosts = blogPosts.map(post => {
  // Post #26: Tipos de Lentes de Contato
  if (post.id === 26) {
    // Find insertion point before "Refer\u00eancias Cient\u00edficas"
    const refIndex = post.content.indexOf('<h3>Refer\u00eancias Cient\u00edficas');

    if (refIndex > -1) {
      const beforeRefs = post.content.substring(0, refIndex);
      const afterRefs = post.content.substring(refIndex);

      post.content = beforeRefs +
        lensCareTips +
        '\n\n' +
        emergencyWarning +
        '\n\n' +
        subscriptionCTA +
        '\n\n' +
        complianceFooter +
        '\n\n' +
        afterRefs;
    }
  }

  // Post #27: Monovis\u00e3o ou Lentes Multifocais
  if (post.id === 27) {
    // Insert multifocal note after introduction
    const firstH2Index = post.content.indexOf('<h2>', post.content.indexOf('<h2>') + 1);

    if (firstH2Index > -1) {
      const beforeSecondH2 = post.content.substring(0, firstH2Index);
      const afterSecondH2 = post.content.substring(firstH2Index);

      post.content = beforeSecondH2 +
        multifocalLensesSubscriptionNote +
        '\n\n' +
        subscriptionBenefitsSection +
        '\n\n' +
        afterSecondH2;
    }

    // Add CTA before conclusion
    const conclusionIndex = post.content.indexOf('<h2>Conclus\u00e3o');
    if (conclusionIndex > -1) {
      const beforeConclusion = post.content.substring(0, conclusionIndex);
      const afterConclusion = post.content.substring(conclusionIndex);

      post.content = beforeConclusion +
        lensCareTips +
        '\n\n' +
        subscriptionCTA +
        '\n\n' +
        complianceFooter +
        '\n\n' +
        afterConclusion;
    }
  }

  return post;
});

export default enhancedBlogPosts;
