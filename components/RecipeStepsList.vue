<script setup lang="ts">
  interface Props {
    steps: string[]
    editable?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    editable: false
  })

  const emit = defineEmits<{
    add: []
    remove: [index: number]
    update: [index: number, value: string]
  }>()

  const updateStep = (index: number, value: string) => {
    emit('update', index, value)
  }
</script>

<template>
  <div class="space-y-3">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white/80">
        Instructions
      </h2>
      <button
        v-if="editable"
        @click="emit('add')"
        type="button"
        class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 cursor-pointer transition-colors"
      >
        Add Step
      </button>
    </div>

    <!-- Steps List -->
    <ol class="space-y-3">
      <li v-for="(step, index) in steps" :key="index" class="flex gap-4">
        <span
          class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-sm rounded-full flex items-center justify-center mt-1"
        >
          {{ index + 1 }}
        </span>

        <!-- View Mode -->
        <span v-if="!editable" class="text-gray-700 dark:text-gray-300 flex-1">
          {{ step }}
        </span>

        <!-- Edit Mode -->
        <div v-else class="flex-1 flex gap-2">
          <textarea
            :value="step"
            @input="
              updateStep(index, ($event.target as HTMLTextAreaElement).value)
            "
            rows="2"
            class="field-sizing-content min-h-10 flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter instruction step"
          ></textarea>
          <button
            @click="emit('remove', index)"
            type="button"
            class="text-red-600 hover:text-red-800 px-2 cursor-pointer"
          >
            <UIcon name="ic:outline-delete" class="size-5" />
          </button>
        </div>
      </li>
    </ol>

    <!-- Empty State -->
    <div
      v-if="!editable && (!steps || steps.length === 0)"
      class="text-gray-500 italic"
    >
      No instructions provided.
    </div>
  </div>
</template>
