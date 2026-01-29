// composables/useRecipeForm.ts
import { ref, computed } from 'vue'
import type { ValidationErrorDetail } from '~/utils/errors'
import { parseValidationErrors, mapErrorToFormField } from '~/utils/errors'

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
    status: initialData?.status || 1
  })

  const errors = ref<ValidationError[]>([])
  const apiErrors = ref<ValidationError[]>([])
  const newTag = ref('')

  const totalTime = computed(() => form.value.prep_time + form.value.cook_time)
  const hasErrors = computed(() => errors.value.length > 0)
  const hasApiErrors = computed(() => apiErrors.value.length > 0)

  const allErrors = computed(() => [...errors.value, ...apiErrors.value])
  const hasAnyErrors = computed(() => allErrors.value.length > 0)

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

    const nonEmptyIngredients = form.value.ingredients.filter(
      (ing) => ing && ing.name.trim()
    )

    if (nonEmptyIngredients.length === 0) {
      errors.value.push({
        field: 'ingredients',
        message: 'At least one non-empty ingredient is required'
      })
      return false
    }

    let hasInvalidAmount = false
    form.value.ingredients.forEach((ing, index) => {
      if (ing.name.trim() && ing.amount <= 0) {
        errors.value.push({
          field: `ingredients #${index + 1} → amount`,
          message: 'Amount must be greater than 0'
        })
        hasInvalidAmount = true
      }
    })

    return !hasInvalidAmount
  }

  const validateSteps = (): boolean => {
    if (!form.value.steps || form.value.steps.length === 0) {
      errors.value.push({
        field: 'steps',
        message: 'At least one instruction step is required'
      })
      return false
    }

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

  /**
   * Set API validation errors from backend response
   *
   * @param validationErrors - Array of validation error details from FastAPI
   *
   * @example
   * try {
   *   await createRecipe(data)
   * } catch (err) {
   *   if (err.statusCode === 422) {
   *     setApiErrors(err.data.detail)
   *   }
   * }
   */
  const setApiErrors = (validationErrors: ValidationErrorDetail[]) => {
    const parsed = parseValidationErrors(validationErrors)

    apiErrors.value = parsed.map((error) => ({
      field: error.field,
      message: error.message
    }))
  }

  const clearApiErrors = () => {
    apiErrors.value = []
  }

  /**
   * Get error for a specific form field by its path
   *
   * @param path - Array representing the field path (e.g., ['ingredients', '0', 'amount'])
   * @returns Error message or null
   */
  const getFieldErrorByPath = (path: string[]): string | null => {
    const fieldKey = mapErrorToFormField(path)

    const apiError = apiErrors.value.find((e) => {
      const errorPath = e.field.toLowerCase().replace(/\s+/g, '-')
      return errorPath === fieldKey.toLowerCase()
    })

    if (apiError) return apiError.message

    const clientError = errors.value.find((e) => e.field === fieldKey)
    return clientError ? clientError.message : null
  }

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

  const addTag = (tag?: string) => {
    const tagToAdd = tag !== undefined ? tag : newTag.value.trim()

    if (tagToAdd && !form.value.tags.includes(tagToAdd)) {
      form.value.tags.push(tagToAdd)
      if (tag === undefined) {
        newTag.value = ''
      }
    }
  }

  const removeTag = (index: number) => {
    form.value.tags.splice(index, 1)
  }

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
    apiErrors.value = []
    newTag.value = ''
  }

  const getFieldError = (field: string): string | null => {
    const apiError = apiErrors.value.find((e) => e.field === field)
    if (apiError) return apiError.message

    const error = errors.value.find((e) => e.field === field)
    return error ? error.message : null
  }

  const clearErrors = () => {
    errors.value = []
    apiErrors.value = []
  }

  const getFormData = () => {
    const cleanedIngredients = form.value.ingredients.filter(
      (ing) => ing && ing.name.trim()
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

  const getUpdatedData = (originalData?: Partial<RecipeFormData> | null) => {
    const current = getFormData()
    if (!originalData) {
      return current
    }

    const updated: Partial<RecipeFormData> = {}

    const primitiveKeys: (keyof RecipeFormData)[] = [
      'title',
      'description',
      'prep_time',
      'cook_time',
      'servings',
      'image',
      'status'
    ]
    primitiveKeys.forEach((k) => {
      if ((current as any)[k] !== (originalData as any)[k]) {
        ;(updated as any)[k] = (current as any)[k]
      }
    })

    const normalize = (v: any) =>
      v === undefined ? null : JSON.stringify(v, Object.keys(v || {}).sort())

    const origIng = originalData.ingredients
    if (normalize(current.ingredients) !== normalize(origIng)) {
      updated.ingredients = current.ingredients
    }

    const origSteps = originalData.steps
    if (normalize(current.steps) !== normalize(origSteps)) {
      updated.steps = current.steps
    }

    const origTags = originalData.tags
    if (normalize(current.tags) !== normalize(origTags)) {
      updated.tags = current.tags
    }

    return updated
  }

  return {
    form,
    errors,
    apiErrors,
    newTag,
    totalTime,
    hasErrors,
    hasApiErrors,
    hasAnyErrors,
    allErrors,
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
    getFieldErrorByPath,
    clearErrors,
    clearApiErrors,
    setApiErrors,
    getFormData,
    getUpdatedData
  }
}
