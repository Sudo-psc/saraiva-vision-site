#!/usr/bin/env node
/**
 * Build-Time Markdown Processor
 * Converts .md files to JSON to avoid Buffer dependency in browser
 *
 * This script runs in Node.js environment during build, eliminating the need
 * for gray-matter and Buffer in the client bundle.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.resolve(__dirname, '../src/content/blog');
const OUTPUT_FILE = path.resolve(__dirname, '../src/content/blog/posts.json');

/**
 * Configure marked options for secure HTML conversion
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
 * Fix YAML frontmatter syntax issues
 * Automatically quotes values with special characters
 */
function fixFrontmatterYAML(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return content;

  let frontmatter = frontmatterMatch[1];

  // Fix unquoted strings with colons, pipes, and other special YAML chars
  frontmatter = frontmatter.replace(/^(\s*)(title|excerpt|author|metaDescription|keywords|description):\s*(.+)$/gm, (match, indent, key, value) => {
    // Already quoted or simple value
    if (value.trim().startsWith('"') || value.trim().startsWith("'") || !/[:|>@&*[\]{}]/.test(value)) {
      return match;
    }
    // Quote the value, escaping existing quotes
    const escapedValue = value.trim().replace(/"/g, '\\"');
    return `${indent}${key}: "${escapedValue}"`;
  });

  return content.replace(/^---\n[\s\S]*?\n---/, `---\n${frontmatter}\n---`);
}

/**
 * Process all .md files in blog directory
 */
function processBlogPosts() {
  console.log('🔨 Building blog posts from Markdown files...\n');

  const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.md'));
  const posts = [];

  for (const filename of files) {
    const filepath = path.join(BLOG_DIR, filename);

    try {
      // Read file content
      let rawContent = fs.readFileSync(filepath, 'utf8');

      // Fix YAML syntax issues before parsing
      rawContent = fixFrontmatterYAML(rawContent);

      // Parse frontmatter and markdown content (Node.js only - uses Buffer)
      const { data, content: markdownContent } = matter(rawContent);

      // Convert markdown to HTML
      const htmlContent = markdownToHtml(markdownContent);

      // Build post object
      const post = {
        id: data.id,
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content: htmlContent,
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

      posts.push(post);
      console.log(`  ✅ Processed: ${filename} (ID: ${post.id})`);

    } catch (error) {
      console.error(`  ❌ Error processing ${filename}:`, error.message);
    }
  }

  // Sort by id descending (newest first)
  posts.sort((a, b) => b.id - a.id);

  // Write JSON output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2), 'utf8');

  console.log(`\n📦 Generated: ${OUTPUT_FILE}`);
  console.log(`   Posts: ${posts.length}`);
  console.log(`   Size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB\n`);
  console.log('✅ Blog posts build completed successfully!\n');
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  processBlogPosts();
}

export { processBlogPosts };
