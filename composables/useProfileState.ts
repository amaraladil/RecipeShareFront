export const useProfileState = () => useState('profile', () => null)

export async function fetchCurrentUserProfile() {
  const api = useApi()
  const profileState = useProfileState()
  try {
    const data = await api('/users/me', { method: 'GET' })
    profileState.value = data
    return profileState.value
  } catch (e) {
    profileState.value = null
    throw e
  }
}
