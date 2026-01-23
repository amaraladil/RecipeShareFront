import { parseCookies } from 'h3'
import type { FetchError } from 'ofetch'

export function useApi<T = any>() {
  const config = useRuntimeConfig()
  const { $supabase } = useNuxtApp()

  return async (url: string, options: any = {}): Promise<T> => {
    const maxRetries = 1 // Only retry once for 401 errors
    let attempt = 0

    while (attempt <= maxRetries) {
      try {
        const accessToken = await getAccessToken()

        // Extract headers from options to merge with auth headers
        const { headers: customHeaders, ...restOptions } = options

        return await $fetch<T>(url, {
          baseURL: config.public.apiBase,
          ...restOptions,
          headers: {
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            ...customHeaders
          }
        })
      } catch (error: any) {
        const fetchError = error as FetchError

        // If 401 and haven't retried yet, try refreshing token
        if (fetchError.statusCode === 401 && attempt === 0) {
          console.log('401 error, attempting to refresh token...')

          const refreshed = await refreshAccessToken()

          if (refreshed) {
            attempt++
            continue // Retry the request
          } else {
            // Refresh failed, redirect to login
            await handleAuthFailure()
            throw new Error('Authentication failed. Please log in again.')
          }
        }

        // For any other error or if retry failed, throw it
        throw error
      }
    }

    // This should never be reached, but TypeScript needs it
    throw new Error('Max retries exceeded')
  }

  async function getAccessToken(): Promise<string | undefined> {
    let accessToken: string | undefined

    if (import.meta.client) {
      const {
        data: { session }
      } = await $supabase.auth.getSession()

      if (session?.expires_at) {
        const expiresAt = session.expires_at * 1000 // Convert to milliseconds
        const now = Date.now()
        const bufferTime = 5 * 60 * 1000 // 5 minutes buffer

        // Proactively refresh if expiring soon
        if (expiresAt - now < bufferTime) {
          console.log('Token expiring soon, refreshing proactively...')
          const refreshed = await refreshAccessToken()
          if (refreshed) {
            const {
              data: { session: newSession }
            } = await $supabase.auth.getSession()
            accessToken = newSession?.access_token
          } else {
            accessToken = session.access_token
          }
        } else {
          accessToken = session.access_token
        }
      }
    } else if (import.meta.server) {
      const event = useRequestEvent()
      if (event) {
        const cookies = parseCookies(event)
        accessToken = cookies[config.public.supabaseCookieName] || undefined
      }
    }

    return accessToken
  }

  async function refreshAccessToken(): Promise<boolean> {
    try {
      if (!import.meta.client) {
        return false
      }

      const { data, error } = await $supabase.auth.refreshSession()

      if (error || !data.session) {
        console.error('Token refresh failed:', error)
        return false
      }

      console.log('Token refreshed successfully')
      return true
    } catch (error) {
      console.error('Exception during token refresh:', error)
      return false
    }
  }

  async function handleAuthFailure(): Promise<void> {
    try {
      if (import.meta.client) {
        await $supabase.auth.signOut()

        // Get the auth modal composable
        const { isOpenAuth } = useAuthModal()

        // If not on a public page, redirect to home
        const router = useRouter()
        const publicPages = ['/', '/explore']

        if (!publicPages.includes(router.currentRoute.value.path)) {
          await navigateTo('/')
        }

        // Show login modal
        isOpenAuth.value = true
      }
    } catch (error) {
      console.error('Error handling auth failure:', error)
    }
  }
}
