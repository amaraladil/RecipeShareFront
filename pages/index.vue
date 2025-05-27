<script setup lang="ts">
const fetchApi = useApi()
const recipes = ref([])

onMounted(async () => {
  recipes.value = await fetchApi('/recipes/recent')
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-4">Recent Recipes</h1>
    <RecipeCard v-for="r in recipes" :key="r._id" :recipe="r" />
  </div>
</template>