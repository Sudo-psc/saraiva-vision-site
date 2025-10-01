#!/usr/bin/env node
/**
 * Blog Posts Migration Script
 * Splits blogPosts.js into individual post files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the original blogPosts.js file
const blogPostsPath = path.join(__dirname, '../src/data/blogPosts.js');
const outputDir = path.join(__dirname, '../src/content/blog/posts');

console.log('📚 Blog Posts Migration Script');
console.log('================================\n');

// Import the blog posts data
const blogPostsModule = await import(blogPostsPath);
const { blogPosts } = blogPostsModule;

console.log(`✓ Loaded ${blogPosts.length} posts from blogPosts.js`);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`✓ Created output directory: ${outputDir}`);
}

// Process each post
let successCount = 0;
let errorCount = 0;

for (const post of blogPosts) {
  try {
    const filename = `post-${post.id}.js`;
    const filepath = path.join(outputDir, filename);

    // Generate the post file content
    const fileContent = `/**
 * Blog Post #${post.id}
 * ${post.title}
 */

export default ${JSON.stringify(post, null, 2)};
`;

    // Write the file
    fs.writeFileSync(filepath, fileContent, 'utf-8');
    console.log(`✓ Created ${filename}`);
    successCount++;
  } catch (error) {
    console.error(`✗ Error processing post ${post.id}:`, error.message);
    errorCount++;
  }
}

console.log('\n================================');
console.log(`✅ Migration complete!`);
console.log(`   Success: ${successCount} posts`);
if (errorCount > 0) {
  console.log(`   Errors: ${errorCount} posts`);
}
console.log(`\n📂 Output: ${outputDir}`);
