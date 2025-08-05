<template>
  <div class="container">
    <main>
      <article class="login-form">
        <header>
          <h1>Login</h1>
          <p>Welcome back! Please sign in to your account.</p>
        </header>

        <form @submit.prevent="handleLogin">
          <div class="grid">
            <label for="email">
              Email
              <input
                id="email"
                v-model="form.email"
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                :disabled="loading"
              />
            </label>
          </div>

          <div class="grid">
            <label for="password">
              Password
              <input
                id="password"
                v-model="form.password"
                type="password"
                name="password"
                placeholder="Enter your password"
                required
                :disabled="loading"
              />
            </label>
          </div>

          <button type="submit" :disabled="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>

          <div v-if="error" class="error-message">
            <p>{{ error }}</p>
          </div>
        </form>

        <footer>
          <nav>
            <ul>
              <li><NuxtLink to="/">← Back to Home</NuxtLink></li>
              <li><NuxtLink to="/signup">Don't have an account? Sign up</NuxtLink></li>
            </ul>
          </nav>
        </footer>
      </article>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
})

const { login, loading } = useAuth()

const form = reactive({
  email: '',
  password: ''
})

const error = ref('')

const handleLogin = async () => {
  error.value = ''
  
  try {
    await login({
      email: form.email,
      password: form.password
    })
    
    // Redirect will be handled by the login function
    await navigateTo('/')
  } catch (err: any) {
    error.value = err.data?.message || 'Login failed. Please try again.'
  }
}
</script>

<style scoped>
.login-form {
  max-width: 800px;
  margin: 2rem auto;
  padding-top: 32px;
}

</style>