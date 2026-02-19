<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <aside
      :class="[
        'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out relative z-40',
        sidebarExpanded ? 'w-64' : 'w-[73px]'
      ]"
      @mouseenter="handleSidebarHover(true)"
      @mouseleave="handleSidebarHover(false)"
    >
      <div class="flex flex-col h-full p-3">
        <div :class="['flex items-center ml-2']">
          <img class="size-8 mr-2" src="/LogoRecipeShare.png" />
          <h1
            :class="[
              'text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap transition-all duration-200 pb-2',
              sidebarExpanded
                ? 'opacity-100 w-auto'
                : 'opacity-0 w-0 overflow-hidden'
            ]"
          >
            {{ appName }}
          </h1>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 space-y-2">
          <button
            @click="toggleSidebar"
            class="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0 cursor-pointer"
          >
            <Icon
              name="heroicons:bars-3"
              class="size-5 text-gray-600 dark:text-gray-300"
            />
          </button>
          <template v-if="!userLoading">
            <!-- Home -->
            <NuxtLink
              to="/"
              class="flex items-center px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <Icon name="heroicons:home" class="size-5 flex-shrink-0" />
              <span
                :class="[
                  'ml-3 transition-all duration-200',
                  sidebarExpanded
                    ? 'opacity-100 w-auto'
                    : 'opacity-0 w-0 overflow-hidden'
                ]"
              >
                Home
              </span>
            </NuxtLink>

            <NuxtLink
              to="/explore"
              class="flex items-center px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <Icon name="heroicons:compass" class="size-5 flex-shrink-0" />
              <span
                :class="[
                  'ml-3 transition-all duration-200',
                  sidebarExpanded
                    ? 'opacity-100 w-auto'
                    : 'opacity-0 w-0 overflow-hidden'
                ]"
              >
                Explore
              </span>
            </NuxtLink>

            <NuxtLink
              v-if="user"
              to="/recipes/create"
              title="Create a new recipe"
              class="flex items-center px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <Icon
                name="heroicons:pencil-square"
                class="w-5 h-5 flex-shrink-0"
              />
              <span
                :class="[
                  'ml-3 transition-all duration-200 whitespace-nowrap',
                  sidebarExpanded
                    ? 'opacity-100 h-6 w-auto'
                    : 'opacity-0 w-1 h-6 overflow-hidden'
                ]"
              >
                Create Recipe
              </span>
            </NuxtLink>

            <div class="relative">
              <NuxtLink
                to="/messages"
                class="flex items-center px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              >
                <div class="relative">
                  <Icon
                    name="heroicons:chat-bubble-left-right"
                    class="w-5 h-5 flex-shrink-0"
                  />
                  <span
                    class="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center"
                  >
                    5
                  </span>
                </div>
                <span
                  :class="[
                    'ml-3 transition-all duration-200',
                    sidebarExpanded
                      ? 'opacity-100 w-auto'
                      : 'opacity-0 w-0 overflow-hidden'
                  ]"
                >
                  Messages
                </span>
              </NuxtLink>
            </div>
          </template>

          <div v-else class="space-y-2">
            <div
              v-for="n in 4"
              :key="n"
              class="h-11 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            ></div>
          </div>
        </nav>

        <!-- User section -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <template v-if="!userLoading">
            <!-- Login button -->
            <button
              v-if="!user"
              @click="isOpenAuth = true"
              class="flex items-center w-full px-3 py-3 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group cursor-pointer"
            >
              <Icon
                name="heroicons:arrow-right-on-rectangle"
                class="size-5 flex-shrink-0"
              />
              <span
                :class="[
                  'ml-3 transition-all duration-200',
                  sidebarExpanded
                    ? 'opacity-100 w-auto'
                    : 'opacity-0 w-0 overflow-hidden'
                ]"
              >
                Login
              </span>
            </button>

            <!-- User profile -->
            <template v-else>
              <NuxtLink
                v-if="profile"
                :to="`/@${profile.display_name}`"
                title="View Profile"
                class="flex items-center w-full px-2 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              >
                <UserAvatar
                  :avatar-url="profile.avatar_url"
                  :alt="profile.display_name"
                  class="w-8 h-8 z-10"
                />
                <div
                  :class="[
                    'ml-3 min-w-0 transition-all duration-200',
                    sidebarExpanded
                      ? 'opacity-100 w-auto'
                      : 'opacity-0 w-0 overflow-hidden'
                  ]"
                >
                  <p class="text-sm font-medium truncate">
                    {{ profile.display_name }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                    View Profile
                  </p>
                </div>
              </NuxtLink>

              <!-- Logout button -->
              <button
                @click="logout"
                class="flex items-center w-full px-3 py-3 mt-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group cursor-pointer"
              >
                <Icon
                  name="heroicons:arrow-left-on-rectangle"
                  class="w-5 h-5 flex-shrink-0"
                />
                <span
                  :class="[
                    'ml-3 transition-all duration-200',
                    sidebarExpanded
                      ? 'opacity-100 w-auto'
                      : 'opacity-0 w-0 overflow-hidden'
                  ]"
                >
                  Logout
                </span>
              </button>
            </template>
          </template>

          <!-- Loading skeleton for user section -->
          <div v-else class="space-y-2">
            <div
              class="h-11 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            ></div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main ref="mainContent" class="flex-1 overflow-y-auto">
      <!-- Mobile backdrop -->
      <div
        v-if="sidebarExpanded && isMobile"
        class="fixed inset-0 bg-black/30 z-30 lg:hidden"
        @click="sidebarExpanded = false"
      ></div>
      <NuxtPage />
    </main>

    <!-- Auth Modal -->
    <AuthModal v-if="isOpenAuth" />

    <NotificationContainer :leftExpand="sidebarExpanded" />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import AuthModal from '../components/AuthModal.vue'
  const { isOpenAuth } = useAuthModal()
  import type { Profile } from '~/types/profile'

  const profile = useProfileState() as Ref<Profile | null>
  const { user, fetchUser } = useSupabaseUser()
  const { $supabase } = useNuxtApp()
  const { appName } = useAppSettings()
  const {
    successNotif,
    errorNotif,
    warningNotif,
    infoNotif,
    removeAll,
    clearNonInfo
  } = useNotification()

  // Sidebar state
  const sidebarExpanded = ref(false)
  const isMobile = ref(false)
  const userLoading = ref(true)

  // Main content ref for scroll control
  const mainContent = ref<HTMLElement | null>(null)
  const route = useRoute()

  // Check if mobile
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1024
    if (!isMobile.value) {
      sidebarExpanded.value = false
    }
  }

  // Sidebar controls
  const toggleSidebar = () => {
    sidebarExpanded.value = !sidebarExpanded.value
  }

  const handleSidebarHover = (isHovering: boolean) => {
    if (!isMobile.value && !sidebarExpanded.value) {
      sidebarExpanded.value = isHovering
    }
  }

  const logout = async () => {
    await $supabase.auth.signOut()
    user.value = null
    location.reload()
  }

  // Scroll to top on route change
  watch(
    () => route.path,
    () => {
      if (mainContent.value) {
        mainContent.value.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  )

  onMounted(async () => {
    checkMobile()
    window.addEventListener('resize', checkMobile)

    await fetchUser()

    if (user.value && !profile.value) {
      await fetchCurrentUserProfile()
    }

    userLoading.value = false
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

  useHead({
    htmlAttrs: {
      lang: 'en'
    },
    link: [
      {
        rel: 'icon',
        type: 'image/png',
        href: '/LogoRecipeShare.png'
      }
    ]
  })
</script>
