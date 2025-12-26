<script setup lang="ts">
  import { toRef } from 'vue'

  interface Props {
    tags?: string[]
    editable?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    tags: () => [],
    editable: false
  })

  // support both event-based and v-model:tags patterns
  const emit = defineEmits<{
    add: [tag: string]
    remove: [index: number]
    'update:tags': [tags: string[]]
  }>()

  const newTag = ref('')

  // helper to normalize tags for duplicate checks (case-insensitive)
  const normalize = (s: string) => s.trim().toLowerCase()

  const addTag = () => {
    const val = newTag.value.trim()
    if (!val) return
    const existing = (props.tags || []).some(
      (t) => normalize(t) === normalize(val)
    )
    if (existing) {
      newTag.value = ''
      return
    }
    // emit both for backward compatibility and v-model usage
    emit('add', val)
    emit('update:tags', [...(props.tags || []), val])
    newTag.value = ''
  }

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const removeTag = (index: number) => {
    const next = [...(props.tags || [])]
    next.splice(index, 1)
    emit('remove', index)
    emit('update:tags', next)
  }
</script>

<template>
  <div class="space-y-2">
    <h2 class="text-xl font-semibold text-gray-900 dark:text-white/80">Tags</h2>

    <div class="flex flex-wrap gap-2">
      <span
        v-for="(tag, index) in props.tags"
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
          @click="removeTag(index)"
          type="button"
          class="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 cursor-pointer"
          aria-label="Remove tag"
        >
          ×
        </button>
      </span>

      <span
        v-if="(props.tags || []).length === 0"
        class="text-gray-500 dark:text-gray-400 text-sm italic"
      >
        No tags added
      </span>
    </div>

    <div v-if="editable" class="flex gap-2 mt-2">
      <input
        v-model="newTag"
        @keyup="handleKey"
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

<style scoped></style>
