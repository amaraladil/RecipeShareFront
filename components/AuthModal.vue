<template>
  <div class="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl p-6 w-[90%] max-w-sm relative">
      <button @click="$emit('close')" class="absolute top-2 right-2 text-gray-500">&times;</button>
      <h2 class="text-xl font-bold mb-4">{{ isLogin ? 'Login' : 'Register' }}</h2>

      <button
    class="flex items-center bg-white border border-gray-300 rounded-lg shadow-md max-w-xs px-6 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
    <svg class="h-6 w-6 mr-2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="-0.5 0 48 48" version="1.1">

        <g id="Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="Color-" transform="translate(-401.000000, -860.000000)">
                <g id="Google" transform="translate(401.000000, 860.000000)">
                    <path
                        d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24"
                        id="Fill-1" fill="#FBBC05"> </path>
                    <path
                        d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333"
                        id="Fill-2" fill="#EB4335"> </path>
                    <path
                        d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667"
                        id="Fill-3" fill="#34A853"> </path>
                    <path
                        d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24"
                        id="Fill-4" fill="#4285F4"> </path>
                </g>
            </g>
        </g>
    </svg>
    <span>Continue with Google</span>
</button>

      <button @click="signInWithProvider('google')" class="px-4 py-2 border flex gap-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150">
        <img class="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo">
        <span>Continue with Google</span>
      </button>
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
const emits = defineEmits(['close'])


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
    emits('close')
    location.reload()
  }
}

const signInWithProvider = async (provider: 'google' | 'apple') => {
  const { error } = await $supabase.auth.signInWithOAuth({ provider })
  if (error) alert(error.message)
}
</script>