<template>
  <div class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl p-6 w-[90%] max-w-sm relative">
      <button @click="$emit('close')" class="absolute top-2 right-2 text-gray-500">&times;</button>
      <h2 class="text-xl font-bold mb-4">{{ isLogin ? 'Login' : 'Register' }}</h2>

      <button @click="signInWithProvider('google')" class="btn w-full mb-2">Continue with Google</button>
      <button @click="signInWithProvider('apple')" class="btn w-full mb-4">Continue with Apple</button>

      <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>

      <input v-model="email" placeholder="Email" class="input mb-2" type="email" />
      <input v-model="password" placeholder="Password" class="input mb-4" type="password" />

      <button @click="handleSubmit" class="btn w-full">
        {{ isLogin ? 'Login' : 'Register' }}
      </button>

      <p class="text-sm text-center mt-4">
        {{ isLogin ? "Don't have an account?" : 'Already registered?' }}
        <span @click="toggle" class="text-blue-600 cursor-pointer underline ml-1">
          {{ isLogin ? 'Register' : 'Login' }}
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $supabase } = useNuxtApp()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const error = ref('')

const toggle = () => {
  isLogin.value = !isLogin.value
}

const handleSubmit = async () => {
  const method = isLogin.value ? 'signInWithPassword' : 'signUp'
  const { error: err } = await $supabase.auth[method]({ email: email.value, password: password.value })
  if (err) {
    error.value = err.message
  } else {
    location.reload()
  }
}

const signInWithProvider = async (provider: 'google' | 'apple') => {
  const { error } = await $supabase.auth.signInWithOAuth({ provider })
  if (error) alert(error.message)
}
</script>