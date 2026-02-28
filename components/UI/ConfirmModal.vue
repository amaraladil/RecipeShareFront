<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="handleBackdropClick"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>

        <!-- Modal container -->
        <div class="flex min-h-full items-center justify-center p-4">
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="isOpen"
              ref="modalRef"
              class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
              role="dialog"
              aria-modal="true"
              :aria-labelledby="titleId"
            >
              <!-- Icon -->
              <div
                v-if="icon"
                :class="[
                  'mx-auto flex items-center justify-center size-12 rounded-full mb-4',
                  iconBgClass
                ]"
              >
                <UIcon :name="icon" :class="['size-6', iconColorClass]" />
              </div>

              <!-- Title -->
              <h3
                :id="titleId"
                class="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2"
              >
                {{ title }}
              </h3>

              <!-- Message -->
              <p
                class="text-sm text-gray-600 dark:text-gray-400 text-center mb-6"
              >
                {{ message }}
              </p>

              <!-- Actions -->
              <div class="flex gap-3">
                <button
                  @click="handleCancel"
                  type="button"
                  class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  ref="cancelButtonRef"
                >
                  {{ cancelText }}
                </button>
                <button
                  @click="handleConfirm"
                  type="button"
                  :disabled="loading"
                  :class="[
                    'flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                    confirmButtonClass
                  ]"
                >
                  <span v-if="!loading">{{ confirmText }}</span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <div
                      class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    ></div>
                    {{ loadingText }}
                  </span>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  type ConfirmVariant = 'danger' | 'warning' | 'primary'

  interface Props {
    isOpen?: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: ConfirmVariant
    loading?: boolean
    loadingText?: string
    icon?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    isOpen: true,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'primary',
    loading: false,
    loadingText: 'Processing...'
  })

  const emit = defineEmits<{
    confirm: []
    cancel: []
    'update:isOpen': [value: boolean]
  }>()

  const modalRef = ref<HTMLElement | null>(null)
  const cancelButtonRef = ref<HTMLButtonElement | null>(null)
  const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`

  const iconBgClass = computed(() => {
    switch (props.variant) {
      case 'danger':
        return 'bg-red-100 dark:bg-red-900/20'
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/20'
      default:
        return 'bg-blue-100 dark:bg-blue-900/20'
    }
  })

  const iconColorClass = computed(() => {
    switch (props.variant) {
      case 'danger':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-blue-600 dark:text-blue-400'
    }
  })

  const confirmButtonClass = computed(() => {
    switch (props.variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    }
  })

  const handleConfirm = () => {
    if (!props.loading) {
      emit('confirm')
    }
  }

  const handleCancel = () => {
    if (!props.loading) {
      emit('cancel')
      emit('update:isOpen', false)
    }
  }

  const handleBackdropClick = () => {
    if (!props.loading) {
      handleCancel()
    }
  }

  // Handle Escape key
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen && !props.loading) {
      handleCancel()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
    // Focus cancel button for accessibility
    nextTick(() => {
      cancelButtonRef.value?.focus()
    })
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  // Trap focus within modal
  const trapFocus = (e: KeyboardEvent) => {
    if (!modalRef.value || e.key !== 'Tab') return

    const focusableElements = modalRef.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault()
      lastElement?.focus()
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault()
      firstElement?.focus()
    }
  }

  watch(
    () => props.isOpen,
    (isOpen) => {
      if (isOpen) {
        document.addEventListener('keydown', trapFocus)
      } else {
        document.removeEventListener('keydown', trapFocus)
      }
    },
    { immediate: true }
  )
</script>
