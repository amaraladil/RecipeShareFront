import { createServerClient } from '@supabase/ssr'
import { parseCookies, setCookie, deleteCookie } from 'h3'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const event = nuxtApp.ssrContext?.event
  if (!event) return

  const cookies = parseCookies(event)

  const supabase = createServerClient(
    config.public.supabaseUrl,
    config.public.supabaseKey,
    {
      cookies: {
        get: (key) => cookies[key],
        set: (key, value, options) =>
          setCookie(event, key, value, {
            ...options,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
          }),
        remove: (key, options) => deleteCookie(event, key, options)
      }
    }
  )

  // Refresh session if expiring soon (on every request)
  nuxtApp.hook('app:rendered', async () => {
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (session?.expires_at && session.refresh_token) {
      const now = Math.floor(Date.now() / 1000)
      const expiresSoon = session.expires_at - now < 60 * 60 // 60 minutes

      if (expiresSoon) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        })
      }
    }
  })

  return {
    provide: {
      supabase
    }
  }
})
