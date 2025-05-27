<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r p-4">
      <div class="text-xl font-bold mb-4">RecipeShare</div>
      <nav class="flex flex-col gap-2">
        <NuxtLink to="/" class="hover:underline">Home</NuxtLink>
        <NuxtLink to="/explore" class="hover:underline">Explore</NuxtLink>
        <template v-if="!userLoading">
          <NuxtLink
            v-if="!user"
            @click="openLogin"
            class="text-blue-600 cursor-pointer"
          >Login</NuxtLink>
          <button
            v-else
            @click="logout"
            class="text-red-600"
          >Logout</button>
        </template>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <NuxtPage />
    </main>

    <!-- Auth Modal -->
    <AuthModal v-if="authVisible" @close="authVisible = false" />
  </div>
</template>

<script setup lang="ts">
import AuthModal from '../components/AuthModal.vue'

const { $supabase } = useNuxtApp()
import { useSupabaseUser } from '~/composables/useSupabaseUser'

const user = useSupabaseUser($supabase)
const userLoading = ref(true)
const authVisible = ref(false)

onMounted(async () => {
  // Wait for Supabase to load session
  await $supabase.auth.getSession()
  userLoading.value = false
})


const openLogin = () => {
  authVisible.value = true
}

const logout = async () => {
  await $supabase.auth.signOut()
  authVisible.value = false
}
</script>