<template>
  <div
    ref="wrapperRef"
    :class="[
      'image-node-view',
      `image-node-view--${alignment}`,
      {
        'image-node-view--selected': isSelected,
        'image-node-view--resizing': isResizing
      }
    ]"
    @click="handleClick"
  >
    <img
      ref="imageRef"
      :src="src"
      :alt="alt"
      :title="title"
      :style="imageStyle"
      @load="handleImageLoad"
      @error="handleImageError"
    >

    <!-- Image Controls Overlay -->
    <ImageControls
      v-if="isSelected && !isEditorReadonly"
      :is-selected="isSelected"
      :src="src"
      :width="width"
      :height="height"
      :alignment="alignment"
      :container-rect="containerRect"
      @update:width="updateWidth"
      @update:height="updateHeight"
      @update:alignment="updateAlignment"
      @remove="removeImage"
      @resize-start="handleResizeStart"
      @resize-end="handleResizeEnd"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import ImageControls from './ImageControls.vue'

interface ImageNodeViewProps {
  node: any
  view: any
  getPos: () => number
  decorations?: any[]
  selected?: boolean
}

// Props
const props = withDefaults(defineProps<ImageNodeViewProps>(), {
  decorations: () => [],
  selected: false
})

// State
const wrapperRef = ref<HTMLElement>()
const imageRef = ref<HTMLImageElement>()
const containerRect = ref<DOMRect>()
const isResizing = ref(false)

// Computed
const src = computed(() => props.node.attrs.src)
const alt = computed(() => props.node.attrs.alt || '')
const title = computed(() => props.node.attrs.title || '')
const width = computed(() => props.node.attrs.width)
const height = computed(() => props.node.attrs.height)
const alignment = computed(() => props.node.attrs.alignment || 'center')
const isSelected = computed(() => props.selected)
const isEditorReadonly = computed(() => !props.view.editable)

const imageStyle = computed(() => {
  const styles: any = {}

  if (width.value) {
    styles.width = `${width.value}px`
  }

  if (height.value) {
    styles.height = `${height.value}px`
  }

  return styles
})

// Methods
const updateContainerRect = () => {
  if (wrapperRef.value) {
    containerRect.value = wrapperRef.value.getBoundingClientRect()
  }
}

const updateNodeAttrs = (attrs: Partial<any>) => {
  const pos = props.getPos()
  if (pos !== undefined) {
    const tr = props.view.state.tr
    tr.setNodeMarkup(pos, null, {
      ...props.node.attrs,
      ...attrs
    })
    props.view.dispatch(tr)
  }
}

const updateWidth = (newWidth: number) => {
  updateNodeAttrs({ width: Math.round(newWidth) })
}

const updateHeight = (newHeight: number) => {
  updateNodeAttrs({ height: Math.round(newHeight) })
}

const updateAlignment = (newAlignment: 'left' | 'center' | 'right') => {
  updateNodeAttrs({ alignment: newAlignment })
}

const removeImage = () => {
  const pos = props.getPos()
  if (pos !== undefined) {
    const tr = props.view.state.tr
    tr.delete(pos, pos + props.node.nodeSize)
    props.view.dispatch(tr)
  }
}

const handleClick = (event: Event) => {
  event.preventDefault()
  event.stopPropagation()

  // Focus the editor and select this node
  props.view.focus()

  const pos = props.getPos()
  if (pos !== undefined) {
    // Create a node selection at this position
    const tr = props.view.state.tr
    const nodeSelection = tr.doc.resolve(pos)

    // Set selection to the entire node
    if (nodeSelection.nodeAfter) {
      const selection = props.view.state.selection.constructor.create(
        tr.doc,
        pos,
        pos + nodeSelection.nodeAfter.nodeSize
      )
      props.view.dispatch(tr.setSelection(selection))
    }
  }
}

const handleImageLoad = () => {
  nextTick(() => {
    updateContainerRect()
  })
}

const handleImageError = () => {
  console.warn('Failed to load image:', src.value)
}

const handleResizeStart = () => {
  isResizing.value = true
}

const handleResizeEnd = () => {
  isResizing.value = false
  nextTick(() => {
    updateContainerRect()
  })
}

// Handle window resize
const handleWindowResize = () => {
  updateContainerRect()
}

// Lifecycle
onMounted(() => {
  updateContainerRect()
  window.addEventListener('resize', handleWindowResize)
  window.addEventListener('scroll', updateContainerRect, true)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize)
  window.removeEventListener('scroll', updateContainerRect, true)
})

// Watch for selection changes
const observer = new MutationObserver(() => {
  if (isSelected.value) {
    updateContainerRect()
  }
})

onMounted(() => {
  if (wrapperRef.value) {
    observer.observe(wrapperRef.value, {
      attributes: true,
      childList: true,
      subtree: true
    })
  }
})

onUnmounted(() => {
  observer.disconnect()
})
</script>

<style scoped>
.image-node-view {
  position: relative;
  display: block;
  margin: 1.5rem 0;
  line-height: 0;
}

.image-node-view--left {
  text-align: left;
}

.image-node-view--center {
  text-align: center;
}

.image-node-view--right {
  text-align: right;
}

.image-node-view img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
}

.image-node-view img:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.image-node-view--selected {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 10px;
}

.image-node-view--selected img {
  opacity: 0.9;
}

.image-node-view--resizing img {
  pointer-events: none;
  user-select: none;
}

/* ProseMirror specific styles */
.image-node-view.ProseMirror-selectednode {
  outline: none;
}

.image-node-view.ProseMirror-selectednode img {
  opacity: 0.8;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .image-node-view--selected {
    outline-color: #60a5fa;
  }
}
</style>