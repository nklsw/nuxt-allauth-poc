// composables/useAuth.ts
import type { Ref } from 'vue'

interface User {
  id: string
  email: string
  username: string
  // Add other user properties as needed
}

interface AuthState {
  user: Ref<User | null>
  loggedIn: Ref<boolean>
  loading: Ref<boolean>
}

export const useAuth = (): AuthState & {
  login: (credentials: { email: string; password: string }) => Promise<void>
  signup: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
} => {
  const user = useState<User | null>('auth.user', () => null)
  const loggedIn = useState<boolean>('auth.loggedIn', () => false)
  const loading = useState<boolean>('auth.loading', () => false)

  const config = useRuntimeConfig()
  const requestFetch = useRequestFetch()
  const csrfCookie = useCookie<string>('csrftoken')

  // Login function
  const login = async (credentials: { email: string; password: string }) => {
    loading.value = true
    console.log('Logging in with credentials:', credentials.email)

    if (!csrfCookie.value) {
      try {
        await $fetch(`${config.public.apiBase}/_allauth/browser/v1/auth/login`, {
          method: 'OPTIONS',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
      }
      catch {
        console.log("error") // can be ignored as csrf cookie is send anyways
      }

    }


    try {
      const response = await $fetch(`${config.public.apiBase}/_allauth/browser/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfCookie.value ?? '' },
        body: credentials,
        credentials: 'include', // Important for cookies
      })

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

    if (!csrfCookie.value) {
      try {
        await $fetch(`${config.public.apiBase}/_allauth/browser/v1/auth/signup`, {
          method: 'OPTIONS',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
      }
      catch {
        console.log("error") // can be ignored as csrf cookie is send anyways
      }
    }

    try {
      const response = await $fetch(`${config.public.apiBase}/_allauth/browser/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfCookie.value ?? '' },
        body: credentials,
        credentials: 'include', // Important for cookies
      })

      // After successful signup, fetch user data
      await refreshSession()
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Logout function
  const logout = async () => {
    loading.value = true
    try {
      // Ensure CSRF cookie is set
      await $fetch(`${config.public.apiBase}/_allauth/browser/v1/auth/session`, {
        method: 'OPTIONS',
        credentials: 'include'
      })

      await $fetch(`${config.public.apiBase}/_allauth/browser/v1/auth/session`, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': csrfCookie.value ?? '' },
        credentials: 'include',
      })

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
      // On server-side, use requestFetch to forward cookies
      const fetchMethod = process.server ? requestFetch : $fetch

      // Fetch session and unwrap API response
      const resp = await fetchMethod<{
        status: number
        data: { user: User; methods: any[] }
        meta: { is_authenticated: boolean }
      }>(
        `${config.public.apiBase}/_allauth/browser/v1/auth/session`,
        { credentials: 'include' }
      )
      user.value = resp.data.user
      loggedIn.value = resp.meta.is_authenticated
    } catch (error) {
      // If fetching user fails, assume not logged in
      user.value = null
      loggedIn.value = false
    } finally {
      loading.value = false
    }
  }

  return {
    user: readonly(user),
    loggedIn: readonly(loggedIn),
    loading: readonly(loading),
    login,
    signup,
    logout,
    refreshSession,
  }
}
