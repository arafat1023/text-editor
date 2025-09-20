<template>
  <div
    v-if="isVisible"
    ref="menuRef"
    class="context-menu"
    :style="menuStyle"
    @click.stop
  >
    <div class="context-menu__section">
      <button
        v-if="hasSelection"
        class="context-menu__item"
        :disabled="!canCopy"
        @click="handleCopy"
      >
        <span class="context-menu__icon">📋</span>
        <span>Copy</span>
        <span class="context-menu__shortcut">Ctrl+C</span>
      </button>

      <button
        v-if="hasSelection"
        class="context-menu__item"
        :disabled="!canCut"
        @click="handleCut"
      >
        <span class="context-menu__icon">✂</span>
        <span>Cut</span>
        <span class="context-menu__shortcut">Ctrl+X</span>
      </button>

      <button
        class="context-menu__item"
        :disabled="!canPaste"
        @click="handlePaste"
      >
        <span class="context-menu__icon">📄</span>
        <span>Paste</span>
        <span class="context-menu__shortcut">Ctrl+V</span>
      </button>

      <button
        class="context-menu__item"
        :disabled="!canPaste"
        @click="handlePasteAsText"
      >
        <span class="context-menu__icon">📃</span>
        <span>Paste as Plain Text</span>
        <span class="context-menu__shortcut">Ctrl+Shift+V</span>
      </button>
    </div>

    <div v-if="hasSelection" class="context-menu__section">
      <button
        class="context-menu__item"
        @click="handleSelectAll"
      >
        <span class="context-menu__icon">📝</span>
        <span>Select All</span>
        <span class="context-menu__shortcut">Ctrl+A</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import type { EditorInstance } from '@/types'

interface ContextMenuProps {
  editor: EditorInstance | null
  isVisible: boolean
  position: { x: number; y: number }
}

// Props
const props = defineProps<ContextMenuProps>()

// Emits
const emit = defineEmits<{
  'close': []
}>()

// State
const menuRef = ref<HTMLElement>()

// Computed
const hasSelection = computed(() => {
  if (!props.editor) return false
  const { selection } = props.editor.state
  return !selection.empty
})

const canCopy = computed(() => {
  return hasSelection.value && props.editor?.isEditable()
})

const canCut = computed(() => {
  return hasSelection.value && props.editor?.isEditable()
})

const canPaste = computed(() => {
  return props.editor?.isEditable() ?? false
})

const menuStyle = computed(() => ({
  position: 'fixed' as const,
  left: `${props.position.x}px`,
  top: `${props.position.y}px`,
  zIndex: 1000
}))

// Methods
const handleCopy = () => {
  if (!props.editor || !canCopy.value) return

  try {
    props.editor.commands.copy()
    emit('close')
  } catch (error) {
    console.warn('Copy failed:', error)
  }
}

const handleCut = () => {
  if (!props.editor || !canCut.value) return

  try {
    props.editor.commands.cut()
    emit('close')
  } catch (error) {
    console.warn('Cut failed:', error)
  }
}

const handlePaste = async () => {
  if (!props.editor || !canPaste.value) return

  try {
    props.editor.commands.paste()
    emit('close')
  } catch (error) {
    console.warn('Paste failed:', error)
  }
}

const handlePasteAsText = async () => {
  if (!props.editor || !canPaste.value) return

  try {
    props.editor.commands.pasteAsPlainText()
    emit('close')
  } catch (error) {
    console.warn('Paste as text failed:', error)
  }
}

const handleSelectAll = () => {
  if (!props.editor) return

  try {
    props.editor.commands.selectAll()
    emit('close')
  } catch (error) {
    console.warn('Select all failed:', error)
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    emit('close')
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

// Position adjustment to keep menu in viewport
const adjustPosition = async () => {
  if (!menuRef.value) return

  await nextTick()

  const menu = menuRef.value
  const rect = menu.getBoundingClientRect()
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  }

  let { x, y } = props.position

  // Adjust horizontal position
  if (x + rect.width > viewport.width) {
    x = viewport.width - rect.width - 10
  }

  // Adjust vertical position
  if (y + rect.height > viewport.height) {
    y = viewport.height - rect.height - 10
  }

  // Ensure minimum distance from edges
  x = Math.max(10, x)
  y = Math.max(10, y)

  menu.style.left = `${x}px`
  menu.style.top = `${y}px`
}

// Lifecycle
onMounted(() => {
  if (props.isVisible) {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    adjustPosition()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})

// Watch for visibility changes
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    adjustPosition()
  } else {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleKeyDown)
  }
})

// Watch for position changes
watch(() => props.position, () => {
  if (props.isVisible) {
    adjustPosition()
  }
}, { deep: true })
</script>

<style scoped>
.context-menu {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 220px;
  user-select: none;
  font-size: 14px;
}

.context-menu__section {
  padding: 4px 0;
}

.context-menu__section:not(:last-child) {
  border-bottom: 1px solid #f1f3f4;
}

.context-menu__item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  color: #202124;
  font-size: 14px;
  text-align: left;
  transition: background-color 0.15s ease;
}

.context-menu__item:hover:not(:disabled) {
  background-color: #f8f9fa;
}

.context-menu__item:disabled {
  color: #9aa0a6;
  cursor: not-allowed;
}

.context-menu__icon {
  margin-right: 12px;
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.context-menu__shortcut {
  margin-left: auto;
  color: #5f6368;
  font-size: 12px;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .context-menu {
    background: #2d2d2d;
    border-color: #404040;
    color: #e8eaed;
  }

  .context-menu__section:not(:last-child) {
    border-bottom-color: #404040;
  }

  .context-menu__item {
    color: #e8eaed;
  }

  .context-menu__item:hover:not(:disabled) {
    background-color: #404040;
  }

  .context-menu__item:disabled {
    color: #9aa0a6;
  }

  .context-menu__shortcut {
    color: #9aa0a6;
  }
}
</style>