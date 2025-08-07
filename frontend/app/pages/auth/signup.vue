<template>
  <div class="container">
    <main>
      <article class="signup-form">
        <div>
          <h1>Sign Up</h1>
          <p>Create your account to get started.</p>
        </div>

        <!-- Verification Code Input -->
        <div v-if="showVerificationMessage" data-testid="verification-message">
          <h2>📧 Enter verification code</h2>
          <p>We've sent a verification code to <strong>{{ form.email }}</strong>.</p>
          <p>Please enter the 6-digit code to activate your account:</p>
          
          <form @submit.prevent="handleVerifyCode">
            <div class="grid">
              <label for="verificationCode">
                Verification Code
                <input
                  id="verificationCode"
                  v-model="verificationCode"
                  type="text"
                  name="verificationCode"
                  placeholder="Enter 6-digit code"
                  maxlength="6"
                  required
                  :disabled="verifyingCode"
                />
              </label>
            </div>

            <button type="submit" :disabled="verifyingCode || !verificationCode">
              {{ verifyingCode ? 'Verifying...' : 'Verify Code' }}
            </button>

            <div v-if="verificationError" class="error-message">
              <p>{{ verificationError }}</p>
            </div>
          </form>
          
          <footer>
            <nav>
              <ul>
                <li><button @click="handleResendCode" type="button" :disabled="verifyingCode">Resend code</button></li>
                <li><button @click="showVerificationMessage = false" type="button">← Back to signup</button></li>
              </ul>
            </nav>
          </footer>
        </div>

        <!-- Signup Form -->
        <form v-else @submit.prevent="handleSignup">
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

        <footer v-if="!showVerificationMessage">
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

const { signup, verifyEmailByCode, requestEmailVerification, loading } = useAuth()

const form = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const error = ref('')
const showVerificationMessage = ref(false)
const verificationCode = ref('')
const verificationError = ref('')
const verifyingCode = ref(false)

const isPasswordMatch = computed(() => {
  return form.password === form.confirmPassword
})

const handleSignup = async () => {
  error.value = ''
  showVerificationMessage.value = false
  
  if (!isPasswordMatch.value) {
    error.value = 'Passwords do not match.'
    return
  }
  
  try {
    const credentials: any = {
      email: form.email,
      password: form.password
    }
    
    const result = await signup(credentials)
    
    // Show verification message instead of redirecting
    if (result?.requiresVerification) {
      showVerificationMessage.value = true
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Signup failed. Please try again.'
  }
}

const handleVerifyCode = async () => {
  verificationError.value = ''
  verifyingCode.value = true
  
  try {
    await verifyEmailByCode(form.email, verificationCode.value)
    // Verification successful - redirect to homepage or login
    await navigateTo('/')
  } catch (err: any) {
    verificationError.value = err.data?.message || 'Invalid verification code. Please try again.'
  } finally {
    verifyingCode.value = false
  }
}

const handleResendCode = async () => {
  try {
    await requestEmailVerification(form.email)
    verificationError.value = ''
    // Show success message or toast
    console.log('Verification code resent')
  } catch (err: any) {
    verificationError.value = 'Failed to resend code. Please try again.'
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