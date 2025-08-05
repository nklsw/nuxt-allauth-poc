export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn, loading, refreshSession } = useAuth()

  // Skip if already checking
  if (loading.value) return

  // If not logged in and we haven't checked yet, try to refresh session
  if (!loggedIn.value && process.server) {
    console.log('Refreshing session on server-side middleware')
    await refreshSession()
  }

  // After checking, if still not logged in, redirect to login
  if (!loggedIn.value) {
    return navigateTo('/auth/login')
  }
})
