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
          class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Icon
            name="heroicons:x-mark"
            class="w-5 h-5 text-gray-500 dark:text-gray-400"
          />
        </button>
      </div>

      <!-- Form Content -->
      <div class="overflow-y-auto max-h-[calc(90vh-140px)]">
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
              maxlength="160"
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
                {{ form.bio.length }}/160 characters
              </p>
            </div>
          </div>

          <!-- Avatar URL Field -->
          <div class="space-y-2">
            <label
              for="avatar_url"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Avatar URL
            </label>
            <div class="flex space-x-3">
              <div class="flex-1">
                <input
                  id="avatar_url"
                  v-model="form.avatar_url"
                  type="url"
                  :class="[
                    'w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
                    errors.avatar_url
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  ]"
                  placeholder="https://example.com/avatar.jpg"
                  @blur="validateField('avatar_url')"
                />
                <p
                  v-if="errors.avatar_url"
                  class="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {{ errors.avatar_url }}
                </p>
              </div>
              <div class="flex-shrink-0">
                <div
                  class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
                >
                  <img
                    v-if="form.avatar_url"
                    :src="form.avatar_url"
                    alt="Avatar preview"
                    class="w-full h-full object-cover"
                    @error="avatarError = true"
                    @load="avatarError = false"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center"
                  >
                    <Icon name="heroicons:user" class="w-6 h-6 text-gray-400" />
                  </div>
                </div>
              </div>
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
          class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          @click="save"
          :disabled="!isFormValid || saving"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed flex items-center"
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
  import { useApi } from '~/composables/useApi'

  const { validateUsername, validateNickName, validateBio, validateUrl } =
    useValidation()

  const props = defineProps({
    show: Boolean,
    user: Object
  })

  const emits = defineEmits(['close', 'updated'])

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
  const avatarError = ref(false)
  const original = ref({})

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
      }
    },
    { immediate: true }
  )

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
      case 'avatar_url': {
        const result = validateUrl(form.avatar_url)
        validation = { isValid: result.isValid, error: result.error ?? '' }
        break
      }
    }

    errors[field] = validation.error || ''
    return validation.isValid
  }

  const validateAllFields = () => {
    let isValid = true
    Object.keys(form).forEach((field) => {
      if (!validateField(field as keyof typeof form)) {
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
    return Object.keys(form).some((key) => {
      const formValue = form[key as keyof typeof form]
      const originalValue = original.value[key as keyof typeof original.value]
      return formValue !== originalValue
    })
  })

  // Event handlers
  const close = () => {
    clearErrors()
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
    if (currentLines >= 4 && event.key === 'Enter') {
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

    if (Object.keys(updatedFields).length === 0) {
      generalError.value = 'No changes were made'
      return
    }

    saving.value = true

    try {
      await api(`/users/${props.user?.id}`, {
        method: 'PATCH',
        body: updatedFields
      })

      emits('updated')

      if (updatedFields.display_name) {
        // Update profile state
        interface ProfileState {
          display_name: string
          [key: string]: any
        }
        const profileState = useProfileState() as { value: ProfileState | null }

        if (profileState.value) {
          profileState.value.display_name = updatedFields.display_name
        }
        navigateTo(`/@${updatedFields.display_name}`)
      }

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
