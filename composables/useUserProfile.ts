export const useUserProfile = (handle: string) => {
  const api = useApi()

  const fetchProfile = async (force = false) => {
    const data = await api(`/users/${handle}`)
    return data
  }

  return { fetchProfile }
}
