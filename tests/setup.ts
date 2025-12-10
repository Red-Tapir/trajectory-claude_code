import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'

// Mock environment variables
beforeAll(() => {
  process.env.NEXTAUTH_URL = 'http://localhost:3000'
  process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only'
  process.env.DATABASE_URL = 'file:./test.db'
})

// Clean up after each test
afterEach(() => {
  // Reset mocks if needed
})

// Clean up after all tests
afterAll(() => {
  // Clean up test database if needed
})
