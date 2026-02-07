<template>
  <div class="relative group" ref="dropdownRef">
    <button
      @click="toggleDropdown"
      :class="['cursor-pointer h-7  transition-colors', buttonClass]"
      :aria-label="ariaLabel"
    >
      <Icon
        name="ic:round-more-vert"
        class="size-7 group-hover:text-blue-600 dark:group-hover:text-blue-300"
      />
    </button>

    <!-- Dropdown menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        :class="[
          'absolute z-50 shadow-lg bg-white dark:bg-gray-800 ring-opacity-5',
          'min-w-[160px]',
          align === 'right' ? 'right-0' : 'left-0'
        ]"
      >
        <div class="" role="menu">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    align?: 'left' | 'right'
    buttonClass?: string
    ariaLabel?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    align: 'right',
    buttonClass: '',
    ariaLabel: 'More options'
  })

  const isOpen = ref(false)
  const dropdownRef = ref<HTMLElement | null>(null)

  const toggleDropdown = () => {
    isOpen.value = !isOpen.value
  }

  const closeDropdown = () => {
    isOpen.value = false
  }

  // Close dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.value &&
      !dropdownRef.value.contains(event.target as Node)
    ) {
      closeDropdown()
    }
  }

  // Close on Escape key
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeDropdown()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleEscape)
  })

  // Expose close method for parent components
  defineExpose({
    close: closeDropdown
  })
</script>
