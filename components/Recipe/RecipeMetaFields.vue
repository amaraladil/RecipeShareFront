<script setup lang="ts">
  interface Props {
    prepTime: number
    cookTime: number
    servings: number
    editable?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    editable: false
  })

  const emit = defineEmits<{
    'update:prepTime': [value: number]
    'update:cookTime': [value: number]
    'update:servings': [value: number]
  }>()

  const totalTime = computed(() => props.prepTime + props.cookTime)
</script>

<template>
  <div
    class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
  >
    <!-- Prep Time -->
    <div class="text-center">
      <div class="font-semibold text-gray-900 dark:text-white">
        <span v-if="!editable">{{ prepTime || 0 }} min</span>
        <span v-else class="flex items-center justify-center gap-1">
          <input
            :value="prepTime"
            @input="
              emit(
                'update:prepTime',
                parseInt(($event.target as HTMLInputElement).value) || 0
              )
            "
            type="number"
            min="0"
            class="w-20 px-2 py-1 ml-8 text-sm border border-gray-300 rounded text-center"
          />
          min
        </span>
      </div>
      <div class="text-sm text-gray-600 dark:text-gray-400">Prep Time</div>
    </div>

    <!-- Cook Time -->
    <div class="text-center">
      <div class="font-semibold text-gray-900 dark:text-white">
        <span v-if="!editable">{{ cookTime || 0 }} min</span>
        <span v-else class="flex items-center justify-center gap-1">
          <input
            :value="cookTime"
            @input="
              emit(
                'update:cookTime',
                parseInt(($event.target as HTMLInputElement).value) || 0
              )
            "
            type="number"
            min="0"
            class="w-20 px-2 py-1 ml-8 text-sm border border-gray-300 rounded text-center"
          />
          min
        </span>
      </div>
      <div class="text-sm text-gray-600 dark:text-gray-400">Cook Time</div>
    </div>

    <!-- Total Time -->
    <div class="text-center">
      <div class="font-semibold text-gray-900 dark:text-white">
        {{ totalTime || 0 }} min
      </div>
      <div class="text-sm text-gray-600 dark:text-gray-400">Total Time</div>
    </div>

    <!-- Servings -->
    <div class="text-center">
      <div class="font-semibold text-gray-900 dark:text-white">
        <span v-if="!editable">{{ servings || 1 }}</span>
        <span v-else>
          <input
            :value="servings"
            @input="
              emit(
                'update:servings',
                parseInt(($event.target as HTMLInputElement).value) || 1
              )
            "
            type="number"
            min="1"
            class="w-20 px-2 py-1 text-sm border border-gray-300 rounded text-center"
          />
        </span>
      </div>
      <div class="text-sm text-gray-600 dark:text-gray-400">Servings</div>
    </div>
  </div>
</template>
