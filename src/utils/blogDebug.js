/**
 * Blog Debug Utilities
 * Provides performance monitoring and validation for blog functionality
 */

// Development mode flag
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Performance monitoring class
export class BlogPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
  }

  /**
   * Start timing a performance metric
   */
  startTiming(label) {
    if (!IS_DEVELOPMENT) return;

    const startTime = performance.now();
    this.metrics.set(label, { startTime, endTime: null, duration: null });

    if (IS_DEVELOPMENT) {
      console.debug(`⏱️  [Blog Debug] Started timing: ${label}`);
    }
  }

  /**
   * End timing a performance metric
   */
  endTiming(label) {
    if (!IS_DEVELOPMENT) return;

    const metric = this.metrics.get(label);
    if (metric && metric.startTime) {
      const endTime = performance.now();
      const duration = endTime - metric.startTime;

      this.metrics.set(label, {
        ...metric,
        endTime,
        duration
      });

      if (IS_DEVELOPMENT) {
        console.log(`⏱️  [Blog Debug] ${label}: ${duration.toFixed(2)}ms`);
      }

      // Log performance warnings
      this.checkPerformanceThresholds(label, duration);

      return duration;
    }
  }

  /**
   * Check performance thresholds and log warnings
   */
  checkPerformanceThresholds(label, duration) {
    const thresholds = {
      'blog-page-load': 1000,
      'blog-post-render': 500,
      'blog-filter-operations': 100,
      'blog-search-execution': 50,
      'blog-content-process': 200
    };

    const threshold = thresholds[label];
    if (threshold && duration > threshold) {
      console.warn(`⚠️  [Blog Debug] Slow performance detected: ${label} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`);
    }
  }

  /**
   * Measure function execution time
   */
  async measureAsync(label, fn) {
    if (!IS_DEVELOPMENT) return await fn();

    this.startTiming(label);
    try {
      const result = await fn();
      this.endTiming(label);
      return result;
    } catch (error) {
      this.endTiming(label);
      console.error(`❌ [Blog Debug] Error in ${label}:`, error);
      throw error;
    }
  }

  /**
   * Get performance report
   */
  getReport() {
    const report = {};
    for (const [label, metric] of this.metrics.entries()) {
      if (metric.duration !== null) {
        report[label] = {
          duration: metric.duration,
          startTime: metric.startTime,
          endTime: metric.endTime
        };
      }
    }
    return report;
  }

  /**
   * Log performance summary
   */
  logSummary() {
    if (!IS_DEVELOPMENT) return;

    const report = this.getReport();
    console.group('📊 [Blog Debug] Performance Summary');

    Object.entries(report).forEach(([label, metric]) => {
      const status = metric.duration > 500 ? '🐌' : metric.duration > 200 ? '⚠️' : '✅';
      console.log(`${status} ${label}: ${metric.duration.toFixed(2)}ms`);
    });

    console.groupEnd();
  }
}

// Blog post validation utilities
export class BlogPostValidator {
  /**
   * Validate blog post structure
   */
  static validatePostStructure(post, index = null) {
    const errors = [];
    const warnings = [];
    const postId = post.id || index || 'unknown';

    // Required fields
    const requiredFields = ['id', 'slug', 'title', 'excerpt', 'content', 'author', 'date'];
    requiredFields.forEach(field => {
      if (!post[field]) {
        errors.push(`Post ${postId}: Missing required field '${field}'`);
      }
    });

    // Field type validation
    if (post.id && typeof post.id !== 'number') {
      errors.push(`Post ${postId}: 'id' should be a number`);
    }

    if (post.title && typeof post.title !== 'string') {
      errors.push(`Post ${postId}: 'title' should be a string`);
    }

    if (post.slug && typeof post.slug !== 'string') {
      errors.push(`Post ${postId}: 'slug' should be a string`);
    }

    // Slug validation
    if (post.slug) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) {
        warnings.push(`Post ${postId}: Slug '${post.slug}' contains invalid characters`);
      }
    }

    // Content validation
    if (post.content) {
      if (typeof post.content !== 'string') {
        errors.push(`Post ${postId}: 'content' should be a string`);
      } else if (post.content.length < 100) {
        warnings.push(`Post ${postId}: Content seems too short (${post.content.length} characters)`);
      }
    }

    // Date validation
    if (post.date) {
      const dateObj = new Date(post.date);
      if (isNaN(dateObj.getTime())) {
        errors.push(`Post ${postId}: Invalid date format`);
      }
    }

    // SEO validation
    if (post.seo) {
      if (post.seo.metaTitle && post.seo.metaTitle.length > 60) {
        warnings.push(`Post ${postId}: SEO meta title is too long (${post.seo.metaTitle.length} chars, max: 60)`);
      }

      if (post.seo.metaDescription && post.seo.metaDescription.length > 160) {
        warnings.push(`Post ${postId}: SEO meta description is too long (${post.seo.metaDescription.length} chars, max: 160)`);
      }
    }

    // Category validation
    if (post.category && typeof post.category !== 'string') {
      warnings.push(`Post ${postId}: 'category' should be a string`);
    }

    // Tags validation
    if (post.tags) {
      if (!Array.isArray(post.tags)) {
        warnings.push(`Post ${postId}: 'tags' should be an array`);
      } else {
        post.tags.forEach((tag, tagIndex) => {
          if (typeof tag !== 'string') {
            warnings.push(`Post ${postId}: Tag ${tagIndex} should be a string`);
          }
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate blog posts array
   */
  static validateBlogPosts(posts) {
    const allErrors = [];
    const allWarnings = [];

    posts.forEach((post, index) => {
      const { errors, warnings } = this.validatePostStructure(post, index);
      allErrors.push(...errors);
      allWarnings.push(...warnings);
    });

    // Check for duplicate slugs
    const slugs = posts.map(post => post.slug).filter(Boolean);
    const duplicateSlugs = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
    if (duplicateSlugs.length > 0) {
      allErrors.push(`Duplicate slugs found: ${duplicateSlugs.join(', ')}`);
    }

    // Check for duplicate IDs
    const ids = posts.map(post => post.id).filter(Boolean);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      allErrors.push(`Duplicate IDs found: ${duplicateIds.join(', ')}`);
    }

    return { errors: allErrors, warnings: allWarnings };
  }
}

// Content processing utilities
export class BlogContentProcessor {
  /**
   * Safe content processing with error handling
   */
  static safeProcessContent(content, processorFn, fallback = '') {
    if (!content || typeof content !== 'string') {
      console.warn('⚠️  [Blog Debug] Invalid content provided to processor');
      return fallback;
    }

    try {
      return processorFn(content);
    } catch (error) {
      console.error('❌ [Blog Debug] Content processing error:', error);
      return fallback;
    }
  }

  /**
   * Safe HTML content extraction
   */
  static safeExtractHeadings(content) {
    return this.safeProcessContent(
      content,
      (htmlContent) => {
        if (typeof document === 'undefined') {
          // SSR fallback
          return [];
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const headingElements = tempDiv.querySelectorAll('h2, h3');

        const headings = Array.from(headingElements).map((heading, index) => {
          const text = heading.textContent;
          const id = `heading-${index}`;

          // Safety check for text content
          if (!text || text.trim().length === 0) {
            console.warn(`⚠️  [Blog Debug] Heading ${index} has no text content`);
            return null;
          }

          heading.id = id;
          return {
            id,
            text: text.trim(),
            level: parseInt(heading.tagName.charAt(1))
          };
        }).filter(Boolean);

        if (IS_DEVELOPMENT) {
          console.debug(`📝 [Blog Debug] Extracted ${headings.length} headings from content`);
        }

        return headings;
      },
      []
    );
  }

  /**
   * Validate content HTML structure
   */
  static validateContentHTML(content) {
    const issues = [];

    if (!content || typeof content !== 'string') {
      issues.push('Content is not a valid string');
      return issues;
    }

    // Check for common HTML issues
    if (content.includes('<script')) {
      issues.push('Content contains script tags (security risk)');
    }

    if (content.includes('javascript:')) {
      issues.push('Content contains javascript: protocol (security risk)');
    }

    // Check for unclosed tags (basic check)
    const openTags = (content.match(/<[^\/][^>]*>/g) || []).length;
    const closeTags = (content.match(/<\/[^>]*>/g) || []).length;

    if (Math.abs(openTags - closeTags) > 5) {
      issues.push('Content may have unclosed HTML tags');
    }

    return issues;
  }
}

// Create global instances
const blogPerformanceMonitor = new BlogPerformanceMonitor();

// Export utilities
export {
  blogPerformanceMonitor,
  IS_DEVELOPMENT
};

// Development mode debug hooks
if (IS_DEVELOPMENT) {
  // Make debug utilities available in console
  window.blogDebug = {
    performance: blogPerformanceMonitor,
    validator: BlogPostValidator,
    processor: BlogContentProcessor,
    getReport: () => blogPerformanceMonitor.getReport(),
    logSummary: () => blogPerformanceMonitor.logSummary()
  };

  console.log('🐛 [Blog Debug] Debug utilities available at window.blogDebug');
}