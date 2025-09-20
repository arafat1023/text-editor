# Vue Text Editor

A feature-rich WYSIWYG text editor for Vue 3 with TypeScript support, similar to TinyMCE. Built on top of ProseMirror for a solid foundation and excellent performance.

## ✨ Features

### 🎯 **Core Features**
- **Vue 3 + TypeScript** - Full type safety and modern Vue features
- **ProseMirror Foundation** - Built on the most robust rich text editing foundation
- **Extensible Architecture** - Plugin system for unlimited customization
- **Responsive Design** - Works perfectly on desktop and mobile
- **Performance Optimized** - Fast rendering with tree-shaking support
- **PNPM Ready** - Optimized for modern package managers

### ✏️ **Rich Text Formatting**
- **Basic Formatting** - Bold, italic, underline, strikethrough
- **Advanced Typography** - Superscript, subscript, inline code
- **Text Colors** - Full color picker for text and background colors
- **Font Controls** - Font family and size selection
- **Text Alignment** - Left, center, right, justify alignment
- **Headers** - H1-H6 heading levels

### 📋 **Content Structure**
- **Lists** - Bullet lists, numbered lists, nested lists
- **Block Elements** - Paragraphs, blockquotes, code blocks
- **Tables** - Full table editing with insert/delete rows/columns
- **Media** - Image insertion and management
- **Links** - Link creation and editing
- **Special Content** - Horizontal rules, special characters

### 🎨 **UI/UX Features**
- **Comprehensive Toolbar** - All formatting options readily available
- **Color Pickers** - Intuitive color selection for text and backgrounds
- **Font Selectors** - Easy font family and size selection
- **Keyboard Shortcuts** - Full keyboard navigation support
- **Context Menus** - Right-click context-sensitive options
- **Dark Mode** - Automatic dark mode support

### 🔧 **Developer Experience**
- **Component API** - Easy-to-use Vue component
- **Composable API** - Flexible composable for advanced usage
- **TypeScript First** - Complete type definitions
- **Extension System** - Create custom extensions easily
- **Event System** - Comprehensive event handling
- **Testing Ready** - Built with testing in mind

## 📦 Installation

```bash
# Using pnpm (recommended)
pnpm add @text-editor/vue

# Using npm
npm install @text-editor/vue

# Using yarn
yarn add @text-editor/vue
```

## 🚀 Quick Start

### Basic Usage with Component

```vue
<template>
  <TextEditor
    v-model="content"
    :options="editorOptions"
    @create="onEditorCreate"
    @update="onEditorUpdate"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TextEditor } from '@text-editor/vue'

const content = ref('<p>Hello world!</p>')

const editorOptions = {
  placeholder: 'Start typing...',
  editable: true,
  showToolbar: true,
  showStatusBar: true
}

const onEditorCreate = ({ editor }) => {
  console.log('Editor ready!', editor)
}

const onEditorUpdate = ({ editor }) => {
  console.log('Content updated:', editor.getHTML())
}
</script>
```

### Using the Composable

```vue
<template>
  <div ref="editorRef" class="editor-container"></div>

  <div class="toolbar">
    <button @click="commands.bold()" :class="{ active: isReady && editor?.isActive('bold') }">
      Bold
    </button>
    <button @click="commands.italic()" :class="{ active: isReady && editor?.isActive('italic') }">
      Italic
    </button>
    <button @click="commands.undo()" :disabled="!canUndo">Undo</button>
    <button @click="commands.redo()" :disabled="!canRedo">Redo</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTextEditor, BoldExtension, ItalicExtension } from '@text-editor/vue'

const editorRef = ref<HTMLElement>()

const {
  editor,
  isReady,
  canUndo,
  canRedo,
  commands,
  mount
} = useTextEditor({
  content: '<p>Hello from composable!</p>',
  extensions: [BoldExtension, ItalicExtension]
})

onMounted(() => {
  if (editorRef.value) {
    mount(editorRef.value)
  }
})
</script>
```

## 📚 API Reference

### TextEditor Component

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `''` | Editor content (HTML) |
| `options` | `EditorOptions` | `{}` | Editor configuration |
| `extensions` | `Extension[]` | `[]` | Additional extensions |
| `editable` | `boolean` | `true` | Whether editor is editable |
| `placeholder` | `string` | `undefined` | Placeholder text |
| `showToolbar` | `boolean` | `true` | Show/hide toolbar |
| `showStatusBar` | `boolean` | `true` | Show/hide status bar |
| `toolbarItems` | `ToolbarItem[]` | Default items | Toolbar configuration |
| `editorClass` | `string` | `undefined` | Additional CSS class |
| `contentClass` | `string` | `undefined` | Content area CSS class |

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Content changed |
| `create` | `{ editor: EditorInstance }` | Editor created |
| `update` | `{ editor: EditorInstance }` | Content updated |
| `selectionUpdate` | `{ editor: EditorInstance }` | Selection changed |
| `focus` | `{ editor: EditorInstance, event: FocusEvent }` | Editor focused |
| `blur` | `{ editor: EditorInstance, event: FocusEvent }` | Editor blurred |
| `destroy` | `void` | Editor destroyed |

#### Exposed Methods

```typescript
// Get content
const html = editorRef.value.getHTML()
const json = editorRef.value.getJSON()
const text = editorRef.value.getText()

// Set content
editorRef.value.setContent('<p>New content</p>')
editorRef.value.clearContent()

// Focus/blur
editorRef.value.focus()
editorRef.value.blur()

// State
const isEmpty = editorRef.value.isEmpty()
```

### useTextEditor Composable

```typescript
const {
  // Core
  editor,           // EditorInstance | null
  isReady,          // boolean
  isFocused,        // boolean
  isEmpty,          // boolean
  isEditable,       // boolean
  canUndo,          // boolean
  canRedo,          // boolean
  wordCount,        // number
  characterCount,   // number

  // Methods
  mount,            // (element: HTMLElement) => void
  createEditor,     // () => void
  destroyEditor,    // () => void
  getHTML,          // () => string
  getJSON,          // () => object
  getText,          // () => string
  setContent,       // (content: string) => void
  clearContent,     // () => void
  focus,            // () => void
  blur,             // () => void

  // Commands
  commands,         // SingleCommands
  can,              // ChainedCommands (for checking)
  chain             // ChainedCommands (for chaining)
} = useTextEditor(options)
```

## 🔧 Configuration

### Editor Options

```typescript
interface EditorOptions {
  content?: string                    // Initial content
  editable?: boolean                  // Editable state
  placeholder?: string               // Placeholder text
  autofocus?: boolean                // Auto focus on mount
  extensions?: Extension[]           // Extensions to use
  onUpdate?: (props) => void         // Update callback
  onSelectionUpdate?: (props) => void // Selection callback
  onFocus?: (props) => void          // Focus callback
  onBlur?: (props) => void           // Blur callback
  onCreate?: (props) => void         // Create callback
  onDestroy?: () => void             // Destroy callback
}
```

### Toolbar Configuration

```typescript
interface ToolbarItem {
  type: 'button' | 'dropdown' | 'separator' | 'group'
  name?: string                      // Item identifier
  icon?: string                      // Icon name
  title?: string                     // Tooltip
  command?: string                   // Command to execute
  isActive?: boolean                 // Active state
  isDisabled?: boolean               // Disabled state
  items?: ToolbarItem[]              // Child items (for groups/dropdowns)
  action?: () => void                // Custom action
}
```

## 🔌 Extensions

### Built-in Extensions

```typescript
import {
  BoldExtension,
  ItalicExtension,
  BasicExtensions  // Includes Bold + Italic
} from '@text-editor/vue'
```

### Creating Custom Extensions

```typescript
import type { Extension } from '@text-editor/vue'

const MyExtension: Extension = {
  name: 'myExtension',
  type: 'mark',

  addCommands() {
    return {
      setMyMark: () => ({ commands }) => commands.toggleMark('my-mark'),
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-m': () => this.editor.commands.setMyMark(),
    }
  },

  onCreate({ editor }) {
    console.log('Extension created')
  }
}
```

## 🎨 Styling

### Default Styles

Import the default styles in your main CSS file:

```css
@import '@text-editor/vue/style.css';
```

### Custom Themes

```css
.text-editor {
  --te-color-background: #ffffff;
  --te-color-text: #1f2937;
  --te-color-border: #e5e7eb;
  --te-color-selection: #dbeafe;
  --te-color-focus: #3b82f6;
  --te-color-toolbar: #f9fafb;
  --te-color-toolbar-text: #374151;
  --te-border-radius: 8px;
  --te-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --te-font-size: 16px;
  --te-line-height: 1.6;
}

/* Dark theme */
.text-editor[data-theme="dark"] {
  --te-color-background: #1f2937;
  --te-color-text: #f9fafb;
  --te-color-border: #374151;
  --te-color-toolbar: #111827;
  --te-color-toolbar-text: #d1d5db;
}
```

## 📱 Browser Support

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

Built on top of:
- [ProseMirror](https://prosemirror.net/) - The robust editor foundation
- [Vue 3](https://vuejs.org/) - The progressive JavaScript framework
- [TypeScript](https://www.typescriptlang.org/) - For type safety

## 📈 Roadmap

- [ ] Table editing support
- [ ] Image upload and resizing
- [ ] Collaborative editing
- [ ] More built-in extensions
- [ ] Plugin marketplace
- [ ] Mobile optimization
- [ ] Accessibility improvements

---

Made with ❤️ for the Vue community