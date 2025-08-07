export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn, loading, initialized } = useAuth()

  // Skip if already checking
  if (loading.value) {
    return
  }

  // Wait for auth initialization to complete
  if (!initialized.value) {
    // On server side, initialization should complete quickly
    // On client side, give it a reasonable timeout  
    const maxWaitTime = process.server ? 500 : 3000
    const startTime = Date.now()

    while (!initialized.value && (Date.now() - startTime) < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // If still not initialized after timeout, assume unauthenticated
    if (!initialized.value) {
      if (process.dev) {
        console.warn('[Auth Middleware] Auth initialization timeout - redirecting to login')
      }
      return navigateTo('/auth/login')
    }
  }

  // Now check if user is authenticated
  if (!loggedIn.value) {
    return navigateTo('/auth/login')
  }
})
