<template>
  <div class="w-full">
    <div class="tabs">
      <button
        @click="activeTab = 'ingredients'"
        :class="[activeTab === 'ingredients' ? 'active' : '']"
      >
        Ingredients
      </button>
      <button
        @click="activeTab = 'instructions'"
        :class="[activeTab === 'instructions' ? 'active' : '']"
      >
        Instructions
      </button>
    </div>

    <div
      ref="tabContainer"
      class="relative overflow-hidden"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @mousedown="handleMouseDown"
    >
      <div
        class="flex transition-transform duration-300 ease-out"
        :style="{ transform: `translateX(${translateX}px)` }"
      >
        <div class="w-full shrink-0 px-2.5">
          <RecipeIngredientsList
            :ingredients="ingredients"
            :editable="editable"
            @add="$emit('add-ingredient')"
            @remove="(index) => $emit('remove-ingredient', index)"
            @update="
              (index, ingredient) =>
                $emit('update-ingredient', index, ingredient)
            "
          />
        </div>
        <div class="w-full shrink-0 px-2.5">
          <RecipeStepsList
            :steps="steps"
            :editable="editable"
            @add="$emit('add-step')"
            @remove="(index) => $emit('remove-step', index)"
            @update="(index, value) => $emit('update-step', index, value)"
          />
        </div>
      </div>
    </div>

    <!-- Swipe Indicator (optional) -->
    <div v-if="showSwipeHint" class="flex justify-center gap-2 mt-4">
      <div
        :class="[
          'w-2 h-2 rounded-full transition-all duration-200',
          activeTab === 'ingredients' ? 'bg-blue-600 w-4' : 'bg-gray-300'
        ]"
      ></div>
      <div
        :class="[
          'w-2 h-2 rounded-full transition-all duration-200',
          activeTab === 'instructions' ? 'bg-blue-600 w-4' : 'bg-gray-300'
        ]"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

  const props = defineProps<{
    ingredients: any[]
    steps: string[]
    editable: boolean
    showSwipeHint?: boolean
  }>()

  const emit = defineEmits([
    'add-ingredient',
    'remove-ingredient',
    'update-ingredient',
    'add-step',
    'remove-step',
    'update-step'
  ])

  const activeTab = ref<'ingredients' | 'instructions'>('ingredients')
  const tabContainer = ref<HTMLElement>()

  // Swipe/drag handling
  const touchStartX = ref(0)
  const touchCurrentX = ref(0)
  const isDragging = ref(false)
  const containerWidth = ref(0)

  const translateX = computed(() => {
    const baseTranslate =
      activeTab.value === 'ingredients' ? 0 : -containerWidth.value

    if (isDragging.value) {
      const dragDistance = touchCurrentX.value - touchStartX.value
      // Add resistance at the edges
      if (
        (activeTab.value === 'ingredients' && dragDistance > 0) ||
        (activeTab.value === 'instructions' && dragDistance < 0)
      ) {
        return baseTranslate + dragDistance * 0.3
      }
      return baseTranslate + dragDistance
    }

    return baseTranslate
  })

  const updateContainerWidth = () => {
    if (tabContainer.value) {
      containerWidth.value = tabContainer.value.offsetWidth
    }
  }

  // Touch handlers
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.value = touchCurrentX.value = e.touches[0].clientX
    isDragging.value = true
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.value) return
    touchCurrentX.value = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!isDragging.value) return

    const dragDistance = touchCurrentX.value - touchStartX.value
    const threshold = containerWidth.value * 0.25 // 25% of container width

    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance > 0 && activeTab.value === 'instructions') {
        // Swiped right, go to ingredients
        activeTab.value = 'ingredients'
      } else if (dragDistance < 0 && activeTab.value === 'ingredients') {
        // Swiped left, go to instructions
        activeTab.value = 'instructions'
      }
    }

    isDragging.value = false
    touchStartX.value = 0
    touchCurrentX.value = 0
  }

  // Mouse handlers (for desktop drag support)
  const handleMouseDown = (e: MouseEvent) => {
    touchStartX.value = e.clientX
    touchCurrentX.value = e.clientX
    isDragging.value = true

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.value) return
      touchCurrentX.value = e.clientX
    }

    const handleMouseUp = () => {
      handleTouchEnd()
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Watch for tab changes
  watch(activeTab, () => {
    isDragging.value = false
    touchStartX.value = 0
    touchCurrentX.value = 0
  })

  onMounted(() => {
    updateContainerWidth()
    window.addEventListener('resize', updateContainerWidth)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateContainerWidth)
  })
</script>

<style scoped>
  @import '@/assets/styles/main.css';
  .tabs {
    @apply flex border-b border-gray-300 dark:border-gray-700 mb-4 mx-2;

    & button {
      @apply flex-1 py-3 px-4 text-center font-medium relative cursor-pointer;

      &.active {
        @apply text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400;
      }

      &:not(.active) {
        @apply text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200;
      }
    }
  }

  button {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
</style>
