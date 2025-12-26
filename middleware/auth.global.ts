export default defineNuxtRouteMiddleware(async (to) => {
  const { $supabase } = useNuxtApp()
  if (!$supabase) return // Prevent error if plugin not ready

  const { data } = await $supabase.auth.getUser()

  if (!data.user && to.path.startsWith('/profile')) {
    return navigateTo('/')
  }
  if (!data.user && to.path.startsWith('/recipes/create')) {
    return navigateTo('/')
  }
})
