// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@nuxtjs/tailwindcss";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3000/api",
      supabaseCookieName: process.env.COOKIE_SUPABASE_NAME,
    },
  },
  css: ["@/assets/styles/main.css"],
  modules: ["@nuxtjs/tailwindcss", "@nuxt/ui"],
  tailwindcss: {
    // Options
  },
});