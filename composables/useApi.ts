import { parseCookies } from 'h3'

export function useApi<T = any>() {
  const config = useRuntimeConfig()
  const { $supabase } = useNuxtApp()

  console.log('useApi initialized with base URL:', config.public.apiBase)

  return async (url: string, options: any = {}): Promise<T> => {
    console.log('Fetching API:', url, 'with options:', options)
    let accessToken: string | undefined
    let refreshToken: string | undefined

    if (import.meta.client) {
      // Client-side: get from supabase
      const session = (await $supabase.auth.getSession()).data?.session
      accessToken = session?.access_token
      refreshToken = session?.refresh_token

      console.log('useApi Client Side token:', accessToken)
    } else if (import.meta.server) {
      // Server-side: read cookie
      const event = useRequestEvent()
      if (event) {
        const cookies = parseCookies(event)
        accessToken = cookies['sb-access-token']
        refreshToken = cookies['sb-refresh-token']
      }
    }

    return await $fetch(url, {
      baseURL: config.public.apiBase,
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : '',
        'x-refresh-token': refreshToken || '',
        ...options.headers
      },
      ...options
    })
  }
}
