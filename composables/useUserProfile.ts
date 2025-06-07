import { ref } from "vue";
import { useApi } from "./useApi";

export function useUserProfile() {
  const profile = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchUserProfile = async (handle: string) => {
    loading.value = true;
    error.value = null;
    try {
      const api = useApi();
      profile.value = await api(`/users/${handle}`);
    } catch (e: any) {
      error.value = e.message || "Failed to fetch user";
      profile.value = null;
    } finally {
      loading.value = false;
    }
  };

  return { profile, loading, error, fetchUserProfile };
}
