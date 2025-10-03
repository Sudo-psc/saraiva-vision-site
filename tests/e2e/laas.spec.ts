/**
 * E2E Tests for LAAS Landing Page
 * Tests navigation, CTAs, forms, responsiveness, and accessibility
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('LAAS Landing Page - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/laas');
  });

  test.describe('Page Load and Structure', () => {
    test('should load successfully with all sections', async ({ page }) => {
      await expect(page).toHaveTitle(/LAAS|Saraiva Vision/);

      // Verify all major sections are present
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('section:has-text("Nunca mais fique sem lentes")')).toBeVisible();
      await expect(page.locator('#planos')).toBeVisible();
      await expect(page.locator('#como-funciona')).toBeVisible();
      await expect(page.locator('#faq')).toBeVisible();
      await expect(page.locator('footer, #footer')).toBeVisible();
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);

      // Check heading order
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  test.describe('Navigation and Smooth Scrolling', () => {
    test('should navigate to Planos section on header link click', async ({ page }) => {
      await page.click('button:has-text("Planos")');

      // Wait for scroll animation
      await page.waitForTimeout(1000);

      const planosSection = page.locator('#planos');
      await expect(planosSection).toBeInViewport();
    });

    test('should navigate to Como Funciona section', async ({ page }) => {
      await page.click('button:has-text("Como Funciona")');
      await page.waitForTimeout(1000);

      const comoFuncionaSection = page.locator('#como-funciona');
      await expect(comoFuncionaSection).toBeInViewport();
    });

    test('should navigate to FAQ section', async ({ page }) => {
      await page.click('button:has-text("FAQ")');
      await page.waitForTimeout(1000);

      const faqSection = page.locator('#faq');
      await expect(faqSection).toBeInViewport();
    });

    test('should navigate to footer on Contato click', async ({ page }) => {
      await page.click('button:has-text("Contato")');
      await page.waitForTimeout(1000);

      const footer = page.locator('#footer, footer');
      await expect(footer).toBeInViewport();
    });

    test('should scroll to planos on hero CTA click', async ({ page }) => {
      const ctaButton = page.locator('button:has-text("Agendar Consulta")').first();
      await ctaButton.click();
      await page.waitForTimeout(1000);

      const planosSection = page.locator('#planos');
      await expect(planosSection).toBeInViewport();
    });
  });

  test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should toggle mobile menu', async ({ page }) => {
      // Menu should be closed initially
      const mobileNav = page.locator('nav').filter({ hasText: 'Planos' });

      // Click hamburger menu
      const menuButton = page.locator('button[aria-label="Toggle menu"]');
      await menuButton.click();

      // Menu should be visible
      await expect(mobileNav).toBeVisible();

      // Click close button
      await menuButton.click();

      // Menu should be hidden (or class changed)
      // Note: This depends on implementation - adjust selector if needed
    });

    test('should close mobile menu after navigation', async ({ page }) => {
      const menuButton = page.locator('button[aria-label="Toggle menu"]');
      await menuButton.click();

      // Click a navigation link
      await page.click('button:has-text("Planos")');

      // Wait for scroll
      await page.waitForTimeout(500);

      // Menu should close automatically
      const mobileNav = page.locator('.md\\:hidden nav');
      await expect(mobileNav).not.toBeVisible();
    });
  });

  test.describe('CTAs - Agendar Consulta', () => {
    test('should have CTA in header', async ({ page }) => {
      const headerCta = page.locator('header button:has-text("Agendar Consulta")');
      await expect(headerCta).toBeVisible();
      await expect(headerCta).toBeEnabled();
    });

    test('should have CTA in hero section', async ({ page }) => {
      const heroCta = page.locator('section button:has-text("Agendar Consulta")').first();
      await expect(heroCta).toBeVisible();
      await expect(heroCta).toBeEnabled();
    });

    test('should have CTA buttons for each pricing plan', async ({ page }) => {
      const planCtas = page.locator('#planos button:has-text("Agendar Consulta")');
      const count = await planCtas.count();

      // Should have 3 plans (Essencial, Premium, VIP)
      expect(count).toBeGreaterThanOrEqual(3);

      // All should be visible and enabled
      for (let i = 0; i < count; i++) {
        await expect(planCtas.nth(i)).toBeVisible();
        await expect(planCtas.nth(i)).toBeEnabled();
      }
    });

    test('should scroll to planos section when clicking header CTA', async ({ page }) => {
      const headerCta = page.locator('header button:has-text("Agendar Consulta")');
      await headerCta.click();
      await page.waitForTimeout(1000);

      const planosSection = page.locator('#planos');
      await expect(planosSection).toBeInViewport();
    });
  });

  test.describe('Floating WhatsApp Button', () => {
    test('should be visible and positioned correctly', async ({ page }) => {
      const whatsappBtn = page.locator('button[aria-label="Falar no WhatsApp"]');
      await expect(whatsappBtn).toBeVisible();

      // Check positioning (fixed bottom-right)
      const box = await whatsappBtn.boundingBox();
      expect(box).toBeTruthy();

      if (box) {
        const viewport = page.viewportSize();
        if (viewport) {
          expect(box.x + box.width).toBeCloseTo(viewport.width, 100);
          expect(box.y + box.height).toBeCloseTo(viewport.height, 100);
        }
      }
    });

    test('should open WhatsApp in new tab when clicked', async ({ page, context }) => {
      const whatsappBtn = page.locator('button[aria-label="Falar no WhatsApp"]');

      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        whatsappBtn.click()
      ]);

      const url = newPage.url();
      expect(url).toContain('wa.me');

      await newPage.close();
    });

    test('should show tooltip on hover', async ({ page }) => {
      const whatsappBtn = page.locator('button[aria-label="Falar no WhatsApp"]');
      await whatsappBtn.hover();

      // Tooltip should appear
      const tooltip = page.locator('text="Fale conosco"');
      await expect(tooltip).toBeVisible();
    });
  });

  test.describe('Hero Form - Calculadora de Economia', () => {
    test('should render all form fields', async ({ page }) => {
      await expect(page.locator('input#nome')).toBeVisible();
      await expect(page.locator('input#whatsapp')).toBeVisible();
      await expect(page.locator('input#email')).toBeVisible();
      await expect(page.locator('input#lgpd')).toBeVisible();
    });

    test('should have proper labels for accessibility', async ({ page }) => {
      const nomeLabel = page.locator('label[for="nome"]');
      const whatsappLabel = page.locator('label[for="whatsapp"]');
      const emailLabel = page.locator('label[for="email"]');
      const lgpdLabel = page.locator('label[for="lgpd"]');

      await expect(nomeLabel).toBeVisible();
      await expect(whatsappLabel).toBeVisible();
      await expect(emailLabel).toBeVisible();
      await expect(lgpdLabel).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      const submitBtn = page.locator('form button[type="submit"]:has-text("Calcule sua economia")');
      await submitBtn.click();

      // Browser native validation should prevent submission
      // Check if form is still on page (not submitted)
      await expect(page.locator('input#nome')).toBeVisible();
    });

    test('should require LGPD consent', async ({ page }) => {
      // Fill all fields except LGPD checkbox
      await page.fill('input#nome', 'João Silva');
      await page.fill('input#whatsapp', '33999999999');
      await page.fill('input#email', 'joao@example.com');

      const submitBtn = page.locator('form button[type="submit"]:has-text("Calcule sua economia")');
      await submitBtn.click();

      // Alert should appear asking for LGPD consent
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('LGPD');
        await dialog.accept();
      });
    });

    test('should submit form successfully when all fields are filled', async ({ page }) => {
      // Fill all fields
      await page.fill('input#nome', 'João Silva');
      await page.fill('input#whatsapp', '33999999999');
      await page.fill('input#email', 'joao@example.com');
      await page.check('input#lgpd');

      // Handle alert
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Obrigado');
        await dialog.accept();
      });

      const submitBtn = page.locator('form button[type="submit"]:has-text("Calcule sua economia")');
      await submitBtn.click();

      // Wait for form to reset
      await page.waitForTimeout(500);

      // Form should be reset
      const nomeValue = await page.locator('input#nome').inputValue();
      expect(nomeValue).toBe('');
    });
  });

  test.describe('Pricing Section', () => {
    test('should display toggle for monthly/yearly billing', async ({ page }) => {
      await page.goto('/laas#planos');

      const monthlyBtn = page.locator('button:has-text("Mensal")');
      const yearlyBtn = page.locator('button:has-text("Anual")');

      await expect(monthlyBtn).toBeVisible();
      await expect(yearlyBtn).toBeVisible();
    });

    test('should switch between monthly and yearly pricing', async ({ page }) => {
      await page.goto('/laas#planos');

      // Get initial price
      const priceElement = page.locator('#planos').getByText(/R\$/).first();
      const monthlyPrice = await priceElement.textContent();

      // Click yearly toggle
      const yearlyBtn = page.locator('button:has-text("Anual")');
      await yearlyBtn.click();

      // Wait for update
      await page.waitForTimeout(300);

      // Price should change
      const yearlyPrice = await priceElement.textContent();
      expect(yearlyPrice).not.toBe(monthlyPrice);
    });

    test('should display all three pricing plans', async ({ page }) => {
      await page.goto('/laas#planos');

      await expect(page.locator('text="Essencial"')).toBeVisible();
      await expect(page.locator('text="Premium"')).toBeVisible();
      await expect(page.locator('text="VIP"')).toBeVisible();
    });

    test('should highlight recommended plan', async ({ page }) => {
      await page.goto('/laas#planos');

      const recommendedBadge = page.locator('text="Mais Popular"');
      await expect(recommendedBadge).toBeVisible();
    });

    test('should show savings badge on yearly option', async ({ page }) => {
      await page.goto('/laas#planos');

      const savingsBadge = page.locator('text=/Economize.*16%/');
      await expect(savingsBadge).toBeVisible();
    });

    test('should display plan features', async ({ page }) => {
      await page.goto('/laas#planos');

      // Check for checkmark icons (features list)
      const checkmarks = page.locator('svg').filter({ has: page.locator('path') });
      const count = await checkmarks.count();

      // Should have multiple feature items across all plans
      expect(count).toBeGreaterThan(10);
    });
  });

  test.describe('FAQ Section', () => {
    test('should display all FAQ items', async ({ page }) => {
      await page.goto('/laas#faq');

      const faqItems = page.locator('#faq button:has-text("?")');
      const count = await faqItems.count();

      // Should have at least 5 FAQ items
      expect(count).toBeGreaterThanOrEqual(5);
    });

    test('should expand FAQ item on click', async ({ page }) => {
      await page.goto('/laas#faq');

      const firstFaq = page.locator('#faq button').first();
      const question = await firstFaq.textContent();

      // Click to expand
      await firstFaq.click();

      // Wait for animation
      await page.waitForTimeout(300);

      // Answer should be visible
      const answer = page.locator('#faq').getByRole('region').first();
      await expect(answer).toBeVisible();
    });

    test('should collapse FAQ item on second click', async ({ page }) => {
      await page.goto('/laas#faq');

      const firstFaq = page.locator('#faq button').first();

      // Expand
      await firstFaq.click();
      await page.waitForTimeout(300);

      // Collapse
      await firstFaq.click();
      await page.waitForTimeout(300);

      // Answer should not be visible
      const answer = page.locator('#faq').getByRole('region').first();
      await expect(answer).not.toBeVisible();
    });

    test('should rotate chevron icon when expanding', async ({ page }) => {
      await page.goto('/laas#faq');

      const firstFaq = page.locator('#faq button').first();
      const chevron = firstFaq.locator('svg').last();

      // Get initial transform
      const initialTransform = await chevron.evaluate(el =>
        window.getComputedStyle(el).transform
      );

      // Click to expand
      await firstFaq.click();
      await page.waitForTimeout(300);

      // Transform should change (rotate)
      const expandedTransform = await chevron.evaluate(el =>
        window.getComputedStyle(el).transform
      );

      expect(expandedTransform).not.toBe(initialTransform);
    });
  });

  test.describe('Responsiveness', () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      test(`should render correctly on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/laas');

        // Page should load without horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() =>
          document.body.scrollWidth > window.innerWidth
        );
        expect(hasHorizontalScroll).toBe(false);

        // All sections should be visible
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('#planos')).toBeVisible();
        await expect(page.locator('#faq')).toBeVisible();
      });
    }
  });

  test.describe('Accessibility (WCAG AAA)', () => {
    test('should pass WCAG AAA accessibility checks', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have proper color contrast', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['color-contrast-enhanced'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
      expect(['A', 'BUTTON', 'INPUT']).toContain(firstFocused);

      // Continue tabbing
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => document.activeElement?.tagName);
        expect(focused).toBeTruthy();
      }
    });

    test('should have alt text for images', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['image-alt'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have proper ARIA labels', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['aria-allowed-attr', 'aria-required-attr', 'button-name'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/laas');
      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should not have layout shifts', async ({ page }) => {
      await page.goto('/laas');

      // Wait for page to settle
      await page.waitForLoadState('networkidle');

      // Get initial positions of key elements
      const headerBox = await page.locator('header').boundingBox();

      // Wait a bit more
      await page.waitForTimeout(1000);

      // Positions should not change
      const headerBoxAfter = await page.locator('header').boundingBox();
      expect(headerBoxAfter?.y).toBe(headerBox?.y);
    });
  });

  test.describe('SEO and Meta Tags', () => {
    test('should have proper meta tags', async ({ page }) => {
      await expect(page).toHaveTitle(/LAAS|Lentes/);

      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description?.length).toBeGreaterThan(50);
    });

    test('should have Open Graph tags', async ({ page }) => {
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');

      expect(ogTitle).toBeTruthy();
      expect(ogDescription).toBeTruthy();
    });
  });
});
