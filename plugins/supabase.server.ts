import { createServerClient } from '@supabase/ssr'
import { parseCookies, setCookie, deleteCookie } from 'h3'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const event = nuxtApp.ssrContext?.event

  // Only run on server-side
  if (!event) return

  const cookies = parseCookies(event)

  const supabase = createServerClient(
    config.public.supabaseUrl,
    config.public.supabaseKey,
    {
      cookies: {
        get: (key) => cookies[key],
        set: (key, value, options) => {
          setCookie(event, key, value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days to match refresh token
            ...options
          })
        },
        remove: (key, options) => {
          deleteCookie(event, key, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            ...options
          })
        }
      }
    }
  )

  // Check and refresh session if needed during SSR
  nuxtApp.hook('app:rendered', async () => {
    try {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession()

      if (error) {
        console.error('Session error:', error)
        await supabase.auth.signOut()
        return
      }

      if (!session) {
        return
      }

      // Check if token expires within 1 hour
      const expiresAt = session.expires_at
      if (expiresAt) {
        const now = Math.floor(Date.now() / 1000)
        const expiresIn = expiresAt - now

        // Refresh if expiring within 1 hour
        if (expiresIn < 3600) {
          console.log('Token expiring soon, refreshing during SSR...')
          const { error: refreshError } = await supabase.auth.refreshSession()

          if (refreshError) {
            console.error('Token refresh failed:', refreshError)
            await supabase.auth.signOut()
          }
        }
      }
    } catch (err) {
      console.error('SSR auth check failed:', err)
    }
  })

  return {
    provide: {
      supabase
    }
  }
})
