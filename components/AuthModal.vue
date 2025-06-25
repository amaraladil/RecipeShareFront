<template>
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200"
    >
      <!-- Close button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Icon
          name="heroicons:x-mark"
          class="w-5 h-5 text-gray-500 dark:text-gray-400"
        />
      </button>

      <div class="p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {{ isLogin ? 'Welcome back' : 'Create account' }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ isLogin ? 'Sign in to your account' : `Join ${appName} today` }}
          </p>
        </div>

        <!-- Social Login Buttons -->
        <div class="space-y-3 mb-6">
          <!-- Google Button -->
          <button
            @click="signInWithProvider('google')"
            :disabled="loading"
            class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <!-- Apple Button -->
          <button
            @click="signInWithProvider('apple')"
            :disabled="loading"
            class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-black hover:bg-gray-800 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="simple-icons:apple" class="w-5 h-5 mr-3" />
            Continue with Apple
          </button>
        </div>

        <!-- Divider -->
        <div class="relative mb-6">
          <div class="absolute inset-0 flex items-center">
            <div
              class="w-full border-t border-gray-300 dark:border-gray-600"
            ></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span
              class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            >
              Or continue with email
            </span>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        >
          <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Email Input -->
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              :class="[
                'w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
                emailError
                  ? 'border-red-300 dark:border-red-600'
                  : 'border-gray-300 dark:border-gray-600'
              ]"
              placeholder="Enter your email"
              @blur="validateEmailField"
            />
            <p
              v-if="emailError"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ emailError }}
            </p>
          </div>

          <!-- Password Input -->
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                :class="[
                  'w-full px-4 py-3 pr-12 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
                  passwordError
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                ]"
                placeholder="Enter your password"
                @blur="validatePasswordField"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Icon
                  :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'"
                  class="w-5 h-5"
                />
              </button>
            </div>
            <p
              v-if="passwordError"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ passwordError }}
            </p>
            <p
              v-else-if="!isLogin"
              class="mt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              Must be at least 6 characters with letters and numbers
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center"
          >
            <div
              v-if="loading"
              class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
            ></div>
            {{ isLogin ? 'Sign in' : 'Create account' }}
          </button>
        </form>

        <!-- Toggle Login/Register -->
        <p class="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          {{ isLogin ? "Don't have an account?" : 'Already have an account?' }}
          <button
            @click="toggle"
            class="text-blue-600 hover:text-blue-700 font-medium ml-1 hover:underline"
          >
            {{ isLogin ? 'Sign up' : 'Sign in' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const { appName } = useAppSettings()
  const { $supabase } = useNuxtApp()
  const { validateEmail, validatePassword } = useValidation()
  const emits = defineEmits(['close'])

  const isLogin = ref(true)
  const email = ref('')
  const password = ref('')
  const error = ref('')
  const loading = ref(false)
  const showPassword = ref(false)

  // Field-specific errors
  const emailError = ref('')
  const passwordError = ref('')

  const toggle = () => {
    isLogin.value = !isLogin.value
    clearErrors()
  }

  const clearErrors = () => {
    error.value = ''
    emailError.value = ''
    passwordError.value = ''
  }

  // Real-time validation
  const validateEmailField = () => {
    const validation = validateEmail(email.value.trim())
    emailError.value = validation.error || ''
    return validation.isValid
  }

  const validatePasswordField = () => {
    const validation = validatePassword(password.value, !isLogin.value)
    passwordError.value = validation.error || ''
    return validation.isValid
  }

  // Validate form before submission
  const validateForm = () => {
    const isEmailValid = validateEmailField()
    const isPasswordValid = validatePasswordField()

    return isEmailValid && isPasswordValid
  }

  const handleSubmit = async () => {
    if (loading.value) return

    clearErrors()

    // Validate form
    if (!validateForm()) {
      return
    }

    loading.value = true

    try {
      const method = isLogin.value ? 'signInWithPassword' : 'signUp'
      const { error: err } = await $supabase.auth[method]({
        email: email.value.trim(),
        password: password.value
      })

      if (err) {
        error.value = err.message
      } else {
        emits('close')
        if (!isLogin.value) {
          // For signup, show a success message or redirect
          // Auto login happens via Supabase auth state change
        }
        location.reload()
      }
    } catch (err) {
      error.value = 'An unexpected error occurred. Please try again.'
    } finally {
      loading.value = false
    }
  }

  const signInWithProvider = async (provider: 'google' | 'apple') => {
    if (loading.value) return

    loading.value = true
    error.value = ''

    try {
      const { error: providerError } = await $supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (providerError) {
        error.value = providerError.message
      }
    } catch (err) {
      error.value = 'Failed to authenticate with provider. Please try again.'
    } finally {
      loading.value = false
    }
  }

  // Clear field errors when user starts typing
  watch(email, () => {
    if (emailError.value) emailError.value = ''
    if (error.value) error.value = ''
  })

  watch(password, () => {
    if (passwordError.value) passwordError.value = ''
    if (error.value) error.value = ''
  })
</script>

<style scoped>
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes zoom-in {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }

  .animate-in {
    animation: fade-in 0.2s ease-out, zoom-in 0.2s ease-out;
  }
</style>
