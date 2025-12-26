// composables/useImageUpload.ts
import { ref } from 'vue'

export const useImageUpload = () => {
  const fileInput = ref<HTMLInputElement>()
  const imagePreview = ref('')
  const imageFile = ref<File | null>(null)
  const compressing = ref(false)
  const uploadError = ref('')

  // Image compression function
  const compressImage = (
    file: File,
    maxWidth = 1200,
    maxHeight = 800,
    targetSizeKB = 1000
  ): Promise<{ blob: Blob; format: string }> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }

        canvas.width = width
        canvas.height = height

        // Draw image
        ctx.drawImage(img, 0, 0, width, height)

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

        // Compress with iterative quality adjustment
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

      console.log(`Target size: ${targetSize}`)

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

            attempts++
            quality -= 0.05
            console.log(blob.size, quality)
            tryCompress()
          },
          format,
          format === 'image/jpeg' ? quality : undefined
        )
      }

      tryCompress()
    })
  }

  // Trigger file input
  const triggerFileInput = () => {
    fileInput.value?.click()
  }

  // Handle file selection
  const handleFileSelect = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      uploadError.value = 'Please select a valid image file'
      return
    }

    // Validate file size (10MB max for initial upload)
    if (file.size > 10 * 1024 * 1024) {
      uploadError.value = 'Image size must be less than 10MB'
      return
    }

    compressing.value = true
    uploadError.value = ''

    try {
      // Compress the image
      const { blob, format } = await compressImage(file, 1920, 1080, 1024)

      // Create file with appropriate extension
      const compressedFile = new File([blob], `recipe.${format}`, {
        type: blob.type,
        lastModified: Date.now()
      })

      // Create preview URL
      if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value)
      }
      imagePreview.value = URL.createObjectURL(compressedFile)
      imageFile.value = compressedFile

      console.log(
        `Image compressed to ${(blob.size / 1024).toFixed(
          2
        )}KB as ${format.toUpperCase()}`
      )
    } catch (error) {
      console.error('Error compressing image:', error)
      uploadError.value = 'Failed to process image. Please try again.'
    } finally {
      compressing.value = false
    }
  }

  // Upload image to server
  const uploadImage = async (
    endpoint: string = '/upload/recipe'
  ): Promise<string | null> => {
    console.log('Uploading image...')
    if (!imageFile.value) return null

    const formData = new FormData()
    formData.append('image', imageFile.value)

    try {
      const api = useApi()
      const response = await api(endpoint, {
        method: 'POST',
        body: formData
      })

      return response.url
    } catch (error) {
      console.error('Failed to upload image:', error)
      throw new Error('Failed to upload image')
    }
  }

  // Clear image
  const clearImage = () => {
    if (imagePreview.value) {
      URL.revokeObjectURL(imagePreview.value)
    }
    imagePreview.value = ''
    imageFile.value = null
    uploadError.value = ''
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }

  return {
    fileInput,
    imagePreview,
    imageFile,
    compressing,
    uploadError,
    triggerFileInput,
    handleFileSelect,
    uploadImage,
    clearImage
  }
}
