<template>
  <div
    class="fixed top-0 left-20 right-0 z-50 px-4 pt-4 space-y-2 pointer-events-none"
  >
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'flex items-start gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm',
          'transform transition-all duration-300 ease-out pointer-events-auto',
          'mx-auto max-w-7xl relative overflow-hidden',
          notificationClasses[notification.type]
        ]"
      >
        <Icon
          :name="notificationIcons[notification.type]"
          :class="[
            'w-5 h-5 flex-shrink-0 mt-0.5',
            iconClasses[notification.type]
          ]"
        />

        <p class="flex-1 text-sm font-medium cursor-default">
          {{ notification.message }}
        </p>

        <button
          @click="remove(notification.id)"
          class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>

        <!-- Progress Bar -->
        <div
          v-if="notification.duration > 0"
          class="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10"
        >
          <div
            :class="[
              'h-full transition-all',
              progressBarClasses[notification.type]
            ]"
            :style="{
              animation: `shrink ${notification.duration}ms linear forwards`
            }"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
  const { notifications, remove } = useNotification()

  const notificationClasses = {
    success:
      'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    error:
      'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    warning:
      'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
  }

  const iconClasses = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400'
  }

  const progressBarClasses = {
    success: 'bg-green-600 dark:bg-green-400',
    error: 'bg-red-600 dark:bg-red-400',
    warning: 'bg-yellow-600 dark:bg-yellow-400',
    info: 'bg-blue-600 dark:bg-blue-400'
  }

  const notificationIcons = {
    success: 'heroicons:check-circle',
    error: 'heroicons:x-circle',
    warning: 'heroicons:exclamation-triangle',
    info: 'heroicons:information-circle'
  }
</script>

<style scoped>
  .notification-enter-active,
  .notification-leave-active {
    transition: all 0.3s ease;
  }

  .notification-enter-from {
    opacity: 0;
    transform: translateY(-20px);
  }

  .notification-leave-to {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }

  .notification-move {
    transition: transform 0.3s ease;
  }

  @keyframes shrink {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
</style>
