export default defineNuxtPlugin(async (nuxtApp) => {
  const { refreshSession, initialized } = useAuth()

  // Skip if already initialized (prevents double initialization)
  if (initialized.value) {
    return
  }

  // Check if we have any authentication cookies first
  const sessionCookie = useCookie<string>('sessionid')
  
  // On server-side, only initialize if we have session cookies
  // This prevents unnecessary API calls during SSR
  if (process.server && !sessionCookie.value) {
    // Mark as initialized but unauthenticated
    const { initialized, user, loggedIn } = useAuth()
    initialized.value = true
    user.value = null
    loggedIn.value = false
    return
  }

  // Use useAsyncData for proper SSR/hydration handling
  try {
    await useAsyncData('auth-session-init', async () => {
      await refreshSession()
      return 'initialized'
    }, {
      default: () => null
    })
  } catch (error) {
    if (process.dev) {
      console.error('[Auth Plugin] Auth initialization failed:', error)
    }
    // Ensure initialized is set even on failure
    const { initialized } = useAuth()
    if (!initialized.value) {
      initialized.value = true
    }
  }
})