<script setup lang="ts">
  interface Props {
    tags: string[]
    editable?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    editable: false
  })

  const emit = defineEmits<{
    add: [tag: string]
    remove: [index: number]
  }>()

  const newTag = ref('')

  const addTag = () => {
    if (newTag.value.trim() && !props.tags.includes(newTag.value.trim())) {
      emit('add', newTag.value.trim())
      newTag.value = ''
    }
  }

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addTag()
    }
  }
</script>

<template>
  <div class="space-y-2">
    <h2 class="text-xl font-semibold text-gray-900 dark:text-white/80">Tags</h2>

    <!-- Tags Display -->
    <div class="flex flex-wrap gap-2">
      <span
        v-for="(tag, index) in tags"
        :key="index"
        class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm flex items-center gap-1"
        :class="
          editable
            ? 'cursor-default hover:bg-blue-200 dark:hover:bg-blue-900/50'
            : ''
        "
      >
        {{ tag }}
        <button
          v-if="editable"
          @click="emit('remove', index)"
          type="button"
          class="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 cursor-pointer"
        >
          ×
        </button>
      </span>

      <!-- Empty State -->
      <span
        v-if="tags.length === 0"
        class="text-gray-500 dark:text-gray-400 text-sm italic"
      >
        No tags added
      </span>
    </div>

    <!-- Add Tag Input (Edit Mode) -->
    <div v-if="editable" class="flex gap-2 mt-2">
      <input
        v-model="newTag"
        @keypress="handleKeyPress"
        type="text"
        class="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Add a tag (e.g., dessert, vegetarian)"
      />
      <button
        @click="addTag"
        type="button"
        class="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 cursor-pointer transition-colors"
      >
        Add
      </button>
    </div>
  </div>
</template>
