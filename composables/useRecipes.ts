import { useApi } from './useApi'

export function useRecipes(handle: string, isOwner: boolean) {
  console.log('useRecipes initialized with handle:', handle)
  const fetchApi = useApi()

  const posts = ref<any[]>([])
  const liked = ref<any[]>([])
  const saved = ref<any[]>([])

  const postsPage = ref(0)
  const likedPage = ref(0)
  const savedPage = ref(0)

  const isLoading = ref(false)
  const hasMorePosts = ref(true)
  const hasMoreLiked = ref(true)
  const hasMoreSaved = ref(true)

  const ITEMS_PER_PAGE = 6 // Adjust based on your grid layout (2 rows of 3 cards each)

  const fetchPosts = async (reset = false) => {
    if (isLoading.value || (!hasMorePosts.value && !reset)) return

    isLoading.value = true

    try {
      if (reset) {
        postsPage.value = 0
        posts.value = []
        hasMorePosts.value = true
      }

      const response = await fetchApi(`/recipes/u/${handle}`, {
        method: 'GET',
        params: {
          page: postsPage.value,
          limit: ITEMS_PER_PAGE
        }
      })

      if (response && Array.isArray(response)) {
        if (reset) {
          posts.value = response
        } else {
          posts.value = [...posts.value, ...response]
        }

        // Check if we have more items
        hasMorePosts.value = response.length === ITEMS_PER_PAGE
        postsPage.value++

        console.log(
          'Fetched posts:',
          response.length,
          'Total:',
          posts.value.length
        )
      } else {
        hasMorePosts.value = false
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      hasMorePosts.value = false
    } finally {
      isLoading.value = false
    }
  }

  const fetchLiked = async (reset = false) => {
    if (isLoading.value || (!hasMoreLiked.value && !reset)) return

    isLoading.value = true

    try {
      if (reset) {
        likedPage.value = 0
        liked.value = []
        hasMoreLiked.value = true
      }

      const response = await fetchApi(`/recipes/liked/${handle}`, {
        method: 'GET',
        params: {
          page: likedPage.value,
          limit: ITEMS_PER_PAGE
        }
      })

      if (response && Array.isArray(response)) {
        if (reset) {
          liked.value = response
        } else {
          liked.value = [...liked.value, ...response]
        }

        hasMoreLiked.value = response.length === ITEMS_PER_PAGE
        likedPage.value++

        console.log(
          'Fetched liked:',
          response.length,
          'Total:',
          liked.value.length
        )
      } else {
        hasMoreLiked.value = false
      }
    } catch (error) {
      console.error('Error fetching liked:', error)
      hasMoreLiked.value = false
    } finally {
      isLoading.value = false
    }
  }

  const fetchSaved = async (reset = false) => {
    if (isLoading.value || (!hasMoreSaved.value && !reset)) return

    isLoading.value = true

    try {
      if (reset) {
        savedPage.value = 0
        saved.value = []
        hasMoreSaved.value = true
      }

      const response = await fetchApi(`/recipes/saved/`, {
        method: 'GET',
        params: {
          page: savedPage.value,
          limit: ITEMS_PER_PAGE
        }
      })

      if (response && Array.isArray(response)) {
        if (reset) {
          saved.value = response
        } else {
          saved.value = [...saved.value, ...response]
        }

        hasMoreSaved.value = response.length === ITEMS_PER_PAGE
        savedPage.value++

        console.log(
          'Fetched saved recipes:',
          response.length,
          'Total:',
          saved.value.length
        )
      } else {
        hasMoreSaved.value = false
      }
    } catch (error) {
      console.error('Error fetching saved:', error)
      hasMoreSaved.value = false
    } finally {
      isLoading.value = false
    }
  }

  const loadMore = async (tab: 'posts' | 'liked' | 'saved') => {
    switch (tab) {
      case 'posts':
        await fetchPosts()
        break
      case 'liked':
        await fetchLiked()
        break
      case 'saved':
        await fetchSaved()
        break
    }
  }

  const hasMore = computed(() => {
    return {
      posts: hasMorePosts.value,
      liked: hasMoreLiked.value,
      saved: hasMoreSaved.value
    }
  })

  const resetTab = async (tab: 'posts' | 'liked' | 'saved') => {
    switch (tab) {
      case 'posts':
        await fetchPosts(true)
        break
      case 'liked':
        await fetchLiked(true)
        break
      case 'saved':
        await fetchSaved(true)
        break
    }
  }

  return {
    posts,
    liked,
    saved,
    isLoading,
    fetchPosts,
    fetchLiked,
    fetchSaved,
    loadMore,
    hasMore,
    resetTab
  }
}
