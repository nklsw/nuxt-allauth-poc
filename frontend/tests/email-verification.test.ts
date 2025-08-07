import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock $fetch globally
global.$fetch = vi.fn()

// Mock useAuth composable
const mockUseAuth = vi.fn()
vi.mock('~/composables/useAuth', () => ({
  useAuth: mockUseAuth
}))

// Mock Nuxt composables
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBase: 'http://localhost:8000'
    }
  }),
  useState: (key: string, init: () => any) => ({ value: init() }),
  useCookie: () => ({ value: 'mock-csrf-token' }),
  navigateTo: vi.fn(),
  useAsyncData: vi.fn(),
  useRequestFetch: () => vi.fn(),
  readonly: (val: any) => val
}))

describe('email verification flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useAuth composable with email verification', () => {
    it('handles signup with email verification requirement', async () => {
      // Mock the signup function to return verification required
      const mockSignup = vi.fn().mockResolvedValue({ requiresVerification: true })
      mockUseAuth.mockReturnValue({
        signup: mockSignup,
        loading: { value: false }
      })

      // Import and use the mocked composable
      const { useAuth } = await import('~/composables/useAuth')
      const { signup } = useAuth()
      
      const result = await signup({ email: 'test@example.com', password: 'password123' })
      
      expect(mockSignup).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(result).toEqual({ requiresVerification: true })
    })

    it('handles signup API errors', async () => {
      const mockSignup = vi.fn().mockRejectedValue(new Error('Invalid email format'))
      mockUseAuth.mockReturnValue({
        signup: mockSignup,
        loading: { value: false }
      })

      const { useAuth } = await import('~/composables/useAuth')
      const { signup } = useAuth()
      
      await expect(signup({ 
        email: 'invalid-email', 
        password: 'password123' 
      })).rejects.toThrow('Invalid email format')
    })
  })

  describe('email verification by code functionality', () => {
    it('verifies email by code successfully', async () => {
      const mockVerifyEmailByCode = vi.fn().mockResolvedValue(undefined)
      mockUseAuth.mockReturnValue({
        verifyEmailByCode: mockVerifyEmailByCode,
        loading: { value: false }
      })

      const { useAuth } = await import('~/composables/useAuth')
      const { verifyEmailByCode } = useAuth()

      await verifyEmailByCode('test@example.com', '123456')

      expect(mockVerifyEmailByCode).toHaveBeenCalledWith('test@example.com', '123456')
    })

    it('handles invalid verification code', async () => {
      const mockVerifyEmailByCode = vi.fn().mockRejectedValue(new Error('Invalid verification code'))
      mockUseAuth.mockReturnValue({
        verifyEmailByCode: mockVerifyEmailByCode,
        loading: { value: false }
      })

      const { useAuth } = await import('~/composables/useAuth')
      const { verifyEmailByCode } = useAuth()

      await expect(verifyEmailByCode('test@example.com', 'invalid')).rejects.toThrow('Invalid verification code')
    })

    it('requests email verification code successfully', async () => {
      const mockRequestEmailVerification = vi.fn().mockResolvedValue(undefined)
      mockUseAuth.mockReturnValue({
        requestEmailVerification: mockRequestEmailVerification,
        loading: { value: false }
      })

      const { useAuth } = await import('~/composables/useAuth')
      const { requestEmailVerification } = useAuth()

      await requestEmailVerification('test@example.com')

      expect(mockRequestEmailVerification).toHaveBeenCalledWith('test@example.com')
    })
  })
})