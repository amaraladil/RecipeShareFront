<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
      >
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Profile
        </h2>
        <button
          @click="close"
          class="p-2 w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <Icon
            name="heroicons:x-mark"
            class="w-5 h-5 text-gray-500 dark:text-gray-400"
          />
        </button>
      </div>

      <!-- Avatar Section - Top Center -->
      <div
        class="flex justify-center py-6 border-b border-gray-100 dark:border-gray-700"
      >
        <div class="relative">
          <div
            @click="triggerFileInput"
            class="relative w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden cursor-pointer group hover:opacity-80 transition-opacity"
          >
            <UserAvatar
              :avatar-url="avatarPreview || form.avatar_url"
              :alt="'Avatar preview'"
              class="w-full h-full"
            />
            <!-- Overlay on hover -->
            <div
              class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Icon name="heroicons:camera" class="w-6 h-6 text-white" />
            </div>
          </div>

          <!-- Loading indicator for compression -->
          <div
            v-if="compressing"
            class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"
          >
            <div
              class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></div>
          </div>
        </div>

        <!-- Hidden file input -->
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileSelect"
          class="hidden"
        />
      </div>

      <div class="text-center pb-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Click to change avatar
        </p>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
          JPG, PNG, or WebP. Max 5MB.
        </p>
      </div>

      <!-- Form Content -->
      <div class="overflow-y-auto max-h-[calc(90vh-300px)]">
        <form @submit.prevent="save" class="p-6 space-y-6">
          <!-- General Error -->
          <div
            v-if="generalError"
            class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          >
            <p class="text-sm text-red-600 dark:text-red-400">
              {{ generalError }}
            </p>
          </div>

          <!-- Username Field -->
          <div class="space-y-2">
            <label
              for="username"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Username
            </label>
            <input
              id="username"
              v-model="form.display_name"
              type="text"
              :class="[
                'w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
                errors.display_name
                  ? 'border-red-300 dark:border-red-600'
                  : 'border-gray-300 dark:border-gray-600'
              ]"
              placeholder="Enter your username"
              @blur="validateField('display_name')"
            />
            <p
              v-if="errors.display_name"
              class="text-sm text-red-600 dark:text-red-400"
            >
              {{ errors.display_name }}
            </p>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">
              www.recipe.com/@{{ form.display_name || 'username' }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Usernames can only contain letters, numbers, underscores, and
              periods. Changing your username will also change your profile
              link.
            </p>
          </div>

          <!-- Display Name Field -->
          <div class="space-y-2">
            <label
              for="nick_name"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nickname
            </label>
            <input
              id="nick_name"
              v-model="form.nick_name"
              type="text"
              :class="[
                'w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
                errors.nick_name
                  ? 'border-red-300 dark:border-red-600'
                  : 'border-gray-300 dark:border-gray-600'
              ]"
              placeholder="Enter your display name"
              @blur="validateField('nick_name')"
            />
            <p
              v-if="errors.nick_name"
              class="text-sm text-red-600 dark:text-red-400"
            >
              {{ errors.nick_name }}
            </p>
            <p v-else class="text-xs text-gray-500 dark:text-gray-400">
              Can only be changed every 7 days
            </p>
          </div>

          <!-- Bio Field -->
          <div class="space-y-2">
            <label
              for="bio"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Bio
            </label>
            <textarea
              id="bio"
              v-model="form.bio"
              rows="4"
              :class="[
                'w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none',
                errors.bio
                  ? 'border-red-300 dark:border-red-600'
                  : 'border-gray-300 dark:border-gray-600'
              ]"
              placeholder="Tell us about yourself..."
              @keydown.enter="limitLines"
              @blur="validateField('bio')"
            />
            <div class="flex justify-between items-center">
              <p
                v-if="errors.bio"
                class="text-sm text-red-600 dark:text-red-400"
              >
                {{ errors.bio }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {{ form.bio.length }}/{{ PROFILE_BIO_MAX_LENGTH }} characters
              </p>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div
        class="flex justify-end items-center gap-3 p-6 border-t border-gray-200 dark:border-gray-700"
      >
        <button
          type="button"
          @click="close"
          class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          @click="save"
          :disabled="!isFormValid || saving"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed flex items-center cursor-pointer"
        >
          <div
            v-if="saving"
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
          ></div>
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, reactive, computed } from 'vue'
  import { PROFILE_BIO_MAX_LINES, PROFILE_BIO_MAX_LENGTH } from '~/constants'

  const { validateUsername, validateNickName, validateBio } = useValidation()
  const { cacheAuthor } = useAuthorCache()

  const props = defineProps({
    show: Boolean,
    user: Object
  })

  const emits = defineEmits<{
    close: []
    updated: [updatedUserData?: any]
  }>()

  const form = reactive({
    display_name: '',
    nick_name: '',
    bio: '',
    avatar_url: ''
  })

  const errors = reactive({
    display_name: '',
    nick_name: '',
    bio: '',
    avatar_url: ''
  })

  const api = useApi()
  const generalError = ref('')
  const saving = ref(false)
  const original = ref({})

  // Avatar-related refs
  const fileInput = ref<HTMLInputElement>()
  const avatarPreview = ref('')
  const avatarFile = ref<File | null>(null)
  const compressing = ref(false)

  // Watch for user prop changes
  watch(
    () => props.user,
    (val) => {
      if (val) {
        Object.assign(form, {
          display_name: val.display_name || '',
          nick_name: val.nick_name || '',
          bio: val.bio || '',
          avatar_url: val.avatar_url || ''
        })
        original.value = { ...val }
        // Reset avatar preview when user changes
        avatarPreview.value = ''
        avatarFile.value = null
      }
    },
    { immediate: true }
  )

  // Image compression function
  const compressImage = (
    file: File,
    maxWidth = 400,
    targetSizeKB = 10
  ): Promise<{ blob: Blob; format: string }> => {
    return new Promise<{ blob: Blob; format: string }>((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio

        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Determine if image has transparency
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const hasTransparency = checkForTransparency(imageData)

        // Choose format based on transparency and original format
        let outputFormat = 'image/jpeg'
        let fileExtension = 'jpg'

        if (hasTransparency || file.type === 'image/png') {
          outputFormat = 'image/png'
          fileExtension = 'png'
        } else if (file.type === 'image/webp') {
          outputFormat = 'image/webp'
          fileExtension = 'webp'
        }

        // Compress with iterative quality adjustment to meet size target
        compressWithSizeLimit(canvas, outputFormat, targetSizeKB * 1024)
          .then((blob) => {
            resolve({ blob, format: fileExtension })
          })
          .catch(reject)
      }

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // Helper function to check if image has transparency
  const checkForTransparency = (imageData: ImageData): boolean => {
    const data = imageData.data
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) {
        return true
      }
    }
    return false
  }

  // Helper function to compress with size limit
  const compressWithSizeLimit = (
    canvas: HTMLCanvasElement,
    format: string,
    targetSize: number
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      let quality = 1.0
      let attempts = 0
      const maxAttempts = 10

      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'))
              return
            }

            if (
              blob.size <= targetSize ||
              attempts >= maxAttempts ||
              quality <= 0.1
            ) {
              resolve(blob)
              return
            }

            // Reduce quality and try again
            attempts++
            quality -= 0.05
            tryCompress()
          },
          format,
          format === 'image/jpeg' ? quality : undefined // Quality only applies to JPEG
        )
      }

      tryCompress()
    })
  }

  // File input handlers
  const triggerFileInput = () => {
    fileInput.value?.click()
  }

  const handleFileSelect = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      generalError.value = 'Please select a valid image file'
      return
    }

    // Validate file size (5MB max for initial upload)
    if (file.size > 5 * 1024 * 1024) {
      generalError.value = 'Image size must be less than 5MB'
      return
    }

    compressing.value = true

    try {
      // Compress the image with transparency support and 10KB limit
      const { blob, format } = await compressImage(file, 400, 100)

      // Create file with appropriate extension
      const compressedFile = new File([blob], `avatar.${format}`, {
        type: blob.type,
        lastModified: Date.now()
      })

      // Create preview URL
      avatarPreview.value = URL.createObjectURL(compressedFile)
      avatarFile.value = compressedFile

      // Clear any previous errors
      generalError.value = ''
      errors.avatar_url = ''

      console.log(
        `Image compressed to ${(blob.size / 1024).toFixed(
          2
        )}KB as ${format.toUpperCase()}`
      )
    } catch (error) {
      console.error('Error compressing image:', error)
      generalError.value = 'Failed to process image. Please try again.'
    } finally {
      compressing.value = false
    }
  }

  // Upload avatar function
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile.value) return null

    const formData = new FormData()
    formData.append('avatar', avatarFile.value)

    try {
      const response = await api('/upload/avatar', {
        method: 'POST',
        body: formData
      })

      return response.url
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      throw new Error('Failed to upload avatar')
    }
  }

  // Validation functions
  const validateField = (field: keyof typeof form) => {
    let validation: { isValid: boolean; error: string } = {
      isValid: true,
      error: ''
    }

    switch (field) {
      case 'display_name': {
        const result = validateUsername(form.display_name)
        validation = { isValid: result.isValid, error: result.error ?? '' }
        break
      }
      case 'nick_name': {
        if (form.nick_name) {
          const result = validateNickName(form.nick_name)
          validation = { isValid: result.isValid, error: result.error ?? '' }
        }
        break
      }
      case 'bio': {
        const result = validateBio(form.bio)
        validation = { isValid: result.isValid, error: result.error ?? '' }
        break
      }
    }

    errors[field] = validation.error || ''
    return validation.isValid
  }

  const validateAllFields = () => {
    let isValid = true
    const fieldsToValidate = ['display_name', 'nick_name', 'bio'] as const

    fieldsToValidate.forEach((field) => {
      if (!validateField(field)) {
        isValid = false
      }
    })
    return isValid
  }

  // Computed properties
  const isFormValid = computed(() => {
    return (
      Object.values(errors).every((error) => !error) &&
      form.display_name.trim() !== '' &&
      hasChanges.value
    )
  })

  const hasChanges = computed(() => {
    const formHasChanges = Object.keys(form).some((key) => {
      const formValue = form[key as keyof typeof form]
      const originalValue = original.value[key as keyof typeof original.value]
      return formValue !== originalValue
    })

    return formHasChanges || avatarFile.value !== null
  })

  // Event handlers
  const close = () => {
    clearErrors()
    // Clean up preview URL
    if (avatarPreview.value) {
      URL.revokeObjectURL(avatarPreview.value)
      avatarPreview.value = ''
    }
    avatarFile.value = null
    emits('close')
  }

  const clearErrors = () => {
    generalError.value = ''
    Object.keys(errors).forEach((key) => {
      errors[key as keyof typeof errors] = ''
    })
  }

  const limitLines = (event: KeyboardEvent) => {
    const currentLines = form.bio.split('\n').length
    if (currentLines >= PROFILE_BIO_MAX_LINES && event.key === 'Enter') {
      event.preventDefault()
    }
  }

  const getUpdatedFields = () => {
    const updated: Record<string, any> = {}

    Object.keys(form).forEach((key) => {
      const formValue = form[key as keyof typeof form]
      const originalValue = original.value[key as keyof typeof original.value]

      if (
        formValue !== originalValue &&
        formValue != null &&
        formValue !== ''
      ) {
        updated[key] = formValue
      }
    })

    return updated
  }

  const save = async () => {
    if (saving.value) return

    clearErrors()

    // Validate all fields
    if (!validateAllFields()) {
      return
    }

    const updatedFields = getUpdatedFields()
    const hasFieldChanges = Object.keys(updatedFields).length > 0
    const hasAvatarChange = avatarFile.value !== null

    if (!hasFieldChanges && !hasAvatarChange) {
      generalError.value = 'No changes were made'
      return
    }

    saving.value = true

    try {
      // Upload avatar first if there's a new one
      if (hasAvatarChange) {
        const avatarUrl = await uploadAvatar()
        if (avatarUrl) {
          updatedFields.avatar_url = avatarUrl
        }
      }

      // Update profile with all changes and get the updated user data
      let updatedUserData = null
      if (Object.keys(updatedFields).length > 0) {
        const response = await api(`/users/${props.user?.id}`, {
          method: 'PATCH',
          body: updatedFields
        })

        // Extract the user data from the response
        updatedUserData = response.data
      }

      // Emit the updated event with the fresh user data
      emits('updated', updatedUserData)

      // Update profile state
      interface ProfileState {
        id: string
        display_name: string
        avatar_url: string
        [key: string]: any
      }
      const profileState = useProfileState() as { value: ProfileState | null }

      if (profileState.value && updatedFields.display_name) {
        profileState.value.display_name = updatedFields.display_name
        navigateTo(`/@${updatedFields.display_name}`)
      }

      if (profileState.value && updatedFields.avatar_url) {
        profileState.value.avatar_url = updatedFields.avatar_url
      }

      cacheAuthor(props.user?.id, profileState.value)

      close()
    } catch (err: any) {
      console.error('Failed to update profile', err)
      generalError.value =
        err.message || 'Failed to update profile. Please try again.'
    } finally {
      saving.value = false
    }
  }

  // Clear field errors when user starts typing
  Object.keys(form).forEach((field) => {
    watch(
      () => form[field as keyof typeof form],
      () => {
        if (errors[field as keyof typeof errors]) {
          errors[field as keyof typeof errors] = ''
        }
        if (generalError.value) {
          generalError.value = ''
        }
      }
    )
  })
</script>
