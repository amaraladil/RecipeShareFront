// composables/useNotification.ts
interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration: number
  createdAt: number
  timeoutId?: NodeJS.Timeout
}

const notifications = ref<Notification[]>([])

export const useNotification = () => {
  const show = (
    message: string,
    type: Notification['type'] = 'info',
    duration?: number
  ) => {
    if (!import.meta.client) return

    const id = Math.random().toString(36).substring(7)

    // Info messages stay infinitely by default
    const finalDuration =
      duration !== undefined ? duration : type === 'info' ? 0 : 5000

    const notification: Notification = {
      id,
      type,
      message,
      duration: finalDuration,
      createdAt: Date.now()
    }

    notifications.value.push(notification)

    // Set up auto-removal if duration > 0
    if (finalDuration > 0) {
      const timeoutId = setTimeout(() => {
        remove(id)
      }, finalDuration)

      // Store timeout ID so we can clear it if needed
      const notif = notifications.value.find((n) => n.id === id)
      if (notif) {
        notif.timeoutId = timeoutId
      }
    }
  }

  const remove = (id: string) => {
    const notification = notifications.value.find((n) => n.id === id)

    // Clear timeout if it exists
    if (notification?.timeoutId) {
      clearTimeout(notification.timeoutId)
    }

    // Remove from array
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  const clearNonInfo = () => {
    notifications.value = notifications.value.filter((n) => n.type === 'info')
  }

  const removeAll = () => {
    notifications.value = []
  }

  const success = (message: string, duration = 5000) => {
    show(message, 'success', duration)
  }

  const errorNotif = (message: string, duration = 5000) => {
    show(message, 'error', duration)
  }

  const info = (message: string, duration = 0) => {
    show(message, 'info', duration)
  }

  const warning = (message: string, duration = 5000) => {
    show(message, 'warning', duration)
  }

  return {
    notifications: readonly(notifications),
    show,
    remove,
    removeAll,
    clearNonInfo,
    success,
    errorNotif,
    info,
    warning
  }
}
