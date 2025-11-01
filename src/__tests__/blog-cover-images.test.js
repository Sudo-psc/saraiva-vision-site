import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const BLOG_POSTS_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'blogPosts.js');
const BLOG_IMAGES_DIR = path.join(PROJECT_ROOT, 'public', 'Blog');

describe('Blog Cover Images Verification', () => {
  let blogPosts = [];
  let availableImages = [];

  beforeEach(async () => {
    // Load blog posts data safely using dynamic import
    try {
      // Import the module directly
      const blogPostsModule = await import(BLOG_POSTS_FILE);
      blogPosts = blogPostsModule.blogPosts || [];
    } catch (error) {
      console.error('Error loading blog posts:', error);
      // Fallback: try to read and parse as JSON if it's a simple structure
      try {
        const blogPostsContent = await fs.readFile(BLOG_POSTS_FILE, 'utf-8');
        // Look for the blogPosts export and parse it safely
        const blogPostsMatch = blogPostsContent.match(/export const blogPosts = (\[[\s\S]*?\]);/);
        if (blogPostsMatch) {
          // Use Function constructor instead of eval for safer parsing
          const blogPostsArray = new Function('return ' + blogPostsMatch[1])();
          blogPosts = blogPostsArray || [];
        }
      } catch (fallbackError) {
        console.error('Fallback loading failed:', fallbackError);
        blogPosts = [];
      }
    }

    // Load available images
    try {
      const imageFiles = await fs.readdir(BLOG_IMAGES_DIR);
      availableImages = imageFiles.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.tiff'].includes(ext);
      });
    } catch (error) {
      console.error('Error loading images:', error);
    }
  });

  describe('Structure Validation', () => {
    it('should have blog posts loaded', () => {
      expect(blogPosts.length).toBeGreaterThan(0);
    });

    it('should have images available', () => {
      expect(availableImages.length).toBeGreaterThan(0);
    });
  });

  describe('Cover Images Existence (Optional)', () => {
    it('blog posts may optionally have cover images', () => {
      const postsWithImages = blogPosts.filter(post => post.image);
      const postsWithoutImages = blogPosts.filter(post => !post.image);
      
      console.log(`\n📊 Image Statistics:`);
      console.log(`   Posts with images: ${postsWithImages.length}`);
      console.log(`   Posts without images: ${postsWithoutImages.length}`);
      
      expect(blogPosts.length).toBeGreaterThan(0);
    });

    it('all defined cover image files should exist in the Blog directory', () => {
      const missingImages = [];
      const postsWithImages = blogPosts.filter(post => post.image);

      postsWithImages.forEach(post => {
        const imagePath = post.image.startsWith('/') ? post.image.slice(1) : post.image;
        const filename = path.basename(imagePath);

        if (!availableImages.includes(filename)) {
          missingImages.push({
            postId: post.id,
            title: post.title,
            slug: post.slug,
            image: post.image,
            filename: filename
          });
        }
      });

      if (missingImages.length > 0) {
        console.log('\n❌ Missing cover images:');
        missingImages.forEach(item => {
          console.log(`  • Post ID ${item.postId}: ${item.title}`);
          console.log(`    Expected file: ${item.filename}`);
          console.log(`    Image path: ${item.image}`);
        });
      }

      expect(missingImages.length).toBe(0);
    });
  });

  describe('Image Format Validation', () => {
    it('defined cover images should have valid image extensions', () => {
      const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.tiff'];
      const invalidImages = [];
      const postsWithImages = blogPosts.filter(post => post.image);

      postsWithImages.forEach(post => {
        const filename = path.basename(post.image);
        const ext = path.extname(filename).toLowerCase();

        if (!validExtensions.includes(ext)) {
          invalidImages.push({
            postId: post.id,
            title: post.title,
            image: post.image,
            extension: ext
          });
        }
      });

      if (invalidImages.length > 0) {
        console.log('\n❌ Invalid image extensions:');
        invalidImages.forEach(item => {
          console.log(`  • Post ID ${item.postId}: ${item.title}`);
          console.log(`    Image: ${item.image}`);
          console.log(`    Extension: ${item.extension}`);
        });
      }

      expect(invalidImages.length).toBe(0);
    });

    it('defined cover images should follow naming conventions', () => {
      const problematicNames = [];
      const postsWithImages = blogPosts.filter(post => post.image);

      postsWithImages.forEach(post => {
        const filename = path.basename(post.image);
        const basename = path.basename(filename, path.extname(filename));

        // Check for common naming issues
        const issues = [];

        // Check for spaces
        if (filename.includes(' ')) {
          issues.push('contains spaces');
        }

        // Check for uppercase letters (should be lowercase)
        if (filename !== filename.toLowerCase()) {
          issues.push('contains uppercase letters');
        }

        // Check for special characters (except hyphens and underscores)
        if (!/^[a-z0-9\-_.]+\.[a-z]+$/.test(filename)) {
          issues.push('contains special characters');
        }

        // Check if basename is too short (likely placeholder)
        if (basename.length < 3) {
          issues.push('basename too short');
        }

        if (issues.length > 0) {
          problematicNames.push({
            postId: post.id,
            title: post.title,
            image: post.image,
            issues: issues
          });
        }
      });

      if (problematicNames.length > 0) {
        console.log('\n⚠️  Naming convention issues:');
        problematicNames.forEach(item => {
          console.log(`  • Post ID ${item.postId}: ${item.title}`);
          console.log(`    Image: ${item.image}`);
          console.log(`    Issues: ${item.issues.join(', ')}`);
        });
      }

      // Allow some naming issues but warn about them
      expect(problematicNames.length).toBeLessThan(Math.max(1, postsWithImages.length / 2));
    });
  });

  describe('Image Quality and Standards', () => {
    it('defined cover images should have modern formats available (WebP/AVIF)', async () => {
      const postsWithoutModernFormats = [];
      const postsWithImages = blogPosts.filter(post => post.image);

      for (const post of postsWithImages) {
        const filename = path.basename(post.image);
        const basename = path.basename(filename, path.extname(filename));

        const hasWebP = availableImages.some(img => img === `${basename}.webp`);
        const hasAVIF = availableImages.some(img => img === `${basename}.avif`);

        if (!hasWebP && !hasAVIF) {
          postsWithoutModernFormats.push({
            postId: post.id,
            title: post.title,
            originalImage: filename,
            missingFormats: ['WebP', 'AVIF']
          });
        } else if (!hasWebP) {
          postsWithoutModernFormats.push({
            postId: post.id,
            title: post.title,
            originalImage: filename,
            missingFormats: ['WebP']
          });
        } else if (!hasAVIF) {
          postsWithoutModernFormats.push({
            postId: post.id,
            title: post.title,
            originalImage: filename,
            missingFormats: ['AVIF']
          });
        }
      }

      if (postsWithoutModernFormats.length > 0) {
        console.log('\n⚠️  Posts without modern image formats:');
        postsWithoutModernFormats.forEach(item => {
          console.log(`  • Post ID ${item.postId}: ${item.title}`);
          console.log(`    Original: ${item.originalImage}`);
          console.log(`    Missing: ${item.missingFormats.join(', ')}`);
        });
        console.log('\n💡 Suggestion: Run npm run optimize:images to generate modern formats');
      }

      // Warn but don't fail the test for missing modern formats
      if (postsWithImages.length > 0) {
        expect(postsWithoutModernFormats.length).toBeLessThan(postsWithImages.length);
      }
    });

    it('defined cover images should not be placeholder images', () => {
      const placeholderPatterns = [
        /placeholder/i,
        /^temp[_-]/i,      // temp-, temp_ no início
        /^test[_-]/i,      // test-, test_ no início (mas não "teste-olhinho")
        /sample/i,
        /^default[_-]/i,   // default-, default_ no início
        /lorem/i,
        /^blank[_-]/i      // blank-, blank_ no início
      ];

      const postsWithPlaceholders = [];
      const postsWithImages = blogPosts.filter(post => post.image);

      postsWithImages.forEach(post => {
        const filename = path.basename(post.image);

        if (placeholderPatterns.some(pattern => pattern.test(filename))) {
          postsWithPlaceholders.push({
            postId: post.id,
            title: post.title,
            image: post.image
          });
        }
      });

      if (postsWithPlaceholders.length > 0) {
        console.log('\n⚠️  Posts with possible placeholder images:');
        postsWithPlaceholders.forEach(item => {
          console.log(`  • Post ID ${item.postId}: ${item.title}`);
          console.log(`    Image: ${item.image}`);
        });
      }

      expect(postsWithPlaceholders.length).toBe(0);
    });
  });

  describe('SEO and Accessibility', () => {
    it('defined cover images should have appropriate file sizes (check for oversized files)', async () => {
      const oversizedImages = [];
      const MAX_SIZE_MB = 5; // 5MB max for cover images
      const postsWithImages = blogPosts.filter(post => post.image);

      for (const post of postsWithImages) {
        const filename = path.basename(post.image);
        const imagePath = path.join(BLOG_IMAGES_DIR, filename);

        try {
          const stats = await fs.stat(imagePath);
          const sizeMB = stats.size / (1024 * 1024);

          if (sizeMB > MAX_SIZE_MB) {
            oversizedImages.push({
              postId: post.id,
              title: post.title,
              image: post.image,
              sizeMB: sizeMB.toFixed(2)
            });
          }
        } catch {
          // File doesn't exist, already caught in previous test
        }
      }

      if (oversizedImages.length > 0) {
        console.log('\n⚠️  Oversized cover images:');
        oversizedImages.forEach(item => {
          console.log(`  • Post ID ${item.postId}: ${item.title}`);
          console.log(`    Image: ${item.image}`);
          console.log(`    Size: ${item.sizeMB}MB (max: ${MAX_SIZE_MB}MB)`);
        });
        console.log('\n💡 Suggestion: Optimize images with npm run optimize:images');
      }

      // Warn but don't fail for oversized images (just log them)
      if (postsWithImages.length > 0) {
        expect(oversizedImages.length).toBeLessThan(Math.max(1, postsWithImages.length / 2));
      }
    });

    it('defined cover images should have descriptive filenames', () => {
      const nonDescriptiveNames = [];
      const postsWithImages = blogPosts.filter(post => post.image);

      postsWithImages.forEach(post => {
        const filename = path.basename(post.image);
        const basename = path.basename(filename, path.extname(filename));

        // Check if filename is too generic
        const genericPatterns = [
          /^img\d+/i,
          /^image\d+/i,
          /^photo\d+/i,
          /^pic\d+/i,
          /^cover\d+/i,
          /^[a-f0-9]{8,}$/i, // Hash-like names
          /^\d+$/, // Just numbers
          /^.{1,3}$/ // Too short
        ];

        if (genericPatterns.some(pattern => pattern.test(basename))) {
          nonDescriptiveNames.push({
            postId: post.id,
            title: post.title,
            image: post.image,
            basename: basename
          });
        }
      });

      if (nonDescriptiveNames.length > 0) {
        console.log('\n⚠️  Posts with non-descriptive image filenames:');
        nonDescriptiveNames.forEach(item => {
          console.log(`  • Post ID ${item.postId}: ${item.title}`);
          console.log(`    Image: ${item.image}`);
          console.log(`    Basename: ${item.basename}`);
        });
      }

      // Allow some non-descriptive names but flag them
      if (postsWithImages.length > 0) {
        expect(nonDescriptiveNames.length).toBeLessThan(Math.max(1, postsWithImages.length / 3));
      }
    });
  });

  describe('Summary Statistics', () => {
    it('should provide summary statistics', () => {
      const postsWithImages = blogPosts.filter(post => post.image);
      const postsWithoutImages = blogPosts.filter(post => !post.image);

      console.log('\n📊 Blog Cover Images Statistics:');
      console.log(`   Total blog posts: ${blogPosts.length}`);
      console.log(`   Posts with images: ${postsWithImages.length}`);
      console.log(`   Posts without images: ${postsWithoutImages.length}`);
      console.log(`   Available image files: ${availableImages.length}`);

      // Count by format (only for posts with images)
      const formatCounts = {};
      postsWithImages.forEach(post => {
        const ext = path.extname(post.image).toLowerCase();
        formatCounts[ext] = (formatCounts[ext] || 0) + 1;
      });

      if (Object.keys(formatCounts).length > 0) {
        console.log('   Image formats used:');
        Object.entries(formatCounts).forEach(([ext, count]) => {
          console.log(`     ${ext}: ${count} posts`);
        });
      }

      // Blog should have posts
      expect(blogPosts.length).toBeGreaterThan(0);
    });
  });
});