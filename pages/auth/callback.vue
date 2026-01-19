<template>
  <div class="flex items-center justify-center flex-col h-full">
    <h2 class="flex text-xl font-semibold mb-4">Welcome to {{ appName }}</h2>
    <p class="flex text-gray-600">One moment while we authenticate you...</p>
  </div>
</template>

<script setup lang="ts">
  const { $supabase } = useNuxtApp()
  const { appName } = useAppSettings()
  const router = useRouter()
  const route = useRoute()
  const code = route.query.code as string
  await $supabase.auth.exchangeCodeForSession(code)
  router.back()
</script>
