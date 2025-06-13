export const useProfileState = () => useState("profile", () => null);

export async function fetchCurrentUserProfile() {
  const api = useApi();
  const profileState = useProfileState();
  try {
    const data = await api("/users/me", { server: true });
    profileState.value = data;
    return data;
  } catch (e) {
    profileState.value = null;
    throw e;
  }
}
