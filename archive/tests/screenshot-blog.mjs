import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:3002/blog', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // Wait for images to load

  await page.screenshot({
    path: '/tmp/blog-screenshot.png',
    fullPage: true
  });

  console.log('Screenshot saved to /tmp/blog-screenshot.png');

  await browser.close();
})();
