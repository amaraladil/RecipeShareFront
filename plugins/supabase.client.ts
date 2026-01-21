import { createBrowserClient } from '@supabase/ssr'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const supabase = createBrowserClient(
    config.public.supabaseUrl,
    config.public.supabaseKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // Set to true to handle OAuth callbacks
        storage: {
          // Optional: customize storage if needed
          getItem: (key) => {
            if (typeof window !== 'undefined') {
              return window.localStorage.getItem(key)
            }
            return null
          },
          setItem: (key, value) => {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(key, value)
            }
          },
          removeItem: (key) => {
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem(key)
            }
          }
        }
      }
    }
  )

  // Handle invalid sessions gracefully
  supabase.auth.getSession().catch(async (error) => {
    console.error('Invalid session detected:', error)
    await supabase.auth.signOut({ scope: 'local' })
  })

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
      console.log(`Auth event: ${event}`)
    }
    if (event === 'TOKEN_REFRESHED') {
      console.log('Token refreshed successfully')
    }
  })

  return {
    provide: {
      supabase
    }
  }
})
