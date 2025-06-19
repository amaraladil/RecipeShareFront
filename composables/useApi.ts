import { parseCookies } from "h3";

export function useApi<T = any>() {
  const config = useRuntimeConfig();
  const { $supabase } = useNuxtApp();

  console.log("useApi initialized with base URL:", config.public.apiBase);

  return async (url: string, options: any = {}): Promise<T> => {
    console.log("Fetching API:", url, "with options:", options);

    let accessToken: string | undefined;
    if (import.meta.client) {
      // Client-side: get from supabase
      accessToken = (await $supabase.auth.getSession()).data?.session
        ?.access_token;

      console.log("useApi Client Side token:", accessToken);
    } else if (import.meta.server) {
      // Server-side: read cookie
      const event = useRequestEvent();
      if (event) {
        const cookies = parseCookies(event);
        accessToken = cookies["sb-access-token"];
      }
    }
    const token = accessToken;

    return await $fetch(url, {
      baseURL: config.public.apiBase,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        ...options.headers,
      },
      ...options,
    });
  };
}
