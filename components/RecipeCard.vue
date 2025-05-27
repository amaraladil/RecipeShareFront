<!-- components/RecipeCard.vue -->
<template>
  <div class="bg-white shadow-md rounded-xl overflow-hidden mb-4">
    <img :src="recipe.image || '/default-recipe.jpg'" alt="Recipe image" class="w-full h-48 object-cover" />
    <div class="p-4">
      <h2 class="text-xl font-semibold">{{ recipe.title }}</h2>
      <p class="text-sm text-gray-600 truncate">{{ recipe.description }}</p>
      <div class="mt-2 text-sm text-gray-500 flex justify-between">
        <span>{{ recipe.likes || 0 }} likes</span>
        <span>{{ recipe.comments || 0 }} comments</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  recipe: {
    type: Object,
    required: true
  }
})
</script>