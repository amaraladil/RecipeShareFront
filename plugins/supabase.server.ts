import { createServerClient } from "@supabase/ssr";
import { parseCookies, setCookie, deleteCookie } from "h3";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const event = nuxtApp.ssrContext?.event;

  if (!event) return;
  const supabase = createServerClient(
    config.public.supabaseUrl,
    config.public.supabaseKey,
    {
      cookies: {
        get(name) {
          console.log("SUPABASE SERVER GET COOKIE");
          return parseCookies(event)[name];
        },
        set(name, value, options) {
          setCookie(event, name, value, options);
        },
        remove(name, options) {
          deleteCookie(event, name, options);
        },
      },
    }
  );

  return {
    provide: {
      supabase,
    },
  };
});
