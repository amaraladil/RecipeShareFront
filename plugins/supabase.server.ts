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
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            ...options
          }),
        remove: (key, options) => deleteCookie(event, key, options)
      }
    }
  )

  // Check session validity and refresh if needed
  nuxtApp.hook('app:rendered', async () => {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    if (session?.expires_at && session.refresh_token) {
      const now = Math.floor(Date.now() / 1000)
      const expiresSoon = session.expires_at - now < 36000

      if (expiresSoon) {
        await supabase.auth.refreshSession()
      }
    }

    if (error || !session) {
      await supabase.auth.signOut()
    }
  })

  return {
    provide: {
      supabase
    }
  }
})
