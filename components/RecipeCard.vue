<!-- components/RecipeCard.vue -->
<template>
  <div class="bg-white shadow-md rounded-xl overflow-hidden mb-4">
    <div class="relative">
      <img
        :src="recipe.image || '/default-recipe.jpg'"
        alt="Recipe image"
        class="w-full h-48 object-cover"
      />

      <UIcon
        v-if="recipe.is_saved"
        name="ic:outline-bookmark"
        class="size-5 absolute top-1 right-1"
      />
    </div>
    <div class="p-4">
      <!-- <h2 class="text-xl font-semibold">{{ recipe.title }}</h2> -->
      <NuxtLink
        :to="`/recipes/${recipe.slug}`"
        class="text-xl font-semibold text-blue-600 hover:underline cursor-pointer"
      >
        {{ recipe.title }}
      </NuxtLink>
      <p class="text-sm text-gray-600 truncate">{{ recipe.description }}</p>
      <div class="mt-2 text-sm text-gray-500 flex justify-between">
        <span>{{ recipe.counter.likes || 0 }} likes</span>
        <span>{{ recipe.counter.comments || 0 }} comments</span>
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
