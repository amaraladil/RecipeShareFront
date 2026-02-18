<script setup lang="ts">
  import { CACHE_RECIPE_DURATION } from '~/constants'
  import { pageTitle } from '~/utils/meta'

  const route = useRoute()
  const router = useRouter()
  const { user } = useSupabaseUser()
  const fetchApi = useApi()
  const { openAuth } = useAuthModal()

  const slug = route.params.slug as string

  // Recipe data
  const recipe = ref<any>(null)
  const recipe_id = ref<string | null>(null)
  const isEditMode = ref(false)
  const isSaving = ref(false)
  const errorMessage = ref('')

  // Comments loading
  const shouldLoadComments = ref(false)
  const commentsTrigger = ref<HTMLElement>()

  // Use recipe form composable for edit mode
  const {
    form,
    errors: validationErrors,
    validateForm,
    resetForm,
    getUpdatedData,
    addIngredient,
    removeIngredient,
    addStep,
    removeStep,
    addTag,
    removeTag
  } = useRecipeForm()

  const { cacheAuthor } = useAuthorCache()
  const { errorNotif, successNotif } = useNotification()

  // Store selected image file for upload
  const selectedImageFile = ref<File | null>(null)
  const imageUploadError = ref('')

  // Computed properties
  const isOwner = computed(() => {
    return (
      user.value && recipe.value && user.value.id === recipe.value.author?.id
    )
  })

  const observer = ref<IntersectionObserver | null>(null)

  // Intersection Observer for lazy loading comments
  const setupCommentsObserver = () => {
    if (!commentsTrigger.value || observer.value) return

    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoadComments.value) {
            shouldLoadComments.value = true
            observer.value?.disconnect()
            observer.value = null
          }
        })
      },
      {
        rootMargin: '100px'
      }
    )

    observer.value.observe(commentsTrigger.value)
  }

  const nuxtApp = useNuxtApp()
  const { data: recipeData, pending } = await useAsyncData<any>(
    `recipe-${slug}`,
    () => fetchApi(`/recipes/${slug}`, { method: 'GET' }),
    {
      transform(input) {
        if (!input) return null
        return {
          ...input,
          fetchTime: new Date()
        } as any
      },
      getCachedData(key) {
        const data = nuxtApp.payload.data[key]

        if (!data) return null

        const expired = data.fetchTime
          ? new Date(data.fetchTime) <
            new Date(Date.now() - CACHE_RECIPE_DURATION)
          : false

        if (expired) {
          return null
        }

        return data as any
      },
      immediate: true,
      server: true,
      lazy: false
    }
  )

  if (recipeData.value) {
    recipe.value = recipeData.value
    recipe_id.value = recipeData.value.id
    resetForm({
      title: recipeData.value.title || '',
      description: recipeData.value.description || '',
      ingredients: [...(recipeData.value.ingredients || [])],
      steps: [...(recipeData.value.steps || [])],
      prep_time: recipeData.value.prep_time || 0,
      cook_time: recipeData.value.cook_time || 0,
      servings: recipeData.value.servings || 1,
      tags: [...(recipeData.value.tags || [])],
      image: recipeData.value.image || '',
      status: recipeData.value.status || 1
    })
    cacheAuthor(recipeData.value.author.id, recipeData.value.author)
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditMode.value) {
      if (recipe.value) {
        resetForm({
          title: recipe.value.title || '',
          description: recipe.value.description || '',
          ingredients: [...(recipe.value.ingredients || [])],
          steps: [...(recipe.value.steps || [])],
          prep_time: recipe.value.prep_time || 0,
          cook_time: recipe.value.cook_time || 0,
          servings: recipe.value.servings || 1,
          tags: [...(recipe.value.tags || [])],
          image: recipe.value.image || '',
          status: recipe.value.status || 1
        })
        selectedImageFile.value = null
        imageUploadError.value = ''
      }
    }
    isEditMode.value = !isEditMode.value
  }

  // Handle file selection in edit mode
  const handleFileSelected = (file: File) => {
    selectedImageFile.value = file
    imageUploadError.value = ''
    console.log('File selected for edit:', file)
  }

  // Save recipe changes
  const saveRecipe = async () => {
    if (!validateForm()) {
      return
    }

    try {
      isSaving.value = true
      errorMessage.value = ''
      imageUploadError.value = ''

      // Upload new image if one was selected
      if (selectedImageFile.value) {
        const uploadFormData = new FormData()
        uploadFormData.append('recipe_id', String(recipe_id.value ?? ''))
        uploadFormData.append('recipe_url', recipe.value.image)
        uploadFormData.append('image', selectedImageFile.value)

        try {
          const uploadResponse = await fetchApi('/upload/recipe', {
            method: 'POST',
            body: uploadFormData
          })

          if (uploadResponse && uploadResponse.url) {
            form.value.image = uploadResponse.url
          }
        } catch (uploadErr) {
          console.error('Error uploading image:', uploadErr)
          imageUploadError.value = 'Failed to upload image'
          return
        }
      }
      const updatedFields = getUpdatedData(recipe.value)

      if (!updatedFields || Object.keys(updatedFields).length === 0) {
        errorNotif('No changes to save')
        return
      }

      const response = await fetchApi(`/recipes/${slug}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedFields)
      })

      if (response) {
        recipe.value = response
        toggleEditMode()
        clearNuxtData(`recipe-${slug}`)
        if (recipe.value.slug !== slug) {
          router.push(`/recipes/${recipe.value.slug}`)
        }
        successNotif('Recipe updated successfully')
        console.log('Recipe updated successfully')
      }
    } catch (err) {
      console.error('Error saving recipe:', err)
      errorMessage.value = 'Failed to save recipe changes'
    } finally {
      isSaving.value = false
    }
  }

  // Delete recipe
  const deleteRecipe = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this recipe? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      await fetchApi(`/recipes/${slug}`, { method: 'DELETE' })
      router.push('/')
    } catch (err) {
      console.error('Error deleting recipe:', err)
      errorMessage.value = 'Failed to delete recipe'
    }
  }

  const likeRecipeToggle = async () => {
    if (!user.value) {
      openAuth()
      return
    }

    if (isOwner.value) {
      return
    }

    const wasLiked = recipe.value.is_liked
    const originalCount = recipe.value.counter?.likes || 0

    recipe.value.is_liked = !wasLiked
    recipe.value.counter.likes += wasLiked ? -1 : 1

    try {
      const method = wasLiked ? 'DELETE' : 'POST'
      await fetchApi(`/recipes/${recipe_id.value}/like`, { method })
    } catch (error) {
      recipe.value.is_liked = wasLiked
      recipe.value.counter.likes = originalCount
      errorNotif(`Failed to ${wasLiked ? 'unlike' : 'like'} recipe.`)
    }
  }

  const saveRecipeToggle = async () => {
    if (!user.value) {
      openAuth()
      return
    }

    if (isOwner.value) {
      return
    }

    const wasSaved = recipe.value.is_saved

    recipe.value.is_saved = !wasSaved

    try {
      const method = wasSaved ? 'DELETE' : 'POST'
      await fetchApi(`/recipes/${recipe_id.value}/save`, { method })
    } catch (error) {
      recipe.value.is_saved = wasSaved
      errorNotif(`Failed to ${wasSaved ? 'unsave' : 'save'} recipe.`)
    }
  }

  const updateIngredient = (index: number, ingredient: any) => {
    form.value.ingredients[index] = ingredient
  }

  const updateStep = (index: number, value: string) => {
    form.value.steps[index] = value
  }

  watch(commentsTrigger, (el) => {
    if (el) setupCommentsObserver()
  })

  onUnmounted(() => {
    observer.value?.disconnect()
    observer.value = null
  })

  if (recipe.value) {
    useSeoMeta({
      title: pageTitle(recipe.value.title),
      description: recipe.value.description,
      ogTitle: pageTitle(recipe.value.title),
      ogDescription: recipe.value.description,
      ogImage: recipe.value.image || '[og:image]',
      ogUrl: useRuntimeConfig().public.baseUrl + route.path,
      twitterTitle: pageTitle(recipe.value.title),
      twitterDescription: recipe.value.description,
      twitterImage: recipe.value.image || '[twitter:image]',
      twitterCard: 'summary_large_image'
    })
  } else {
    useSeoMeta({
      title: pageTitle('Recipe Not Found'),
      description: 'The recipe you are looking for does not exist.',
      ogTitle: pageTitle('Recipe Not Found'),
      ogDescription: 'The recipe you are looking for does not exist.',
      ogImage: '[og:image]',
      ogUrl: useRuntimeConfig().public.baseUrl + route.path,
      twitterTitle: pageTitle('Recipe Not Found'),
      twitterDescription: 'The recipe you are looking for does not exist.',
      twitterImage: '[twitter:image]',
      twitterCard: 'summary_large_image'
    })
  }
</script>

<template>
  <div class="container mx-auto px-4 py-6 max-w-4xl">
    <div v-if="pending" class="flex justify-center items-center min-h-[50vh]">
      <div
        class="animate-spin rounded-full size-12 border-b-2 border-blue-600"
      ></div>
      <span class="ml-3 text-lg text-gray-600">Loading recipe...</span>
    </div>
    <div v-else-if="recipe" class="space-y-6">
      <div>
        <div class="flex flex-row justify-between gap-4">
          <h1
            v-if="!isEditMode"
            class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white/80 mb-2"
          >
            {{ recipe.title }}
          </h1>
          <div v-else class="mb-1 w-full flex items-center gap-2">
            <label
              class="block whitespace-nowrap text-sm dark:text-white/80 font-medium text-gray-700 mb-1"
            >
              Title:
            </label>
            <input
              v-model="form.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter recipe title"
            />
          </div>

          <div class="flex gap-2 justify-center items-center">
            <!-- Edit Mode Buttons -->
            <template v-if="isEditMode">
              <button
                @click="saveRecipe"
                :disabled="isSaving"
                class="bg-green-600 whitespace-nowrap text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Icon name="ic:outline-edit-note" />
                {{ isSaving ? 'Saving...' : 'Save' }}
              </button>
              <Icon
                name="ic:outline-cancel"
                @click="toggleEditMode"
                :disabled="isSaving"
                title="Cancel Edit"
                class="text-red-500 size-9 mt-0.5 rounded hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer"
              />
            </template>

            <div v-if="!isEditMode" class="flex items-center gap-1">
              <div
                :class="[
                  'flex like items-center gap-1',
                  recipe.is_liked
                    ? `after:content-['unlike'] `
                    : `after:content-['like'] `
                ]"
              >
                <Icon
                  :name="
                    recipe.is_liked
                      ? 'ic:outline-favorite'
                      : 'ic:outline-favorite-border'
                  "
                  @click="likeRecipeToggle"
                  :class="[
                    'size-7',
                    recipe.is_liked
                      ? 'text-red-600'
                      : 'text-gray-600 dark:text-gray-300',
                    !isOwner ? 'cursor-pointer' : 'cursor-not-allowed'
                  ]"
                />
                <span>{{ recipe.counter?.likes || 0 }}</span>
              </div>
              <UIDropdownMenu class="h-7" align="right">
                <template v-if="isOwner">
                  <UIDropdownMenuItem
                    label="Edit Recipe"
                    icon="ic:outline-edit"
                    variant="primary"
                    @click="toggleEditMode"
                  />
                  <UIDropdownMenuItem
                    label="Delete Recipe"
                    icon="ic:outline-delete"
                    variant="danger"
                    @click="deleteRecipe"
                  />
                </template>
                <template v-else>
                  <UIDropdownMenuItem
                    :label="recipe.is_saved ? 'Bookmarked' : 'Bookmark'"
                    :icon="
                      recipe.is_saved
                        ? 'ic:outline-bookmark'
                        : 'ic:outline-bookmark-border'
                    "
                    variant="primary"
                    @click="saveRecipeToggle"
                  />
                </template>
              </UIDropdownMenu>
            </div>
          </div>
        </div>
        <div
          class="flex items-center gap-3 text-sm md:text-base text-gray-600 dark:text-gray-400"
        >
          <UserAvatar
            :avatar-url="recipe.author.avatar_url"
            :alt="recipe.author.display_name"
            class="size-8"
          />

          <span class="whitespace-nowrap"
            >by
            <NuxtLink
              :to="`/@${recipe.author?.display_name}`"
              class="text-blue-600 hover:underline cursor-pointer"
            >
              @{{ recipe.author?.display_name || 'Unknown' }}
            </NuxtLink>
          </span>
          <span>•</span>
          <span class="gap-3 flex items-center">
            <span
              v-if="recipe.updatedAt == recipe.createdAt"
              :title="
                'Created: ' + new Date(recipe.createdAt).toLocaleDateString()
              "
              >{{ new Date(recipe.createdAt).toLocaleDateString() }}</span
            >
            <span
              class="whitespace-nowrap"
              v-else
              :title="
                'Created: ' + new Date(recipe.createdAt).toLocaleDateString()
              "
            >
              (Edit: {{ new Date(recipe.updatedAt).toLocaleDateString() }})
            </span>
          </span>
        </div>
      </div>
      <div v-if="isEditMode && isOwner" class="space-y-2">
        <label
          class="block text-sm dark:text-white/80 font-medium text-gray-700"
        >
          Recipe Status
        </label>
        <select
          v-model.number="form.status"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option :value="1">Public</option>
          <option :value="2">Private</option>
        </select>
      </div>

      <!-- Recipe Image Component -->
      <RecipeImageUpload
        v-if="isEditMode"
        v-model="form.image"
        :editable="true"
        :title="form.title"
        @file-selected="handleFileSelected"
      />
      <RecipeImageUpload
        v-else
        v-model="recipe.image"
        :editable="false"
        :title="recipe.title"
      />

      <!-- Recipe Meta Fields Component -->
      <RecipeMetaFields
        :prep-time="isEditMode ? form.prep_time : recipe.prep_time"
        :cook-time="isEditMode ? form.cook_time : recipe.cook_time"
        :servings="isEditMode ? form.servings : recipe.servings"
        :editable="isEditMode"
        @update:prep-time="form.prep_time = $event"
        @update:cook-time="form.cook_time = $event"
        @update:servings="form.servings = $event"
      />

      <!-- Description -->
      <div class="space-y-2">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white/80">
          Description
        </h2>
        <p
          v-if="!isEditMode"
          class="text-gray-700 dark:text-gray-300 leading-relaxed"
        >
          {{ recipe.description || 'No description available.' }}
        </p>
        <textarea
          v-else
          v-model="form.description"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter recipe description"
        ></textarea>
      </div>

      <!-- Tags -->
      <RecipeTagsInput
        :tags="isEditMode ? form.tags : recipe.tags || []"
        :editable="isEditMode"
        @add="addTag"
        @remove="removeTag"
      />

      <!-- Ingredients and Steps -->
      <RecipeSwipeableTabs
        :ingredients="isEditMode ? form.ingredients : recipe.ingredients || []"
        :steps="isEditMode ? form.steps : recipe.steps || []"
        :editable="isEditMode"
        :show-swipe-hint="true"
        @add-ingredient="addIngredient"
        @remove-ingredient="removeIngredient"
        @update-ingredient="updateIngredient"
        @add-step="addStep"
        @remove-step="removeStep"
        @update-step="updateStep"
      />

      <!-- Comments Section -->
      <div v-if="!shouldLoadComments" class="pt-64">
        <div ref="commentsTrigger" class="h-1"></div>
      </div>

      <div
        v-if="shouldLoadComments"
        ref="commentsSection"
        class="py-8 transition-all duration-300 ease-in-out"
      >
        <RecipeComments :recipe-id="recipe.id" />
      </div>
    </div>

    <!-- Recipe Not Found -->
    <div v-else class="text-center py-12">
      <div class="text-gray-500 text-lg font-medium mb-2">Recipe not found</div>
      <NuxtLink to="/" class="text-blue-600 hover:underline">
        Go back to home
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
  @import '@/assets/styles/main.css';
  .btn {
    @apply px-4 py-2 rounded font-medium transition-colors duration-200;
  }

  .like {
    @apply relative after:absolute after:size-fit  after:text-[15px] dark:after:text-white after:text-gray-800 after:opacity-0 after:invisible after:transition after:duration-200 after:ease-linear after:top-[115%];
    &::after {
      font-family:
        'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande',
        'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
    }
    &:hover::after {
      @apply visible opacity-100 z-10 top-[105%];
    }
  }
</style>
