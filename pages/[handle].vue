<script setup lang="ts">
import { useRecipes } from '@/composables/useRecipes'
import { pageTitle } from '~/utils/meta'
const config = useRuntimeConfig();

const route = useRoute()
const handle = route.params.handle.toString().replace(/^@/, '')

// const { data: profile } = await useFetch(`/api/users/handle/${handle}`)

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
    <h2>@{{ handle }}</h2>
    <div class="tabs">
      <button @click="activeTab = 'posts'">Posts</button>
      <button @click="activeTab = 'liked'">Liked</button>
      <button @click="activeTab = 'saved'">Saved</button>
    </div>

    <div v-if="isLoading">Loading...</div>
    <div v-else>
      <RecipeCard v-for="recipe in activeTab === 'posts' ? posts : activeTab === 'liked' ? liked : saved" :key="recipe._id" :recipe="recipe" />
    </div>
  </div>
</template>