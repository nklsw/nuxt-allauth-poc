<template>
  <div>
    <main class="container">
      <section>
        <h2>Secure Example Page</h2>
        <div v-if="loading" class="loading">
          <p>Loading...</p>
        </div>
        <div v-else>
          <p>
            <strong>Status: </strong> 
            <span :class="loggedIn ? 'success' : 'error'">
              {{ loggedIn ? 'Logged In' : 'Not Logged In' }}
            </span>
          </p>
        </div>
      </section>

      <section>
        <h2>Actions</h2>
        <div class="grid" v-if="loggedIn">
            <NuxtLink to="/" role="button">Home</NuxtLink>
            <button @click="handleLogout" :disabled="loading" class="secondary">
                {{ loading ? 'Logging out...' : 'Logout' }}
            </button>
        </div>
        <div class="grid" v-else>
          <NuxtLink to="/auth/login" role="button">Login</NuxtLink>
          <NuxtLink to="/auth/signup" role="button" class="secondary">Sign Up</NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, loggedIn, loading, logout } = useAuth()

definePageMeta({
  middleware: 'auth'
})

const handleLogout = async () => {
  try {
    await logout()
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>
<style scoped>
.container {
    max-width: 800px;
    padding-top: 32px;

}
</style>