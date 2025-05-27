import { ref, onMounted } from "vue";

export const user = ref(null);

export function useSupabaseUser($supabase: any) {
  onMounted(async () => {
    const { data } = await $supabase.auth.getUser();
    user.value = data.user;
    // Listen for auth changes
    $supabase.auth.onAuthStateChange((_event: any, session: any) => {
      user.value = session?.user ?? null;
    });
  });
  return user;
}
