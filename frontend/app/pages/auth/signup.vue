<template>
  <div class="container">
    <main>
      <article class="signup-form">
        <header>
          <h1>Sign Up</h1>
          <p>Create your account to get started.</p>
        </header>

        <form @submit.prevent="handleSignup">
          <div class="grid">
            <label for="username">
              Username (optional)
              <input
                id="username"
                v-model="form.username"
                type="text"
                name="username"
                placeholder="Enter your username"
                :disabled="loading"
              />
            </label>
          </div>

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

          <div class="grid">
            <label for="confirmPassword">
              Confirm Password
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                required
                :disabled="loading"
              />
            </label>
          </div>

          <button type="submit" :disabled="loading || !isPasswordMatch">
            {{ loading ? 'Creating account...' : 'Sign Up' }}
          </button>

          <div v-if="!isPasswordMatch && form.confirmPassword" class="warning-message">
            <p>Passwords do not match.</p>
          </div>

          <div v-if="error" class="error-message">
            <p>{{ error }}</p>
          </div>
        </form>

        <footer>
          <nav>
            <ul>
              <li><NuxtLink to="/">← Back to Home</NuxtLink></li>
              <li><NuxtLink to="/auth/login">Already have an account? Sign in</NuxtLink></li>
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

const { signup, loading } = useAuth()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const error = ref('')

const isPasswordMatch = computed(() => {
  return form.password === form.confirmPassword
})

const handleSignup = async () => {
  error.value = ''
  
  if (!isPasswordMatch.value) {
    error.value = 'Passwords do not match.'
    return
  }
  
  try {
    const credentials: any = {
      email: form.email,
      password: form.password
    }
    
    if (form.username) {
      credentials.username = form.username
    }
    
    await signup(credentials)
    
    // Redirect will be handled by the signup function
    await navigateTo('/')
  } catch (err: any) {
    error.value = err.data?.message || 'Signup failed. Please try again.'
  }
}
</script>

<style scoped>
.signup-form {
  max-width: 800px;
  margin: 2rem auto;
  padding-top: 32px;

}

</style>