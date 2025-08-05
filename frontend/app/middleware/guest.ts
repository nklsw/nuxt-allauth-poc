export default defineNuxtRouteMiddleware((to, from) => {
  const { loggedIn } = useAuth()

  // If already logged in, redirect to dashboard
  if (loggedIn.value) {
    return navigateTo('/')
  }
})
