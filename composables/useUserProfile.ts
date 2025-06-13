const CACHE_DURATION = 1 * 60 * 1000; // 5 minutes

export const useUserProfile = (handle: string) => {
  const profileState = useState<{ data: any; ts: number } | null>(
    `profile-${handle}`,
    () => null
  );
  const api = useApi();

  const fetchProfile = async (force = false) => {
    const now = Date.now();
    if (
      !force &&
      profileState.value &&
      now - profileState.value.ts < CACHE_DURATION
    ) {
      return profileState.value.data;
    }
    const data = await api(`/users/${handle}`, { server: true });
    profileState.value = { data, ts: now };
    return data;
  };

  const profile = computed(() => profileState.value?.data ?? null);

  return { profile, fetchProfile };
};
