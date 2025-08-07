<template>
  <div>
    <main class="container">
      <section>
        <h2>Authentication Status</h2>
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

      <section v-if="loggedIn && user">
        <h2>User Information</h2>
        <article>
          <header>User Details</header>
          <p><strong>ID:</strong> {{ user.id }}</p>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Username:</strong> {{ user.username }}</p>
        </article>
      </section>

      <section>
        <h2>Actions</h2>
        <div class="grid" v-if="loggedIn">
          <NuxtLink to="/example" role="button">Example</NuxtLink>
          <button @click="handleLogout" :disabled="loading" class="secondary">
            {{ loading ? 'Logging out...' : 'Logout' }}
          </button>
        </div>
        <div class="grid" v-else>
          <NuxtLink to="/example" role="button">Example</NuxtLink>
          <NuxtLink to="/auth/login" role="button">Login</NuxtLink>
          <NuxtLink to="/auth/signup" role="button" class="secondary">Sign Up</NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, loggedIn, loading, logout } = useAuth()

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