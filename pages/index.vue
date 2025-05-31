<script setup lang="ts">
import { pageTitle } from '~/utils/meta'
console.log('Index Page Loaded')
const fetchApi = useApi()
interface Recipe {
  id: number
  // add other properties as needed, e.g. title: string
}

const recipes = ref<Recipe[]>([])

onMounted(async () => {
  recipes.value = await fetchApi('/recipes/')
})

useSeoMeta({
  title: pageTitle('Recent Recipes'),
  description: 'Discover the latest recipes shared by our community.',
  ogTitle: pageTitle('Recent Recipes'),
  ogDescription: 'Explore the newest recipes from our users.',
  ogImage: '/images/og-image.jpg',
  ogUrl: useRuntimeConfig().public.baseUrl + '/',
  twitterTitle: pageTitle('Recent Recipes'),
  twitterDescription: 'Check out the latest recipes shared by our community.',
  twitterImage: '/images/twitter-image.jpg',
  twitterCard: 'summary_large_image'
})

useHead({
  htmlAttrs: {
    lang: 'en'
  },
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: '/favicon.png'
    }
  ]
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-4">Recent Recipes</h1>
    <RecipeCard v-for="r in recipes" :key="r.id" :recipe="r" />
  </div>
</template>