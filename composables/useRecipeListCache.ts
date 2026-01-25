interface RecipeListCache {
  recipes: any[]
  totalLoaded: number
  hasMore: boolean
}

interface CacheStore {
  [handle: string]: {
    posts?: RecipeListCache
    liked?: RecipeListCache
    saved?: RecipeListCache
  }
}

// Global cache that persists across component instances
const recipeListCache: CacheStore = {}

export const useRecipeListCache = () => {
  /**
   * Get cached recipe list
   * Returns null if cache doesn't exist
   */
  const getCachedList = (
    handle: string,
    type: 'posts' | 'liked' | 'saved'
  ): RecipeListCache | null => {
    const userCache = recipeListCache[handle]
    if (!userCache || !userCache[type]) {
      return null
    }

    const cache = userCache[type]!
    console.log(
      `Cache hit for ${handle}/${type}, ${cache.recipes.length} recipes`
    )
    return cache
  }

  /**
   * Set cached recipe list
   * Appends new recipes if skip > 0 (pagination)
   */
  const setCachedList = (
    handle: string,
    type: 'posts' | 'liked' | 'saved',
    recipes: any[],
    skip: number,
    hasMore: boolean
  ) => {
    if (!recipeListCache[handle]) {
      recipeListCache[handle] = {}
    }

    const existingCache = recipeListCache[handle][type]

    if (skip === 0) {
      // Fresh fetch, replace cache
      recipeListCache[handle][type] = {
        recipes: [...recipes],
        totalLoaded: recipes.length,
        hasMore
      }
      console.log(
        `Cache set (fresh) for ${handle}/${type}, ${recipes.length} recipes`
      )
    } else if (existingCache) {
      // Pagination, append to existing cache
      const uniqueRecipes = recipes.filter(
        (newRecipe) => !existingCache.recipes.some((r) => r.id === newRecipe.id)
      )

      recipeListCache[handle][type] = {
        recipes: [...existingCache.recipes, ...uniqueRecipes],
        totalLoaded: existingCache.totalLoaded + uniqueRecipes.length,
        hasMore
      }
      console.log(
        `Cache updated (pagination) for ${handle}/${type}, added ${uniqueRecipes.length} recipes, total: ${recipeListCache[handle][type]!.recipes.length}`
      )
    }
  }

  /**
   * Invalidate cache for a specific list type
   */
  const invalidateList = (
    handle: string,
    type: 'posts' | 'liked' | 'saved'
  ) => {
    if (recipeListCache[handle] && recipeListCache[handle][type]) {
      delete recipeListCache[handle][type]
      console.log(`Cache invalidated for ${handle}/${type}`)
    }
  }

  /**
   * Invalidate all caches for a user
   */
  const invalidateUser = (handle: string) => {
    delete recipeListCache[handle]
    console.log(`All caches invalidated for ${handle}`)
  }

  /**
   * Clear entire cache
   */
  const clearCache = () => {
    Object.keys(recipeListCache).forEach((key) => {
      delete recipeListCache[key]
    })
    console.log('Entire recipe list cache cleared')
  }

  /**
   * Update a single recipe in cache (useful after like/save actions)
   */
  const updateRecipeInCache = (
    handle: string,
    type: 'posts' | 'liked' | 'saved',
    recipeId: string,
    updates: Partial<any>
  ) => {
    const cache = recipeListCache[handle]?.[type]
    if (!cache) return

    const recipeIndex = cache.recipes.findIndex((r) => r.id === recipeId)
    if (recipeIndex !== -1) {
      cache.recipes[recipeIndex] = {
        ...cache.recipes[recipeIndex],
        ...updates
      }
      console.log(`Recipe ${recipeId} updated in ${handle}/${type} cache`)
    }
  }

  /**
   * Remove a recipe from cache (useful after delete)
   */
  const removeRecipeFromCache = (
    handle: string,
    type: 'posts' | 'liked' | 'saved',
    recipeId: string
  ) => {
    const cache = recipeListCache[handle]?.[type]
    if (!cache) return

    const initialLength = cache.recipes.length
    cache.recipes = cache.recipes.filter((r) => r.id !== recipeId)

    if (cache.recipes.length < initialLength) {
      cache.totalLoaded = cache.recipes.length
      console.log(`Recipe ${recipeId} removed from ${handle}/${type} cache`)
    }
  }

  /**
   * Add a recipe to cache (useful after create)
   */
  const addRecipeToCache = (
    handle: string,
    type: 'posts' | 'liked' | 'saved',
    recipe: any
  ) => {
    const cache = recipeListCache[handle]?.[type]
    if (!cache) return

    // Add to beginning of list (most recent first)
    cache.recipes.unshift(recipe)
    cache.totalLoaded = cache.recipes.length
    console.log(`Recipe added to ${handle}/${type} cache`)
  }

  return {
    getCachedList,
    setCachedList,
    invalidateList,
    invalidateUser,
    clearCache,
    updateRecipeInCache,
    removeRecipeFromCache,
    addRecipeToCache
  }
}
