<template>
  <div
    :class="[
      'flex items-center justify-center rounded-full overflow-hidden flex-shrink-0'
    ]"
  >
    <img
      v-if="avatarUrl"
      :src="avatarUrl"
      :alt="alt || 'User avatar'"
      class="size-full object-cover"
    />
    <Icon v-else name="heroicons:user-circle" class="size-full text-gray-400" />
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{
    avatarUrl?: string | null
    alt?: string
  }>()
</script>
