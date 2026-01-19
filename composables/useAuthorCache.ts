import type { User } from '~/types/comment'

// Global author cache that persists across component instances
const authorCache = new Map<string, User | null>()

// Track pending requests to avoid duplicate fetches
const pendingRequests = new Map<string, Promise<User | null>>()

export const useAuthorCache = () => {
  const fetchApi = useApi()

  /**
   * Fetch author by ID with caching
   * Returns cached data immediately if available
   * Deduplicates concurrent requests for the same author
   */
  const fetchAuthor = async (userId: string): Promise<User | null> => {
    // Handle deleted/hidden users
    if (userId === '00000000-0000-0000-0000-000000000000') {
      return null
    }

    // Return cached data if available
    if (authorCache.has(userId)) {
      return authorCache.get(userId) || null
    }

    // Return pending request if one exists (deduplication)
    if (pendingRequests.has(userId)) {
      return pendingRequests.get(userId)!
    }

    // Create new fetch request
    const fetchPromise = (async () => {
      try {
        const authorResponse = await fetchApi(`/users/id/${userId}`)
        const author: User = {
          id: authorResponse.id,
          display_name: authorResponse.display_name,
          avatar_url: authorResponse.avatar_url || ''
        }

        // Cache the result
        authorCache.set(userId, author)
        return author
      } catch (error) {
        console.error(`Error fetching author ${userId}:`, error)
        // Cache null to avoid repeated failed requests
        authorCache.set(userId, null)
        return null
      } finally {
        // Clean up pending request
        pendingRequests.delete(userId)
      }
    })()

    // Store pending request
    pendingRequests.set(userId, fetchPromise)

    return fetchPromise
  }

  /**
   * Batch fetch multiple authors at once
   * More efficient than individual fetches
   */
  const fetchAuthors = async (
    userIds: string[]
  ): Promise<Map<string, User | null>> => {
    // Filter out already cached and deleted users
    const uniqueIds = [...new Set(userIds)].filter(
      (id) =>
        id !== '00000000-0000-0000-0000-000000000000' && !authorCache.has(id)
    )

    if (uniqueIds.length === 0) {
      // Return only cached data
      const result = new Map<string, User | null>()
      userIds.forEach((id) => {
        result.set(id, authorCache.get(id) || null)
      })
      return result
    }

    // Fetch all uncached authors in parallel
    await Promise.all(uniqueIds.map((id) => fetchAuthor(id)))

    // Return all requested authors (now all cached)
    const result = new Map<string, User | null>()
    userIds.forEach((id) => {
      result.set(id, authorCache.get(id) || null)
    })
    return result
  }

  /**
   * Pre-populate cache with known author data
   * Useful when you already have author info from API responses
   */
  const cacheAuthor = (userId: string, author: User | null) => {
    authorCache.set(userId, author)
  }

  /**
   * Clear specific author from cache
   * Useful when author info is updated
   */
  const invalidateAuthor = (userId: string) => {
    authorCache.delete(userId)
  }

  /**
   * Clear all cached authors
   * Use sparingly (e.g., on logout)
   */
  const clearCache = () => {
    authorCache.clear()
    pendingRequests.clear()
  }

  /**
   * Get cached author without fetching
   * Returns undefined if not cached
   */
  const getCachedAuthor = (userId: string): User | null | undefined => {
    return authorCache.get(userId)
  }

  return {
    fetchAuthor,
    fetchAuthors,
    cacheAuthor,
    invalidateAuthor,
    clearCache,
    getCachedAuthor
  }
}
