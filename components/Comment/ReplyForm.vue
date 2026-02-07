<template>
  <div class="mt-3 pl-4 border-l-2 border-blue-500">
    <!-- Error Display -->
    <div
      v-if="error"
      class="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded"
    >
      <div class="flex items-start gap-2">
        <Icon
          name="ic:outline-error"
          class="size-4 text-red-600 dark:text-red-400 mt-0.5"
        />
        <p class="text-xs text-red-700 dark:text-red-400 flex-1">
          {{ error }}
        </p>
        <button
          @click="$emit('clearError')"
          class="text-red-600 hover:text-red-800"
        >
          <Icon name="ic:round-close" class="size-3" />
        </button>
      </div>
    </div>

    <div class="flex gap-2">
      <UserAvatar
        :avatar-url="profile?.avatar_url"
        :alt="profile?.display_name"
        class="size-6"
      />
      <div class="flex-1">
        <div v-if="replyToUser" class="text-sm text-gray-600 mb-1">
          Replying to @{{ replyToUser.display_name }}
        </div>
        <textarea
          :value="modelValue"
          @input="
            $emit(
              'update:modelValue',
              ($event.target as HTMLTextAreaElement).value
            )
          "
          placeholder="Write a reply..."
          rows="2"
          :class="[
            'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 resize-none text-sm',
            error
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          ]"
          @keydown.ctrl.enter="$emit('submit')"
        ></textarea>
        <div class="flex justify-between items-center mt-2">
          <span
            :class="[
              'text-xs',
              modelValue.length > maxLength
                ? 'text-red-500 font-medium'
                : 'text-gray-500'
            ]"
          >
            {{ modelValue.length }}/{{ maxLength }}
          </span>
          <div class="flex gap-2">
            <button
              @click="$emit('cancel')"
              class="cursor-pointer px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="$emit('submit')"
              :disabled="
                !modelValue.trim() ||
                isSubmitting ||
                modelValue.length > maxLength
              "
              class="cursor-pointer px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isSubmitting ? 'Posting...' : 'Reply' }}
            </button>
          </div>
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
    } | null
    replyToUser: {
      display_name: string
    } | null
    isSubmitting: boolean
    error: string
    maxLength: number
  }

  defineProps<Props>()

  defineEmits<{
    'update:modelValue': [value: string]
    submit: []
    cancel: []
    clearError: []
  }>()
</script>
