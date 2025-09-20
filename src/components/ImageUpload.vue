<template>
  <div
    class="image-upload"
    :class="{
      'image-upload--dragging': isDragging,
      'image-upload--disabled': disabled,
      'image-upload--compact': compact
    }"
    @drop="handleDrop"
    @dragover.prevent="handleDragOver"
    @dragenter.prevent="handleDragEnter"
    @dragleave="handleDragLeave"
    @click="openFileDialog"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      style="display: none"
      @change="handleFileSelect"
    >

    <div class="image-upload__content">
      <div class="image-upload__icon">
        <span v-if="!uploading">📷</span>
        <span v-else class="image-upload__spinner">⟳</span>
      </div>

      <div class="image-upload__text">
        <div class="image-upload__title">
          {{ uploading ? 'Uploading...' : (compact ? 'Add Image' : 'Drop images here or click to browse') }}
        </div>
        <div v-if="!compact && !uploading" class="image-upload__subtitle">
          Supports: JPG, PNG, GIF, WebP • Max size: {{ formatFileSize(maxSize) }}
        </div>
      </div>

      <div v-if="!compact" class="image-upload__button">
        <button
          type="button"
          class="image-upload__browse-btn"
          :disabled="disabled || uploading"
        >
          Browse Files
        </button>
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploadProgress.length > 0" class="image-upload__progress">
      <div
        v-for="(item, index) in uploadProgress"
        :key="index"
        class="image-upload__progress-item"
        :class="{
          'image-upload__progress-item--success': item.status === 'success',
          'image-upload__progress-item--error': item.status === 'error'
        }"
      >
        <div class="image-upload__progress-preview">
          <img v-if="item.preview" :src="item.preview" :alt="item.name">
          <span v-else class="image-upload__progress-placeholder">📷</span>
        </div>
        <div class="image-upload__progress-info">
          <div class="image-upload__progress-name">{{ item.name }}</div>
          <div class="image-upload__progress-status">
            <span v-if="item.status === 'uploading'">{{ item.progress }}%</span>
            <span v-else-if="item.status === 'success'" class="image-upload__success">✓ Uploaded</span>
            <span v-else-if="item.status === 'error'" class="image-upload__error">✗ {{ item.error }}</span>
          </div>
        </div>
        <button
          v-if="item.status === 'error'"
          class="image-upload__retry"
          @click.stop="retryUpload(index)"
        >
          ↻
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { validateImageFile, createImagePreview, type ImageOptions } from '@/plugins/ImageExtension'

interface UploadProgressItem {
  name: string
  file: File
  preview?: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

// Props
const props = withDefaults(defineProps<{
  maxSize?: number
  allowedTypes?: string[]
  multiple?: boolean
  disabled?: boolean
  compact?: boolean
  uploadHandler?: (file: File) => Promise<string>
}>(), {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: () => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  multiple: false,
  disabled: false,
  compact: false
})

// Emits
const emit = defineEmits<{
  'upload': [files: File[]]
  'success': [data: { file: File; url: string }]
  'error': [data: { file: File; error: string }]
  'progress': [data: { file: File; progress: number }]
}>()

// State
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const dragCounter = ref(0)
const uploadProgress = ref<UploadProgressItem[]>([])

// Computed
const uploading = computed(() =>
  uploadProgress.value.some(item => item.status === 'uploading')
)

// Methods
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const openFileDialog = () => {
  if (props.disabled || uploading.value) return
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  if (files.length > 0) {
    processFiles(files)
  }
  // Reset input
  target.value = ''
}

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  dragCounter.value++
  isDragging.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  dragCounter.value--
  if (dragCounter.value === 0) {
    isDragging.value = false
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  dragCounter.value = 0

  if (props.disabled || uploading.value) return

  const files = Array.from(event.dataTransfer?.files || [])
  const imageFiles = files.filter(file => file.type.startsWith('image/'))

  if (imageFiles.length > 0) {
    processFiles(imageFiles)
  }
}

const processFiles = async (files: File[]) => {
  // Limit to single file if multiple is false
  const filesToProcess = props.multiple ? files : files.slice(0, 1)

  // Validate files
  const validFiles: File[] = []
  for (const file of filesToProcess) {
    const validation = validateImageFile(file, {
      maxSize: props.maxSize,
      allowedTypes: props.allowedTypes
    })

    if (validation.valid) {
      validFiles.push(file)
    } else {
      // Add error item to progress
      uploadProgress.value.push({
        name: file.name,
        file,
        progress: 0,
        status: 'error',
        error: validation.error
      })
    }
  }

  if (validFiles.length === 0) return

  emit('upload', validFiles)

  // Process each valid file
  for (const file of validFiles) {
    await uploadFile(file)
  }
}

const uploadFile = async (file: File) => {
  // Create progress item
  const progressItem: UploadProgressItem = {
    name: file.name,
    file,
    progress: 0,
    status: 'uploading'
  }

  // Generate preview
  try {
    progressItem.preview = await createImagePreview(file)
  } catch (error) {
    console.warn('Failed to create preview:', error)
  }

  uploadProgress.value.push(progressItem)
  const itemIndex = uploadProgress.value.length - 1

  try {
    let url: string

    if (props.uploadHandler) {
      // Use custom upload handler
      url = await props.uploadHandler(file)
    } else {
      // Use default FileReader for local preview
      url = await createImagePreview(file)
    }

    // Simulate progress for better UX
    for (let progress = 10; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 50))
      uploadProgress.value[itemIndex].progress = progress
      emit('progress', { file, progress })
    }

    // Mark as success
    uploadProgress.value[itemIndex].status = 'success'
    uploadProgress.value[itemIndex].progress = 100

    emit('success', { file, url })

    // Remove from progress after delay
    setTimeout(() => {
      const index = uploadProgress.value.findIndex(item => item.file === file)
      if (index !== -1) {
        uploadProgress.value.splice(index, 1)
      }
    }, 2000)

  } catch (error) {
    // Mark as error
    uploadProgress.value[itemIndex].status = 'error'
    uploadProgress.value[itemIndex].error = error instanceof Error ? error.message : 'Upload failed'

    emit('error', {
      file,
      error: error instanceof Error ? error.message : 'Upload failed'
    })
  }
}

const retryUpload = (index: number) => {
  const item = uploadProgress.value[index]
  if (item && item.status === 'error') {
    // Reset item
    item.status = 'uploading'
    item.progress = 0
    item.error = undefined

    // Retry upload
    uploadFile(item.file)
  }
}

// Clean up progress items that are completed
const clearProgress = () => {
  uploadProgress.value = uploadProgress.value.filter(
    item => item.status === 'uploading'
  )
}

// Expose methods
defineExpose({
  clearProgress,
  openFileDialog
})
</script>

<style scoped>
.image-upload {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.image-upload:hover:not(.image-upload--disabled) {
  border-color: #9ca3af;
  background: #f3f4f6;
}

.image-upload--dragging {
  border-color: #3b82f6;
  background: #dbeafe;
  transform: scale(1.02);
}

.image-upload--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f9fafb;
}

.image-upload--compact {
  min-height: 80px;
  padding: 16px;
}

.image-upload__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.image-upload--compact .image-upload__content {
  flex-direction: row;
  gap: 8px;
}

.image-upload__icon {
  font-size: 32px;
  opacity: 0.7;
}

.image-upload--compact .image-upload__icon {
  font-size: 20px;
}

.image-upload__spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.image-upload__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.image-upload--compact .image-upload__text {
  flex: 1;
  text-align: left;
}

.image-upload__title {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
}

.image-upload--compact .image-upload__title {
  font-size: 14px;
}

.image-upload__subtitle {
  font-size: 12px;
  color: #6b7280;
}

.image-upload__button {
  margin-top: 8px;
}

.image-upload__browse-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.image-upload__browse-btn:hover:not(:disabled) {
  background: #2563eb;
}

.image-upload__browse-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.image-upload__progress {
  margin-top: 16px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-upload__progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  text-align: left;
}

.image-upload__progress-item--success {
  border-color: #10b981;
  background: #f0fdf4;
}

.image-upload__progress-item--error {
  border-color: #ef4444;
  background: #fef2f2;
}

.image-upload__progress-preview {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.image-upload__progress-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-upload__progress-placeholder {
  font-size: 14px;
  opacity: 0.5;
}

.image-upload__progress-info {
  flex: 1;
  min-width: 0;
}

.image-upload__progress-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-upload__progress-status {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.image-upload__success {
  color: #10b981;
  font-weight: 500;
}

.image-upload__error {
  color: #ef4444;
  font-weight: 500;
}

.image-upload__retry {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.image-upload__retry:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .image-upload {
    border-color: #4b5563;
    background: #374151;
    color: #f9fafb;
  }

  .image-upload:hover:not(.image-upload--disabled) {
    border-color: #6b7280;
    background: #4b5563;
  }

  .image-upload--dragging {
    border-color: #60a5fa;
    background: #1e40af;
  }

  .image-upload--disabled {
    background: #1f2937;
  }

  .image-upload__title {
    color: #f9fafb;
  }

  .image-upload__subtitle {
    color: #9ca3af;
  }

  .image-upload__progress-item {
    background: #1f2937;
    border-color: #374151;
  }

  .image-upload__progress-item--success {
    border-color: #059669;
    background: #064e3b;
  }

  .image-upload__progress-item--error {
    border-color: #dc2626;
    background: #7f1d1d;
  }

  .image-upload__progress-name {
    color: #f9fafb;
  }

  .image-upload__progress-status {
    color: #9ca3af;
  }

  .image-upload__retry {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .image-upload__retry:hover {
    background: #4b5563;
    border-color: #6b7280;
  }
}
</style>