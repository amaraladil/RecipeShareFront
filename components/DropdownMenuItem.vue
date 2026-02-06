<template>
  <button
    @click="handleClick"
    :disabled="disabled"
    :class="[
      'w-full cursor-pointer text-left px-4 py-2 text-sm transition-colors',
      'flex items-center gap-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variant === 'danger'
        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
        : variant === 'primary'
          ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
      customClass
    ]"
    role="menuitem"
  >
    <Icon v-if="icon" :name="icon" class="size-4" />
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
  interface Props {
    label: string
    icon?: string
    variant?: 'default' | 'primary' | 'danger'
    disabled?: boolean
    customClass?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    disabled: false,
    customClass: ''
  })

  const emit = defineEmits<{
    click: []
  }>()

  const handleClick = () => {
    if (!props.disabled) {
      emit('click')
    }
  }
</script>
