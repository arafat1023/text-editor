<template>
  <div class="text-editor" :class="editorClass">
    <div
      v-if="showToolbar"
      class="text-editor__toolbar"
    >
      <EditorToolbar
        v-if="editor"
        :editor="editor"
        :items="toolbarItems"
      />
    </div>

    <div
      ref="editorRef"
      class="text-editor__content"
      :class="contentClass"
      @contextmenu="handleContextMenu"
    />

    <!-- Context Menu -->
    <ContextMenu
      :editor="editor"
      :is-visible="contextMenu.isVisible"
      :position="contextMenu.position"
      @close="closeContextMenu"
    />

    <div
      v-if="showStatusBar"
      class="text-editor__status"
    >
      <span class="text-editor__word-count">
        Words: {{ wordCount }}
      </span>
      <span class="text-editor__character-count">
        Characters: {{ characterCount }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  onUnmounted,
  watch,
  computed,
  provide
} from 'vue'
import { Editor } from '@/core/Editor'
import { AllExtensions } from '@/plugins'
import EditorToolbar from './EditorToolbar.vue'
import ContextMenu from './ContextMenu.vue'
import type {
  EditorOptions,
  EditorInstance,
  Extension,
  ToolbarItem
} from '@/types'

// Props
const props = withDefaults(defineProps<{
  modelValue?: string
  options?: Partial<EditorOptions>
  extensions?: Extension[]
  editable?: boolean
  placeholder?: string
  showToolbar?: boolean
  showStatusBar?: boolean
  toolbarItems?: ToolbarItem[]
  editorClass?: string
  contentClass?: string
}>(), {
  modelValue: '',
  editable: true,
  showToolbar: true,
  showStatusBar: true,
  toolbarItems: () => [
    // Text formatting group
    {
      type: 'group',
      items: [
        { type: 'button', name: 'bold', icon: 'bold', title: 'Bold (Ctrl+B)', command: 'bold' },
        { type: 'button', name: 'italic', icon: 'italic', title: 'Italic (Ctrl+I)', command: 'italic' },
        { type: 'button', name: 'underline', icon: 'underline', title: 'Underline (Ctrl+U)', command: 'underline' },
        { type: 'button', name: 'strike', icon: 'strike', title: 'Strikethrough', command: 'strike' }
      ]
    },
    { type: 'separator' },
    // Color formatting
    { type: 'color', title: 'Text Color', command: 'textColor' },
    { type: 'color', title: 'Highlight Color', command: 'backgroundColor' },
    { type: 'separator' },
    // Font formatting
    { type: 'font', title: 'Font Family', command: 'fontFamily', fontType: 'family' },
    { type: 'font', title: 'Font Size', command: 'fontSize', fontType: 'size' },
    { type: 'separator' },
    // Script formatting
    {
      type: 'group',
      items: [
        { type: 'button', name: 'superscript', icon: 'superscript', title: 'Superscript', command: 'superscript' },
        { type: 'button', name: 'subscript', icon: 'subscript', title: 'Subscript', command: 'subscript' },
        { type: 'button', name: 'code', icon: 'code', title: 'Inline Code (Ctrl+E)', command: 'code' }
      ]
    },
    { type: 'separator' },
    // Links
    { type: 'link', name: 'link', icon: 'link', title: 'Insert/Edit Link (Ctrl+K)', command: 'toggleLink' },
    { type: 'separator' },
    // Block formatting
    { type: 'heading', title: 'Heading', command: 'setHeading' },
    { type: 'button', name: 'blockquote', icon: 'blockquote', title: 'Blockquote', command: 'toggleBlockquote' },
    { type: 'button', name: 'codeBlock', icon: 'code-block', title: 'Code Block', command: 'toggleCodeBlock' },
    { type: 'button', name: 'horizontalRule', icon: 'hr', title: 'Insert Divider', command: 'insertHorizontalRule' },
    { type: 'separator' },
    // Lists
    { type: 'button', name: 'bulletList', icon: 'list-ul', title: 'Bullet List', command: 'bulletList' },
    { type: 'button', name: 'orderedList', icon: 'list-ol', title: 'Ordered List', command: 'orderedList' },
    { type: 'separator' },
    // History
    { type: 'button', name: 'undo', icon: 'undo', title: 'Undo (Ctrl+Z)', command: 'undo' },
    { type: 'button', name: 'redo', icon: 'redo', title: 'Redo (Ctrl+Y)', command: 'redo' },
    { type: 'separator' },
    // Clipboard
    {
      type: 'group',
      items: [
        { type: 'button', name: 'copy', icon: 'copy', title: 'Copy (Ctrl+C)', command: 'copy' },
        { type: 'button', name: 'cut', icon: 'cut', title: 'Cut (Ctrl+X)', command: 'cut' },
        { type: 'button', name: 'paste', icon: 'paste', title: 'Paste (Ctrl+V)', command: 'paste' },
        { type: 'button', name: 'pasteAsText', icon: 'paste-text', title: 'Paste as Plain Text (Ctrl+Shift+V)', command: 'pasteAsPlainText' }
      ]
    }
  ]
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'create': [props: { editor: EditorInstance }]
  'update': [props: { editor: EditorInstance }]
  'selectionUpdate': [props: { editor: EditorInstance }]
  'focus': [props: { editor: EditorInstance; event: FocusEvent }]
  'blur': [props: { editor: EditorInstance; event: FocusEvent }]
  'destroy': []
}>()

// Reactive state
const editorRef = ref<HTMLElement>()
const editor = ref<EditorInstance | null>(null)
const isReady = ref(false)
const isFocused = ref(false)
const wordCount = ref(0)
const characterCount = ref(0)

// Context menu state
const contextMenu = ref({
  isVisible: false,
  position: { x: 0, y: 0 }
})

// Computed
const allExtensions = computed(() => [
  ...AllExtensions,
  ...(props.extensions || [])
])

// Create editor instance
const createEditor = () => {
  if (!editorRef.value) return

  const editorOptions: EditorOptions = {
    content: props.modelValue,
    editable: props.editable,
    placeholder: props.placeholder,
    extensions: allExtensions.value,

    onCreate: ({ editor }) => {
      isReady.value = true
      updateCounts()
      emit('create', { editor })
    },

    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      emit('update:modelValue', html)
      emit('update', { editor })
      updateCounts()
    },

    onSelectionUpdate: ({ editor }) => {
      emit('selectionUpdate', { editor })
    },

    onFocus: ({ editor, event }) => {
      isFocused.value = true
      emit('focus', { editor, event })
    },

    onBlur: ({ editor, event }) => {
      isFocused.value = false
      emit('blur', { editor, event })
    },

    onDestroy: () => {
      isReady.value = false
      emit('destroy')
    },

    ...props.options
  }

  const editorInstance = new Editor(editorOptions) as EditorInstance
  editorInstance.mount(editorRef.value)
  editor.value = editorInstance
}

// Update word and character counts
const updateCounts = () => {
  if (!editor.value) return

  const text = editor.value.getText()
  characterCount.value = text.length
  wordCount.value = text.trim().split(/\s+/).filter((word: string) => word.length > 0).length
}

// Context menu methods
const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault()

  contextMenu.value = {
    isVisible: true,
    position: {
      x: event.clientX,
      y: event.clientY
    }
  }
}

const closeContextMenu = () => {
  contextMenu.value.isVisible = false
}

// Watch for content changes from parent
watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.getHTML() !== newValue) {
    editor.value.setContent(newValue, false)
  }
})

// Watch for editable changes
watch(() => props.editable, (newValue) => {
  if (editor.value && editor.value.view) {
    // Update editable state - editable is a function in ProseMirror
    const view = editor.value.view
    const currentProps = view.props || {}
    view.setProps({
      ...currentProps,
      editable: () => newValue
    })
  }
})

// Provide editor instance to child components
provide('editor', editor)

// Lifecycle
onMounted(() => {
  createEditor()
})

onUnmounted(() => {
  if (editor.value) {
    editor.value.destroy()
    editor.value = null
  }
})

// Expose editor instance and methods
defineExpose({
  editor,
  isReady,
  isFocused,
  wordCount,
  characterCount,
  focus: () => editor.value?.focus(),
  blur: () => editor.value?.blur(),
  getHTML: () => editor.value?.getHTML() || '',
  getJSON: () => editor.value?.getJSON() || {},
  getText: () => editor.value?.getText() || '',
  setContent: (content: string) => editor.value?.setContent(content),
  clearContent: () => editor.value?.commands.clearContent(),
  isEmpty: () => editor.value?.isEmpty() ?? true
})
</script>

<style scoped>
.text-editor {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.text-editor__toolbar {
  border-bottom: 1px solid #e5e7eb;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 8px 8px 0 0;
}

.text-editor__content {
  min-height: 200px;
  padding: 16px;
  outline: none;
}

.text-editor__content :deep(.ProseMirror) {
  outline: none;
  min-height: 200px;
}

.text-editor__content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}

.text-editor__content :deep(.ProseMirror blockquote) {
  border-left: 4px solid #e5e7eb;
  margin: 1.5em 0;
  padding-left: 1em;
  color: #6b7280;
  font-style: italic;
}

.text-editor__content :deep(.ProseMirror h1) {
  font-size: 2rem;
  font-weight: bold;
  margin: 1em 0 0.5em 0;
  line-height: 1.2;
}

.text-editor__content :deep(.ProseMirror h2) {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.83em 0 0.5em 0;
  line-height: 1.3;
}

.text-editor__content :deep(.ProseMirror h3) {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0.75em 0 0.5em 0;
  line-height: 1.4;
}

.text-editor__content :deep(.ProseMirror h4) {
  font-size: 1.125rem;
  font-weight: bold;
  margin: 0.67em 0 0.5em 0;
  line-height: 1.5;
}

.text-editor__content :deep(.ProseMirror h5) {
  font-size: 1rem;
  font-weight: bold;
  margin: 0.5em 0 0.5em 0;
  line-height: 1.6;
}

.text-editor__content :deep(.ProseMirror h6) {
  font-size: 0.875rem;
  font-weight: bold;
  margin: 0.5em 0 0.5em 0;
  line-height: 1.6;
}

.text-editor__content :deep(.ProseMirror pre) {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
  margin: 1.5rem 0;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.text-editor__content :deep(.ProseMirror pre code) {
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
  color: inherit;
}

.text-editor__content :deep(.ProseMirror hr) {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 2rem 0;
  cursor: pointer;
}

.text-editor__content :deep(.ProseMirror hr:hover) {
  border-top-color: #d1d5db;
}

.text-editor__content :deep(.ProseMirror ul) {
  list-style-type: disc;
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.text-editor__content :deep(.ProseMirror ol) {
  list-style-type: decimal;
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.text-editor__content :deep(.ProseMirror li) {
  margin: 0.25rem 0;
  line-height: 1.6;
}

.text-editor__content :deep(.ProseMirror li p) {
  margin: 0;
}

.text-editor__content :deep(.ProseMirror ul ul),
.text-editor__content :deep(.ProseMirror ol ol),
.text-editor__content :deep(.ProseMirror ul ol),
.text-editor__content :deep(.ProseMirror ol ul) {
  margin: 0.5rem 0;
}

.text-editor__content :deep(.ProseMirror a),
.text-editor__content :deep(.text-editor-link) {
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.15s ease;
}

.text-editor__content :deep(.ProseMirror a:hover),
.text-editor__content :deep(.text-editor-link:hover) {
  color: #1d4ed8;
  text-decoration: underline;
}

.text-editor__content :deep(.ProseMirror a:visited),
.text-editor__content :deep(.text-editor-link:visited) {
  color: #7c3aed;
}

.text-editor__content :deep(.auto-link-detected) {
  background: rgba(59, 130, 246, 0.1);
  border-bottom: 1px dashed #3b82f6;
  border-radius: 3px;
  padding: 1px 2px;
  position: relative;
  cursor: pointer;
}

.text-editor__content :deep(.auto-link-detected:hover) {
  background: rgba(59, 130, 246, 0.15);
  border-bottom-style: solid;
}

.text-editor__content :deep(.image-wrapper) {
  margin: 1.5rem 0;
  text-align: center;
  position: relative;
  display: block;
}

.text-editor__content :deep(.image-wrapper.image-left) {
  text-align: left;
}

.text-editor__content :deep(.image-wrapper.image-right) {
  text-align: right;
}

.text-editor__content :deep(.image-wrapper.image-center) {
  text-align: center;
}

.text-editor__content :deep(.image-wrapper img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
}

.text-editor__content :deep(.image-wrapper img:hover) {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.text-editor__content :deep(.image-wrapper.ProseMirror-selectednode) {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 10px;
}

.text-editor__content :deep(.image-wrapper.ProseMirror-selectednode img) {
  opacity: 0.8;
}

.text-editor__status {
  border-top: 1px solid #e5e7eb;
  padding: 8px 16px;
  background: #f9fafb;
  font-size: 12px;
  color: #6b7280;
  display: flex;
  gap: 16px;
  border-radius: 0 0 8px 8px;
}

.text-editor:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .text-editor {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;
  }

  .text-editor__toolbar,
  .text-editor__status {
    background: #111827;
    border-color: #374151;
  }

  .text-editor__content :deep(.ProseMirror blockquote) {
    border-left-color: #4b5563;
    color: #9ca3af;
  }

  .text-editor__content :deep(.ProseMirror pre) {
    background: #1f2937;
    border-color: #374151;
    color: #e5e7eb;
  }

  .text-editor__content :deep(.ProseMirror hr) {
    border-top-color: #4b5563;
  }

  .text-editor__content :deep(.ProseMirror hr:hover) {
    border-top-color: #6b7280;
  }

  .text-editor__content :deep(.ProseMirror a),
  .text-editor__content :deep(.text-editor-link) {
    color: #60a5fa;
  }

  .text-editor__content :deep(.ProseMirror a:hover),
  .text-editor__content :deep(.text-editor-link:hover) {
    color: #93c5fd;
  }

  .text-editor__content :deep(.ProseMirror a:visited),
  .text-editor__content :deep(.text-editor-link:visited) {
    color: #a78bfa;
  }

  .text-editor__content :deep(.auto-link-detected) {
    background: rgba(96, 165, 250, 0.1);
    border-bottom-color: #60a5fa;
  }

  .text-editor__content :deep(.auto-link-detected:hover) {
    background: rgba(96, 165, 250, 0.15);
  }

  .text-editor__content :deep(.image-wrapper.ProseMirror-selectednode) {
    outline-color: #60a5fa;
  }
}
</style>