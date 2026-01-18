<script setup lang="ts">
  import { pageTitle } from '~/utils/meta'
  import EditProfileModal from '~/components/EditProfileModal.vue'
  import { CACHE_PROFILE_DURATION } from '~/constants'
  import type { Profile } from '~/types/profile'

  const config = useRuntimeConfig()
  const route = useRoute()
  const handle = route.params.handle.toString().replace(/^@/, '')
  const { user } = useSupabaseUser()
  const { fetchProfile } = useUserProfile(handle)

  const showModal = ref(false)
  const openModal = () => (showModal.value = true)
  const closeModal = () => (showModal.value = false)

  const nuxtApp = useNuxtApp()
  const {
    data: profile,
    pending: profileLoading,
    error
  } = await useAsyncData<Profile | null>(
    `profile-${handle}`,
    () => fetchProfile(),
    {
      transform(input) {
        if (!input) return null
        return {
          ...input,
          fetchTime: new Date()
        } as Profile
      },
      getCachedData(key) {
        const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key]

        if (!data) return null

        const expired = data.fetchTime
          ? new Date(data.fetchTime) <
            new Date(Date.now() - CACHE_PROFILE_DURATION)
          : false

        if (expired) {
          return null // Cache expired, fetch new data
        }

        return data as Profile
      }
    }
  )

  const refreshProfile = async (updatedUserData?: any) => {
    if (updatedUserData) {
      // Use the fresh data from the server
      profile.value = {
        ...updatedUserData,
        fetchTime: new Date()
      } as Profile
    } else {
      // Fallback to fetching from the server
      profile.value = await fetchProfile(true)
    }
  }

  const isOwnProfile = computed(() => {
    return user.value && profile.value && user.value.id === profile.value.id
  })

  const {
    posts,
    liked,
    saved,
    fetchPosts,
    fetchLiked,
    fetchSaved,
    isLoading,
    loadMore,
    hasMore,
    resetTab,
    itemsPerPage,
    cleanup
  } = useRecipes(handle, isOwnProfile.value ?? false)

  const activeTab = ref('posts')
  const loadMoreTrigger = ref<HTMLElement>()
  let intersectionObserver: IntersectionObserver | null = null

  onMounted(async () => {
    await fetchPosts()
    setupIntersectionObserver()
  })

  onUnmounted(() => {
    cleanup()
    if (intersectionObserver) {
      intersectionObserver.disconnect()
    }
  })

  // Watch for tab changes and load initial data
  watch(activeTab, async (newTab, oldTab) => {
    if (newTab === 'liked' && liked.value.length === 0) {
      await fetchLiked(true)
    } else if (newTab === 'saved' && saved.value.length === 0) {
      await fetchSaved(true)
    }
  })

  // Setup Intersection Observer for infinite scroll
  const setupIntersectionObserver = () => {
    if (!import.meta.client) return

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoading.value) {
            const currentTab = activeTab.value as 'posts' | 'liked' | 'saved'
            if (hasMore.value[currentTab]) {
              console.log('Loading more recipes for tab:', currentTab)
              loadMore(currentTab)
            }
          }
        })
      },
      {
        root: null, // Use viewport as root
        rootMargin: '100px', // Trigger 100px before the element comes into view
        threshold: 0.1
      }
    )

    // Observe the trigger element when it's available
    nextTick(() => {
      if (loadMoreTrigger.value) {
        intersectionObserver?.observe(loadMoreTrigger.value)
      }
    })
  }

  // Re-observe trigger when tab changes
  watch(activeTab, () => {
    nextTick(() => {
      if (loadMoreTrigger.value && intersectionObserver) {
        intersectionObserver.unobserve(loadMoreTrigger.value)
        intersectionObserver.observe(loadMoreTrigger.value)
      }
    })
  })

  // Get current recipes based on active tab
  const currentRecipes = computed(() => {
    switch (activeTab.value) {
      case 'posts':
        return posts.value
      case 'liked':
        return liked.value
      case 'saved':
        return saved.value
      default:
        return []
    }
  })

  // Debug info
  const debugInfo = computed(() => ({
    activeTab: activeTab.value,
    recipesCount: currentRecipes.value.length,
    itemsPerPage: itemsPerPage.value,
    isLoading: isLoading.value,
    hasMore: hasMore.value[activeTab.value as 'posts' | 'liked' | 'saved']
  }))

  // Expose environment to template
  const isDev = false //process.env.NODE_ENV === 'development'

  if (profile.value) {
    useSeoMeta({
      title: pageTitle(`${profile.value?.nick_name} (@${handle})`),
      description: ` @${profile.value?.display_name} - Explore their recipes and culinary creations.`,
      ogTitle: pageTitle(`@${handle} - Profile`),
      ogDescription: ` @${profile.value?.display_name} - Explore their recipes and culinary creations.`,
      ogImage: '/LogoRecipeShare.png',
      ogUrl: config.public.baseUrl + route.path,
      twitterTitle: pageTitle(`@${handle} - Profile`),
      twitterDescription: `@${profile.value?.display_name} - Explore their recipes and culinary creations.`,
      twitterImage: '/LogoRecipeShare.png',
      twitterCard: 'summary'
    })
  } else {
    useSeoMeta({
      title: pageTitle(`Discover Recipes here`),
      description: 'Find and share your favorite recipes with our community.',
      ogTitle: pageTitle(`Discover Recipes here`),
      ogDescription: 'Find and share your favorite recipes with our community.',
      ogImage: '/LogoRecipeShare.png',
      ogUrl: config.public.baseUrl + route.path,
      twitterTitle: pageTitle(`Discover Recipes here`),
      twitterDescription:
        'Find and share your favorite recipes with our community.',
      twitterImage: '/LogoRecipeShare.png',
      twitterCard: 'summary_large_image'
    })
  }
</script>

<template>
  <div class="container ml-4 p-6">
    <div v-if="profileLoading" class="mb-4">Loading profile...</div>
    <div v-else-if="profile">
      <!-- Profile Info -->
      <div class="flex items-center gap-4 mb-6">
        <Icon
          v-if="!profile.avatar_url"
          name="stash:user-avatar"
          class="sm:w-53 w-48 sm:h-53 h-48 text-gray-500 dark:text-gray-400"
        />
        <img
          v-else
          :src="profile.avatar_url"
          alt="Profile picture"
          class="sm:w-53 w-48 sm:h-53 h-48 rounded-full object-cover border"
        />
        <div>
          <button v-if="isOwnProfile" class="btn" @click="openModal">
            Edit Profile
          </button>
          <div class="text-2xl font-bold">@{{ profile.display_name }}</div>
          <div class="text-lg text-gray-700">{{ profile.nick_name }}</div>
          <div class="text-gray-500 whitespace-pre-line">{{ profile.bio }}</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs flex gap-2 mb-4">
        <button
          @click="activeTab = 'posts'"
          :class="
            activeTab === 'posts'
              ? 'bg-blue-600 text-white font-bold px-4 py-2 rounded'
              : 'bg-gray-200 text-gray-700 px-4 py-2 rounded'
          "
        >
          Posts ({{ posts.length }})
        </button>
        <button
          @click="activeTab = 'liked'"
          :class="
            activeTab === 'liked'
              ? 'bg-blue-600 text-white font-bold px-4 py-2 rounded'
              : 'bg-gray-200 text-gray-700 px-4 py-2 rounded'
          "
        >
          Liked ({{ liked.length }})
        </button>
        <button
          @click="activeTab = 'saved'"
          :class="
            activeTab === 'saved'
              ? 'bg-blue-600 text-white font-bold px-4 py-2 rounded'
              : 'bg-gray-200 text-gray-700 px-4 py-2 rounded'
          "
        >
          Saved ({{ saved.length }})
        </button>
        <div class="bg-gray-100 p-2 mb-4 text-xs rounded" v-if="isDev">
          Debug: {{ debugInfo }}
        </div>
      </div>

      <!-- Recipes Grid Container -->
      <div class="recipes-container">
        <!-- Recipes Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <RecipeCard
            v-for="recipe in currentRecipes"
            :key="recipe._id"
            :recipe="recipe"
          />
        </div>

        <!-- Empty state -->
        <div
          v-if="!isLoading && currentRecipes.length === 0"
          class="text-center py-12 text-gray-500"
        >
          <!-- <div class="text-lg font-medium mb-2">No recipes found</div> -->
          <div class="text-sm">
            {{
              activeTab === 'posts'
                ? 'No recipes posted yet'
                : activeTab === 'liked'
                ? 'No liked recipes yet'
                : 'No saved recipes yet'
            }}
          </div>
        </div>

        <!-- Loading trigger and indicator -->
        <div ref="loadMoreTrigger" class="load-more-trigger py-8">
          <!-- Loading indicator -->
          <div v-if="isLoading" class="flex justify-center items-center">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
            ></div>
            <span class="ml-2 text-gray-600">Loading more recipes...</span>
          </div>

          <!-- No more items indicator -->
          <div
            v-else-if="currentRecipes.length != 0 && !hasMore[activeTab as 'posts' | 'liked' | 'saved']"
            class="text-center text-gray-500"
          >
            <div class="text-sm">No more recipes to load</div>
          </div>

          <!-- Load more trigger (visible but subtle) -->
          <div v-else class="text-center text-gray-400 text-sm">
            Scroll down for more recipes...
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center min-h-[40vh] mb-4 text-xl font-bold"
    >
      Couldn't find this account.
    </div>
  </div>

  <EditProfileModal
    v-if="isOwnProfile && profile"
    :show="showModal"
    :user="profile"
    @close="closeModal"
    @updated="refreshProfile"
  />
</template>

<style scoped>
  @import '@/assets/styles/main.css';

  .recipes-container {
    min-height: 400px;
  }

  .load-more-trigger {
    min-height: 50px;
  }
</style>
