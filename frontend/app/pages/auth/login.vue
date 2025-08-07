<template>
  <div class="container">
    <main>
      <article class="login-form">
        <div>
          <h1>Login</h1>
          <p>Welcome back! Please sign in to your account.</p>
        </div>

        <!-- Mode Toggle -->
        <div v-if="!showCodeInput" class="mode-toggle">
          <nav>
            <ul>
              <li>
                <button 
                  @click="switchToPasswordMode" 
                  :class="{ active: loginMode === 'password' }"
                  type="button"
                >
                  Password
                </button>
              </li>
              <li>
                <button 
                  @click="switchToCodeMode" 
                  :class="{ active: loginMode === 'code' }"
                  type="button"
                >
                  Email Code
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <!-- Code Verification Input (similar to signup verification) -->
        <div v-if="showCodeInput" data-testid="code-verification">
          <h2>📧 Enter login code</h2>
          <p>We've sent a login code to <strong>{{ form.email }}</strong>.</p>
          <p>Please enter the 6-digit code to sign in:</p>
          
          <form @submit.prevent="handleVerifyCode">
            <div class="grid">
              <label for="loginCode">
                Login Code
                <input
                  id="loginCode"
                  v-model="loginCode"
                  type="text"
                  name="loginCode"
                  placeholder="Enter 6-digit code"
                  maxlength="6"
                  required
                  :disabled="verifyingCode"
                />
              </label>
            </div>

            <button type="submit" :disabled="verifyingCode || !loginCode">
              {{ verifyingCode ? 'Verifying...' : 'Sign In' }}
            </button>

            <div v-if="codeError" class="error-message">
              <p>{{ codeError }}</p>
            </div>
          </form>
          
          <footer>
            <nav>
              <ul>
                <li><button @click="handleResendCode" type="button" :disabled="verifyingCode">Resend code</button></li>
                <li><button @click="showCodeInput = false" type="button">← Back to email input</button></li>
              </ul>
            </nav>
          </footer>
        </div>

        <!-- Password Login Form -->
        <form v-else-if="loginMode === 'password'" @submit.prevent="handleLogin">
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

        <!-- Code Login Form -->
        <form v-else-if="loginMode === 'code'" @submit.prevent="handleRequestCode">
          <div class="grid">
            <label for="codeEmail">
              Email
              <input
                id="codeEmail"
                v-model="form.email"
                type="email"
                name="codeEmail"
                placeholder="Enter your email"
                required
                :disabled="requestingCode"
              />
            </label>
          </div>

          <button type="submit" :disabled="requestingCode || !form.email">
            {{ requestingCode ? 'Sending code...' : 'Send Login Code' }}
          </button>

          <div v-if="error" class="error-message">
            <p>{{ error }}</p>
          </div>
        </form>

        <footer v-if="!showCodeInput">
          <nav>
            <ul>
              <li><NuxtLink to="/">← Back to Home</NuxtLink></li>
              <li><NuxtLink to="/auth/signup">Don't have an account? Sign up</NuxtLink></li>
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

const { login, loading, requestLoginCode, loginWithCode } = useAuth()

const form = reactive({
  email: '',
  password: ''
})

const error = ref('')
const loginMode = ref<'password' | 'code'>('password')
const showCodeInput = ref(false)
const loginCode = ref('')
const codeError = ref('')
const requestingCode = ref(false)
const verifyingCode = ref(false)

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

const handleRequestCode = async () => {
  error.value = ''
  codeError.value = ''
  requestingCode.value = true
  
  try {
    await requestLoginCode(form.email)
    showCodeInput.value = true
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to send login code. Please try again.'
  } finally {
    requestingCode.value = false
  }
}

const handleVerifyCode = async () => {
  codeError.value = ''
  verifyingCode.value = true
  
  try {
    await loginWithCode(loginCode.value)
    await navigateTo('/')
  } catch (err: any) {
    codeError.value = err.data?.message || 'Invalid code. Please try again.'
  } finally {
    verifyingCode.value = false
  }
}

const handleResendCode = async () => {
  try {
    await requestLoginCode(form.email)
    codeError.value = ''
    console.log('Login code resent')
  } catch (err: any) {
    codeError.value = 'Failed to resend code. Please try again.'
  }
}

const switchToPasswordMode = () => {
  loginMode.value = 'password'
  showCodeInput.value = false
  loginCode.value = ''
  codeError.value = ''
  error.value = ''
}

const switchToCodeMode = () => {
  loginMode.value = 'code'
  error.value = ''
}
</script>

<style scoped>
.login-form {
  max-width: 800px;
  margin: 2rem auto;
  padding-top: 32px;
}

.mode-toggle {
  margin-bottom: 2rem;
}

.mode-toggle nav ul {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.mode-toggle nav li {
  list-style: none;
}

.mode-toggle button {
  background-color: var(--pico-secondary-background);
  border: 1px solid var(--pico-secondary-border);
  color: var(--pico-secondary);
  padding: 0.5rem 1rem;
  border-radius: var(--pico-border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-toggle button.active {
  background-color: var(--pico-primary-background);
  border-color: var(--pico-primary-border);
  color: var(--pico-primary-inverse);
}

.mode-toggle button:hover:not(.active) {
  background-color: var(--pico-secondary-hover-background);
}
</style>