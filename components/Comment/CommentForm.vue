<template>
  <div class="mb-6">
    <!-- Error Display -->
    <div
      v-if="error"
      class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
    >
      <div class="flex items-start gap-2">
        <Icon
          name="ic:outline-error"
          class="size-5 text-red-600 dark:text-red-400 mt-0.5"
        />
        <div class="flex-1">
          <p class="text-sm text-red-700 dark:text-red-400">
            {{ error }}
          </p>
        </div>
        <button
          @click="$emit('clearError')"
          class="text-red-600 hover:text-red-800"
        >
          <Icon name="ic:round-close" class="size-4" />
        </button>
      </div>
    </div>

    <div class="flex gap-3">
      <UserAvatar
        :avatar-url="profile.avatar_url"
        :alt="profile.display_name"
        class="size-8"
      />
      <div class="flex-1">
        <textarea
          :value="modelValue"
          @input="
            $emit(
              'update:modelValue',
              ($event.target as HTMLTextAreaElement).value
            )
          "
          placeholder="Add a comment..."
          rows="3"
          :class="[
            'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 resize-none',
            error
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          ]"
          @keydown.ctrl.enter="$emit('submit')"
        ></textarea>
        <div class="flex justify-between items-center mt-2">
          <span
            :class="[
              'text-sm',
              modelValue.length > maxLength
                ? 'text-red-500 font-medium'
                : 'text-gray-500'
            ]"
          >
            {{ modelValue.length }}/{{ maxLength }}
          </span>
          <button
            @click="$emit('submit')"
            :disabled="
              !modelValue.trim() ||
              isSubmitting ||
              modelValue.length > maxLength
            "
            class="px-4 cursor-pointer py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ isSubmitting ? 'Posting...' : 'Post Comment' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    modelValue: string
    profile: {
      display_name: string
      avatar_url?: string
    }
    isSubmitting: boolean
    error: string
    maxLength: number
  }

  defineProps<Props>()

  defineEmits<{
    'update:modelValue': [value: string]
    submit: []
    clearError: []
  }>()
</script>
