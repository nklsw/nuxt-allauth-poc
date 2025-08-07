// composables/useApiFetch.ts
import type { UseFetchOptions } from 'nuxt/app'

export const useApiFetch = <T>(
  url: string | (() => string),
  options?: UseFetchOptions<T>
) => {
  const config = useRuntimeConfig()
  const csrfToken = useCookie<string>('csrftoken')

  return useFetch(url, {
    baseURL: config.public.apiBase,
    credentials: 'include', // Always include cookies
    // Headers will be set in onRequest to handle SSR properly
    onRequest({ options }) {
      // Set headers in onRequest for better SSR compatibility
      const currentCsrfToken = useCookie<string>('csrftoken')
      const sessionCookie = useCookie<string>('sessionid')
      
      // Handle headers properly for different types
      const headers: Record<string, string> = {}
      
      // Copy existing headers if they exist
      if (options.headers) {
        if (options.headers instanceof Headers) {
          options.headers.forEach((value, key) => {
            headers[key] = value
          })
        } else {
          Object.assign(headers, options.headers)
        }
      }
      
      headers['Content-Type'] = 'application/json'
      
      // Add CSRF token if available
      const token = currentCsrfToken.value || csrfToken.value
      if (token) {
        headers['X-CSRFToken'] = token
      }

      // During SSR, manually forward cookies since 'credentials: include' might not work
      if (process.server) {
        try {
          const event = useRequestEvent()
          if (event && event.node && event.node.req && event.node.req.headers) {
            const cookieHeader = event.node.req.headers.cookie
            if (cookieHeader) {
              headers['Cookie'] = cookieHeader
            }
          }
        } catch (error) {
          // Silently fail if we can't get cookies - not critical
        }
      }

      // Set the headers back
      options.headers = headers as any

      // Log for debugging in development
      if (process.dev) {
        console.log(`[API] ${options.method || 'GET'} ${url}`, {
          hasCSRF: !!token,
          hasSessionCookie: !!sessionCookie.value,
          isServer: process.server
        })
      }
    },
    onResponseError({ response }) {
      // Handle 401 errors globally for authenticated requests
      // Skip logout for auth endpoints to allow proper flow handling
      if (response.status === 401 && !url.toString().includes('/_allauth/')) {
        const { logout } = useAuth()
        logout()
      }
    },
    ...options,
  })
}

// For direct API calls without useFetch
export const $apiFetch = <T>(url: string, options?: any) => {
  const config = useRuntimeConfig()
  const csrfToken = useCookie<string>('csrftoken')

  return $fetch<T>(url, {
    baseURL: config.public.apiBase,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken.value || '',
      ...options?.headers,
    },
    onResponseError({ response }) {
      // Handle 401 errors globally for authenticated requests
      // Skip logout for auth endpoints to allow proper flow handling
      if (response.status === 401 && !url.includes('/_allauth/')) {
        const { logout } = useAuth()
        logout()
      }
    },
    ...options,
  })
}
