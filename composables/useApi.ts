export function useApi<T = any>() {
  const config = useRuntimeConfig();
  const { $supabase } = useNuxtApp();

  console.log("useApi initialized with base URL:", config.public.apiBase);

  return async (url: string, options: any = {}): Promise<T> => {
    console.log("Fetching API:", url, "with options:", options);
    const token = (await $supabase.auth.getSession()).data?.session
      ?.access_token;
    console.log("useAPI Current token value:", token);
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
