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
const openModal = () => showModal.value = true
const closeModal = () => showModal.value = false



// Use baseURL for SSR and client
interface Profile {
  id: string
  avatar_url: string
  display_name: string
  nick_name: string
  bio: string
  // add other properties as needed
}

const { data: profile, pending: profileLoading, error } = await useAsyncData<Profile | null>(
  `profile-${handle}`,
  () => fetchProfile()
)

const refreshProfile = async () => {
  profile.value = await fetchProfile(true)
}



const isOwnProfile = computed(() => {
  // Compare by id, handle, or email as appropriate for your app
  return user.value && profile.value && user.value.id === profile.value.id
  // Or, if using handle: return user.value && profile.value && user.value.handle === profile.value.handle
})

const {
  posts,
  liked,
  saved,
  fetchPosts,
  fetchLiked,
  fetchSaved,
  isLoading
} = useRecipes(handle)

const activeTab = ref('posts')

onMounted(async () => {
  await fetchPosts()
})

watch(activeTab, async (tab) => {
  if (tab === 'liked') await fetchLiked()
  if (tab === 'saved') await fetchSaved()
})

if (profile.value){
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
    twitterDescription: 'Find and share your favorite recipes with our community.',
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
          <button v-if="isOwnProfile" class="btn" @click="openModal">Edit Profile</button>
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
          :class="activeTab === 'posts' ? 'bg-blue-600 text-white font-bold px-4 py-2 rounded' : 'bg-gray-200 text-gray-700 px-4 py-2 rounded'"
        >
          Posts
        </button>
        <button
          @click="activeTab = 'liked'"
          :class="activeTab === 'liked' ? 'bg-blue-600 text-white font-bold px-4 py-2 rounded' : 'bg-gray-200 text-gray-700 px-4 py-2 rounded'"
        >
          Liked
        </button>
        <button
          @click="activeTab = 'saved'"
          :class="activeTab === 'saved' ? 'bg-blue-600 text-white font-bold px-4 py-2 rounded' : 'bg-gray-200 text-gray-700 px-4 py-2 rounded'"
        >
          Saved
        </button>
      </div>
      <div v-if="isLoading">Loading...</div>
      <div v-else>
        <RecipeCard
          v-for="recipe in activeTab === 'posts' ? posts : activeTab === 'liked' ? liked : saved"
          :key="recipe._id"
          :recipe="recipe"
        />
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