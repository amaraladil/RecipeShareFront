import { useApi } from './useApi'

export function useRecipes(handle: string, isOwner: boolean) {
  console.log('useRecipes initialized with handle num:', handle)
  const fetchApi = useApi()

  const posts = ref([])
  const liked = ref<null | any[]>(null)
  const saved = ref<null | any[]>(null)

  const page = ref(0)
  const recipes = ref<any[]>([])
  const isLoading = ref(false)
  const hasMore = ref(true)

  const fetchPosts = async () => {
    isLoading.value = true
    posts.value = await fetchApi(`/recipes/u/${handle}`, { method: 'GET' })
    console.log('Fetched posts:', posts.value)
    isLoading.value = false
  }

  const fetchLiked = async () => {
    if (!liked.value) liked.value = await fetchApi(`/recipes/liked/${handle}`)
  }

  const fetchSaved = async () => {
    if (!saved.value) saved.value = await fetchApi(`/recipes/saved/`)
    console.log('Fetched saved recipes:', saved.value)
  }

  return { posts, liked, saved, isLoading, fetchPosts, fetchLiked, fetchSaved }
}
