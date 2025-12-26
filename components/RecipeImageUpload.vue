<script setup lang="ts">
  interface Props {
    modelValue: string
    editable?: boolean
    title?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    editable: false,
    title: 'Recipe Image'
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    'file-selected': [file: File]
  }>()

  const {
    fileInput,
    imagePreview,
    imageFile,
    compressing,
    uploadError,
    triggerFileInput,
    handleFileSelect,
    clearImage
  } = useImageUpload()

  const showImageViewer = ref(false)

  // Watch for file selection
  watch(imageFile, (file) => {
    if (file) {
      emit('file-selected', file)
    }
  })

  // Display either preview or provided URL
  const displayImage = computed(() => {
    return imagePreview.value || props.modelValue
  })

  const openImageViewer = () => {
    if (displayImage.value && !props.editable) {
      showImageViewer.value = true
    }
  }

  const handleClick = () => {
    if (props.editable) {
      triggerFileInput()
    } else if (displayImage.value) {
      openImageViewer()
    }
  }

  // Handle file selection wrapper
  const onFileSelect = async (event: Event) => {
    await handleFileSelect(event)
  }
</script>

<template>
  <div class="space-y-2">
    <div
      @click="handleClick"
      :class="[
        'relative w-full rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700',
        editable
          ? 'h-64 md:h-96 cursor-pointer group hover:opacity-90 transition-opacity'
          : displayImage
          ? 'h-64 md:h-96 cursor-zoom-in'
          : 'h-64 md:h-96'
      ]"
    >
      <!-- Image Display -->
      <img
        v-if="displayImage"
        :src="displayImage"
        :alt="title"
        class="w-full h-full object-cover"
      />

      <!-- Empty State -->
      <div
        v-else
        class="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500"
      >
        <UIcon name="ic:outline-image" class="size-16 mb-2" />
        <p v-if="editable" class="text-sm">Click to upload image</p>
        <p v-else class="text-sm">No image available</p>
      </div>

      <!-- Upload Overlay (Edit Mode) -->
      <div
        v-if="editable"
        class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center"
      >
        <UIcon name="ic:outline-upload" class="size-8 text-white mb-2" />
        <p class="text-white text-sm font-medium">
          {{ displayImage ? 'Change Image' : 'Upload Image' }}
        </p>
      </div>

      <!-- Zoom Hint Overlay (View Mode with Image) -->
      <div
        v-if="!editable && displayImage"
        class="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
      >
        <UIcon
          name="ic:outline-zoom-in"
          class="size-8 text-white drop-shadow-lg"
        />
      </div>

      <!-- Compression Loading -->
      <div
        v-if="compressing"
        class="absolute inset-0 bg-black/70 flex flex-col items-center justify-center"
      >
        <div
          class="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-3"
        ></div>
        <p class="text-white text-sm font-medium">Compressing image...</p>
      </div>
    </div>

    <!-- File Input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="onFileSelect"
      class="hidden"
    />

    <!-- Error Message -->
    <p v-if="uploadError" class="text-red-600 dark:text-red-400 text-sm">
      {{ uploadError }}
    </p>

    <!-- Help Text (Edit Mode) -->
    <p
      v-if="editable && !uploadError"
      class="text-xs text-gray-500 dark:text-gray-400"
    >
      JPG, PNG, or WebP. Max 10MB. Image will be compressed automatically.
    </p>
  </div>

  <!-- Image Viewer Modal -->
  <ImageViewerModal
    v-if="showImageViewer"
    :image-url="displayImage"
    :title="title"
    @close="showImageViewer = false"
  />
</template>
