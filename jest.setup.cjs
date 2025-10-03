/**
 * Jest Setup File
 * Configures testing environment and global mocks
 */

require('@testing-library/jest-dom')

// Environment variables for tests
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-maps-key'
process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY = 'test-places-key'
process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID = 'test-place-id'
process.env.RESEND_API_KEY = 'test-resend-key'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Suppress console errors in tests (optional)
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
