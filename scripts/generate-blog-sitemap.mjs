import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE_URL = 'https://saraivavision.com.br';

const { blogPosts } = await import('../src/data/blogPosts.js');

const now = new Date().toISOString();

const generateBlogSitemap = () => {
  const urls = blogPosts
    .filter(post => post.slug && post.date)
    .map(post => {
      const lastmod = post.lastModified || post.date;
      const priority = post.featured ? '0.9' : '0.8';
      const changefreq = post.featured ? 'weekly' : 'monthly';
      
      return `  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
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
  <!-- Blog Articles - Saraiva Vision - Oftalmologia em Caratinga/MG -->
  <!-- Dr. Philipe Saraiva Cruz - CRM-MG 69.870 -->
  <!-- Total articles: ${blogPosts.length} -->
  <!-- All articles are medically reviewed and optimized for LLMs and AI agents -->
  
  <!-- Blog Index Page -->
  <url>
    <loc>${SITE_URL}/blog</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="pt-br" href="${SITE_URL}/blog" />
  </url>

  <!-- Individual Blog Articles -->
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
console.log(`🔗 URL: ${SITE_URL}/blog-sitemap.xml`);
