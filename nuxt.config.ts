// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@nuxtjs/tailwindcss";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
    },
  },
  css: ["@/assets/styles/main.css"],
  modules: ["@nuxtjs/tailwindcss"],
  tailwindcss: {
    // Options
  },
});
