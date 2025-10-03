/**
 * Playwright Configuration for Multi-Profile E2E Testing
 * Tests three user profiles: familiar, jovem, senior
 */

import { defineConfig, devices } from '@playwright/test'

const PORT = process.env.PORT || 3000
const baseURL = process.env.BASE_URL || `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',

  // Maximum time one test can run
  timeout: 60 * 1000,

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['list'],
  ],

  // Shared settings for all projects
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Collect console logs and network activity
    contextOptions: {
      recordVideo: {
        dir: 'playwright-report/videos',
      },
    },
  },

  // Project configurations for different profiles and devices
  projects: [
    // ============================================
    // FAMILIAR PROFILE - Desktop (WCAG AA)
    // ============================================
    {
      name: 'familiar-desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
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
      },
    },
    {
      name: 'familiar-desktop-firefox',
      use: {
        ...devices['Desktop Firefox'],
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
      },
    },
    {
      name: 'familiar-desktop-webkit',
      use: {
        ...devices['Desktop Safari'],
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
      },
    },

    // ============================================
    // JOVEM PROFILE - Mobile + Desktop (WCAG AA)
    // ============================================
    {
      name: 'jovem-mobile-chrome',
      use: {
        ...devices['Pixel 5'],
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
      },
    },
    {
      name: 'jovem-mobile-safari',
      use: {
        ...devices['iPhone 13'],
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
      },
    },
    {
      name: 'jovem-desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
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
      },
    },

    // ============================================
    // SENIOR PROFILE - Desktop + Tablet (WCAG AAA)
    // ============================================
    {
      name: 'senior-desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }, // Larger viewport for better readability
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
      },
    },
    {
      name: 'senior-tablet-ipad',
      use: {
        ...devices['iPad Pro'],
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
      },
    },
    {
      name: 'senior-desktop-firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
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
      },
    },

    // ============================================
    // ACCESSIBILITY TESTING (All Profiles)
    // ============================================
    {
      name: 'a11y-familiar',
      use: {
        ...devices['Desktop Chrome'],
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
      },
      testMatch: '**/*.a11y.spec.ts',
    },
    {
      name: 'a11y-senior',
      use: {
        ...devices['Desktop Chrome'],
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
      },
      testMatch: '**/*.a11y.spec.ts',
    },
  ],

  // Web server configuration (for local development)
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
