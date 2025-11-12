import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE_URL = 'https://saraivavision.com.br';

const blogPostsPath = join(__dirname, '../src/data/blogPosts.js');
const blogPostsContent = readFileSync(blogPostsPath, 'utf-8');

const blogPostsMatch = blogPostsContent.match(/export const blogPosts = (\[[\s\S]*?\]);/);
if (!blogPostsMatch) {
  console.error('Could not find blogPosts array');
  process.exit(1);
}

const cleanedContent = blogPostsMatch[1]
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*/g, '');

let blogPosts;
try {
  blogPosts = eval(cleanedContent);
} catch (error) {
  console.error('Error parsing blog posts:', error);
  process.exit(1);
}

const now = new Date().toISOString();

const generateBlogSitemap = () => {
  const urls = blogPosts
    .filter(post => post.slug && post.date)
    .map(post => {
      const lastmod = post.lastModified || post.date;
      const priority = post.featured ? '0.9' : '0.8';
      
      return `  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="pt-br" href="${SITE_URL}/blog/${post.slug}" />
  </url>`;
    })
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Generated: ${now} -->
  <!-- Blog Articles - Saraiva Vision -->
  <!-- Total articles: ${blogPosts.length} -->
  
  <url>
    <loc>${SITE_URL}/blog</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="pt-br" href="${SITE_URL}/blog" />
  </url>
${urls}
</urlset>`;

  return sitemap;
};

const outputPath = join(__dirname, '../public/blog-sitemap.xml');
const sitemap = generateBlogSitemap();
writeFileSync(outputPath, sitemap, 'utf-8');

console.log(`✅ Blog sitemap generated successfully!`);
console.log(`📝 Total posts: ${blogPosts.length}`);
console.log(`📍 Output: ${outputPath}`);
