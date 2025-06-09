import type { User } from "@supabase/supabase-js";

export const useSupabaseUser = () => {
  const user = useState<User | null>("user", () => null);
  const supabase = useNuxtApp().$supabase;

  // Load user session from Supabase
  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (data?.user) {
      user.value = data.user;
    } else {
      user.value = null;
    }
  };

  // Subscribe to auth state changes
  if (import.meta.client) {
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null;
    });
  }

  return { user, fetchUser };
};
