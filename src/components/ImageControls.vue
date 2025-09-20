<template>
  <div
    v-if="isSelected"
    class="image-controls"
    :style="controlsStyle"
  >
    <!-- Resize Handles -->
    <div
      v-for="handle in resizeHandles"
      :key="handle.name"
      :class="[
        'image-controls__handle',
        `image-controls__handle--${handle.name}`
      ]"
      :style="handle.style"
      @mousedown.prevent="startResize(handle, $event)"
    />

    <!-- Alignment Controls -->
    <div class="image-controls__toolbar">
      <div class="image-controls__group">
        <button
          :class="[
            'image-controls__button',
            { 'image-controls__button--active': alignment === 'left' }
          ]"
          @click="setAlignment('left')"
          title="Align Left"
        >
          ⬅
        </button>
        <button
          :class="[
            'image-controls__button',
            { 'image-controls__button--active': alignment === 'center' }
          ]"
          @click="setAlignment('center')"
          title="Align Center"
        >
          ⬌
        </button>
        <button
          :class="[
            'image-controls__button',
            { 'image-controls__button--active': alignment === 'right' }
          ]"
          @click="setAlignment('right')"
          title="Align Right"
        >
          ➡
        </button>
      </div>

      <div class="image-controls__group">
        <button
          class="image-controls__button"
          @click="resetSize"
          title="Reset Size"
        >
          ↻
        </button>
        <button
          class="image-controls__button image-controls__button--danger"
          @click="removeImage"
          title="Remove Image"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Size Display -->
    <div class="image-controls__size-display">
      {{ Math.round(currentWidth) }} × {{ Math.round(currentHeight) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface ImageControlsProps {
  isSelected: boolean
  src: string
  width?: number
  height?: number
  alignment?: 'left' | 'center' | 'right'
  maxWidth?: number
  minWidth?: number
  aspectRatio?: number
  containerRect?: DOMRect
}

// Props
const props = withDefaults(defineProps<ImageControlsProps>(), {
  alignment: 'center',
  maxWidth: 1200,
  minWidth: 50,
  containerRect: undefined
})

// Emits
const emit = defineEmits<{
  'update:width': [width: number]
  'update:height': [height: number]
  'update:alignment': [alignment: 'left' | 'center' | 'right']
  'remove': []
  'resize-start': []
  'resize-end': []
}>()

// State
const isResizing = ref(false)
const resizeHandle = ref<string | null>(null)
const startMousePos = ref({ x: 0, y: 0 })
const startSize = ref({ width: 0, height: 0 })
const currentWidth = ref(props.width || 300)
const currentHeight = ref(props.height || 200)
const naturalSize = ref({ width: 0, height: 0 })

// Computed
const aspectRatio = computed(() => {
  if (props.aspectRatio) return props.aspectRatio
  if (naturalSize.value.width && naturalSize.value.height) {
    return naturalSize.value.width / naturalSize.value.height
  }
  return 16 / 9 // Default aspect ratio
})

const controlsStyle = computed(() => {
  if (!props.containerRect) return {}

  return {
    position: 'absolute' as const,
    left: `${props.containerRect.left}px`,
    top: `${props.containerRect.top}px`,
    width: `${props.containerRect.width}px`,
    height: `${props.containerRect.height}px`,
    pointerEvents: 'none' as const
  }
})

const resizeHandles = computed(() => [
  {
    name: 'nw',
    style: { top: '-4px', left: '-4px' }
  },
  {
    name: 'ne',
    style: { top: '-4px', right: '-4px' }
  },
  {
    name: 'sw',
    style: { bottom: '-4px', left: '-4px' }
  },
  {
    name: 'se',
    style: { bottom: '-4px', right: '-4px' }
  },
  {
    name: 'n',
    style: { top: '-4px', left: '50%', transform: 'translateX(-50%)' }
  },
  {
    name: 's',
    style: { bottom: '-4px', left: '50%', transform: 'translateX(-50%)' }
  },
  {
    name: 'w',
    style: { left: '-4px', top: '50%', transform: 'translateY(-50%)' }
  },
  {
    name: 'e',
    style: { right: '-4px', top: '50%', transform: 'translateY(-50%)' }
  }
])

// Watch for prop changes
watch(() => props.width, (newWidth) => {
  if (newWidth && !isResizing.value) {
    currentWidth.value = newWidth
  }
})

watch(() => props.height, (newHeight) => {
  if (newHeight && !isResizing.value) {
    currentHeight.value = newHeight
  }
})

// Methods
const loadNaturalSize = async () => {
  if (!props.src) return

  try {
    const img = new Image()
    img.onload = () => {
      naturalSize.value = {
        width: img.naturalWidth,
        height: img.naturalHeight
      }

      // If no initial size is provided, use natural size with max width constraint
      if (!props.width && !props.height) {
        const maxWidth = Math.min(img.naturalWidth, props.maxWidth)
        const scaledHeight = (maxWidth / img.naturalWidth) * img.naturalHeight

        currentWidth.value = maxWidth
        currentHeight.value = scaledHeight

        emit('update:width', maxWidth)
        emit('update:height', scaledHeight)
      }
    }
    img.src = props.src
  } catch (error) {
    console.warn('Failed to load image for size calculation:', error)
  }
}

const startResize = (handle: any, event: MouseEvent) => {
  isResizing.value = true
  resizeHandle.value = handle.name
  startMousePos.value = { x: event.clientX, y: event.clientY }
  startSize.value = { width: currentWidth.value, height: currentHeight.value }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.body.style.cursor = getResizeCursor(handle.name)
  document.body.style.userSelect = 'none'

  emit('resize-start')
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isResizing.value || !resizeHandle.value) return

  const deltaX = event.clientX - startMousePos.value.x
  const deltaY = event.clientY - startMousePos.value.y

  let newWidth = startSize.value.width
  let newHeight = startSize.value.height

  // Calculate new dimensions based on handle
  switch (resizeHandle.value) {
    case 'se':
      newWidth = startSize.value.width + deltaX
      newHeight = startSize.value.height + deltaY
      break
    case 'sw':
      newWidth = startSize.value.width - deltaX
      newHeight = startSize.value.height + deltaY
      break
    case 'ne':
      newWidth = startSize.value.width + deltaX
      newHeight = startSize.value.height - deltaY
      break
    case 'nw':
      newWidth = startSize.value.width - deltaX
      newHeight = startSize.value.height - deltaY
      break
    case 'e':
      newWidth = startSize.value.width + deltaX
      newHeight = newWidth / aspectRatio.value
      break
    case 'w':
      newWidth = startSize.value.width - deltaX
      newHeight = newWidth / aspectRatio.value
      break
    case 's':
      newHeight = startSize.value.height + deltaY
      newWidth = newHeight * aspectRatio.value
      break
    case 'n':
      newHeight = startSize.value.height - deltaY
      newWidth = newHeight * aspectRatio.value
      break
  }

  // Maintain aspect ratio for corner handles
  if (['se', 'sw', 'ne', 'nw'].includes(resizeHandle.value)) {
    if (event.shiftKey) {
      // Force maintain aspect ratio when Shift is held
      newHeight = newWidth / aspectRatio.value
    }
  }

  // Apply constraints
  newWidth = Math.max(props.minWidth, Math.min(props.maxWidth, newWidth))
  newHeight = Math.max(props.minWidth / aspectRatio.value, newHeight)

  // Update current size
  currentWidth.value = newWidth
  currentHeight.value = newHeight
}

const handleMouseUp = () => {
  if (!isResizing.value) return

  isResizing.value = false
  resizeHandle.value = null

  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''

  // Emit final size
  emit('update:width', currentWidth.value)
  emit('update:height', currentHeight.value)
  emit('resize-end')
}

const getResizeCursor = (handle: string): string => {
  const cursors: Record<string, string> = {
    'nw': 'nw-resize',
    'ne': 'ne-resize',
    'sw': 'sw-resize',
    'se': 'se-resize',
    'n': 'n-resize',
    's': 's-resize',
    'w': 'w-resize',
    'e': 'e-resize'
  }
  return cursors[handle] || 'default'
}

const setAlignment = (newAlignment: 'left' | 'center' | 'right') => {
  emit('update:alignment', newAlignment)
}

const resetSize = () => {
  if (naturalSize.value.width && naturalSize.value.height) {
    const maxWidth = Math.min(naturalSize.value.width, props.maxWidth)
    const scaledHeight = (maxWidth / naturalSize.value.width) * naturalSize.value.height

    currentWidth.value = maxWidth
    currentHeight.value = scaledHeight

    emit('update:width', maxWidth)
    emit('update:height', scaledHeight)
  }
}

const removeImage = () => {
  emit('remove')
}

// Lifecycle
onMounted(() => {
  loadNaturalSize()
})

onUnmounted(() => {
  if (isResizing.value) {
    handleMouseUp()
  }
})

// Expose methods for parent component
defineExpose({
  resetSize,
  setAlignment
})
</script>

<style scoped>
.image-controls {
  position: relative;
  pointer-events: none;
  z-index: 10;
}

.image-controls__handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border: 1px solid white;
  border-radius: 2px;
  pointer-events: auto;
  transition: all 0.15s ease;
}

.image-controls__handle:hover {
  background: #2563eb;
  transform: scale(1.2);
}

.image-controls__handle--nw {
  cursor: nw-resize;
}

.image-controls__handle--ne {
  cursor: ne-resize;
}

.image-controls__handle--sw {
  cursor: sw-resize;
}

.image-controls__handle--se {
  cursor: se-resize;
}

.image-controls__handle--n,
.image-controls__handle--s {
  cursor: ns-resize;
}

.image-controls__handle--w,
.image-controls__handle--e {
  cursor: ew-resize;
}

.image-controls__toolbar {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 6px;
  pointer-events: auto;
  backdrop-filter: blur(4px);
}

.image-controls__group {
  display: flex;
  gap: 4px;
}

.image-controls__button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 3px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.image-controls__button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.image-controls__button--active {
  background: #3b82f6;
}

.image-controls__button--danger:hover {
  background: #ef4444;
}

.image-controls__size-display {
  position: absolute;
  bottom: -28px;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 10px;
  border-radius: 3px;
  pointer-events: none;
  backdrop-filter: blur(4px);
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .image-controls__handle {
    border-color: #374151;
  }

  .image-controls__toolbar {
    background: rgba(0, 0, 0, 0.9);
  }

  .image-controls__size-display {
    background: rgba(0, 0, 0, 0.9);
  }
}
</style>