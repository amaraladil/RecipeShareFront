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
  const isLoading = ref(true)
  const isEditMode = ref(false)
  const isSaving = ref(false)
  const errorMessage = ref('')

  // Comments loading
  const shouldLoadComments = ref(false)
  const commentsSection = ref<HTMLElement>()
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

  // Intersection Observer for lazy loading comments
  const setupCommentsObserver = () => {
    if (!commentsTrigger.value) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoadComments.value) {
            shouldLoadComments.value = true
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '100px'
      }
    )

    observer.observe(commentsTrigger.value)

    onUnmounted(() => {
      observer.disconnect()
    })
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
          return null // Cache expired, fetch new data
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
  }

  // Fetch recipe data
  const fetchRecipe = async () => {
    try {
      isLoading.value = true
      errorMessage.value = ''

      const response = await fetchApi(`/recipes/${slug}`, { method: 'GET' })

      if (response) {
        recipe.value = response
        recipe_id.value = response.id
        resetForm({
          title: response.title || '',
          description: response.description || '',
          ingredients: [...(response.ingredients || [])],
          steps: [...(response.steps || [])],
          prep_time: response.prep_time || 0,
          cook_time: response.cook_time || 0,
          servings: response.servings || 1,
          tags: [...(response.tags || [])],
          image: response.image || '',
          status: response.status || 1
        })
      } else {
        throw new Error('Recipe not found')
      }
    } catch (err) {
      console.error('Error fetching recipe:', err)
      errorMessage.value = 'Failed to load recipe'
    } finally {
      isLoading.value = false
    }
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditMode.value) {
      // Reset form to original values when canceling edit
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
        // Clear selected image file
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

    try {
      if (recipe.value.is_liked) {
        recipe.value.is_liked = false
        const response = await fetchApi(`/recipes/${recipe.value.id}/like`, {
          method: 'DELETE'
        })
        if (response) {
          recipe.value.counter.likes -= 1
        }
      } else {
        recipe.value.is_liked = true
        const response = await fetchApi(`/recipes/${recipe.value.id}/like`, {
          method: 'POST'
        })
        if (response) {
          recipe.value.counter.likes += 1
        }
      }
    } catch (err) {
      recipe.value.is_liked = !recipe.value.is_liked
      errorNotif(
        recipe.value.is_liked
          ? 'Failed to like recipe'
          : 'Failed to unlike recipe'
      )
      console.error('Error toggling like:', err)
      errorMessage.value = recipe.value.is_liked
        ? 'Failed to unlike recipe'
        : 'Failed to like recipe'
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

    try {
      if (recipe.value.is_saved) {
        recipe.value.is_saved = false
        const response = await fetchApi(`/recipes/${recipe.value.id}/save`, {
          method: 'DELETE'
        })
        if (response) {
          recipe.value.counter.views -= 1
        }
      } else {
        recipe.value.is_saved = true
        const response = await fetchApi(`/recipes/${recipe.value.id}/save`, {
          method: 'POST'
        })
        if (response) {
          recipe.value.counter.views += 1
        }
      }
    } catch (err) {
      recipe.value.is_saved = !recipe.value.is_saved
      errorNotif(
        recipe.value.is_saved
          ? 'Failed to save recipe'
          : 'Failed to unsave recipe'
      )
      console.error('Error toggling save:', err)
      errorMessage.value = recipe.value.is_saved
        ? 'Failed to unsave recipe'
        : 'Failed to save recipe'
    }
  }

  // Update ingredient
  const updateIngredient = (index: number, ingredient: any) => {
    form.value.ingredients[index] = ingredient
  }

  // Update step
  const updateStep = (index: number, value: string) => {
    form.value.steps[index] = value
  }

  // Initialize
  onMounted(async () => {
    nextTick(() => {
      setupCommentsObserver()
    })
  })

  // SEO Meta
  watchEffect(() => {
    if (recipe.value) {
      useSeoMeta({
        title: pageTitle(recipe.value.title),
        description: recipe.value.description,
        ogTitle: pageTitle(recipe.value.title),
        ogDescription: recipe.value.description,
        ogImage: recipe.value.image || '[og:image]',
        ogUrl: route.fullPath,
        twitterTitle: pageTitle(recipe.value.title),
        twitterDescription: recipe.value.description,
        twitterImage: recipe.value.image || '[twitter:image]',
        twitterCard: 'summary_large_image'
      })
    }
  })
</script>

<template>
  <div class="container mx-auto px-4 py-6 max-w-4xl">
    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center items-center min-h-[50vh]">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
      <span class="ml-3 text-lg text-gray-600">Loading recipe...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="text-center py-12">
      <div class="text-red-600 text-lg font-medium mb-2">
        {{ errorMessage }}
      </div>
      <button
        @click="fetchRecipe"
        class="btn bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
      >
        Try Again
      </button>
    </div>

    <!-- Recipe Content -->
    <div v-else-if="recipe" class="space-y-6">
      <!-- Validation Errors in Edit Mode -->
      <div
        v-if="isEditMode && (validationErrors.length > 0 || imageUploadError)"
        class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
      >
        <div class="flex items-start gap-2">
          <UIcon
            name="ic:outline-error"
            class="size-5 text-red-600 dark:text-red-400 mt-0.5"
          />
          <div class="flex-1">
            <h3 class="font-semibold text-red-900 dark:text-red-300 mb-1">
              Please fix the following errors:
            </h3>
            <ul
              class="list-disc list-inside text-red-700 dark:text-red-400 text-sm space-y-1"
            >
              <li v-if="imageUploadError">{{ imageUploadError }}</li>
              <li v-for="err in validationErrors" :key="err.field">
                {{ err.message }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Header with Edit Controls -->
      <div class="flex justify-between items-start gap-4">
        <div class="flex-1">
          <!-- View Mode Title -->
          <h1
            v-if="!isEditMode"
            class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white/80 mb-2"
          >
            {{ recipe.title }}
          </h1>

          <!-- Edit Mode Title -->
          <div v-else class="mb-4 flex items-center gap-2">
            <label
              class="block whitespace-nowrap text-sm dark:text-white/80 font-medium text-gray-700 mb-1"
            >
              Recipe Title:
            </label>
            <input
              v-model="form.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter recipe title"
            />
          </div>

          <!-- Author Info -->
          <div
            class="flex items-center gap-3 text-sm md:text-base text-gray-600 dark:text-gray-400"
          >
            <img
              :src="recipe.author?.avatar_url || '/default-avatar.jpg'"
              alt="Author"
              class="w-8 h-8 rounded-full"
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
              <span>{{ new Date(recipe.createdAt).toLocaleDateString() }}</span>
              <span
                class="whitespace-nowrap text-xs md:text-sm"
                v-if="recipe.updatedAt != recipe.createdAt"
              >
                (Edit: {{ new Date(recipe.updatedAt).toLocaleDateString() }})
              </span>
            </span>
          </div>
        </div>

        <div class="grid grid-flow-col grid-rows-2">
          <!-- Owner Controls -->
          <div v-if="isOwner" class="row-span-1 flex gap-2">
            <button
              v-if="!isEditMode"
              @click="toggleEditMode"
              class="bg-blue-600 text-white whitespace-nowrap px-4 py-2 rounded hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Edit Recipe
            </button>

            <template v-else>
              <button
                @click="saveRecipe"
                :disabled="isSaving"
                class="bg-green-600 whitespace-nowrap text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
              <button
                @click="toggleEditMode"
                :disabled="isSaving"
                class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
            </template>

            <button
              v-if="!isEditMode"
              @click="deleteRecipe"
              class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
          <div v-else class="row-span-1 h-10"></div>
          <div class="row-span-1 flex justify-end items-end gap-2">
            <UIcon
              :name="
                recipe.is_saved
                  ? 'ic:outline-bookmark'
                  : 'ic:outline-bookmark-border'
              "
              @click="saveRecipeToggle"
              :class="[
                'size-7',
                recipe.is_saved
                  ? 'text-blue-600'
                  : 'text-gray-600 dark:text-gray-300',
                !isOwner ? 'cursor-pointer' : 'cursor-not-allowed'
              ]"
            />
            <div class="flex items-center gap-1">
              <UIcon
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
              <span class="pr-2">{{ recipe.counter?.likes || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Selector (Edit Mode Only) -->
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

      <!-- Tags Component -->
      <RecipeTagsInput
        :tags="isEditMode ? form.tags : recipe.tags || []"
        :editable="isEditMode"
        @add="addTag"
        @remove="removeTag"
      />

      <!-- Ingredients Component -->
      <RecipeIngredientsList
        :ingredients="isEditMode ? form.ingredients : recipe.ingredients || []"
        :editable="isEditMode"
        @add="addIngredient"
        @remove="removeIngredient"
        @update="updateIngredient"
      />

      <!-- Instructions Component -->
      <RecipeStepsList
        :steps="isEditMode ? form.steps : recipe.steps || []"
        :editable="isEditMode"
        @add="addStep"
        @remove="removeStep"
        @update="updateStep"
      />

      <!-- Comments Section -->
      <div class="py-4">
        <div ref="commentsTrigger" class="h-1"></div>
      </div>

      <div
        v-if="shouldLoadComments"
        ref="commentsSection"
        class="transition-all duration-300 ease-in-out"
      >
        <Suspense>
          <template #default>
            <LazyRecipeComments :recipe-id="recipe.id" />
          </template>
          <template #fallback>
            <div class="flex justify-center items-center py-8">
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
              ></div>
              <span class="ml-3 text-gray-600">Loading comments...</span>
            </div>
          </template>
        </Suspense>
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
</style>
