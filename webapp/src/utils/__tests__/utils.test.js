import { describe, it, expect } from 'vitest'

// Mock utility functions for testing
const mockUtils = {
  cn: (...classes) => classes.filter(Boolean).join(' '),
  formatDate: (date) => new Date(date).toLocaleDateString(),
  validateEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  truncateText: (text, maxLength) => 
    text.length <= maxLength ? text : text.slice(0, maxLength) + '...',
  generateSlug: (text) => 
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('combines multiple class names', () => {
      const result = mockUtils.cn('class1', 'class2', 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('filters out falsy values', () => {
      const result = mockUtils.cn('class1', null, 'class2', undefined, 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('handles empty input', () => {
      const result = mockUtils.cn()
      expect(result).toBe('')
    })
  })

  describe('formatDate', () => {
    it('formats valid dates', () => {
      const date = '2024-01-15'
      const result = mockUtils.formatDate(date)
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })

    it('handles Date objects', () => {
      const date = new Date('2024-01-15')
      const result = mockUtils.formatDate(date)
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })
  })

  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(mockUtils.validateEmail('user@example.com')).toBe(true)
      expect(mockUtils.validateEmail('test.email+tag@domain.co.uk')).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      expect(mockUtils.validateEmail('invalid-email')).toBe(false)
      expect(mockUtils.validateEmail('user@')).toBe(false)
      expect(mockUtils.validateEmail('@domain.com')).toBe(false)
      expect(mockUtils.validateEmail('')).toBe(false)
    })
  })

  describe('truncateText', () => {
    it('truncates long text', () => {
      const text = 'This is a very long text that needs to be truncated'
      const result = mockUtils.truncateText(text, 20)
      expect(result).toBe('This is a very long ...')
    })

    it('returns original text if shorter than max length', () => {
      const text = 'Short text'
      const result = mockUtils.truncateText(text, 20)
      expect(result).toBe('Short text')
    })

    it('handles edge case of exact length', () => {
      const text = 'Exact length text'
      const result = mockUtils.truncateText(text, 17)
      expect(result).toBe('Exact length text')
    })
  })

  describe('generateSlug', () => {
    it('converts text to URL-friendly slug', () => {
      const result = mockUtils.generateSlug('Hello World! This is a Test')
      expect(result).toBe('hello-world-this-is-a-test')
    })

    it('handles special characters', () => {
      const result = mockUtils.generateSlug('Special Characters: @#$%^&*()')
      expect(result).toBe('special-characters')
    })

    it('removes leading and trailing dashes', () => {
      const result = mockUtils.generateSlug('  Leading and trailing spaces  ')
      expect(result).toBe('leading-and-trailing-spaces')
    })
  })
})