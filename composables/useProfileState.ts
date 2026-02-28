export const useProfileState = () => useState('profile', () => null)

export async function fetchCurrentUserProfile() {
  const api = useApi()
  const profileState = useProfileState()
  const { cacheAuthor } = useAuthorCache()
  try {
    const data = await api('/users/me', { method: 'GET' })
    profileState.value = data
    cacheAuthor(data.id, data)
    return profileState.value
  } catch (e) {
    profileState.value = null
    throw e
  }
}
