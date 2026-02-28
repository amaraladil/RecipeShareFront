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
              class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-recipe-title"
            >
              <button
                @click="handleCancel"
                class="absolute flex items-center justify-center top-4 right-4 size-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <Icon
                  name="heroicons:x-mark"
                  class="size-5 text-gray-500 dark:text-gray-400"
                />
              </button>
              <!-- Warning Icon -->
              <div
                class="mx-auto flex items-center justify-center size-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4"
              >
                <Icon
                  name="ic:outline-warning"
                  class="size-6 text-red-600 dark:text-red-400"
                />
              </div>

              <!-- Title -->
              <h3
                id="delete-recipe-title"
                class="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2"
              >
                Delete Recipe?
              </h3>

              <!-- Recipe Title -->
              <p
                class="text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-2"
              >
                "{{ recipeTitle }}"
              </p>

              <!-- Warning Message -->
              <div
                class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4"
              >
                <p class="text-sm text-red-800 dark:text-red-300 text-center">
                  ⚠️ This action cannot be undone. All data including comments
                  and likes will be permanently deleted.
                </p>
              </div>

              <!-- Verification Code -->
              <div class="mb-4">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  To confirm, type
                  <code
                    class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400 rounded font-mono text-base font-bold"
                  >
                    {{ verificationCode }}
                  </code>
                  below:
                </label>
                <input
                  v-model="userInput"
                  type="text"
                  ref="inputRef"
                  :placeholder="verificationCode"
                  :class="[
                    'w-full px-3 py-2 border rounded-lg font-mono text-center text-lg tracking-wider focus:outline-none focus:ring-2 transition-colors',
                    inputError
                      ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500'
                  ]"
                  @input="inputError = false"
                  @keydown.enter="handleConfirm"
                />
                <p
                  v-if="inputError"
                  class="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  Code doesn't match. Please try again.
                </p>
              </div>

              <!-- Actions -->
              <div class="flex gap-3">
                <button
                  @click="handleConfirm"
                  type="button"
                  :disabled="!isCodeValid || loading"
                  class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="!loading">Delete Recipe</span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <div
                      class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    ></div>
                    Deleting...
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
  interface Props {
    isOpen?: boolean
    recipeTitle: string
    loading?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    isOpen: true,
    loading: false
  })

  const emit = defineEmits<{
    confirm: []
    cancel: []
    'update:isOpen': [value: boolean]
  }>()

  const modalRef = ref<HTMLElement | null>(null)
  const inputRef = ref<HTMLInputElement | null>(null)
  const userInput = ref('')
  const inputError = ref(false)

  // Generate random 6-character alphanumeric code
  const verificationCode = ref('')
  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excluding similar looking chars
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const isCodeValid = computed(() => {
    return userInput.value.toUpperCase() === verificationCode.value
  })

  const handleConfirm = () => {
    if (!isCodeValid.value) {
      inputError.value = true
      // Shake animation
      inputRef.value?.classList.add('animate-shake')
      setTimeout(() => {
        inputRef.value?.classList.remove('animate-shake')
      }, 500)
      return
    }

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
    verificationCode.value = generateCode()
    document.addEventListener('keydown', handleKeydown)
    // Focus input for accessibility
    nextTick(() => {
      inputRef.value?.focus()
    })
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  // Reset on open
  watch(
    () => props.isOpen,
    (isOpen) => {
      if (isOpen) {
        verificationCode.value = generateCode()
        userInput.value = ''
        inputError.value = false
        nextTick(() => {
          inputRef.value?.focus()
        })
      }
    }
  )
</script>

<style scoped>
  button:not(:disabled) {
    cursor: pointer;
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    10%,
    30%,
    50%,
    70%,
    90% {
      transform: translateX(-5px);
    }
    20%,
    40%,
    60%,
    80% {
      transform: translateX(5px);
    }
  }

  .animate-shake {
    animation: shake 0.5s;
  }
</style>
