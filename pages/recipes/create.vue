<script setup lang="ts">
  import { pageTitle } from '~/utils/meta'
  import { extractValidationErrors } from '~/utils/errors'
  const { errorNotif, successNotif } = useNotification()

  // definePageMeta({
  //   middleware: 'auth' // Require authentication to create recipes
  // })

  const router = useRouter()
  const fetchApi = useApi()

  const {
    form,
    errors,
    apiErrors,
    hasErrors,
    hasApiErrors,
    hasAnyErrors,
    allErrors,
    validateForm,
    addIngredient,
    removeIngredient,
    addStep,
    removeStep,
    addTag,
    removeTag,
    getFormData,
    clearErrors,
    clearApiErrors,
    setApiErrors
  } = useRecipeForm()

  const isSubmitting = ref(false)
  const submitError = ref('')
  const selectedImageFile = ref<File | null>(null)

  // Add initial ingredient and step
  onMounted(() => {
    if (form.value.ingredients.length === 0) {
      addIngredient()
    }
    if (form.value.steps.length === 0) {
      addStep()
    }
  })

  const handleFileSelected = (file: File) => {
    // Store the compressed file for upload
    selectedImageFile.value = file
    console.log('File selected:', file)
  }

  const handleSubmit = async () => {
    // Clear all previous errors
    submitError.value = ''
    clearErrors()
    clearApiErrors()

    // Run client-side validation first
    if (!validateForm()) {
      return
    }

    try {
      isSubmitting.value = true
      const formData = getFormData()

      // Create the recipe
      const response = await fetchApi('/recipes/', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      if (response && response.slug) {
        if (selectedImageFile.value) {
          const uploadFormData = new FormData()
          uploadFormData.append('recipe_id', response.slug)
          uploadFormData.append('recipe_url', 'newfile')
          uploadFormData.append('image', selectedImageFile.value)

          try {
            const uploadResponse = await fetchApi('/upload/recipe', {
              method: 'POST',
              body: uploadFormData
            })

            if (uploadResponse && uploadResponse.url) {
              formData.image = uploadResponse.url
            }
          } catch (uploadErr: any) {
            console.error('Error uploading image:', uploadErr)
            errorNotif(
              'Error uploading the image, recipe is successful. Re-upload again in a little bit',
              10000
            )
          }
        }

        await router.push(`/recipes/${response.slug}`)
      }
    } catch (err: any) {
      console.error('Error creating recipe:', err)

      // Handle different error types
      if (err.statusCode === 422) {
        // Validation error from backend
        const validationErrors = extractValidationErrors(err)

        if (validationErrors.length > 0) {
          setApiErrors(validationErrors)
          submitError.value = 'Please fix the validation errors below'
        } else {
          submitError.value = 'Validation failed. Please check your input.'
        }
      } else if (err.statusCode === 401) {
        // Authentication error
        submitError.value = 'You must be logged in to create recipes'
      } else if (err.statusCode === 403) {
        // Permission error
        submitError.value = 'You do not have permission to create recipes'
      } else if (err.statusCode === 413) {
        // Payload too large
        submitError.value =
          'The recipe data is too large. Please reduce the image size or content.'
      } else if (err.statusCode >= 500) {
        // Server error
        submitError.value = 'Server error. Please try again later.'
      } else {
        // Generic error
        submitError.value =
          err.message || 'Failed to create recipe. Please try again.'
      }
    } finally {
      isSubmitting.value = false
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

  // SEO Meta
  useSeoMeta({
    title: pageTitle('Create Recipe'),
    description: 'Create and share your own recipes',
    ogUrl: useRuntimeConfig().public.baseUrl + useRoute().path,
    ogTitle: pageTitle('Create Recipe'),
    ogImage: '/LogoRecipeShare.png',
    ogDescription: 'Create and share your own recipes',
    twitterTitle: pageTitle('Create Recipe'),
    twitterDescription: 'Create and share your own recipes',
    twitterImage: '/LogoRecipeShare.png'
  })
</script>

<template>
  <div class="container mx-auto px-4 py-6 max-w-4xl">
    <div class="mb-8">
      <h1
        class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white/80 mb-2"
      >
        Create New Recipe
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Share your culinary creation with the world
      </p>
    </div>

    <!-- Error Summary -->
    <div
      v-if="hasAnyErrors || submitError"
      class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
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
            <li v-if="submitError">{{ submitError }}</li>
            <!-- Show all errors (client-side + API) -->
            <li v-for="(error, index) in allErrors" :key="`error-${index}`">
              <strong>{{ error.field }}:</strong> {{ error.message }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div class="space-y-2">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Recipe Title <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.title"
          type="text"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          placeholder="e.g., Grandma's Chocolate Chip Cookies"
          required
        />
      </div>

      <div class="space-y-2">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Recipe Status <span class="text-red-500">*</span>
        </label>
        <select
          v-model.number="form.status"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          <option :value="1">Public - Everyone can see this recipe</option>
          <option :value="2">Private - Only you can see this recipe</option>
        </select>
      </div>

      <RecipeImageUpload
        v-model="form.image"
        :editable="true"
        @file-selected="handleFileSelected"
      />

      <RecipeMetaFields
        :prep-time="form.prep_time"
        :cook-time="form.cook_time"
        :servings="form.servings"
        :editable="true"
        @update:prep-time="form.prep_time = $event"
        @update:cook-time="form.cook_time = $event"
        @update:servings="form.servings = $event"
      />

      <div class="space-y-2">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="form.description"
          rows="4"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          placeholder="Describe your recipe..."
          required
        ></textarea>
      </div>

      <RecipeTagsInput
        :tags="form.tags"
        :editable="true"
        @add="addTag"
        @remove="removeTag"
      />

      <RecipeSwipeableTabs
        :ingredients="form.ingredients"
        :steps="form.steps"
        :editable="true"
        :show-swipe-hint="true"
        @add-ingredient="addIngredient"
        @remove-ingredient="removeIngredient"
        @update-ingredient="updateIngredient"
        @add-step="addStep"
        @remove-step="removeStep"
        @update-step="updateStep"
      />

      <div class="flex gap-4 pt-6 border-t dark:border-gray-700">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {{ isSubmitting ? 'Creating Recipe...' : 'Create Recipe' }}
        </button>
        <button
          type="button"
          @click="router.back()"
          :disabled="isSubmitting"
          class="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    opacity: 1;
  }

  button {
    @apply cursor-pointer;
  }
</style>
