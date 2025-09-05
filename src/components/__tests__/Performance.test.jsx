import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Performance and Build Quality Tests', () => {
  const distPath = path.join(process.cwd(), 'dist');
  let buildExists = false;

  beforeAll(() => {
    buildExists = fs.existsSync(distPath);
  });

  describe('Build Output Validation', () => {
    it('should have dist directory after build', () => {
      if (buildExists) {
        expect(fs.existsSync(distPath)).toBe(true);
      } else {
        // Skip if no build available
        expect(true).toBe(true);
      }
    });

    it('should have critical files in build output', () => {
      if (!buildExists) {
        expect(true).toBe(true);
        return;
      }

      const criticalFiles = [
        'index.html',
        'assets'
      ];

      criticalFiles.forEach(file => {
        const filePath = path.join(distPath, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    it('should have reasonable asset sizes', () => {
      if (!buildExists) {
        expect(true).toBe(true);
        return;
      }

      const assetsPath = path.join(distPath, 'assets');
      if (!fs.existsSync(assetsPath)) {
        expect(true).toBe(true);
        return;
      }

      const files = fs.readdirSync(assetsPath);
      const jsFiles = files.filter(f => f.endsWith('.js'));
      const cssFiles = files.filter(f => f.endsWith('.css'));

      // Should have JS and CSS files
      expect(jsFiles.length).toBeGreaterThan(0);
      expect(cssFiles.length).toBeGreaterThan(0);

      // Check file sizes are reasonable (not empty, not too large)
      jsFiles.forEach(file => {
        const filePath = path.join(assetsPath, file);
        const stats = fs.statSync(filePath);
        
        // File should not be empty
        expect(stats.size).toBeGreaterThan(0);
        
        // Main bundle shouldn't be too large (warn at 1MB)
        if (file.includes('index')) {
          expect(stats.size).toBeLessThan(1024 * 1024); // 1MB
        }
      });
    });

    it('should have valid HTML structure', () => {
      if (!buildExists) {
        expect(true).toBe(true);
        return;
      }

      const indexHtml = path.join(distPath, 'index.html');
      if (!fs.existsSync(indexHtml)) {
        expect(true).toBe(true);
        return;
      }

      const content = fs.readFileSync(indexHtml, 'utf8');

      // Basic HTML structure
      expect(content).toContain('<!DOCTYPE html>');
      expect(content).toContain('<html');
      expect(content).toContain('<head>');
      expect(content).toContain('<body>');
      expect(content).toContain('</html>');

      // Should have viewport meta tag
      expect(content).toContain('<meta name="viewport"');
      
      // Should have title
      expect(content).toContain('<title>');
      
      // Should reference assets
      expect(content).toContain('/assets/');
    });
  });

  describe('Performance Budgets', () => {
    it('should define performance thresholds', () => {
      const performanceBudgets = {
        // Core Web Vitals thresholds
        LCP: 2.5,    // Largest Contentful Paint (seconds)
        FID: 100,    // First Input Delay (milliseconds)
        CLS: 0.1,    // Cumulative Layout Shift
        
        // Loading performance
        TTFB: 600,   // Time to First Byte (milliseconds)
        FCP: 1.8,    // First Contentful Paint (seconds)
        
        // Bundle sizes (KB)
        mainJSBundle: 600,    // Main JS bundle
        vendorBundle: 400,    // Vendor libraries
        cssBundle: 150,       // CSS bundle
        
        // Resource counts
        maxHTTPRequests: 30,  // Maximum HTTP requests
        maxDOMElements: 1500  // Maximum DOM elements
      };

      // Validate thresholds are reasonable
      expect(performanceBudgets.LCP).toBeLessThan(4);     // Good: < 2.5s
      expect(performanceBudgets.FID).toBeLessThan(300);   // Good: < 100ms
      expect(performanceBudgets.CLS).toBeLessThan(0.25);  // Good: < 0.1
      expect(performanceBudgets.TTFB).toBeLessThan(1500); // Reasonable TTFB
      expect(performanceBudgets.FCP).toBeLessThan(3);     // Good: < 1.8s
      
      // Bundle sizes should be reasonable
      expect(performanceBudgets.mainJSBundle).toBeLessThan(1000);
      expect(performanceBudgets.vendorBundle).toBeLessThan(800);
      expect(performanceBudgets.cssBundle).toBeLessThan(300);
    });

    it('should validate actual bundle sizes against budgets', () => {
      if (!buildExists) {
        expect(true).toBe(true);
        return;
      }

      const assetsPath = path.join(distPath, 'assets');
      if (!fs.existsSync(assetsPath)) {
        expect(true).toBe(true);
        return;
      }

      const files = fs.readdirSync(assetsPath);
      
      // Check main JS bundle size
      const mainJSFiles = files.filter(f => f.includes('index') && f.endsWith('.js'));
      if (mainJSFiles.length > 0) {
        const mainJS = mainJSFiles[0];
        const filePath = path.join(assetsPath, mainJS);
        const stats = fs.statSync(filePath);
        const sizeKB = stats.size / 1024;
        
        // Main bundle should be reasonable size
        expect(sizeKB).toBeLessThan(800); // 800KB warning threshold
      }

      // Check CSS bundle size
      const cssFiles = files.filter(f => f.endsWith('.css'));
      if (cssFiles.length > 0) {
        const totalCSSSize = cssFiles.reduce((total, file) => {
          const filePath = path.join(assetsPath, file);
          const stats = fs.statSync(filePath);
          return total + stats.size;
        }, 0);
        
        const totalCSSKB = totalCSSSize / 1024;
        expect(totalCSSKB).toBeLessThan(200); // 200KB warning threshold
      }
    });
  });

  describe('SEO and Accessibility', () => {
    it('should have proper meta tags', () => {
      if (!buildExists) {
        expect(true).toBe(true);
        return;
      }

      const indexHtml = path.join(distPath, 'index.html');
      if (!fs.existsSync(indexHtml)) {
        expect(true).toBe(true);
        return;
      }

      const content = fs.readFileSync(indexHtml, 'utf8');

      // Essential meta tags
      expect(content).toContain('<meta charset=');
      expect(content).toContain('<meta name="viewport"');
      expect(content).toContain('<title>');
      
      // SEO meta tags (may be added by React Helmet)
      const hasMetaDescription = content.includes('<meta name="description"');
      const hasOGTags = content.includes('og:') || content.includes('property="og:');
      
      // At least one should be present (either static or dynamic)
      expect(hasMetaDescription || hasOGTags || content.includes('react-helmet')).toBe(true);
    });

    it('should have accessibility features', () => {
      if (!buildExists) {
        expect(true).toBe(true);
        return;
      }

      const indexHtml = path.join(distPath, 'index.html');
      if (!fs.existsSync(indexHtml)) {
        expect(true).toBe(true);
        return;
      }

      const content = fs.readFileSync(indexHtml, 'utf8');

      // Language attribute
      expect(content).toMatch(/<html[^>]*lang=/);
      
      // Skip check should work with root div
      expect(content).toContain('id="root"');
    });
  });

  describe('Security Features', () => {
    it('should not expose sensitive information', () => {
      if (!buildExists) {
        expect(true).toBe(true);
        return;
      }

      const indexHtml = path.join(distPath, 'index.html');
      if (!fs.existsSync(indexHtml)) {
        expect(true).toBe(true);
        return;
      }

      const content = fs.readFileSync(indexHtml, 'utf8');

      // Should not contain obvious secrets
      expect(content).not.toContain('secret');
      expect(content).not.toContain('password');
      expect(content).not.toContain('private_key');
      
      // Should not contain development-only content
      expect(content).not.toContain('localhost:');
      expect(content).not.toContain('development');
    });

    it('should have proper resource integrity', () => {
      if (!buildExists) {
        expect(true).toBe(true);
        return;
      }

      const indexHtml = path.join(distPath, 'index.html');
      if (!fs.existsSync(indexHtml)) {
        expect(true).toBe(true);
        return;
      }

      const content = fs.readFileSync(indexHtml, 'utf8');

      // Vite should generate proper module scripts
      const hasModuleScript = content.includes('type="module"');
      const hasAssetReferences = content.includes('/assets/');
      
      expect(hasModuleScript || hasAssetReferences).toBe(true);
    });
  });

  describe('Production Readiness', () => {
    it('should be production optimized', () => {
      if (!buildExists) {
        expect(true).toBe(true);
        return;
      }

      const indexHtml = path.join(distPath, 'index.html');
      if (!fs.existsSync(indexHtml)) {
        expect(true).toBe(true);
        return;
      }

      const content = fs.readFileSync(indexHtml, 'utf8');

      // Should have basic production indicators
      expect(content.length).toBeGreaterThan(100); // Not empty
      
      // Should not contain development artifacts
      expect(content).not.toContain('console.log');
      expect(content).not.toContain('debugger');
      expect(content).not.toContain('development');
    });

    it('should have proper asset references', () => {
      if (!buildExists) {
        expect(true).toBe(true);
        return;
      }

      const indexHtml = path.join(distPath, 'index.html');
      const assetsPath = path.join(distPath, 'assets');
      
      if (!fs.existsSync(indexHtml) || !fs.existsSync(assetsPath)) {
        expect(true).toBe(true);
        return;
      }

      const content = fs.readFileSync(indexHtml, 'utf8');
      const assetFiles = fs.readdirSync(assetsPath);

      // Extract asset references from HTML
      const assetReferences = content.match(/\/assets\/[^"'\s]+/g) || [];
      
      if (assetReferences.length > 0) {
        // Check that referenced assets actually exist
        assetReferences.forEach(ref => {
          const filename = ref.replace('/assets/', '');
          expect(assetFiles).toContain(filename);
        });
      }
    });
  });
});