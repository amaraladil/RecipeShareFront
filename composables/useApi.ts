import { parseCookies } from 'h3'

export function useApi<T = any>() {
  const config = useRuntimeConfig()
  const { $supabase } = useNuxtApp()

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

    // Extract headers from options to merge with auth headers
    const { headers: customHeaders, ...restOptions } = options

    return await $fetch(url, {
      baseURL: config.public.apiBase,
      ...restOptions, // Spread first so method, body, etc. are at top level
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : '',
        'x-refresh-token': refreshToken || '',
        ...customHeaders // Then merge custom headers
      }
    })
  }
}
