// composables/useRecipeForm.ts
import { ref, computed } from 'vue'

export interface RecipeIngredient {
  name: string
  amount: number
  unit: number
}

export interface RecipeFormData {
  title: string
  description: string
  ingredients: Array<RecipeIngredient>
  steps: string[]
  prep_time: number
  cook_time: number
  servings: number
  tags: string[]
  image: string
  status: number
}

export interface ValidationError {
  field: string
  message: string
}

export const useRecipeForm = (initialData?: Partial<RecipeFormData>) => {
  const form = ref<RecipeFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    ingredients:
      initialData?.ingredients && initialData.ingredients.length > 0
        ? initialData!.ingredients
        : [{ name: '', amount: 0, unit: 1 }],
    steps: initialData?.steps || [],
    prep_time: initialData?.prep_time || 0,
    cook_time: initialData?.cook_time || 0,
    servings: initialData?.servings || 1,
    tags: initialData?.tags || [],
    image: initialData?.image || '',
    status: initialData?.status || -1 // Default to PUBLIC
  })

  const errors = ref<ValidationError[]>([])
  const newTag = ref('')

  // Computed
  const totalTime = computed(() => form.value.prep_time + form.value.cook_time)
  const hasErrors = computed(() => errors.value.length > 0)

  // Validation functions
  const validateTitle = (): boolean => {
    if (!form.value.title || !form.value.title.trim()) {
      errors.value.push({
        field: 'title',
        message: 'Recipe title is required'
      })
      return false
    }
    if (form.value.title.length < 3) {
      errors.value.push({
        field: 'title',
        message: 'Recipe title must be at least 3 characters'
      })
      return false
    }
    return true
  }

  const validateDescription = (): boolean => {
    if (!form.value.description || !form.value.description.trim()) {
      errors.value.push({
        field: 'description',
        message: 'Recipe description is required'
      })
      return false
    }
    if (form.value.description.length < 10) {
      errors.value.push({
        field: 'description',
        message: 'Description must be at least 10 characters'
      })
      return false
    }
    return true
  }

  const validateIngredients = (): boolean => {
    if (!form.value.ingredients || form.value.ingredients.length === 0) {
      errors.value.push({
        field: 'ingredients',
        message: 'At least one ingredient is required'
      })
      return false
    }

    // Filter out empty ingredients
    const nonEmptyIngredients = form.value.ingredients.filter(
      (ing) => ing && (typeof ing === 'string' ? ing.trim() : ing.name?.trim())
    )

    if (nonEmptyIngredients.length === 0) {
      errors.value.push({
        field: 'ingredients',
        message: 'At least one non-empty ingredient is required'
      })
      return false
    }

    return true
  }

  const validateSteps = (): boolean => {
    if (!form.value.steps || form.value.steps.length === 0) {
      errors.value.push({
        field: 'steps',
        message: 'At least one instruction step is required'
      })
      return false
    }

    // Filter out empty steps
    const nonEmptySteps = form.value.steps.filter((step) => step && step.trim())

    if (nonEmptySteps.length === 0) {
      errors.value.push({
        field: 'steps',
        message: 'At least one non-empty instruction step is required'
      })
      return false
    }

    return true
  }

  const validateServings = (): boolean => {
    if (form.value.servings < 1) {
      errors.value.push({
        field: 'servings',
        message: 'Servings must be at least 1'
      })
      return false
    }
    return true
  }

  const validateStatus = (): boolean => {
    if (![1, 2, 3, 4].includes(form.value.status)) {
      errors.value.push({
        field: 'status',
        message: 'Invalid status value'
      })
      return false
    }
    return true
  }

  const validateImage = (): boolean => {
    if (form.value.image && form.value.image.trim()) {
      try {
        new URL(form.value.image)
        return true
      } catch {
        errors.value.push({
          field: 'image',
          message: 'Image must be a valid URL'
        })
        return false
      }
    }
    return true
  }

  const validateForm = (): boolean => {
    errors.value = []

    const validations = [
      validateTitle(),
      validateDescription(),
      validateIngredients(),
      validateSteps(),
      validateServings(),
      validateStatus(),
      validateImage()
    ]

    return validations.every((v) => v === true)
  }

  // Form operations
  const addIngredient = () => {
    form.value.ingredients.push({ name: '', amount: 0, unit: 1 })
  }

  const removeIngredient = (index: number) => {
    if (form.value.ingredients.length <= 1) return
    form.value.ingredients.splice(index, 1)
  }

  const addStep = () => {
    form.value.steps.push('')
  }

  const removeStep = (index: number) => {
    if (form.value.steps.length <= 1) return
    form.value.steps.splice(index, 1)
  }

  const addTag = () => {
    if (newTag.value.trim() && !form.value.tags.includes(newTag.value.trim())) {
      form.value.tags.push(newTag.value.trim())
      newTag.value = ''
    }
  }

  const removeTag = (index: number) => {
    form.value.tags.splice(index, 1)
  }

  // Reset form
  const resetForm = (data?: Partial<RecipeFormData>) => {
    form.value = {
      title: data?.title || '',
      description: data?.description || '',
      ingredients: data?.ingredients || [],
      steps: data?.steps || [],
      prep_time: data?.prep_time || 0,
      cook_time: data?.cook_time || 0,
      servings: data?.servings || 1,
      tags: data?.tags || [],
      image: data?.image || '',
      status: data?.status || 1
    }
    errors.value = []
    newTag.value = ''
  }

  // Get error for specific field
  const getFieldError = (field: string): string | null => {
    const error = errors.value.find((e) => e.field === field)
    return error ? error.message : null
  }

  // Clear errors
  const clearErrors = () => {
    errors.value = []
  }

  // Get form data for submission
  const getFormData = () => {
    // Clean up empty ingredients and steps
    const cleanedIngredients = form.value.ingredients.filter(
      (ing) => ing && (typeof ing === 'string' ? ing.trim() : ing.name?.trim())
    )
    const cleanedSteps = form.value.steps.filter((step) => step && step.trim())

    return {
      ...form.value,
      ingredients: cleanedIngredients,
      steps: cleanedSteps,
      title: form.value.title.trim(),
      description: form.value.description.trim()
    }
  }

  return {
    form,
    errors,
    newTag,
    totalTime,
    hasErrors,
    validateForm,
    validateTitle,
    validateDescription,
    validateIngredients,
    validateSteps,
    validateServings,
    validateStatus,
    validateImage,
    addIngredient,
    removeIngredient,
    addStep,
    removeStep,
    addTag,
    removeTag,
    resetForm,
    getFieldError,
    clearErrors,
    getFormData
  }
}
