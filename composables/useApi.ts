export function useApi<T = any>() {
  const config = useRuntimeConfig();
  const token = useCookie("sb-access-token");

  return async (url: string, options: any = {}): Promise<T> => {
    return await $fetch(url, {
      baseURL: config.public.apiBase,
      headers: {
        Authorization: token.value ? `Bearer ${token.value}` : "",
        ...options.headers,
      },
      ...options,
    });
  };
}
