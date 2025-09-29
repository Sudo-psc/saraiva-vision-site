// src/lib/__tests__/date.test.js
import { describe, it, expect, vi } from 'vitest'
import { formatDate, getWeekdays } from '../date.js'

describe('formatDate', () => {
  it('should format valid ISO date string', () => {
    const dateString = '2023-12-25T10:30:00.000Z'
    const result = formatDate(dateString)
    expect(result).toBe('25/12/2023')
  })

  it('should format Date object', () => {
    const date = new Date('2023-12-25T10:30:00.000Z')
    const result = formatDate(date)
    expect(result).toBe('25/12/2023')
  })

  it('should handle custom format', () => {
    const dateString = '2023-12-25T10:30:00.000Z'
    const result = formatDate(dateString, 'DD-MM-YYYY')
    expect(result).toBe('25-12-2023')
  })

  it('should return empty string for invalid date', () => {
    expect(formatDate('invalid-date')).toBe('')
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('')).toBe('')
  })

  it('should handle error gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Test with a very invalid input that might cause dayjs to throw
    const result = formatDate('not-a-date-at-all')

    expect(result).toBe('')
    consoleSpy.mockRestore()
  })
})

describe('getWeekdays', () => {
  it('should return array of 7 weekdays', () => {
    const weekdays = getWeekdays()
    expect(weekdays).toHaveLength(7)
    expect(weekdays[0]).toBe('domingo')
    expect(weekdays[6]).toBe('sábado')
  })

  it('should handle errors with fallback', () => {
    // Mock console.error to avoid noise in tests
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // The function has a try/catch with fallback so it should always return valid weekdays
    const weekdays = getWeekdays()
    expect(weekdays).toHaveLength(7)
    expect(Array.isArray(weekdays)).toBe(true)

    consoleSpy.mockRestore()
  })
})