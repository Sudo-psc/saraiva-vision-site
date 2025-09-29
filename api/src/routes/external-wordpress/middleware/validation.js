// Request Validation Middleware for External WordPress Integration
// JSON Schema validation and API contract enforcement

import { createErrorResponse } from '../utils/error-handler.js';
import { logger } from '../utils/logger.js';

// JSON Schema definitions for different request types
const schemas = {
  // Source management schemas
  createSource: {
    type: 'object',
    required: ['name', 'base_url'],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        pattern: '^[a-zA-Z0-9\\s\\-_]+$'
      },
      base_url: {
        type: 'string',
        format: 'uri',
        pattern: '^https?://[^/]+/?$'
      },
      api_key: {
        type: 'string',
        minLength: 16,
        maxLength: 255
      },
      sync_frequency: {
        type: 'string',
        pattern: '^\\d+\\s+(seconds?|minutes?|hours?|days?)$',
        default: '5 minutes'
      },
      cache_ttl: {
        type: 'integer',
        minimum: 60,
        maximum: 86400,
        default: 300
      },
      enable_webhooks: {
        type: 'boolean',
        default: false
      },
      enable_ssl_verification: {
        type: 'boolean',
        default: true
      },
      enable_compliance_filter: {
        type: 'boolean',
        default: true
      },
      wordpress_version: {
        type: 'string',
        pattern: '^\\d+\\.\\d+(\\.\\d+)?$'
      },
      rest_api_version: {
        type: 'string',
        enum: ['v1', 'v2'],
        default: 'v2'
      },
      supported_post_types: {
        type: 'array',
        items: {
          type: 'string'
        },
        default: ['post', 'page']
      },
      supported_taxonomies: {
        type: 'array',
        items: {
          type: 'string'
        },
        default: ['category', 'tag']
      },
      health_check_url: {
        type: 'string',
        format: 'uri'
      },
      health_check_interval: {
        type: 'integer',
        minimum: 60,
        maximum: 3600,
        default: 300
      },
      webhook_secret: {
        type: 'string',
        minLength: 16,
        maxLength: 255
      },
      rate_limit_requests: {
        type: 'integer',
        minimum: 10,
        maximum: 10000,
        default: 1000
      },
      rate_limit_window: {
        type: 'integer',
        minimum: 60,
        maximum: 86400,
        default: 3600
      }
    },
    additionalProperties: false
  },

  updateSource: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        pattern: '^[a-zA-Z0-9\\s\\-_]+$'
      },
      base_url: {
        type: 'string',
        format: 'uri',
        pattern: '^https?://[^/]+/?$'
      },
      api_key: {
        type: 'string',
        minLength: 16,
        maxLength: 255
      },
      status: {
        type: 'string',
        enum: ['active', 'inactive', 'error']
      },
      sync_frequency: {
        type: 'string',
        pattern: '^\\d+\\s+(seconds?|minutes?|hours?|days?)$'
      },
      cache_ttl: {
        type: 'integer',
        minimum: 60,
        maximum: 86400
      },
      enable_webhooks: {
        type: 'boolean'
      },
      enable_ssl_verification: {
        type: 'boolean'
      },
      enable_compliance_filter: {
        type: 'boolean'
      },
      wordpress_version: {
        type: 'string',
        pattern: '^\\d+\\.\\d+(\\.\\d+)?$'
      },
      rest_api_version: {
        type: 'string',
        enum: ['v1', 'v2']
      },
      supported_post_types: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      supported_taxonomies: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      health_check_url: {
        type: 'string',
        format: 'uri'
      },
      health_check_interval: {
        type: 'integer',
        minimum: 60,
        maximum: 3600
      },
      webhook_secret: {
        type: 'string',
        minLength: 16,
        maxLength: 255
      },
      rate_limit_requests: {
        type: 'integer',
        minimum: 10,
        maximum: 10000
      },
      rate_limit_window: {
        type: 'integer',
        minimum: 60,
        maximum: 86400
      }
    },
    additionalProperties: false,
    minProperties: 1
  },

  // Content query schemas
  listPosts: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        default: 1
      },
      per_page: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 10
      },
      status: {
        type: 'string',
        enum: ['publish', 'draft', 'pending', 'private', 'any'],
        default: 'publish'
      },
      search: {
        type: 'string',
        minLength: 1,
        maxLength: 100
      },
      categories: {
        type: 'array',
        items: {
          type: 'integer'
        }
      },
      tags: {
        type: 'array',
        items: {
          type: 'integer'
        }
      },
      author: {
        type: 'integer'
      },
      order: {
        type: 'string',
        enum: ['asc', 'desc'],
        default: 'desc'
      },
      orderby: {
        type: 'string',
        enum: ['date', 'relevance', 'id', 'title', 'slug', 'modified'],
        default: 'date'
      },
      after: {
        type: 'string',
        format: 'date-time'
      },
      before: {
        type: 'string',
        format: 'date-time'
      },
      include: {
        type: 'array',
        items: {
          type: 'integer'
        }
      },
      exclude: {
        type: 'array',
        items: {
          type: 'integer'
        }
      },
      sticky: {
        type: 'boolean'
      },
      fields: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    },
    additionalProperties: false
  },

  getPost: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        minimum: 1
      },
      fields: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      include: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['author', 'comments', 'categories', 'tags', 'excerpt', 'featured_media', 'replies']
        }
      }
    },
    required: ['id'],
    additionalProperties: false
  },

  getPostBySlug: {
    type: 'object',
    properties: {
      slug: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
        pattern: '^[a-z0-9-]+$'
      },
      fields: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      include: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['author', 'comments', 'categories', 'tags', 'excerpt', 'featured_media', 'replies']
        }
      }
    },
    required: ['slug'],
    additionalProperties: false
  },

  // Page schemas
  listPages: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        default: 1
      },
      per_page: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 10
      },
      search: {
        type: 'string',
        minLength: 1,
        maxLength: 100
      },
      status: {
        type: 'string',
        enum: ['publish', 'draft', 'pending', 'private', 'any'],
        default: 'publish'
      },
      author: {
        type: 'integer'
      },
      order: {
        type: 'string',
        enum: ['asc', 'desc'],
        default: 'asc'
      },
      orderby: {
        type: 'string',
        enum: ['date', 'relevance', 'id', 'title', 'slug', 'modified', 'menu_order'],
        default: 'menu_order'
      },
      parent: {
        type: 'integer'
      },
      include: {
        type: 'array',
        items: {
          type: 'integer'
        }
      },
      exclude: {
        type: 'array',
        items: {
          type: 'integer'
        }
      },
      fields: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    },
    additionalProperties: false
  },

  getPage: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        minimum: 1
      },
      fields: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      include: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['author', 'comments', 'excerpt', 'featured_media', 'replies']
        }
      }
    },
    required: ['id'],
    additionalProperties: false
  },

  // Media schemas
  listMedia: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        default: 1
      },
      per_page: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 10
      },
      search: {
        type: 'string',
        minLength: 1,
        maxLength: 100
      },
      status: {
        type: 'string',
        enum: ['publish', 'draft', 'pending', 'private', 'any'],
        default: 'inherit'
      },
      author: {
        type: 'integer'
      },
      order: {
        type: 'string',
        enum: ['asc', 'desc'],
        default: 'desc'
      },
      orderby: {
        type: 'string',
        enum: ['date', 'relevance', 'id', 'title', 'slug', 'modified'],
        default: 'date'
      },
      parent: {
        type: 'integer'
      },
      include: {
        type: 'array',
        items: {
          type: 'integer'
        }
      },
      exclude: {
        type: 'array',
        items: {
          type: 'integer'
        }
      },
      fields: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      media_type: {
        type: 'string',
        enum: ['image', 'video', 'audio', 'application', 'text']
      },
      mime_type: {
        type: 'string',
        pattern: '^[a-zA-Z]+/[a-zA-Z0-9\\-+.]+$'
      }
    },
    additionalProperties: false
  },

  getMedia: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        minimum: 1
      },
      fields: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      include: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['author', 'excerpt']
        }
      }
    },
    required: ['id'],
    additionalProperties: false
  },

  proxyMedia: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        minimum: 1
      },
      size: {
        type: 'string',
        enum: ['thumbnail', 'medium', 'large', 'full'],
        default: 'full'
      },
      format: {
        type: 'string',
        enum: ['jpg', 'png', 'webp', 'gif'],
        default: 'jpg'
      },
      quality: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 80
      }
    },
    required: ['id'],
    additionalProperties: false
  },

  // Taxonomy schemas
  listCategories: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        default: 1
      },
      per_page: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 10
      },
      search: {
        type: 'string',
        minLength: 1,
        maxLength: 100
      },
      hide_empty: {
        type: 'boolean',
        default: false
      },
      parent: {
        type: 'integer'
      },
      order: {
        type: 'string',
        enum: ['asc', 'desc'],
        default: 'asc'
      },
      orderby: {
        type: 'string',
        enum: ['id', 'count', 'name', 'slug'],
        default: 'name'
      },
      include: {
        type: 'array',
        items: {
          type: 'integer'
        }
      },
      exclude: {
        type: 'array',
        items: {
          type: 'integer'
        }
      },
      fields: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    },
    additionalProperties: false
  },

  getCategory: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        minimum: 1
      },
      fields: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      include: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['count']
        }
      }
    },
    required: ['id'],
    additionalProperties: false
  },

  listTags: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        default: 1
      },
      per_page: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 10
      },
      search: {
        type: 'string',
        minLength: 1,
        maxLength: 100
      },
      hide_empty: {
        type: 'boolean',
        default: false
      },
      order: {
        type: 'string',
        enum: ['asc', 'desc'],
        default: 'asc'
      },
      orderby: {
        type: 'string',
        enum: ['id', 'count', 'name', 'slug'],
        default: 'name'
      },
      include: {
        type: 'array',
        items: {
          type: 'integer'
        }
      },
      exclude: {
        type: 'array',
        items: {
          type: 'integer'
        }
      },
      fields: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    },
    additionalProperties: false
  },

  getTag: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        minimum: 1
      },
      fields: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      include: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['count']
        }
      }
    },
    required: ['id'],
    additionalProperties: false
  },

  // Synchronization schemas
  triggerSync: {
    type: 'object',
    properties: {
      sync_type: {
        type: 'string',
        enum: ['full', 'posts', 'pages', 'media', 'categories', 'tags'],
        default: 'full'
      },
      force_refresh: {
        type: 'boolean',
        default: false
      },
      include_drafts: {
        type: 'boolean',
        default: false
      },
      max_items: {
        type: 'integer',
        minimum: 1,
        maximum: 1000,
        default: 100
      },
      webhook_secret: {
        type: 'string',
        minLength: 16,
        maxLength: 255
      }
    },
    additionalProperties: false
  },

  syncPosts: {
    type: 'object',
    properties: {
      post_ids: {
        type: 'array',
        items: {
          type: 'integer'
        }
      },
      force_refresh: {
        type: 'boolean',
        default: false
      },
      include_drafts: {
        type: 'boolean',
        default: false
      },
      webhook_secret: {
        type: 'string',
        minLength: 16,
        maxLength: 255
      }
    },
    additionalProperties: false,
    minProperties: 1
  },

  syncMedia: {
    type: 'object',
    properties: {
      media_ids: {
        type: 'array',
        items: {
          type: 'integer'
        }
      },
      force_refresh: {
        type: 'boolean',
        default: false
      },
      optimize_images: {
        type: 'boolean',
        default: true
      },
      webhook_secret: {
        type: 'string',
        minLength: 16,
        maxLength: 255
      }
    },
    additionalProperties: false,
    minProperties: 1
  },

  // Search schemas
  searchContent: {
    type: 'object',
    properties: {
      q: {
        type: 'string',
        minLength: 1,
        maxLength: 200
      },
      content_type: {
        type: 'string',
        enum: ['posts', 'pages', 'media', 'all'],
        default: 'all'
      },
      page: {
        type: 'integer',
        minimum: 1,
        default: 1
      },
      per_page: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 10
      },
      status: {
        type: 'string',
        enum: ['publish', 'draft', 'pending', 'private', 'any'],
        default: 'publish'
      },
      categories: {
        type: 'array',
        items: {
          type: 'integer'
        }
      },
      tags: {
        type: 'array',
        items: {
          type: 'integer'
        }
      },
      author: {
        type: 'integer'
      },
      date_from: {
        type: 'string',
        format: 'date-time'
      },
      date_to: {
        type: 'string',
        format: 'date-time'
      },
      exact_match: {
        type: 'boolean',
        default: false
      }
    },
    required: ['q'],
    additionalProperties: false
  },

  // Aggregation schemas
  getAggregatedContent: {
    type: 'object',
    properties: {
      source_ids: {
        type: 'array',
        items: {
          type: 'integer'
        }
      },
      content_types: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['posts', 'pages', 'media']
        },
        default: ['posts']
      },
      max_per_source: {
        type: 'integer',
        minimum: 1,
        maximum: 50,
        default: 10
      },
      status: {
        type: 'string',
        enum: ['publish', 'draft', 'pending', 'private'],
        default: 'publish'
      },
      include_fields: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      exclude_fields: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      group_by: {
        type: 'string',
        enum: ['source', 'date', 'type'],
        default: 'source'
      }
    },
    additionalProperties: false
  },

  getUnifiedContent: {
    type: 'object',
    properties: {
      search_query: {
        type: 'string',
        minLength: 1,
        maxLength: 200
      },
      source_ids: {
        type: 'array',
        items: {
          type: 'integer'
        }
      },
      content_types: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['posts', 'pages', 'media']
        },
        default: ['posts']
      },
      max_results: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 20
      },
      status: {
        type: 'string',
        enum: ['publish', 'draft', 'pending', 'private'],
        default: 'publish'
      },
      date_from: {
        type: 'string',
        format: 'date-time'
      },
      date_to: {
        type: 'string',
        format: 'date-time'
      },
      include_fields: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    },
    required: ['search_query'],
    additionalProperties: false
  }
};

// Custom validation error class
class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

/**
 * Validate data against JSON schema
 * @param {Object} data - Data to validate
 * @param {Object} schema - JSON schema to validate against
 * @returns {Object} Validation result
 */
const validateSchema = (data, schema) => {
  const errors = [];

  // Check required properties
  if (schema.required) {
    for (const prop of schema.required) {
      if (data[prop] === undefined || data[prop] === null) {
        errors.push({
          property: prop,
          message: `Required property '${prop}' is missing`
        });
      }
    }
  }

  // Check each property in data
  for (const [prop, value] of Object.entries(data)) {
    // Check if property is allowed
    if (schema.additionalProperties === false && !schema.properties[prop]) {
      errors.push({
        property: prop,
        message: `Property '${prop}' is not allowed`
      });
      continue;
    }

    const propSchema = schema.properties[prop];
    if (!propSchema) continue;

    // Validate type
    if (propSchema.type && !validateType(value, propSchema.type)) {
      errors.push({
        property: prop,
        message: `Property '${prop}' must be of type ${Array.isArray(propSchema.type) ? propSchema.type.join(' or ') : propSchema.type}`
      });
    }

    // Validate format
    if (propSchema.format && !validateFormat(value, propSchema.format)) {
      errors.push({
        property: prop,
        message: `Property '${prop}' must match format ${propSchema.format}`
      });
    }

    // Validate pattern
    if (propSchema.pattern && typeof value === 'string' && !new RegExp(propSchema.pattern).test(value)) {
      errors.push({
        property: prop,
        message: `Property '${prop}' must match pattern ${propSchema.pattern}`
      });
    }

    // Validate minimum/maximum for numbers
    if (typeof value === 'number') {
      if (propSchema.minimum !== undefined && value < propSchema.minimum) {
        errors.push({
          property: prop,
          message: `Property '${prop}' must be at least ${propSchema.minimum}`
        });
      }
      if (propSchema.maximum !== undefined && value > propSchema.maximum) {
        errors.push({
          property: prop,
          message: `Property '${prop}' must be at most ${propSchema.maximum}`
        });
      }
    }

    // Validate minLength/maxLength for strings
    if (typeof value === 'string') {
      if (propSchema.minLength !== undefined && value.length < propSchema.minLength) {
        errors.push({
          property: prop,
          message: `Property '${prop}' must be at least ${propSchema.minLength} characters long`
        });
      }
      if (propSchema.maxLength !== undefined && value.length > propSchema.maxLength) {
        errors.push({
          property: prop,
          message: `Property '${prop}' must be at most ${propSchema.maxLength} characters long`
        });
      }
    }

    // Validate minimumItems/maximumItems for arrays
    if (Array.isArray(value)) {
      if (propSchema.minItems !== undefined && value.length < propSchema.minItems) {
        errors.push({
          property: prop,
          message: `Property '${prop}' must have at least ${propSchema.minItems} items`
        });
      }
      if (propSchema.maxItems !== undefined && value.length > propSchema.maxItems) {
        errors.push({
          property: prop,
          message: `Property '${prop}' must have at most ${propSchema.maxItems} items`
        });
      }

      // Validate array items
      if (propSchema.items && value.length > 0) {
        for (let i = 0; i < Math.min(5, value.length); i++) { // Validate first 5 items for performance
          const itemErrors = validateSchema(value[i], propSchema.items);
          if (itemErrors.length > 0) {
            errors.push({
              property: `${prop}[${i}]`,
              message: `Array item at index ${i} is invalid: ${itemErrors[0].message}`
            });
          }
        }
      }
    }

    // Validate enum values
    if (propSchema.enum && !propSchema.enum.includes(value)) {
      errors.push({
        property: prop,
        message: `Property '${prop}' must be one of: ${propSchema.enum.join(', ')}`
      });
    }

    // Validate default value
    if (value === undefined && propSchema.default !== undefined) {
      data[prop] = propSchema.default;
    }
  }

  // Check minimum properties
  if (schema.minProperties !== undefined && Object.keys(data).length < schema.minProperties) {
    errors.push({
      message: `Object must have at least ${schema.minProperties} properties`
    });
  }

  return errors;
};

/**
 * Validate type
 * @param {*} value - Value to validate
 * @param {string|Array} type - Expected type(s)
 * @returns {boolean} Whether value is valid type
 */
const validateType = (value, type) => {
  if (Array.isArray(type)) {
    return type.some(t => validateType(value, t));
  }

  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'integer':
      return Number.isInteger(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    case 'null':
      return value === null;
    default:
      return false;
  }
};

/**
 * Validate format
 * @param {string} value - Value to validate
 * @param {string} format - Expected format
 * @returns {boolean} Whether value matches format
 */
const validateFormat = (value, format) => {
  if (typeof value !== 'string') return false;

  switch (format) {
    case 'uri':
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    case 'date-time':
      return !isNaN(Date.parse(value));
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    default:
      return true;
  }
};

/**
 * Request validation middleware factory
 * @param {string} schemaName - Name of schema to validate against
 * @returns {Function} Express middleware
 */
export const validateRequest = (schemaName) => {
  const schema = schemas[schemaName];

  if (!schema) {
    throw new Error(`Schema '${schemaName}' not found`);
  }

  return (req, res, next) => {
    try {
      // Validate request body
      const errors = validateSchema(req.body, schema);

      if (errors.length > 0) {
        logger.warn('Request validation failed', {
          path: req.path,
          method: req.method,
          schema: schemaName,
          errors: errors.map(e => ({
            property: e.property,
            message: e.message
          })),
          body: req.body,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(400).json(createErrorResponse(
          'VALIDATION_ERROR',
          'Request validation failed',
          {
            schema: schemaName,
            errors: errors,
            timestamp: new Date().toISOString()
          }
        ));
      }

      // Apply defaults to request body
      for (const [prop, propSchema] of Object.entries(schema.properties)) {
        if (req.body[prop] === undefined && propSchema.default !== undefined) {
          req.body[prop] = propSchema.default;
        }
      }

      logger.debug('Request validation passed', {
        path: req.path,
        method: req.method,
        schema: schemaName,
        ip: req.ip
      });

      next();
    } catch (error) {
      logger.error('Request validation middleware error', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        schema: schemaName,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      res.status(500).json(createErrorResponse(
        'INTERNAL_ERROR',
        'Request validation failed',
        process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
      ));
    }
  };
};

/**
 * Validate query parameters
 * @param {string} schemaName - Name of schema to validate against
 * @returns {Function} Express middleware
 */
export const validateQuery = (schemaName) => {
  const schema = schemas[schemaName];

  if (!schema) {
    throw new Error(`Schema '${schemaName}' not found`);
  }

  return (req, res, next) => {
    try {
      // Validate query parameters
      const errors = validateSchema(req.query, schema);

      if (errors.length > 0) {
        logger.warn('Query validation failed', {
          path: req.path,
          method: req.method,
          schema: schemaName,
          errors: errors.map(e => ({
            property: e.property,
            message: e.message
          })),
          query: req.query,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(400).json(createErrorResponse(
          'VALIDATION_ERROR',
          'Query validation failed',
          {
            schema: schemaName,
            errors: errors,
            timestamp: new Date().toISOString()
          }
        ));
      }

      // Apply defaults to query parameters
      for (const [prop, propSchema] of Object.entries(schema.properties)) {
        if (req.query[prop] === undefined && propSchema.default !== undefined) {
          req.query[prop] = propSchema.default;
        }
      }

      logger.debug('Query validation passed', {
        path: req.path,
        method: req.method,
        schema: schemaName,
        ip: req.ip
      });

      next();
    } catch (error) {
      logger.error('Query validation middleware error', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        schema: schemaName,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      res.status(500).json(createErrorResponse(
        'INTERNAL_ERROR',
        'Query validation failed',
        process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
      ));
    }
  };
};

/**
 * Validate path parameters
 * @param {string} schemaName - Name of schema to validate against
 * @returns {Function} Express middleware
 */
export const validateParams = (schemaName) => {
  const schema = schemas[schemaName];

  if (!schema) {
    throw new Error(`Schema '${schemaName}' not found`);
  }

  return (req, res, next) => {
    try {
      // Validate path parameters
      const errors = validateSchema(req.params, schema);

      if (errors.length > 0) {
        logger.warn('Path parameter validation failed', {
          path: req.path,
          method: req.method,
          schema: schemaName,
          errors: errors.map(e => ({
            property: e.property,
            message: e.message
          })),
          params: req.params,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(400).json(createErrorResponse(
          'VALIDATION_ERROR',
          'Path parameter validation failed',
          {
            schema: schemaName,
            errors: errors,
            timestamp: new Date().toISOString()
          }
        ));
      }

      logger.debug('Path parameter validation passed', {
        path: req.path,
        method: req.method,
        schema: schemaName,
        ip: req.ip
      });

      next();
    } catch (error) {
      logger.error('Path parameter validation middleware error', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        schema: schemaName,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      res.status(500).json(createErrorResponse(
        'INTERNAL_ERROR',
        'Path parameter validation failed',
        process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
      ));
    }
  };
};

/**
 * Validate source ID parameter
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export const validateSourceId = (req, res, next) => {
  const sourceId = parseInt(req.params.sourceId);

  if (isNaN(sourceId) || sourceId < 1) {
    logger.warn('Invalid source ID', {
      sourceId: req.params.sourceId,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.status(400).json(createErrorResponse(
      'VALIDATION_ERROR',
      'Invalid source ID. Must be a positive integer.',
      {
        sourceId: req.params.sourceId,
        timestamp: new Date().toISOString()
      }
    ));
  }

  // Add validated source ID to request
  req.sourceId = sourceId;

  next();
};

/**
 * Validate pagination parameters
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.per_page) || 10;

  if (isNaN(page) || page < 1) {
    return res.status(400).json(createErrorResponse(
      'VALIDATION_ERROR',
      'Page must be a positive integer.',
      {
        page: req.query.page,
        timestamp: new Date().toISOString()
      }
    ));
  }

  if (isNaN(perPage) || perPage < 1 || perPage > 100) {
    return res.status(400).json(createErrorResponse(
      'VALIDATION_ERROR',
      'Per page must be between 1 and 100.',
      {
        per_page: req.query.per_page,
        timestamp: new Date().toISOString()
      }
    ));
  }

  // Add validated pagination to request
  req.pagination = {
    page,
    perPage,
    offset: (page - 1) * perPage
  };

  next();
};

/**
 * Validate date range parameters
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export const validateDateRange = (req, res, next) => {
  const { date_from, date_to } = req.query;

  if (date_from) {
    const fromDate = new Date(date_from);
    if (isNaN(fromDate.getTime())) {
      return res.status(400).json(createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid date_from format. Must be ISO 8601 date-time.',
        {
          date_from,
          timestamp: new Date().toISOString()
        }
      ));
    }
  }

  if (date_to) {
    const toDate = new Date(date_to);
    if (isNaN(toDate.getTime())) {
      return res.status(400).json(createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid date_to format. Must be ISO 8601 date-time.',
        {
          date_to,
          timestamp: new Date().toISOString()
        }
      ));
    }
  }

  if (date_from && date_to) {
    const fromDate = new Date(date_from);
    const toDate = new Date(date_to);

    if (fromDate > toDate) {
      return res.status(400).json(createErrorResponse(
        'VALIDATION_ERROR',
        'date_from must be before date_to.',
        {
          date_from,
          date_to,
          timestamp: new Date().toISOString()
        }
      ));
    }
  }

  next();
};

/**
 * Validate webhook signature
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export const validateWebhookSignature = (req, res, next) => {
  const signature = req.get('X-Webhook-Signature');
  const timestamp = req.get('X-Webhook-Timestamp');

  if (!signature || !timestamp) {
    return res.status(400).json(createErrorResponse(
      'VALIDATION_ERROR',
      'Webhook signature and timestamp are required.',
      {
        timestamp: new Date().toISOString()
      }
    ));
  }

  // Check if timestamp is recent (within 5 minutes)
  const webhookTime = parseInt(timestamp) * 1000;
  const currentTime = Date.now();
  const timeDiff = Math.abs(currentTime - webhookTime);

  if (timeDiff > 5 * 60 * 1000) { // 5 minutes
    return res.status(400).json(createErrorResponse(
      'VALIDATION_ERROR',
      'Webhook timestamp is too old.',
      {
        timestamp,
        currentTime: new Date().toISOString()
      }
    ));
  }

  // TODO: Implement actual signature validation
  // This would involve comparing the received signature with a computed signature
  // For now, we'll pass through but log the validation attempt
  logger.debug('Webhook signature validation (implementation pending)', {
    signature,
    timestamp,
    path: req.path,
    ip: req.ip
  });

  next();
};

export default {
  validateRequest,
  validateQuery,
  validateParams,
  validateSourceId,
  validatePagination,
  validateDateRange,
  validateWebhookSignature,
  ValidationError,
  schemas
};