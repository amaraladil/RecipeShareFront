<script setup lang="ts">
  import { useRecipes } from '@/composables/useRecipes'
  import { pageTitle } from '~/utils/meta'
  import { useSupabaseUser } from '~/composables/useSupabaseUser'
  import EditProfileModal from '~/components/EditProfileModal.vue'
  import EditProfileModal2 from '~/components/EditProfile2Modal.vue'

  const config = useRuntimeConfig()
  const route = useRoute()
  const handle = route.params.handle.toString().replace(/^@/, '')
  const { user } = useSupabaseUser()
  const { fetchProfile } = useUserProfile(handle)

  const showModal = ref(false)
  const openModal = () => (showModal.value = true)
  const closeModal = () => (showModal.value = false)

  // Use baseURL for SSR and client
  interface Profile {
    id: string
    avatar_url: string
    display_name: string
    nick_name: string
    bio: string
    fetchTime?: Date
    // add other properties as needed
  }

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
          ? new Date(data.fetchTime) < new Date(Date.now() - 30 * 1000)
          : false

        if (expired) {
          return null // Cache expired, fetch new data
        }

        return data as Profile
      }
    }
  )

  const refreshProfile = async () => {
    profile.value = await fetchProfile(true)
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
    resetTab
  } = useRecipes(handle, isOwnProfile.value ?? false)

  const activeTab = ref('posts')
  const recipesContainer = ref<HTMLElement>()

  onMounted(async () => {
    await fetchPosts()
    setupInfiniteScroll()
  })

  // Watch for tab changes and load initial data
  watch(activeTab, async (newTab, oldTab) => {
    if (newTab === 'liked' && liked.value.length === 0) {
      await fetchLiked(true)
    } else if (newTab === 'saved' && saved.value.length === 0) {
      await fetchSaved(true)
    }
  })

  // Infinite scroll setup
  const setupInfiniteScroll = () => {
    const handleScroll = () => {
      if (!recipesContainer.value || isLoading.value) return

      const container = recipesContainer.value
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight

      // Load more when user scrolls to within 200px of bottom
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        const currentTab = activeTab.value as 'posts' | 'liked' | 'saved'
        if (hasMore.value[currentTab]) {
          loadMore(currentTab)
        }
      }
    }

    // Also listen to window scroll if container doesn't have its own scroll
    const handleWindowScroll = () => {
      if (isLoading.value) return

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight

      if (scrollTop + clientHeight >= scrollHeight - 200) {
        const currentTab = activeTab.value as 'posts' | 'liked' | 'saved'
        if (hasMore.value[currentTab]) {
          loadMore(currentTab)
        }
      }
    }

    // Add scroll listeners
    if (recipesContainer.value) {
      recipesContainer.value.addEventListener('scroll', handleScroll)
    }
    window.addEventListener('scroll', handleWindowScroll)

    // Cleanup on unmount
    onUnmounted(() => {
      if (recipesContainer.value) {
        recipesContainer.value.removeEventListener('scroll', handleScroll)
      }
      window.removeEventListener('scroll', handleWindowScroll)
    })
  }

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

  if (profile.value) {
    useSeoMeta({
      title: pageTitle(`${profile.value?.nick_name} (@${handle})`),
      description: ` @${profile.value?.display_name} - Explore their recipes and culinary creations.`,
      ogTitle: pageTitle(`@${handle} - Profile`),
      ogDescription: ` @${profile.value?.display_name} - Explore their recipes and culinary creations.`,
      ogImage: '[og:image]',
      ogUrl: config.public.baseUrl + route.path,
      twitterTitle: pageTitle(`@${handle} - Profile`),
      twitterDescription: `@${profile.value?.display_name} - Explore their recipes and culinary creations.`,
      twitterImage: '[twitter:image]',
      twitterCard: 'summary'
    })
  } else {
    useSeoMeta({
      title: pageTitle(`Discover Recipes here`),
      description: 'Find and share your favorite recipes with our community.',
      ogTitle: pageTitle(`Discover Recipes here`),
      ogDescription: 'Find and share your favorite recipes with our community.',
      ogImage: '[og:image]',
      ogUrl: config.public.baseUrl + route.path,
      twitterTitle: pageTitle(`Discover Recipes here`),
      twitterDescription:
        'Find and share your favorite recipes with our community.',
      twitterImage: '[twitter:image]',
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
        <img
          :src="profile.avatar_url"
          alt="Profile picture"
          class="w-53 h-53 rounded-full object-cover border"
        />
        <div>
          <button v-if="isOwnProfile" class="btn" @click="openModal">
            Edit Profile
          </button>
          <EditProfileModal2
            v-if="isOwnProfile && profile"
            :show="showModal"
            :user="profile"
            @close="closeModal"
            @updated="refreshProfile"
          />
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
      </div>

      <!-- Recipes Grid Container -->
      <div ref="recipesContainer" class="recipes-container">
        <!-- Recipes Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <RecipeCard
            v-for="recipe in currentRecipes"
            :key="recipe._id"
            :recipe="recipe"
          />
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="flex justify-center items-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          ></div>
          <span class="ml-2 text-gray-600">Loading more recipes...</span>
        </div>

        <!-- No more items indicator -->
        <div
          v-else-if="currentRecipes.length > 0 && !hasMore[activeTab as 'posts' | 'liked' | 'saved']"
          class="text-center py-8 text-gray-500"
        >
          No more recipes to load
        </div>

        <!-- Empty state -->
        <div
          v-else-if="!isLoading && currentRecipes.length === 0"
          class="text-center py-12 text-gray-500"
        >
          <div class="text-lg font-medium mb-2">No recipes found</div>
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
</style>
