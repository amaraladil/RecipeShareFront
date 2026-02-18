<template>
  <!-- Something has went wrong-->
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-6xl font-bold text-red-500 mb-4">
      Error {{ error.statusCode }}
    </h1>
    <p class="text-xl text-gray-700 mb-8">{{ error.message }}</p>
    <nuxt-link
      to="/"
      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
    >
      Go Home
    </nuxt-link>
  </div>
</template>

<script setup lang="ts">
  import type { NuxtError } from 'nuxt/app'
  defineProps({
    error: {
      type: Object as () => NuxtError,
      required: true
    }
  })
</script>

<style lang="scss" scoped></style>
