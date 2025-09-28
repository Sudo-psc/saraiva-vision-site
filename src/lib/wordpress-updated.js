/**
 * WordPress GraphQL API with enhanced error handling
 * Uses the resilient GraphQL client for SSL/CORS error handling
 */

import { gqlQuery, GraphQLError, GraphQLErrorType } from './graphqlClient.js';
import {
  GET_ALL_POSTS,
  GET_POST_BY_SLUG,
  GET_ALL_PAGES,
  GET_PAGE_BY_SLUG,
  GET_ALL_SERVICES,
  GET_SERVICE_BY_SLUG,
  GET_POPULAR_SERVICES,
  GET_ALL_TEAM_MEMBERS,
  GET_TEAM_MEMBER_BY_SLUG,
  GET_FEATURED_TESTIMONIALS,
  GET_ALL_TESTIMONIALS,
  GET_RECENT_POSTS,
  GET_SITE_SETTINGS,
  GET_NAVIGATION_MENUS,
  GET_POSTS_BY_CATEGORY,
  GET_ALL_CATEGORIES,
} from './wordpress-queries.js';

import {
  sanitizeWordPressContent,
  sanitizeWordPressExcerpt,
  sanitizeWordPressTitle
} from '../utils/sanitizeWordPressContent.js';

/**
 * Execute WordPress GraphQL query with error handling
 */
async function executeWordPressQuery(query, variables = {}) {
  try {
    const result = await gqlQuery(query, variables);
    return { data: result, error: null };
  } catch (error) {
    console.error('WordPress GraphQL error:', error);

    if (error instanceof GraphQLError) {
      return {
        data: null,
        error: {
          type: error.details.type,
          message: error.getUserMessage(),
          technical: error.details.message,
          shouldRetry: !error.isSSLError() && !error.isCORSError()
        }
      };
    }

    return {
      data: null,
      error: {
        type: 'UNKNOWN',
        message: 'Erro ao conectar com o WordPress',
        technical: error.message,
        shouldRetry: true
      }
    };
  }
}

/**
 * Get all posts with pagination
 */
export async function getAllPosts(options = {}) {
  const { first = 10, after = null } = options;
  const variables = { first, after };

  const result = await executeWordPressQuery(GET_ALL_POSTS, variables);

  if (result.error) {
    return result;
  }

  return {
    data: {
      posts: result.data.posts,
      pageInfo: result.data.posts?.pageInfo || null
    },
    error: null
  };
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug) {
  if (!slug) {
    return {
      data: null,
      error: {
        type: 'VALIDATION',
        message: 'Slug do post é obrigatório',
        shouldRetry: false
      }
    };
  }

  const variables = { slug };
  const result = await executeWordPressQuery(GET_POST_BY_SLUG, variables);

  if (result.error) {
    return result;
  }

  return {
    data: {
      post: result.data.postBySlug
    },
    error: null
  };
}

/**
 * Get all pages
 */
export async function getAllPages() {
  const result = await executeWordPressQuery(GET_ALL_PAGES);

  if (result.error) {
    return result;
  }

  return {
    data: {
      pages: result.data.pages
    },
    error: null
  };
}

/**
 * Get a single page by slug
 */
export async function getPageBySlug(slug) {
  if (!slug) {
    return {
      data: null,
      error: {
        type: 'VALIDATION',
        message: 'Slug da página é obrigatório',
        shouldRetry: false
      }
    };
  }

  const variables = { slug };
  const result = await executeWordPressQuery(GET_PAGE_BY_SLUG, variables);

  if (result.error) {
    return result;
  }

  return {
    data: {
      page: result.data.pageBySlug
    },
    error: null
  };
}

/**
 * Get all services
 */
export async function getAllServices() {
  const result = await executeWordPressQuery(GET_ALL_SERVICES);

  if (result.error) {
    return result;
  }

  return {
    data: {
      services: result.data.services
    },
    error: null
  };
}

/**
 * Get a single service by slug
 */
export async function getServiceBySlug(slug) {
  if (!slug) {
    return {
      data: null,
      error: {
        type: 'VALIDATION',
        message: 'Slug do serviço é obrigatório',
        shouldRetry: false
      }
    };
  }

  const variables = { slug };
  const result = await executeWordPressQuery(GET_SERVICE_BY_SLUG, variables);

  if (result.error) {
    return result;
  }

  return {
    data: {
      service: result.data.serviceBySlug
    },
    error: null
  };
}

/**
 * Get popular services
 */
export async function getPopularServices(count = 6) {
  const variables = { first: count };
  const result = await executeWordPressQuery(GET_POPULAR_SERVICES, variables);

  if (result.error) {
    return result;
  }

  return {
    data: {
      services: result.data.popularServices
    },
    error: null
  };
}

/**
 * Get all team members
 */
export async function getAllTeamMembers() {
  const result = await executeWordPressQuery(GET_ALL_TEAM_MEMBERS);

  if (result.error) {
    return result;
  }

  return {
    data: {
      teamMembers: result.data.teamMembers
    },
    error: null
  };
}

/**
 * Get a single team member by slug
 */
export async function getTeamMemberBySlug(slug) {
  if (!slug) {
    return {
      data: null,
      error: {
        type: 'VALIDATION',
        message: 'Slug do membro é obrigatório',
        shouldRetry: false
      }
    };
  }

  const variables = { slug };
  const result = await executeWordPressQuery(GET_TEAM_MEMBER_BY_SLUG, variables);

  if (result.error) {
    return result;
  }

  return {
    data: {
      teamMember: result.data.teamMemberBySlug
    },
    error: null
  };
}

/**
 * Get featured testimonials
 */
export async function getFeaturedTestimonials(count = 6) {
  const variables = { first: count };
  const result = await executeWordPressQuery(GET_FEATURED_TESTIMONIALS, variables);

  if (result.error) {
    return result;
  }

  return {
    data: {
      testimonials: result.data.featuredTestimonials
    },
    error: null
  };
}

/**
 * Get all testimonials
 */
export async function getAllTestimonials() {
  const result = await executeWordPressQuery(GET_ALL_TESTIMONIALS);

  if (result.error) {
    return result;
  }

  return {
    data: {
      testimonials: result.data.testimonials
    },
    error: null
  };
}

/**
 * Get recent posts
 */
export async function getRecentPosts(count = 3) {
  const variables = { first: count };
  const result = await executeWordPressQuery(GET_RECENT_POSTS, variables);

  if (result.error) {
    return result;
  }

  return {
    data: {
      posts: result.data.recentPosts
    },
    error: null
  };
}

/**
 * Get site settings
 */
export async function getSiteSettings() {
  const result = await executeWordPressQuery(GET_SITE_SETTINGS);

  if (result.error) {
    return result;
  }

  return {
    data: {
      siteSettings: result.data.siteSettings
    },
    error: null
  };
}

/**
 * Get navigation menus
 */
export async function getNavigationMenus() {
  const result = await executeWordPressQuery(GET_NAVIGATION_MENUS);

  if (result.error) {
    return result;
  }

  return {
    data: {
      menus: result.data.menus
    },
    error: null
  };
}

/**
 * Get posts by category
 */
export async function getPostsByCategory(categorySlug, options = {}) {
  if (!categorySlug) {
    return {
      data: null,
      error: {
        type: 'VALIDATION',
        message: 'Slug da categoria é obrigatório',
        shouldRetry: false
      }
    };
  }

  const { first = 12 } = options;
  const variables = { categorySlug, first };
  const result = await executeWordPressQuery(GET_POSTS_BY_CATEGORY, variables);

  if (result.error) {
    return result;
  }

  return {
    data: {
      posts: result.data.postsByCategory
    },
    error: null
  };
}

/**
 * Get all categories
 */
export async function getAllCategories() {
  const result = await executeWordPressQuery(GET_ALL_CATEGORIES);

  if (result.error) {
    return result;
  }

  return {
    data: {
      categories: result.data.categories
    },
    error: null
  };
}

/**
 * Health check for WordPress connection
 */
export async function checkWordPressHealth() {
  try {
    const result = await gqlQuery('{ __typename }', {}, { retries: 1 });
    return {
      healthy: !!result.__typename,
      error: null
    };
  } catch (error) {
    console.error('WordPress health check failed:', error);

    if (error instanceof GraphQLError) {
      return {
        healthy: false,
        error: {
          type: error.details.type,
          message: error.getUserMessage(),
          technical: error.details.message
        }
      };
    }

    return {
      healthy: false,
      error: {
        type: 'UNKNOWN',
        message: 'Erro ao verificar saúde do WordPress',
        technical: error.message
      }
    };
  }
}