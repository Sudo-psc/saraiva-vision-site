import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env.RESEND_API_KEY = 'test-api-key'
process.env.DOCTOR_EMAIL = 'test@example.com'
process.env.RATE_LIMIT_WINDOW = '15'
process.env.RATE_LIMIT_MAX = '5'

// Mock fetch for API tests
global.fetch = vi.fn()

// Setup cleanup after each test
afterEach(() => {
    vi.clearAllMocks()
})