/**
 * A composable to provide easy access to application-wide,
 * environment-dependent settings from nuxt.config.ts.
 */
export const useAppSettings = () => {
  const config = useRuntimeConfig()

  // Return an object with the values you want to expose.
  // This makes them available with clear names.
  return {
    appName: config.public.APPNAME, // Assumes appName is in your nuxt.config
    apiBase: config.public.apiBase
    // Add any other runtime configs you need here
  }
}
