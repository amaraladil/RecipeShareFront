<script setup lang="ts">
console.log('Index Page Loaded')
const fetchApi = useApi()
const recipes = ref([])

onMounted(async () => {
  recipes.value = await fetchApi('/recipes/')
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-4">Recent Recipes</h1>
    <RecipeCard v-for="r in recipes" :key="r.id" :recipe="r" />
  </div>
</template>