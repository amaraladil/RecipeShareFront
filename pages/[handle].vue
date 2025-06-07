<script setup lang="ts">
import { useRecipes } from '@/composables/useRecipes'
import { pageTitle } from '~/utils/meta'
const config = useRuntimeConfig();

const route = useRoute()
const handle = route.params.handle.toString().replace(/^@/, '')

const profile = ref<any>(null)
const profileLoading = ref(true)

const {
  posts,
  liked,
  saved,
  fetchPosts,
  fetchLiked,
  fetchSaved,
  isLoading
} = useRecipes(handle)

onMounted(async () => {
  await fetchPosts()
  try {
    const { data } = await useFetch(`/users/handle/${handle}`)
    profile.value = data.value
  } catch (e) {
    profile.value = null
  } finally {
    profileLoading.value = false
  }
})

const activeTab = ref('posts')

watch(activeTab, async (tab) => {
  if (tab === 'liked') await fetchLiked()
  if (tab === 'saved') await fetchSaved()
})

useSeoMeta({
  title: pageTitle(`@${handle} - Profile`),
  description: '[description]',
  ogTitle: pageTitle(`@${handle} - Profile`),
  ogDescription: '[og:description]',
  ogImage: '[og:image]',
  ogUrl: config.public.baseUrl + route.path,
  twitterTitle: pageTitle(`@${handle} - Profile`),
  twitterDescription: '[twitter:description]',
  twitterImage: '[twitter:image]',
  twitterCard: 'summary'
})
</script>

<template>
  <div>
    <div v-if="profileLoading" class="mb-4">Loading profile...</div>
    <div v-else-if="profile">
      <!-- Profile Info -->
      <div class="flex items-center gap-4 mb-6">
        <img
          v-if="profile.avatar_url"
          :src="profile.avatar_url"
          alt="Profile picture"
          class="w-20 h-20 rounded-full object-cover border"
        />
        <div>
          <div class="text-2xl font-bold">@{{ profile.username }}</div>
          <div class="text-lg text-gray-700">{{ profile.nickname }}</div>
          <div class="text-gray-500">{{ profile.bio }}</div>
        </div>
      </div>
      <!-- Tabs and recipes as before -->
      <div class="tabs flex gap-2 mb-4">
        <button
          @click="activeTab = 'posts'"
          :class="activeTab === 'posts' ? 'bg-blue-600 text-white font-bold px-4 py-2 rounded' : 'bg-gray-200 text-gray-700 px-4 py-2 rounded'"
        >
          Posts
        </button>
        <button
          @click="activeTab = 'liked'"
          :class="activeTab === 'liked' ? 'bg-blue-600 text-white font-bold px-4 py-2 rounded' : 'bg-gray-200 text-gray-700 px-4 py-2 rounded'"
        >
          Liked
        </button>
        <button
          @click="activeTab = 'saved'"
          :class="activeTab === 'saved' ? 'bg-blue-600 text-white font-bold px-4 py-2 rounded' : 'bg-gray-200 text-gray-700 px-4 py-2 rounded'"
        >
          Saved
        </button>
      </div>
      <div v-if="isLoading">Loading...</div>
      <div v-else>
        <RecipeCard v-for="recipe in activeTab === 'posts' ? posts : activeTab === 'liked' ? liked : saved" :key="recipe._id" :recipe="recipe" />
      </div>
    </div>
    <div
      v-else
      class="flex flex-col items-center justify-center min-h-[40vh] mb-4 text-xl font-bold"
    >
      Couldn't find this account.
    </div>
  </div>
</template>