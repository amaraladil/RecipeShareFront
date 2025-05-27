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
import { ref, onMounted } from 'vue'
import AuthModal from '../components/AuthModal.vue'
import { useSupabaseUser } from '~/composables/useSupabaseUser'

const { user, fetchUser } = useSupabaseUser()
const { $supabase } = useNuxtApp()
// console.log('Supabase Client on defaultvue: ', $supabase)

const userLoading = ref(true)
const authVisible = ref(false)

onMounted(async () => {
  // Wait for Supabase to load session
  await fetchUser()
  // if (user){
  //   console.log('Fetch User:', user)
  // }
  // console.log('Supabase Client default mounted: ', (await $supabase.auth.getSession()).data.session?.access_token)
  userLoading.value = false
})


const openLogin = () => {
  authVisible.value = true
}

const logout = async () => {
  await $supabase.auth.signOut()
  authVisible.value = false
  user.value = null
  location.reload() // Reload to update user state
}
</script>