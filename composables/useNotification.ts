// composables/useNotification.ts
interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration: number
  createdAt: number
}

const notifications = ref<Notification[]>([])

export const useNotification = () => {
  const show = (
    message: string,
    type: Notification['type'] = 'info',
    duration?: number
  ) => {
    const id = Math.random().toString(36).substring(7)

    // Info messages stay up infinitely by default
    const finalDuration =
      duration !== undefined ? duration : type === 'info' ? 0 : 5000

    notifications.value.push({
      id,
      type,
      message,
      duration: finalDuration,
      createdAt: Date.now()
    })

    if (finalDuration > 0) {
      setTimeout(() => {
        remove(id)
      }, finalDuration)
    }
  }

  const remove = (id: string) => {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  const success = (message: string, duration = 5000) => {
    show(message, 'success', duration)
  }

  const error = (message: string, duration = 6000) => {
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
    success,
    error,
    info,
    warning
  }
}
