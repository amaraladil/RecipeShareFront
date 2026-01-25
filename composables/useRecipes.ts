import { useApi } from './useApi'

export function useRecipes(handle: string, isOwner: boolean) {
  console.log('useRecipes initialized with handle:', handle)
  const fetchApi = useApi()
  const { getCachedList, setCachedList, invalidateList } = useRecipeListCache()

  const posts = ref<any[]>([])
  const liked = ref<any[]>([])
  const saved = ref<any[]>([])

  const isLoading = ref(false)
  const hasMorePosts = ref(true)
  const hasMoreLiked = ref(true)
  const hasMoreSaved = ref(true)

  // Dynamic items per page based on screen width
  const getItemsPerPage = () => {
    if (import.meta.client) {
      const width = window.innerWidth
      if (width < 640) return 4 // Mobile: 1 column, show 4 rows
      if (width < 1024) return 6 // Tablet: 2 columns, show 3 rows
      return 9 // Desktop: 3 columns, show 3 rows
    }
    return 6 // Default for SSR
  }

  const itemsPerPage = ref(getItemsPerPage())

  // Update items per page on window resize
  if (import.meta.client) {
    const updateItemsPerPage = () => {
      itemsPerPage.value = getItemsPerPage()
    }

    window.addEventListener('resize', updateItemsPerPage)
  }

  const fetchPosts = async (reset = false) => {
    if (isLoading.value || (!hasMorePosts.value && !reset)) return

    // Try to load from cache first
    if (reset) {
      const cachedData = getCachedList(handle, 'posts')
      if (cachedData) {
        posts.value = cachedData.recipes
        hasMorePosts.value = cachedData.hasMore
        console.log('Loaded posts from cache:', posts.value.length)
        return
      }
    }

    isLoading.value = true

    try {
      if (reset) {
        posts.value = []
        hasMorePosts.value = true
      }

      const skip = reset ? 0 : posts.value.length
      const response = await fetchApi(`/recipes/u/${handle}`, {
        method: 'GET',
        params: {
          skip,
          limit: itemsPerPage.value
        }
      })

      if (response && Array.isArray(response)) {
        if (reset) {
          posts.value = response
        } else {
          posts.value = [...posts.value, ...response]
        }

        hasMorePosts.value = response.length === itemsPerPage.value
        console.log('Response posts:', hasMorePosts.value)
        // Cache the results
        setCachedList(handle, 'posts', response, skip, hasMorePosts.value)

        console.log(
          'Fetched posts:',
          response.length,
          'Total:',
          posts.value.length,
          'Skip:',
          skip
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

    // Try to load from cache first
    if (reset) {
      const cachedData = getCachedList(handle, 'liked')
      if (cachedData) {
        liked.value = cachedData.recipes
        hasMoreLiked.value = cachedData.hasMore
        console.log('Loaded liked from cache:', liked.value.length)
        return
      }
    }

    isLoading.value = true

    try {
      if (reset) {
        liked.value = []
        hasMoreLiked.value = true
      }

      const skip = reset ? 0 : liked.value.length
      const response = await fetchApi(`/recipes/liked/`, {
        method: 'GET',
        params: {
          skip,
          limit: itemsPerPage.value
        }
      })

      if (response && Array.isArray(response)) {
        const hasMore = response.length === itemsPerPage.value

        if (reset) {
          liked.value = response
        } else {
          liked.value = [...liked.value, ...response]
        }

        hasMoreLiked.value = hasMore

        // Cache the results
        setCachedList(handle, 'liked', response, skip, hasMore)

        console.log(
          'Fetched liked:',
          response.length,
          'Total:',
          liked.value.length,
          'Skip:',
          skip
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

    // Try to load from cache first
    if (reset) {
      const cachedData = getCachedList(handle, 'saved')
      if (cachedData) {
        saved.value = cachedData.recipes
        hasMoreSaved.value = cachedData.hasMore
        console.log('Loaded saved from cache:', saved.value.length)
        return
      }
    }

    isLoading.value = true

    try {
      if (reset) {
        saved.value = []
        hasMoreSaved.value = true
      }

      const skip = reset ? 0 : saved.value.length
      const response = await fetchApi(`/recipes/saved/`, {
        method: 'GET',
        params: {
          skip,
          limit: itemsPerPage.value
        }
      })

      if (response && Array.isArray(response)) {
        const hasMore = response.length === itemsPerPage.value

        if (reset) {
          saved.value = response
        } else {
          saved.value = [...saved.value, ...response]
        }

        hasMoreSaved.value = hasMore

        // Cache the results
        setCachedList(handle, 'saved', response, skip, hasMore)

        console.log(
          'Fetched saved recipes:',
          response.length,
          'Total:',
          saved.value.length,
          'Skip:',
          skip
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
    // Invalidate cache when explicitly resetting
    invalidateList(handle, tab)

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

  // Cleanup function for resize listener
  const cleanup = () => {
    if (import.meta.client) {
      window.removeEventListener('resize', () => {
        itemsPerPage.value = getItemsPerPage()
      })
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
    resetTab,
    itemsPerPage: readonly(itemsPerPage),
    cleanup
  }
}
