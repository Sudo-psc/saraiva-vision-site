import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // Listen to page errors
  page.on('pageerror', error => console.error('PAGE ERROR:', error));

  await page.goto('http://localhost:3002/blog', { waitUntil: 'networkidle' });

  // Wait for content
  await page.waitForTimeout(5000);

  // Check if blog posts are rendered
  const postCount = await page.locator('[data-testid="blog-post"], .blog-post, article').count();
  console.log(`Found ${postCount} blog posts`);

  // Get page content
  const content = await page.content();
  console.log('Page has blog content:', content.includes('blog'));

  await page.screenshot({ path: '/tmp/blog-debug.png', fullPage: true });
  console.log('Screenshot saved to /tmp/blog-debug.png');

  await browser.close();
})();
