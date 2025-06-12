<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <aside class="w-64 bg-white dark:bg-black dark:text-white border-r p-4">
      <template v-if="!userLoading">
      <div class="text-xl font-bold mb-4">RecipeShare</div>
      <nav class="flex flex-col gap-2">
        <NuxtLink to="/" class="hover:underline ">Home</NuxtLink>
        <NuxtLink to="/explore" class="hover:underline ">Explore</NuxtLink>
        <UButton icon="typcn:home-outline" size="xl" color="neutral" variant="solid">Home</UButton>
        <UButton icon="teenyicons:compass-outline" size="xl" color="neutral" variant="solid">Explore</UButton>
        <UButton icon="ri:edit-line" size="xl" color="neutral" variant="solid">write</UButton>
        <template v-if="!userLoading">
          <NuxtLink
            v-if="!user"
            @click="openLogin"
            class="text-blue-600 cursor-pointer"
          >Login</NuxtLink>
          <template v-else>
            <UButton icon="ci:user" size="xl" color="neutral" variant="solid">Profile</UButton>
            <button
              @click="logout"
              class="rounded-md bg-red-600 px-4 py-2 font-bold leading-none text-white"
            >Logout</button>
            

          </template>
          
        </template>
        
        
      </nav>
      </template>
      <div v-else class="flex flex-col gap-2">
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
        <USkeleton class="h-6 w-[223px]" />
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <NuxtPage />
    </main>

    <AuthModal v-if="authVisible" @close="closeAuthModal" />
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
const closeAuthModal = () => authVisible.value = false

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