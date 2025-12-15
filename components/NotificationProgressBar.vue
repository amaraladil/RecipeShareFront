<template>
  <div
    class="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10"
  >
    <div
      :class="['h-full transition-all ease-linear', progressBarClasses[type]]"
      :style="{ width: `${progress}%` }"
    ></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'

  const props = defineProps<{
    duration: number
    type: 'success' | 'error' | 'info' | 'warning'
    createdAt: number
  }>()

  const progress = ref(100)
  let animationFrameId: number | null = null

  const progressBarClasses = {
    success: 'bg-green-600 dark:bg-green-400',
    error: 'bg-red-600 dark:bg-red-400',
    warning: 'bg-yellow-600 dark:bg-yellow-400',
    info: 'bg-blue-600 dark:bg-blue-400'
  }

  const updateProgress = () => {
    const elapsed = Date.now() - props.createdAt
    const remaining = Math.max(0, props.duration - elapsed)
    progress.value = (remaining / props.duration) * 100

    if (remaining > 0) {
      animationFrameId = requestAnimationFrame(updateProgress)
    }
  }

  onMounted(() => {
    updateProgress()
  })

  onUnmounted(() => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
    }
  })
</script>
