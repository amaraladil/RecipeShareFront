export const useAuthModal = () => {
  const isOpenAuth = useState('auth-modal', () => false)

  const openAuth = () => {
    isOpenAuth.value = true
  }

  const closeAuth = () => {
    isOpenAuth.value = false
  }

  return {
    isOpenAuth,
    openAuth,
    closeAuth
  }
}
