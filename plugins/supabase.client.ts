import { createBrowserClient } from '@supabase/ssr'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  console.log('SUPABASE CLIENT')
  const supabase = createBrowserClient(
    config.public.supabaseUrl,
    config.public.supabaseKey,
    {
      auth: {
        persistSession: true, // Persist session across page reloads
        autoRefreshToken: true, // Automatically refresh the token
        detectSessionInUrl: false // Disable session detection in URL
      }
    }
  )

  supabase.auth.getSession().catch(async (error) => {
    console.error('Invalid session detected:', error)
    await supabase.auth.signOut({ scope: 'local' })
  })

  return {
    provide: {
      supabase
    }
  }
})
