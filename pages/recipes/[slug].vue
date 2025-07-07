<script setup lang="ts">
  import { pageTitle } from '~/utils/meta'
  import { UnitLabels } from '~/utils/units'

  const route = useRoute()
  const router = useRouter()
  const config = useRuntimeConfig()
  const { user } = useSupabaseUser()
  const fetchApi = useApi()

  const slug = route.params.slug as string

  // Recipe data
  const recipe = ref<any>(null)
  const isLoading = ref(true)
  const isEditMode = ref(false)
  const isSaving = ref(false)
  const error = ref('')

  // Edit form data
  const editForm = ref({
    title: '',
    description: '',
    ingredients: [] as string[],
    steps: [] as string[],
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    difficulty: 'Easy',
    tags: [] as string[],
    image: ''
  })

  // Computed properties
  const isOwner = computed(() => {
    return (
      user.value && recipe.value && user.value.id === recipe.value.author?.id
    )
  })

  const totalTime = computed(() => {
    if (isEditMode.value) {
      return editForm.value.prep_time + editForm.value.cook_time
    }
    return (recipe.value?.prep_time || 0) + (recipe.value?.cook_time || 0)
  })

  // Fetch recipe data
  const fetchRecipe = async () => {
    try {
      isLoading.value = true
      error.value = ''

      const response = await fetchApi(`/recipes/${slug}`, { method: 'GET' })

      if (response) {
        recipe.value = response
        // Initialize edit form with recipe data
        editForm.value = {
          title: response.title || '',
          description: response.description || '',
          ingredients: [...(response.ingredients || [])],
          steps: [...(response.steps || [])],
          prep_time: response.prep_time || 0,
          cook_time: response.cook_time || 0,
          servings: response.servings || 1,
          difficulty: response.difficulty || 'Easy',
          tags: [...(response.tags || [])],
          image: response.image || ''
        }
      } else {
        throw new Error('Recipe not found')
      }
    } catch (err) {
      console.error('Error fetching recipe:', err)
      error.value = 'Failed to load recipe'
    } finally {
      isLoading.value = false
    }
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditMode.value) {
      // Reset form to original values when canceling edit
      if (recipe.value) {
        editForm.value = {
          title: recipe.value.title || '',
          description: recipe.value.description || '',
          ingredients: [...(recipe.value.ingredients || [])],
          steps: [...(recipe.value.steps || [])],
          prep_time: recipe.value.prep_time || 0,
          cook_time: recipe.value.cook_time || 0,
          servings: recipe.value.servings || 1,
          difficulty: recipe.value.difficulty || 'Easy',
          tags: [...(recipe.value.tags || [])],
          image: recipe.value.image || ''
        }
      }
    }
    isEditMode.value = !isEditMode.value
  }

  // Save recipe changes
  const saveRecipe = async () => {
    try {
      isSaving.value = true
      error.value = ''

      const response = await fetchApi(`/recipes/${slug}`, {
        method: 'PUT',
        body: JSON.stringify(editForm.value)
      })

      if (response) {
        recipe.value = response
        isEditMode.value = false
        // Show success message (you can add a toast notification here)
        console.log('Recipe updated successfully')
      }
    } catch (err) {
      console.error('Error saving recipe:', err)
      error.value = 'Failed to save recipe changes'
    } finally {
      isSaving.value = false
    }
  }

  // Add/remove ingredient
  const addIngredient = () => {
    editForm.value.ingredients.push('')
  }

  const removeIngredient = (index: number) => {
    editForm.value.ingredients.splice(index, 1)
  }

  // Add/remove instruction
  const addInstruction = () => {
    editForm.value.steps.push('')
  }

  const removeInstruction = (index: number) => {
    editForm.value.steps.splice(index, 1)
  }

  // Add/remove tag
  const newTag = ref('')
  const addTag = () => {
    if (
      newTag.value.trim() &&
      !editForm.value.tags.includes(newTag.value.trim())
    ) {
      editForm.value.tags.push(newTag.value.trim())
      newTag.value = ''
    }
  }

  const removeTag = (index: number) => {
    editForm.value.tags.splice(index, 1)
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
      router.push('/') // Redirect to home or profile
    } catch (err) {
      console.error('Error deleting recipe:', err)
      error.value = 'Failed to delete recipe'
    }
  }

  const likeRecipeToggle = async () => {
    if (!user.value) {
      alert('You must be logged in to like a recipe.')
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
      recipe.value.is_liked = !recipe.value.is_liked // Revert the like state when error occurs
      console.error('Error toggling like:', err)
      error.value = recipe.value.is_liked
        ? 'Failed to unlike recipe'
        : 'Failed to like recipe'
    }
  }

  const saveRecipeToggle = async () => {
    if (!user.value) {
      alert('You must be logged in to save a recipe.')
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
      recipe.value.is_saved = !recipe.value.is_saved // Revert the like state when error occurs
      console.error('Error toggling like:', err)
      error.value = recipe.value.is_saved
        ? 'Failed to unlike recipe'
        : 'Failed to like recipe'
    }
  }

  // Initialize
  onMounted(() => {
    fetchRecipe()
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
    <div v-if="isLoading" class="flex justify-center items-center min-h-[50vh]">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
      <span class="ml-3 text-lg text-gray-600">Loading recipe...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-600 text-lg font-medium mb-2">{{ error }}</div>
      <button
        @click="fetchRecipe"
        class="btn bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
      >
        Try Again
      </button>
    </div>

    <!-- Recipe Content -->
    <div v-else-if="recipe" class="space-y-6">
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
          <div v-else class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Recipe Title</label
            >
            <input
              v-model="editForm.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter recipe title"
            />
          </div>

          <!-- Author Info -->
          <div class="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <img
              :src="recipe.author?.avatar_url || '/default-avatar.jpg'"
              alt="Author"
              class="w-8 h-8 rounded-full"
            />
            <span
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
              <span v-if="recipe.updatedAt != recipe.createdAt">
                (Updated: {{ new Date(recipe.updatedAt).toLocaleDateString() }})
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
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Edit Recipe
            </button>

            <template v-else>
              <button
                @click="saveRecipe"
                :disabled="isSaving"
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
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
          <div
            v-if="!isOwner"
            class="row-span-1 flex justify-end items-end gap-2"
          >
            <UIcon
              v-if="recipe.is_saved"
              name="ic:outline-bookmark"
              @click="saveRecipeToggle"
              class="size-7 text-gray-900/90 dark:text-gray-300 cursor-pointer"
            />
            <UIcon
              v-else
              name="ic:outline-bookmark-border"
              @click="saveRecipeToggle"
              class="size-7 text-gray-600 dark:text-gray-300 cursor-pointer"
            />
            <div class="flex items-center gap-1">
              <UIcon
                v-if="recipe.is_liked"
                name="ic:outline-favorite"
                @click="likeRecipeToggle"
                class="size-7 text-red-600 cursor-pointer"
              />
              <UIcon
                v-else
                name="ic:outline-favorite-border"
                @click="likeRecipeToggle"
                class="size-7 text-gray-600 dark:text-gray-300 cursor-pointer"
              />
              <span class="pr-2">{{ recipe.counter?.likes || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recipe Image -->
      <div class="w-full h-64 md:h-96 rounded-lg overflow-hidden bg-gray-200">
        <img
          v-if="isEditMode ? editForm.image : recipe.image"
          :src="isEditMode ? editForm.image : recipe.image"
          :alt="isEditMode ? editForm.title : recipe.title"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center text-gray-400"
        >
          No image available
        </div>
      </div>

      <!-- Edit Image URL -->
      <div v-if="isEditMode" class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Image URL</label>
        <input
          v-model="editForm.image"
          type="url"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <!-- Recipe Meta Info -->
      <div
        class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg"
      >
        <div class="text-center">
          <div class="font-semibold text-gray-900">
            {{ isEditMode ? editForm.prep_time : recipe.prep_time || 0 }}
            <span v-if="isEditMode">
              <input
                v-model.number="editForm.prep_time"
                type="number"
                min="0"
                class="w-16 ml-1 px-1 py-1 text-sm border rounded"
              />
            </span>
            min
          </div>
          <div class="text-sm text-gray-600">Prep Time</div>
        </div>

        <div class="text-center">
          <div class="font-semibold text-gray-900">
            {{ isEditMode ? editForm.cook_time : recipe.cook_time || 0 }}
            <span v-if="isEditMode">
              <input
                v-model.number="editForm.cook_time"
                type="number"
                min="0"
                class="w-16 ml-1 px-1 py-1 text-sm border rounded"
              />
            </span>
            min
          </div>
          <div class="text-sm text-gray-600">Cook Time</div>
        </div>

        <div class="text-center">
          <div class="font-semibold text-gray-900">{{ totalTime }} min</div>
          <div class="text-sm text-gray-600">Total Time</div>
        </div>

        <div class="text-center">
          <div class="font-semibold text-gray-900">
            {{ isEditMode ? editForm.servings : recipe.servings || 1 }}
            <span v-if="isEditMode">
              <input
                v-model.number="editForm.servings"
                type="number"
                min="1"
                class="w-16 ml-1 px-1 py-1 text-sm border rounded"
              />
            </span>
          </div>
          <div class="text-sm text-gray-600">Servings</div>
        </div>
      </div>

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
          v-model="editForm.description"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter recipe description"
        ></textarea>
      </div>

      <!-- Tags -->
      <div class="space-y-2">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white/80">
          Tags
        </h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(tag, index) in isEditMode
              ? editForm.tags
              : recipe.tags || []"
            :key="index"
            class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
          >
            {{ tag }}
            <button
              v-if="isEditMode"
              @click="removeTag(index)"
              class="ml-1 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </span>
        </div>

        <!-- Add Tag in Edit Mode -->
        <div v-if="isEditMode" class="flex gap-2 mt-2">
          <input
            v-model="newTag"
            @keyup.enter="addTag"
            type="text"
            class="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a tag"
          />
          <button
            @click="addTag"
            class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      <!-- Ingredients -->
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white/80">
            Ingredients
          </h2>
          <button
            v-if="isEditMode"
            @click="addIngredient"
            class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 cursor-pointer"
          >
            Add Ingredient
          </button>
        </div>

        <ul class="space-y-2">
          <li
            v-for="(ingredient, index) in isEditMode
              ? editForm.ingredients
              : recipe.ingredients || []"
            :key="index"
            class="flex items-center gap-3"
          >
            <span
              v-if="!isEditMode"
              class="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"
            ></span>
            <span
              v-if="!isEditMode"
              class="text-gray-700 dark:text-gray-300 flex gap-1"
            >
              <span class="flex-1">{{ ingredient.name }}</span>
              <span>{{ ingredient.amount }}</span>
              <span>{{ UnitLabels[ingredient.unit] }}</span>
            </span>

            <template v-else>
              <input
                v-model="editForm.ingredients[index]"
                type="text"
                class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter ingredient"
              />
              <button
                @click="removeIngredient(index)"
                class="text-red-600 hover:text-red-800 px-2 cursor-pointer"
              >
                Remove
              </button>
            </template>
          </li>
        </ul>

        <div
          v-if="
            !isEditMode &&
            (!recipe.ingredients || recipe.ingredients.length === 0)
          "
          class="text-gray-500 italic"
        >
          No ingredients listed.
        </div>
      </div>

      <!-- Instructions -->
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white/80">
            Instructions
          </h2>
          <button
            v-if="isEditMode"
            @click="addInstruction"
            class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 cursor-pointer"
          >
            Add Step
          </button>
        </div>

        <ol class="space-y-3">
          <li
            v-for="(instruction, index) in isEditMode
              ? editForm.steps
              : recipe.steps || []"
            :key="index"
            class="flex gap-4"
          >
            <span
              class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-sm rounded-full flex items-center justify-center"
            >
              {{ index + 1 }}
            </span>

            <span
              v-if="!isEditMode"
              class="text-gray-700 dark:text-gray-300 flex-1"
              >{{ instruction }}</span
            >

            <div v-else class="flex-1 flex gap-2">
              <textarea
                v-model="editForm.steps[index]"
                rows="2"
                class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter instruction step"
              ></textarea>
              <button
                @click="removeInstruction(index)"
                class="text-red-600 hover:text-red-800 px-2 cursor-pointer"
              >
                Remove
              </button>
            </div>
          </li>
        </ol>

        <div
          v-if="!isEditMode && (!recipe.steps || recipe.steps.length === 0)"
          class="text-gray-500 italic"
        >
          No instructions provided.
        </div>
      </div>

      <!-- Recipe Stats -->
      <div
        class="flex items-center justify-between py-4 border-t border-gray-200"
      >
        <div class="flex gap-6 text-sm text-gray-600">
          <span>{{ recipe.counter?.likes || 0 }} likes</span>
          <span>{{ recipe.counter?.comments || 0 }} comments</span>
          <span>{{ recipe.counter?.views || 0 }} saves</span>
        </div>
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
