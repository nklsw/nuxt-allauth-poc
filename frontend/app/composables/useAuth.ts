// composables/useAuth.ts
import type { Ref } from 'vue'
import type { 
  AllauthUser, 
  AllauthAuthenticatedResponse, 
  AllauthAuthenticationResponse,
  AllauthApiError 
} from '~/types/auth'

// Legacy interface for backward compatibility
interface User {
  id: string
  email: string
  username: string
}

interface AuthState {
  user: Ref<User | null>
  loggedIn: Ref<boolean>
  loading: Ref<boolean>
  initialized: Ref<boolean>
}

export const useAuth = (): AuthState & {
  login: (credentials: { email: string; password: string }) => Promise<void>
  signup: (credentials: { email: string; password: string }) => Promise<{ requiresVerification?: boolean }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  verifyEmail: (key: string) => Promise<void>
  verifyEmailByCode: (email: string, code: string) => Promise<void>
  requestEmailVerification: (email: string) => Promise<void>
  requestLoginCode: (email: string) => Promise<void>
  loginWithCode: (code: string) => Promise<void>
} => {
  const user = useState<User | null>('auth.user', () => null)
  const loggedIn = useState<boolean>('auth.loggedIn', () => false)
  const loading = useState<boolean>('auth.loading', () => false)
  const initialized = useState<boolean>('auth.initialized', () => false)

  // Login function
  const login = async (credentials: { email: string; password: string }) => {
    loading.value = true
    console.log('Logging in with credentials:', credentials.email)

    try {
      await $apiFetch<AllauthAuthenticatedResponse>(
        '/_allauth/browser/v1/auth/login',
        {
          method: 'POST',
          body: credentials,
        }
      )

      // After successful login, fetch user data
      await refreshSession()
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Signup function
  const signup = async (credentials: { email: string; password: string }) => {
    loading.value = true
    console.log('Signing up with credentials:', credentials.email)

    try {
      const response = await $apiFetch<AllauthAuthenticatedResponse>(
        '/_allauth/browser/v1/auth/signup',
        {
          method: 'POST',
          body: credentials,
        }
      )

      console.log('Signup response:', response)
      
      // With mandatory email verification, user is not automatically logged in
      // Return status indicating verification is required
      return { requiresVerification: true }
    } catch (error: any) {
      console.error('Signup response error:', error)
      console.error('Error status:', error.status)
      console.error('Error data:', error.data)
      
      // Check if this is the expected "verify_email" pending response (401 with verify_email flow)
      if (error.status === 401 && error.data?.data?.flows) {
        const verifyEmailFlow = error.data.data.flows.find((flow: any) => flow.id === 'verify_email')
        if (verifyEmailFlow && verifyEmailFlow.is_pending) {
          console.log('Signup successful, email verification required')
          return { requiresVerification: true }
        }
      }
      
      // Re-throw actual errors
      throw {
        ...error,
        data: {
          message: error.data?.message || error.statusText || 'Signup failed. Please try again.'
        }
      }
    } finally {
      loading.value = false
    }
  }

  // Logout function
  const logout = async () => {
    loading.value = true
    try {
      try {
        await $apiFetch('/_allauth/browser/v1/auth/session', {
          method: 'DELETE',
        })
      } catch (error: any) {
        // 401 is expected after successful logout, so we can ignore it
        if (error?.status !== 401) {
          throw error
        }
      }

      // Clear local state
      user.value = null
      loggedIn.value = false

      // Navigate to login
      await navigateTo('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if logout fails on backend, clear local state
      user.value = null
      loggedIn.value = false
    } finally {
      loading.value = false
    }
  }

  // Refresh session - fetch current user data
  const refreshSession = async () => {
    loading.value = true
    
    try {
      // Use useApiFetch for consistent API calls
      const { data: response, error } = await useApiFetch<AllauthAuthenticatedResponse>(
        '/_allauth/browser/v1/auth/session'
      )

      if (error.value) {
        throw new Error(`Session API error: ${error.value}`)
      }
      
      if (!response.value) {
        throw new Error('Failed to fetch session data')
      }

      user.value = response.value.data.user as User
      loggedIn.value = response.value.meta.is_authenticated
      
      if (process.dev) {
        console.log('[Auth] Session refreshed:', { loggedIn: loggedIn.value, userId: user.value?.id })
      }
    } catch (error: any) {
      if (process.dev) {
        console.log('[Auth] Session refresh failed:', error.message || error)
      }
      // If fetching user fails, assume not logged in
      user.value = null
      loggedIn.value = false
    } finally {
      loading.value = false
      initialized.value = true // Mark as initialized regardless of success/failure
    }
  }

  // Email verification function
  const verifyEmail = async (key: string) => {
    loading.value = true
    try {
      console.log('Verifying email with key:', key)
      
      const response = await $apiFetch<AllauthAuthenticatedResponse>(
        '/_allauth/browser/v1/auth/email/verify',
        {
          method: 'POST',
          body: { key },
        }
      )
      
      console.log('Email verification response:', response)
      
      // If verification successful and user is now authenticated, update auth state
      if (response?.meta?.is_authenticated && response?.data?.user) {
        user.value = response.data.user as User
        loggedIn.value = true
        console.log('User authenticated after email verification')
      }
    } catch (error: any) {
      console.error('Email verification failed:', error)
      console.error('Error status:', error.status)
      console.error('Error data:', error.data)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Email verification by code function
  const verifyEmailByCode = async (email: string, code: string) => {
    loading.value = true
    try {
      console.log('Verifying email by code for:', email)
      
      const response = await $apiFetch<AllauthAuthenticatedResponse>(
        '/_allauth/browser/v1/auth/email/verify',
        {
          method: 'POST',
          body: { key: code },
        }
      )
      
      console.log('Email verification by code response:', response)
      
      // If verification successful and user is now authenticated, update auth state
      if (response?.meta?.is_authenticated && response?.data?.user) {
        user.value = response.data.user as User
        loggedIn.value = true
        console.log('User authenticated after email verification by code')
      }
    } catch (error: any) {
      console.error('Email verification by code failed:', error)
      console.error('Error status:', error.status)
      console.error('Error data:', error.data)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Request email verification function
  const requestEmailVerification = async (email: string) => {
    loading.value = true
    try {
      console.log('Requesting email verification for:', email)
      
      const response = await $apiFetch(
        '/_allauth/browser/v1/auth/email/verify/resend',
        {
          method: 'POST',
        }
      )
      
      console.log('Request email verification response:', response)
    } catch (error: any) {
      console.error('Request email verification failed:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Request login code function
  const requestLoginCode = async (email: string) => {
    loading.value = true
    try {
      console.log('Requesting login code for:', email)
      
      const response = await $apiFetch(
        '/_allauth/browser/v1/auth/code/request',
        {
          method: 'POST',
          body: { email },
        }
      )
      
      console.log('Request login code response:', response)
    } catch (error: any) {
      console.error('Request login code response:', error)
      console.error('Error status:', error.status)
      console.error('Error data:', error.data)
      
      // Check if this is the expected "login_by_code" pending response (401 with login_by_code flow)
      if (error.status === 401 && error.data?.data?.flows) {
        const loginByCodeFlow = error.data.data.flows.find((flow: any) => flow.id === 'login_by_code')
        if (loginByCodeFlow && loginByCodeFlow.is_pending) {
          console.log('Login code request successful, code sent')
          return // Success case - don't throw error
        }
      }
      
      // Re-throw actual errors
      throw {
        ...error,
        data: {
          message: error.data?.message || error.statusText || 'Failed to send login code. Please try again.'
        }
      }
    } finally {
      loading.value = false
    }
  }

  // Login with code function
  const loginWithCode = async (code: string) => {
    loading.value = true
    try {
      console.log('Logging in with code')
      
      const response = await $apiFetch<AllauthAuthenticatedResponse>(
        '/_allauth/browser/v1/auth/code/confirm',
        {
          method: 'POST',
          body: { code },
        }
      )
      
      console.log('Login with code response:', response)
      
      // Update auth state if login was successful
      if (response?.meta?.is_authenticated && response?.data?.user) {
        user.value = response.data.user as User
        loggedIn.value = true
        console.log('User authenticated via login code')
      }
    } catch (error: any) {
      console.error('Login with code failed:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    user: readonly(user),
    loggedIn: readonly(loggedIn),
    loading: readonly(loading),
    initialized: readonly(initialized),
    login,
    signup,
    logout,
    refreshSession,
    verifyEmail,
    verifyEmailByCode,
    requestEmailVerification,
    requestLoginCode,
    loginWithCode,
  }
}
