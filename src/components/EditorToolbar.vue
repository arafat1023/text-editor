<template>
  <div class="editor-toolbar">
    <template v-for="(item, _index) in items" :key="_index">
      <div v-if="item.type === 'separator'" class="editor-toolbar__separator" />

      <div
        v-else-if="item.type === 'group'"
        class="editor-toolbar__group"
      >
        <EditorToolbar
          v-if="item.items"
          :editor="editor"
          :items="item.items"
        />
      </div>

      <ColorPicker
        v-else-if="item.type === 'color'"
        :title="item.title"
        :model-value="getCurrentColor(item)"
        @change="(color) => setColor(item, color)"
      />

      <FontSelector
        v-else-if="item.type === 'font'"
        :type="item.fontType || 'family'"
        :model-value="getCurrentFont(item)"
        @change="(font) => setFont(item, font)"
      />

      <HeadingSelector
        v-else-if="item.type === 'heading'"
        :model-value="getCurrentHeading(item)"
        @change="(level) => setHeading(item, level)"
      />

      <button
        v-else-if="item.type === 'link'"
        :class="[
          'editor-toolbar__button',
          {
            'editor-toolbar__button--active': isActive(item),
            'editor-toolbar__button--disabled': isDisabled(item)
          }
        ]"
        :title="item.title"
        :disabled="isDisabled(item)"
        @click="handleLinkClick(item)"
      >
        <span v-if="item.icon" class="editor-toolbar__icon">
          {{ getIconSymbol(item.icon) }}
        </span>
        <span v-else-if="item.name">{{ item.name }}</span>
      </button>

      <button
        v-else-if="item.type === 'button'"
        :class="[
          'editor-toolbar__button',
          {
            'editor-toolbar__button--active': isActive(item),
            'editor-toolbar__button--disabled': isDisabled(item)
          }
        ]"
        :title="item.title"
        :disabled="isDisabled(item)"
        @click="executeCommand(item)"
      >
        <span v-if="item.icon" class="editor-toolbar__icon">
          {{ getIconSymbol(item.icon) }}
        </span>
        <span v-else-if="item.name">{{ item.name }}</span>
      </button>
    </template>

    <!-- Link Dialog -->
    <LinkDialog
      :is-open="linkDialog.isOpen"
      :link-data="linkDialog.linkData"
      :selected-text="linkDialog.selectedText"
      @close="closeLinkDialog"
      @insert="handleLinkInsert"
      @update="handleLinkUpdate"
      @remove="handleLinkRemove"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { EditorInstance, ToolbarItem } from '@/types'
import ColorPicker from './ColorPicker.vue'
import FontSelector from './FontSelector.vue'
import HeadingSelector from './HeadingSelector.vue'
import LinkDialog from './LinkDialog.vue'

// Props
const props = defineProps<{
  editor: EditorInstance
  items: ToolbarItem[]
}>()

// Link dialog state
const linkDialog = ref({
  isOpen: false,
  linkData: null as any,
  selectedText: ''
})

// Check if a toolbar item is active
const isActive = (item: ToolbarItem): boolean => {
  if (item.isActive !== undefined) return item.isActive

  if (!item.command) return false

  // Basic active state detection
  switch (item.command) {
    case 'bold':
      return props.editor.isActive('strong')
    case 'italic':
      return props.editor.isActive('em')
    case 'heading':
      return props.editor.isActive('heading')
    case 'bulletList':
      return props.editor.isActive('bulletList')
    case 'orderedList':
      return props.editor.isActive('orderedList')
    case 'link':
      return props.editor.isActive('link')
    default:
      return false
  }
}

// Check if a toolbar item is disabled
const isDisabled = (item: ToolbarItem): boolean => {
  if (item.isDisabled !== undefined) return item.isDisabled
  return !props.editor.isEditable()
}

// Execute command
const executeCommand = (item: ToolbarItem) => {
  if (isDisabled(item)) return

  if (item.action) {
    item.action()
    return
  }

  if (!item.command) return

  const commands = props.editor.commands as any

  if (typeof commands[item.command] === 'function') {
    commands[item.command]()
  }
}

// Get current color value
const getCurrentColor = (item: ToolbarItem): string | undefined => {
  if (item.command === 'textColor') {
    // Get current text color from editor state
    const mark = props.editor.state.selection.$from.marks().find((m: any) => m.type.name === 'textColor')
    return mark?.attrs.color || undefined
  }
  if (item.command === 'backgroundColor') {
    // Get current background color from editor state
    const mark = props.editor.state.selection.$from.marks().find((m: any) => m.type.name === 'backgroundColor')
    return mark?.attrs.color || undefined
  }
  return undefined
}

// Get current font value
const getCurrentFont = (item: ToolbarItem): string | undefined => {
  if (item.command === 'fontFamily') {
    const mark = props.editor.state.selection.$from.marks().find((m: any) => m.type.name === 'fontFamily')
    return mark?.attrs.family || undefined
  }
  if (item.command === 'fontSize') {
    const mark = props.editor.state.selection.$from.marks().find((m: any) => m.type.name === 'fontSize')
    return mark?.attrs.size || undefined
  }
  return undefined
}

// Set color
const setColor = (item: ToolbarItem, color: string | null) => {
  const commands = props.editor.commands as any
  if (item.command && typeof commands[item.command] === 'function') {
    commands[item.command](color)
  }
}

// Set font
const setFont = (item: ToolbarItem, font: string | null) => {
  const commands = props.editor.commands as any
  if (item.command && typeof commands[item.command] === 'function') {
    commands[item.command](font)
  }
}

// Get current heading level
const getCurrentHeading = (_item: ToolbarItem): number | null => {
  const state = props.editor.state
  const { selection } = state
  const { $from } = selection

  // Check if current node or parent is a heading
  let node = $from.node()
  if (node.type.name === 'heading') {
    return node.attrs.level || null
  }

  // Check parent node
  const parent = $from.parent
  if (parent && parent.type.name === 'heading') {
    return parent.attrs.level || null
  }

  return null
}

// Set heading level
const setHeading = (_item: ToolbarItem, level: number | null) => {
  const commands = props.editor.commands as any

  if (level === null) {
    // Convert to paragraph
    if (typeof commands.clearHeading === 'function') {
      commands.clearHeading()
    } else if (typeof commands.paragraph === 'function') {
      commands.paragraph()
    }
  } else {
    // Set heading level
    if (typeof commands.setHeading === 'function') {
      commands.setHeading(level)
    } else if (typeof commands.heading === 'function') {
      commands.heading(level)
    }
  }
}

// Link dialog handlers
const handleLinkClick = (item: ToolbarItem) => {
  if (isDisabled(item)) return

  const { selection } = props.editor.state
  const selectedText = props.editor.state.doc.textBetween(selection.from, selection.to)

  // Check if we're editing an existing link
  if (props.editor.isActive('link')) {
    // Get current link attributes
    const mark = selection.$from.marks().find((m: any) => m.type.name === 'link')
    linkDialog.value = {
      isOpen: true,
      linkData: mark ? mark.attrs : null,
      selectedText: selectedText
    }
  } else {
    // New link
    linkDialog.value = {
      isOpen: true,
      linkData: null,
      selectedText: selectedText
    }
  }
}

const closeLinkDialog = () => {
  linkDialog.value.isOpen = false
}

const handleLinkInsert = (data: { url: string; text?: string; title?: string; target?: string }) => {
  const commands = props.editor.commands as any

  if (data.text && !props.editor.state.selection.empty) {
    // Replace selection with link text and apply link
    const { tr } = props.editor.state
    const linkMark = props.editor.schema.marks.link

    tr.replaceSelectionWith(props.editor.schema.text(data.text, [
      linkMark.create({
        href: data.url,
        title: data.title,
        target: data.target
      })
    ]))
    props.editor.view.dispatch(tr)
  } else {
    // Use existing commands
    commands.link(data.url, data.title, data.target)
  }

  props.editor.focus()
}

const handleLinkUpdate = (data: { url: string; text?: string; title?: string; target?: string }) => {
  const commands = props.editor.commands as any

  // Remove current link and add new one
  commands.unsetLink()

  if (data.text) {
    // Replace text and apply link
    const { tr, selection } = props.editor.state
    const linkMark = props.editor.schema.marks.link

    tr.replaceWith(selection.from, selection.to, props.editor.schema.text(data.text, [
      linkMark.create({
        href: data.url,
        title: data.title,
        target: data.target
      })
    ]))
    props.editor.view.dispatch(tr)
  } else {
    commands.link(data.url, data.title, data.target)
  }

  props.editor.focus()
}

const handleLinkRemove = () => {
  const commands = props.editor.commands as any
  commands.unsetLink()
  props.editor.focus()
}

// Get icon symbol (simplified icon system)
const getIconSymbol = (icon: string): string => {
  const icons: Record<string, string> = {
    bold: 'B',
    italic: 'I',
    underline: 'U',
    strike: 'S',
    code: '<>',
    superscript: 'x²',
    subscript: 'x₂',
    h1: 'H₁',
    h2: 'H₂',
    h3: 'H₃',
    paragraph: '¶',
    'list-ul': '•',
    'list-ol': '1.',
    blockquote: '"',
    'code-block': '{ }',
    hr: '—',
    link: '🔗',
    undo: '↶',
    redo: '↷',
    copy: '📋',
    cut: '✂',
    paste: '📄',
    'paste-text': '📃'
  }

  return icons[icon] || icon.charAt(0).toUpperCase()
}
</script>

<style scoped>
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.editor-toolbar__button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 4px 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: #374151;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s ease;
}

.editor-toolbar__button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.editor-toolbar__button--active {
  background: #dbeafe;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.editor-toolbar__button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.editor-toolbar__icon {
  font-weight: bold;
  font-size: 16px;
  line-height: 1;
}

.editor-toolbar__separator {
  width: 1px;
  height: 24px;
  background: #d1d5db;
  margin: 0 4px;
}

.editor-toolbar__group {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 4px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .editor-toolbar__button {
    color: #d1d5db;
  }

  .editor-toolbar__button:hover:not(:disabled) {
    background: #374151;
    border-color: #4b5563;
  }

  .editor-toolbar__button--active {
    background: #1e40af;
    color: #dbeafe;
    border-color: #3b82f6;
  }

  .editor-toolbar__separator {
    background: #4b5563;
  }

  .editor-toolbar__group {
    border-color: #4b5563;
  }
}
</style>