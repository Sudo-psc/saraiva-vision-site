/**
 * E2E Accessibility Tests using Playwright and axe-core
 * Tests WCAG compliance across all profiles
 */

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Compliance', () => {
  test.describe('Familiar Profile - WCAG AA', () => {
    test.use({
      storageState: {
        cookies: [
          {
            name: 'user-profile',
            value: 'familiar',
            domain: 'localhost',
            path: '/',
            expires: -1,
            httpOnly: false,
            secure: false,
            sameSite: 'Lax',
          },
        ],
        origins: [],
      },
    })

    test('should pass WCAG AA accessibility checks on homepage', async ({ page }) => {
      await page.goto('/')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have minimum 4.5:1 color contrast for normal text', async ({ page }) => {
      await page.goto('/')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('body')
        .analyze()

      const contrastViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === 'color-contrast',
      )

      expect(contrastViolations).toHaveLength(0)
    })

    test('should have keyboard-accessible navigation', async ({ page }) => {
      await page.goto('/')

      // Tab through focusable elements
      await page.keyboard.press('Tab')
      const firstFocused = await page.evaluate(() => document.activeElement?.tagName)

      expect(['A', 'BUTTON', 'INPUT']).toContain(firstFocused)
    })

    test('should have skip navigation link', async ({ page }) => {
      await page.goto('/')

      // Press Tab to focus skip link
      await page.keyboard.press('Tab')

      const skipLink = page.locator('a[href="#main-content"]')
      if (await skipLink.count() > 0) {
        await expect(skipLink).toBeFocused()

        // Activate skip link
        await page.keyboard.press('Enter')

        // Verify main content is focused
        const mainContent = page.locator('#main-content')
        await expect(mainContent).toBeFocused()
      }
    })

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['heading-order'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have alt text for all images', async ({ page }) => {
      await page.goto('/')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['image-alt'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have labels for all form inputs', async ({ page }) => {
      await page.goto('/')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['label'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })
  })

  test.describe('Senior Profile - WCAG AAA', () => {
    test.use({
      storageState: {
        cookies: [
          {
            name: 'user-profile',
            value: 'senior',
            domain: 'localhost',
            path: '/',
            expires: -1,
            httpOnly: false,
            secure: false,
            sameSite: 'Lax',
          },
        ],
        origins: [],
      },
    })

    test('should pass WCAG AAA accessibility checks', async ({ page }) => {
      await page.goto('/')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have minimum 7:1 color contrast for normal text', async ({ page }) => {
      await page.goto('/')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['color-contrast-enhanced'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have visible focus indicators on all interactive elements', async ({
      page,
    }) => {
      await page.goto('/')

      // Get all focusable elements
      const focusableElements = await page.locator(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      const count = await focusableElements.count()

      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = focusableElements.nth(i)
        await element.focus()

        // Check for visible focus outline
        const outline = await element.evaluate((el) => {
          const styles = window.getComputedStyle(el)
          return {
            outlineWidth: styles.outlineWidth,
            outlineStyle: styles.outlineStyle,
            outlineColor: styles.outlineColor,
          }
        })

        // Focus indicator should be visible
        expect(outline.outlineStyle).not.toBe('none')
        expect(parseInt(outline.outlineWidth)).toBeGreaterThanOrEqual(2)
      }
    })

    test('should support high contrast mode', async ({ page }) => {
      await page.goto('/')

      // Look for high contrast toggle
      const toggle = page.locator('[data-testid="high-contrast-toggle"]')

      if (await toggle.count() > 0) {
        // Enable high contrast mode
        await toggle.check()

        // Verify high contrast styles applied
        const html = await page.locator('html')
        await expect(html).toHaveAttribute('data-high-contrast', 'true')

        // Re-run contrast checks
        const accessibilityScanResults = await new AxeBuilder({ page })
          .withRules(['color-contrast-enhanced'])
          .analyze()

        expect(accessibilityScanResults.violations).toEqual([])
      }
    })
  })

  test.describe('Screen Reader Support', () => {
    test('should have proper ARIA landmarks', async ({ page }) => {
      await page.goto('/')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['region', 'landmark-unique'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have ARIA labels for interactive elements', async ({ page }) => {
      await page.goto('/')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['aria-allowed-attr', 'aria-required-attr', 'aria-valid-attr'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should announce dynamic content changes', async ({ page }) => {
      await page.goto('/')

      // Look for ARIA live regions
      const liveRegions = page.locator('[aria-live]')
      if (await liveRegions.count() > 0) {
        const ariaLive = await liveRegions.first().getAttribute('aria-live')
        expect(['polite', 'assertive']).toContain(ariaLive)
      }
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('should navigate through all interactive elements with Tab', async ({ page }) => {
      await page.goto('/')

      const focusableElements = await page.locator(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )

      const count = await focusableElements.count()

      // Tab through first 10 elements
      for (let i = 0; i < Math.min(count, 10); i++) {
        await page.keyboard.press('Tab')
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
        expect(focusedElement).toBeTruthy()
      }
    })

    test('should navigate backwards with Shift+Tab', async ({ page }) => {
      await page.goto('/')

      // Tab forward first
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Tab backward
      await page.keyboard.press('Shift+Tab')

      const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement)
    })

    test('should have no keyboard traps', async ({ page }) => {
      await page.goto('/')

      // Open a modal if available
      const modalTrigger = page.locator('[data-testid="modal-trigger"]')
      if (await modalTrigger.count() > 0) {
        await modalTrigger.click()

        // Try to escape with Esc key
        await page.keyboard.press('Escape')

        // Modal should be closed
        const modal = page.locator('[role="dialog"]')
        await expect(modal).not.toBeVisible()
      }
    })
  })

  test.describe('Mobile Accessibility', () => {
    test.use({
      viewport: { width: 375, height: 667 }, // iPhone SE size
    })

    test('should have appropriate touch target sizes on mobile', async ({ page }) => {
      await page.goto('/')

      const buttons = page.locator('button')
      const count = await buttons.count()

      for (let i = 0; i < Math.min(count, 5); i++) {
        const box = await buttons.nth(i).boundingBox()
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44)
          expect(box.height).toBeGreaterThanOrEqual(44)
        }
      }
    })

    test('should be responsive and not require horizontal scrolling', async ({ page }) => {
      await page.goto('/')

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth
      })

      expect(hasHorizontalScroll).toBe(false)
    })
  })
})
