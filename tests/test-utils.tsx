/**
 * Custom Testing Utilities
 * Provides helpers for rendering components with providers
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Define user profiles
export type UserProfile = 'familiar' | 'jovem' | 'senior'

interface ProfileProviderProps {
  children: React.ReactNode
  initialProfile?: UserProfile
}

/**
 * Mock ProfileProvider for tests
 * In actual implementation, this would be imported from @/contexts/ProfileContext
 */
function ProfileProvider({ children, initialProfile = 'familiar' }: ProfileProviderProps) {
  return <div data-profile={initialProfile}>{children}</div>
}

interface AllTheProvidersProps {
  children: React.ReactNode
  profile?: UserProfile
}

/**
 * Wrapper with all providers needed for tests
 */
function AllTheProviders({ children, profile = 'familiar' }: AllTheProvidersProps) {
  return (
    <ProfileProvider initialProfile={profile}>
      {children}
    </ProfileProvider>
  )
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  profile?: UserProfile
}

/**
 * Custom render function with providers
 * Usage: render(<Component />, { profile: 'senior' })
 */
function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions,
) {
  const { profile = 'familiar', ...renderOptions } = options || {}

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders profile={profile}>{children}</AllTheProviders>
    ),
    ...renderOptions,
  })
}

/**
 * Helper to wait for loading states
 */
export async function waitForLoadingToFinish() {
  const { waitFor } = await import('@testing-library/react')
  return waitFor(() => {
    const loadingElements = document.querySelectorAll('[aria-busy="true"]')
    expect(loadingElements).toHaveLength(0)
  })
}

/**
 * Helper to simulate user profile cookie
 */
export function setProfileCookie(profile: UserProfile) {
  document.cookie = `user-profile=${profile}; path=/`
}

/**
 * Helper to clear all cookies
 */
export function clearCookies() {
  document.cookie.split(';').forEach((cookie) => {
    const eqPos = cookie.indexOf('=')
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
  })
}

/**
 * Helper to check color contrast ratios
 */
export function calculateContrastRatio(foreground: string, background: string): number {
  // Simplified contrast calculation for testing
  // In production, use a proper WCAG contrast calculator
  const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = (rgb >> 0) & 0xff
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Helper to check WCAG compliance level
 */
export function checkWCAGCompliance(
  contrastRatio: number,
  level: 'AA' | 'AAA',
  textSize: 'normal' | 'large',
): boolean {
  if (level === 'AAA') {
    return textSize === 'large' ? contrastRatio >= 4.5 : contrastRatio >= 7
  }
  return textSize === 'large' ? contrastRatio >= 3 : contrastRatio >= 4.5
}

/**
 * Helper to simulate keyboard navigation
 */
export async function simulateKeyboardNavigation(
  element: HTMLElement,
  key: string,
  options?: { shiftKey?: boolean; ctrlKey?: boolean },
) {
  const { fireEvent } = await import('@testing-library/react')
  fireEvent.keyDown(element, {
    key,
    code: key,
    ...options,
  })
}

/**
 * Helper to check if element is keyboard accessible
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tabIndex = element.getAttribute('tabindex')
  const role = element.getAttribute('role')
  const interactiveRoles = ['button', 'link', 'textbox', 'checkbox', 'radio', 'menuitem']

  // Check if naturally focusable
  const focusableElements = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']
  if (focusableElements.includes(element.tagName)) {
    return true
  }

  // Check if has tabindex >= 0 or interactive role
  return (
    (tabIndex !== null && parseInt(tabIndex) >= 0) ||
    (role !== null && interactiveRoles.includes(role))
  )
}

/**
 * Helper to check touch target size (WCAG 2.5.5)
 */
export function checkTouchTargetSize(
  element: HTMLElement,
  minSize: number = 44,
): boolean {
  const rect = element.getBoundingClientRect()
  return rect.width >= minSize && rect.height >= minSize
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'

// Override render with custom render
export { customRender as render }
