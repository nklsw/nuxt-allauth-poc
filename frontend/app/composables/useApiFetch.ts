// composables/useApiFetch.ts
import type { UseFetchOptions } from 'nuxt/app'

export const useApiFetch = <T>(
  url: string | (() => string),
  options?: UseFetchOptions<T>
) => {
  const config = useRuntimeConfig()

  return useFetch(url, {
    baseURL: config.public.apiBase,
    credentials: 'include', // Always include cookies
    onRequest({ options }) {
      // Add any additional headers if needed
      options.headers = {
        ...options.headers,
      }
    },
    onResponseError({ response }) {
      // Handle 401 errors globally
      if (response.status === 401) {
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

  return $fetch<T>(url, {
    baseURL: config.public.apiBase,
    credentials: 'include',
    onResponseError({ response }) {
      if (response.status === 401) {
        const { logout } = useAuth()
        logout()
      }
    },
    ...options,
  })
}
