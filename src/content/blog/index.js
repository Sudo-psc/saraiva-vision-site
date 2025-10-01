/**
 * Blog Posts Loader
 * Aggregates individual markdown files into a single array
 * Compatible with existing blogPosts schema
 */

import matter from 'gray-matter';
import { marked } from 'marked';

// Import category configuration
export { categoryConfig } from './categoryConfig.js';

/**
 * Configure marked options for secure and proper HTML conversion
 */
marked.setOptions({
  headerIds: false,
  mangle: false,
  breaks: true,
  gfm: true,
});

/**
 * Convert Markdown to HTML using marked library
 */
function markdownToHtml(markdown) {
  try {
    return marked.parse(markdown);
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return markdown; // Fallback to raw content
  }
}

/**
 * Load and parse all markdown posts using Vite's import.meta.glob
 */
function loadPosts() {
  // Import all .md files from current directory
  const posts = import.meta.glob('./*.md', { eager: true, as: 'raw' });

  const parsedPosts = [];

  for (const [filepath, content] of Object.entries(posts)) {
    try {
      // Parse frontmatter and content
      const { data, content: markdownContent } = matter(content);

      // Convert markdown to HTML
      const htmlContent = markdownToHtml(markdownContent);

      // Build post object matching original schema
      const post = {
        id: data.id,
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content: htmlContent, // HTML content for compatibility
        author: data.author || 'Dr. Philipe Saraiva Cruz',
        date: data.date,
        category: data.category || 'Geral',
        tags: data.tags || [],
        image: data.image || '/Blog/default.png',
        featured: data.featured || false,
        seo: data.seo || {
          metaDescription: data.excerpt || '',
          keywords: '',
          ogImage: data.image || '/Blog/default.png'
        }
      };

      parsedPosts.push(post);
    } catch (error) {
      console.error(`Error parsing ${filepath}:`, error);
    }
  }

  // Sort by id descending (newest first)
  return parsedPosts.sort((a, b) => b.id - a.id);
}

/**
 * Export posts array (lazy loaded)
 */
export const blogPosts = loadPosts();

/**
 * Export categories list
 */
export const categories = [
  'Todas',
  'Prevenção',
  'Tratamento',
  'Tecnologia',
  'Dúvidas Frequentes'
];

/**
 * Export default for convenience
 */
export default blogPosts;

// Export individual post by slug helper
export const getPostBySlug = (slug) => {
  return blogPosts.find(post => post.slug === slug);
};

// Export posts by category helper
export const getPostsByCategory = (category) => {
  return blogPosts.filter(post => post.category === category);
};

// Export featured posts helper
export const getFeaturedPosts = () => {
  return blogPosts.filter(post => post.featured);
};

// Export recent posts helper
export const getRecentPosts = (limit = 3) => {
  return [...blogPosts]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
};
