/**
 * Middleware Profile Detection Tests
 * Tests user profile detection and cookie management
 */

import { describe, it, expect, beforeEach } from '@jest/globals'

describe('Middleware Profile Detection', () => {
  beforeEach(() => {
    // Clear cookies before each test
    if (typeof document !== 'undefined') {
      document.cookie.split(';').forEach((cookie) => {
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      })
    }
  })

  describe('Profile Detection from Cookies', () => {
    it('should detect familiar profile from cookie', () => {
      const cookie = 'user-profile=familiar'
      const profile = extractProfileFromCookie(cookie)
      expect(profile).toBe('familiar')
    })

    it('should detect jovem profile from cookie', () => {
      const cookie = 'user-profile=jovem'
      const profile = extractProfileFromCookie(cookie)
      expect(profile).toBe('jovem')
    })

    it('should detect senior profile from cookie', () => {
      const cookie = 'user-profile=senior'
      const profile = extractProfileFromCookie(cookie)
      expect(profile).toBe('senior')
    })

    it('should default to familiar when no cookie present', () => {
      const cookie = ''
      const profile = extractProfileFromCookie(cookie)
      expect(profile).toBe('familiar')
    })

    it('should default to familiar when invalid profile in cookie', () => {
      const cookie = 'user-profile=invalid'
      const profile = extractProfileFromCookie(cookie)
      expect(profile).toBe('familiar')
    })
  })

  describe('Profile Detection from User Agent', () => {
    it('should detect senior profile from senior-friendly UA keywords', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; AccessibilityMode)'
      const profile = detectProfileFromUserAgent(userAgent)
      expect(profile).toBe('senior')
    })

    it('should detect jovem profile from mobile devices', () => {
      const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
      const profile = detectProfileFromUserAgent(userAgent)
      expect(profile).toBe('jovem')
    })

    it('should default to familiar for standard desktop browsers', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      const profile = detectProfileFromUserAgent(userAgent)
      expect(profile).toBe('familiar')
    })
  })

  describe('Cookie Creation and Management', () => {
    it('should create valid profile cookie', () => {
      const cookie = createProfileCookie('senior')
      expect(cookie).toContain('user-profile=senior')
      expect(cookie).toContain('path=/')
      expect(cookie).toContain('max-age=31536000') // 1 year
    })

    it('should set secure flag in production', () => {
      const cookie = createProfileCookie('familiar', true)
      expect(cookie).toContain('Secure')
      expect(cookie).toContain('SameSite=Strict')
    })

    it('should not set secure flag in development', () => {
      const cookie = createProfileCookie('familiar', false)
      expect(cookie).not.toContain('Secure')
      expect(cookie).toContain('SameSite=Lax')
    })
  })

  describe('Profile Validation', () => {
    it('should validate familiar as valid profile', () => {
      expect(isValidProfile('familiar')).toBe(true)
    })

    it('should validate jovem as valid profile', () => {
      expect(isValidProfile('jovem')).toBe(true)
    })

    it('should validate senior as valid profile', () => {
      expect(isValidProfile('senior')).toBe(true)
    })

    it('should reject invalid profile strings', () => {
      expect(isValidProfile('invalid')).toBe(false)
      expect(isValidProfile('')).toBe(false)
      expect(isValidProfile(null as any)).toBe(false)
      expect(isValidProfile(undefined as any)).toBe(false)
    })
  })
})

// Helper functions (these would be in actual middleware)
type UserProfile = 'familiar' | 'jovem' | 'senior'

function extractProfileFromCookie(cookieString: string): UserProfile {
  const match = cookieString.match(/user-profile=([^;]+)/)
  if (!match) return 'familiar'

  const profile = match[1]
  return isValidProfile(profile) ? profile : 'familiar'
}

function detectProfileFromUserAgent(userAgent: string): UserProfile {
  const ua = userAgent.toLowerCase()

  // Senior profile indicators
  if (ua.includes('accessibilitymode') || ua.includes('highcontrast')) {
    return 'senior'
  }

  // Jovem profile indicators (mobile devices)
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'jovem'
  }

  return 'familiar'
}

function createProfileCookie(profile: UserProfile, isProduction = false): string {
  const parts = [
    `user-profile=${profile}`,
    'path=/',
    'max-age=31536000', // 1 year
  ]

  if (isProduction) {
    parts.push('Secure')
    parts.push('SameSite=Strict')
  } else {
    parts.push('SameSite=Lax')
  }

  return parts.join('; ')
}

function isValidProfile(profile: any): profile is UserProfile {
  return ['familiar', 'jovem', 'senior'].includes(profile)
}
