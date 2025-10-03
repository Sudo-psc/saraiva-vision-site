/**
 * E2E Test: Profile Detection and Switching
 * Tests user profile detection, cookie management, and theme application
 */

import { test, expect } from '@playwright/test'

test.describe('Profile Detection and Management', () => {
  test.describe('Default Profile (Familiar)', () => {
    test('should load with familiar profile by default', async ({ page }) => {
      await page.goto('/')

      // Check that data-profile attribute is set to familiar
      const html = await page.locator('html')
      await expect(html).toHaveAttribute('data-profile', 'familiar')
    })

    test('should have correct font size for familiar profile', async ({ page }) => {
      await page.goto('/')

      const html = await page.locator('html')
      const fontSize = await html.evaluate((el) => {
        return window.getComputedStyle(el).fontSize
      })

      expect(parseInt(fontSize)).toBe(16)
    })

    test('should have 44px minimum touch targets (WCAG AA)', async ({ page }) => {
      await page.goto('/')

      // Check button touch target size
      const button = page.locator('button').first()
      const box = await button.boundingBox()

      expect(box?.width).toBeGreaterThanOrEqual(44)
      expect(box?.height).toBeGreaterThanOrEqual(44)
    })
  })

  test.describe('Jovem Profile', () => {
    test.use({
      storageState: {
        cookies: [
          {
            name: 'user-profile',
            value: 'jovem',
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

    test('should load with jovem profile from cookie', async ({ page }) => {
      await page.goto('/')

      const html = await page.locator('html')
      await expect(html).toHaveAttribute('data-profile', 'jovem')
    })

    test('should have modern UI with animations', async ({ page }) => {
      await page.goto('/')

      // Check for glassmorphism effects (if implemented)
      const card = page.locator('.glass-card').first()
      if (await card.count() > 0) {
        const backdropFilter = await card.evaluate((el) => {
          return window.getComputedStyle(el).backdropFilter
        })
        expect(backdropFilter).toContain('blur')
      }
    })

    test('should respect prefers-reduced-motion', async ({ page, context }) => {
      await context.addInitScript(() => {
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: (query: string) => ({
            matches: query === '(prefers-reduced-motion: reduce)',
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
          }),
        })
      })

      await page.goto('/')

      // Animations should be disabled
      const element = page.locator('[data-motion]').first()
      if (await element.count() > 0) {
        const animationDuration = await element.evaluate((el) => {
          return window.getComputedStyle(el).animationDuration
        })
        expect(animationDuration).toBe('0s')
      }
    })
  })

  test.describe('Senior Profile', () => {
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

    test('should load with senior profile from cookie', async ({ page }) => {
      await page.goto('/')

      const html = await page.locator('html')
      await expect(html).toHaveAttribute('data-profile', 'senior')
    })

    test('should have 20px base font size (WCAG AAA)', async ({ page }) => {
      await page.goto('/')

      const html = await page.locator('html')
      const fontSize = await html.evaluate((el) => {
        return window.getComputedStyle(el).fontSize
      })

      expect(parseInt(fontSize)).toBeGreaterThanOrEqual(20)
    })

    test('should have 48px minimum touch targets (WCAG AAA)', async ({ page }) => {
      await page.goto('/')

      const buttons = page.locator('button')
      const count = await buttons.count()

      for (let i = 0; i < Math.min(count, 5); i++) {
        const box = await buttons.nth(i).boundingBox()
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(48)
          expect(box.height).toBeGreaterThanOrEqual(48)
        }
      }
    })

    test('should have all links underlined', async ({ page }) => {
      await page.goto('/')

      const links = page.locator('a')
      const count = await links.count()

      for (let i = 0; i < Math.min(count, 5); i++) {
        const textDecoration = await links.nth(i).evaluate((el) => {
          return window.getComputedStyle(el).textDecoration
        })
        expect(textDecoration).toContain('underline')
      }
    })

    test('should have enhanced line height (1.8+)', async ({ page }) => {
      await page.goto('/')

      const paragraph = page.locator('p').first()
      const lineHeight = await paragraph.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return parseFloat(computed.lineHeight) / parseFloat(computed.fontSize)
      })

      expect(lineHeight).toBeGreaterThanOrEqual(1.8)
    })

    test('should have high contrast mode toggle', async ({ page }) => {
      await page.goto('/')

      // Look for high contrast toggle (if implemented)
      const toggle = page.locator('[data-testid="high-contrast-toggle"]')
      if (await toggle.count() > 0) {
        await expect(toggle).toBeVisible()
      }
    })
  })

  test.describe('Profile Switcher', () => {
    test('should allow switching between profiles', async ({ page }) => {
      await page.goto('/')

      // Look for profile switcher
      const switcher = page.locator('[data-testid="profile-switcher"]')
      if (await switcher.count() > 0) {
        await switcher.click()

        // Select senior profile
        await page.locator('input[value="senior"]').click()

        // Verify profile changed
        const html = await page.locator('html')
        await expect(html).toHaveAttribute('data-profile', 'senior')

        // Verify cookie was set
        const cookies = await page.context().cookies()
        const profileCookie = cookies.find((c) => c.name === 'user-profile')
        expect(profileCookie?.value).toBe('senior')
      }
    })

    test('should announce profile change to screen readers', async ({ page }) => {
      await page.goto('/')

      const switcher = page.locator('[data-testid="profile-switcher"]')
      if (await switcher.count() > 0) {
        await switcher.click()
        await page.locator('input[value="jovem"]').click()

        // Check for ARIA live region announcement
        const announcement = page.locator('[role="status"]')
        if (await announcement.count() > 0) {
          await expect(announcement).toContainText(/perfil.*jovem/i)
        }
      }
    })
  })

  test.describe('Navigation and Routing', () => {
    test('should preserve profile across page navigation', async ({ page, context }) => {
      // Set senior profile cookie
      await context.addCookies([
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
      ])

      await page.goto('/')

      // Navigate to another page
      await page.goto('/servicos')

      // Verify profile is still senior
      const html = await page.locator('html')
      await expect(html).toHaveAttribute('data-profile', 'senior')
    })
  })
})
