import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation(query => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(), // deprecated
    dispatchEvent: vi.fn(),
    matches: false,
    media: query,
    onchange: undefined,
    removeEventListener: vi.fn(),
    removeListener: vi.fn() // deprecated
  })),
  writable: true
})

Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true })

Object.defineProperty(window, 'SERVER_VARIABLES', {
  value: {
    isPro: '0'
  },
  writable: true
})
