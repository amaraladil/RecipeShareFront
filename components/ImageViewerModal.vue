<script setup lang="ts">
  interface Props {
    imageUrl: string
    title?: string
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    close: []
  }>()

  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      emit('close')
    }
  }

  // Close on escape key
  onMounted(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        emit('close')
      }
    }
    window.addEventListener('keydown', handleEscape)

    onUnmounted(() => {
      window.removeEventListener('keydown', handleEscape)
    })
  })
</script>

<template>
  <div
    @click="emit('close')"
    class="fixed inset-0 z-50 h-full flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out"
  >
    <!-- Close Button -->
    <button
      @click="emit('close')"
      class="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors cursor-pointer z-10"
    >
      <UIcon name="ic:outline-close" class="size-6 text-white" />
    </button>

    <!-- Image Title -->
    <div
      @click="handleBackdropClick"
      v-if="title"
      class="absolute top-4 left-4 px-4 py-2 rounded-lg bg-black/50 backdrop-blur-sm"
    >
      <p class="text-white font-medium">{{ title }}</p>
    </div>

    <!-- Image Container -->
    <div class="relative max-w-7xl max-h-[90vh] cursor-default" @click.stop>
      <img
        :src="imageUrl"
        :alt="title || 'Recipe image'"
        class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
      />
    </div>

    <!-- Instructions -->
    <div
      @click="emit('close')"
      class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-black/50 backdrop-blur-sm"
    >
      <p class="text-white text-sm">Click outside or press ESC to close</p>
    </div>
  </div>
</template>
