<!-- components/RecipeCard.vue -->
<template>
  <div class="bg-white shadow-md rounded-xl overflow-hidden mb-4">
    <div class="relative">
      <img
        :src="recipe.image || ''"
        alt="Recipe image"
        class="w-full h-48 object-cover"
      />
      <div
        v-if="recipe.status == 2"
        class="absolute mt-1 top-2 left-1 size-10 backdrop-blur-sm bg-blue-800/50 rounded-full flex items-center justify-center"
      >
        <Icon
          name="bi:eye-slash"
          class="size-7 text-gray-100 backdrop-blur-2xl"
        />
      </div>
      <div class="absolute mt-1 top-2 right-1 flex gap-1">
        <Icon
          v-if="recipe.is_saved"
          name="ic:outline-bookmark"
          class="size-5 text-gray-900/90 dark:text-gray-300"
        />
        <Icon
          v-if="recipe.is_liked"
          name="ic:outline-favorite"
          class="size-5 text-red-600"
        />
      </div>
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
