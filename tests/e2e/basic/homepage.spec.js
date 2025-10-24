import { test, expect } from '@playwright/test';

test.describe('Basic Medical Platform Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('https://saraivavision.com.br', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    console.log('Homepage loaded successfully. Title:', title);
  });

  test('should have valid accessibility structure', async ({ page }) => {
    await page.goto('https://saraivavision.com.br', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    const main = page.locator('main, [role="main"]');
    await expect(main).toHaveCount(1);

    const nav = page.locator('nav, [role="navigation"]');
    expect(await nav.count()).toBeGreaterThanOrEqual(1);

    console.log('Accessibility structure validated');
  });

  test('should load medical content', async ({ page }) => {
    await page.goto('https://saraivavision.com.br', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    const bodyText = await page.textContent('body');
    
    expect(bodyText).toContain('oftalmologia' || 'Oftalmologia' || 'OFTALMOLOGIA');

    console.log('Medical content verified');
  });
});
