export const useUserProfile = (handle: string) => {
  const profile = useState(`profile-${handle}`, () => null);
  const api = useApi();

  const fetchProfile = async () => {
    const data = await api(`/users/${handle}`);
    // profile.value = data;
    return data;
  };

  return { profile, fetchProfile };
};
