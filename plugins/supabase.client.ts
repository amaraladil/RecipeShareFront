import { createBrowserClient } from "@supabase/ssr";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const supabase = createBrowserClient(
    config.public.supabaseUrl,
    config.public.supabaseKey,
    {
      auth: {
        // persistSession: true, // Persist session across page reloads
        // autoRefreshToken: true, // Automatically refresh the token
        // detectSessionInUrl: false, // Disable session detection in URL
      },
    }
  );

  return {
    provide: {
      supabase,
    },
  };
});
