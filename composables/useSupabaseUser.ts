import type { User } from '@supabase/supabase-js'

export const useSupabaseUser = () => {
  const user = useState<User | null>('user', () => null)
  const supabase = useNuxtApp().$supabase

  const fetchUser = async () => {
    try {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession()
      if (error) {
        console.error('Session error:', error)
        await supabase.auth.signOut({ scope: 'local' })
        user.value = null
        return null
      }

      user.value = session?.user ?? null
      return session
    } catch (error) {
      console.error('Failed to get session:', error)
      await supabase.auth.signOut({ scope: 'local' })
      user.value = null
      return null
    }
  }

  if (import.meta.client) {
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null
    })
  }

  return { user, fetchUser }
}
