export default defineNuxtPlugin(async (nuxtApp) => {
  const { refreshSession } = useAuth()

  // Only refresh session on initial client load
  // The server-side session check is handled in the middleware
  if (!nuxtApp.ssrContext) {
    await refreshSession()
  }
})