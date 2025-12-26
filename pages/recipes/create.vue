<script setup lang="ts">
  import { pageTitle } from '~/utils/meta'
  import { UnitGroups } from '~/utils/units'

  //   definePageMeta({
  //     middleware: 'auth' // Require authentication to create recipes
  //   })

  const router = useRouter()
  const fetchApi = useApi()

  const {
    form,
    errors,
    newTag,
    totalTime,
    hasErrors,
    validateForm,
    addIngredient,
    removeIngredient,
    addStep,
    removeStep,
    addTag,
    removeTag,
    getFieldError,
    getFormData
  } = useRecipeForm()

  const isSubmitting = ref(false)
  const submitError = ref('')

  // Add initial ingredient and step
  onMounted(() => {
    if (form.value.ingredients.length === 0) {
      addIngredient()
    }
    if (form.value.steps.length === 0) {
      addStep()
    }
  })

  const handleSubmit = async () => {
    submitError.value = ''

    if (!validateForm()) {
      submitError.value = 'Please fix the errors in the form'
      return
    }

    try {
      isSubmitting.value = true
      const formData = getFormData()

      const response = await fetchApi('/recipes/', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      if (response && response.slug) {
        // Redirect to the newly created recipe
        await router.push(`/recipes/${response.slug}`)
      }
    } catch (err: any) {
      console.error('Error creating recipe:', err)
      submitError.value =
        err.message || 'Failed to create recipe. Please try again.'
    } finally {
      isSubmitting.value = false
    }
  }

  // SEO Meta
  useSeoMeta({
    title: pageTitle('Create Recipe'),
    description: 'Create and share your own recipes',
    ogTitle: pageTitle('Create Recipe'),
    ogDescription: 'Create and share your own recipes'
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
      v-if="hasErrors || submitError"
      class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
    >
      <div class="flex items-start gap-2">
        <UIcon name="ic:outline-error" class="size-5 text-red-600 mt-0.5" />
        <div class="flex-1">
          <h3 class="font-semibold text-red-900 mb-1">
            Please fix the following errors:
          </h3>
          <ul class="list-disc list-inside text-red-700 text-sm space-y-1">
            <li v-if="submitError">{{ submitError }}</li>
            <li v-for="error in errors" :key="error.field">
              {{ error.message }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Recipe Title -->
      <div class="space-y-2">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Recipe Title <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.title"
          type="text"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="getFieldError('title') ? 'border-red-300' : 'border-gray-300'"
          placeholder="e.g., Grandma's Chocolate Chip Cookies"
          required
        />
        <p v-if="getFieldError('title')" class="text-red-600 text-sm">
          {{ getFieldError('title') }}
        </p>
      </div>

      <!-- Recipe Image -->
      <div class="space-y-2">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Image URL
        </label>
        <input
          v-model="form.image"
          type="url"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="getFieldError('image') ? 'border-red-300' : 'border-gray-300'"
          placeholder="https://example.com/image.jpg"
        />
        <p v-if="getFieldError('image')" class="text-red-600 text-sm">
          {{ getFieldError('image') }}
        </p>
        <!-- Image Preview -->
        <div
          v-if="form.image"
          class="mt-2 w-full h-48 rounded-lg overflow-hidden bg-gray-200"
        >
          <img
            :src="form.image"
            alt="Recipe preview"
            class="w-full h-full object-cover"
            @error="() => (form.image = '')"
          />
        </div>
      </div>

      <!-- Description -->
      <div class="space-y-2">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="form.description"
          rows="4"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="
            getFieldError('description') ? 'border-red-300' : 'border-gray-300'
          "
          placeholder="Describe your recipe..."
          required
        ></textarea>
        <p v-if="getFieldError('description')" class="text-red-600 text-sm">
          {{ getFieldError('description') }}
        </p>
      </div>

      <!-- Recipe Meta Info -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="space-y-2">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Prep Time (min) <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="form.prep_time"
            type="number"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div class="space-y-2">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Cook Time (min) <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="form.cook_time"
            type="number"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div class="space-y-2">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Total Time
          </label>
          <input
            :value="totalTime"
            type="text"
            disabled
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div class="space-y-2">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Servings <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="form.servings"
            type="number"
            min="1"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="
              getFieldError('servings') ? 'border-red-300' : 'border-gray-300'
            "
            required
          />
        </div>
      </div>

      <div class="space-y-2">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Recipe Status <span class="text-red-500">*</span>
        </label>
        <select
          v-model.number="form.status"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <!-- <option selected>Choose to either make public or private</option> -->
          <option :value="1">Public - Everyone can see this recipe</option>
          <option :value="2">Private - Only you can see this recipe</option>
        </select>
      </div>

      <!-- Tags -->
      <div class="space-y-2">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Tags
        </label>
        <div class="flex flex-wrap gap-2 mb-2">
          <span
            v-for="(tag, index) in form.tags"
            :key="index"
            class="px-3 py-1 bg-blue-100 cursor-default hover:bg-blue-200 text-blue-800 rounded-full text-sm flex items-center gap-1"
          >
            {{ tag }}
            <button
              type="button"
              @click="removeTag(index)"
              class="ml-1 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </span>
        </div>
        <div class="flex gap-2">
          <input
            v-model="newTag"
            @keyup.enter.prevent="addTag"
            type="text"
            class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a tag (e.g., dessert, vegetarian)"
          />
          <button
            type="button"
            @click="addTag"
            class="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>

      <!-- Ingredients -->
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Ingredients <span class="text-red-500">*</span>
          </label>
          <button
            type="button"
            @click="addIngredient"
            class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Add Ingredient
          </button>
        </div>
        <p v-if="getFieldError('ingredients')" class="text-red-600 text-sm">
          {{ getFieldError('ingredients') }}
        </p>

        <div
          class="space-y-2 divide-y divide-gray-300/80 dark:divide-gray-200/80 md:divide-y-0"
        >
          <div
            v-for="(ingredient, index) in form.ingredients"
            :key="index"
            class="flex gap-2 items-start pb-4"
          >
            <div class="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2">
              <input
                v-model="ingredient.name"
                type="text"
                class="px-3 py-2 col-span-2 md:col-span-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingredient name"
              />
              <input
                v-model.number="ingredient.amount"
                type="number"
                step="0.1"
                min="0"
                class="px-3 py-2 col-span-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Amount"
              />
              <select
                v-model.number="ingredient.unit"
                class="px-3 py-2 col-span-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <optgroup
                  v-for="(groupItems, groupName) in UnitGroups"
                  :key="groupName"
                  :label="groupName"
                >
                  <option
                    v-for="unit in groupItems"
                    :key="unit.id"
                    :value="unit.id"
                  >
                    {{ unit.label }}
                  </option>
                </optgroup>
              </select>
            </div>
            <button
              type="button"
              @click="removeIngredient(index)"
              class="mt-2 text-red-600 hover:text-red-800 px-2"
            >
              <UIcon name="ic:outline-delete" class="size-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Instructions <span class="text-red-500">*</span>
          </label>
          <button
            type="button"
            @click="addStep"
            class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Add Step
          </button>
        </div>
        <p v-if="getFieldError('steps')" class="text-red-600 text-sm">
          {{ getFieldError('steps') }}
        </p>

        <div class="space-y-3">
          <div
            v-for="(step, index) in form.steps"
            :key="index"
            class="flex gap-3"
          >
            <span
              class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-sm rounded-full flex items-center justify-center mt-2"
            >
              {{ index + 1 }}
            </span>
            <textarea
              v-model="form.steps[index]"
              rows="2"
              class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe this step..."
            ></textarea>
            <button
              type="button"
              @click="removeStep(index)"
              class="mt-2 text-red-600 hover:text-red-800 px-2"
            >
              <UIcon name="ic:outline-delete" class="size-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Submit Buttons -->
      <div class="flex gap-4 pt-6 border-t">
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
          class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
