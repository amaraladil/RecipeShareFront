import { createBrowserClient } from "@supabase/ssr";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const supabase = createBrowserClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  );

  return {
    provide: {
      supabase,
    },
  };
});
