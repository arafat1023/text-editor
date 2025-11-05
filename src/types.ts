import type { EditorState, Transaction } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'
import type { Schema, Node as PMNode } from 'prosemirror-model'
import type { Ref, ComputedRef } from 'vue'

// Core Editor Types
export interface EditorOptions {
  content?: string
  editable?: boolean
  placeholder?: string
  autofocus?: boolean
  extensions?: Extension[]
  onUpdate?: (props: { editor: EditorInstance; transaction: Transaction }) => void
  onSelectionUpdate?: (props: { editor: EditorInstance }) => void
  onFocus?: (props: { editor: EditorInstance; event: FocusEvent }) => void
  onBlur?: (props: { editor: EditorInstance; event: FocusEvent }) => void
  onCreate?: (props: { editor: EditorInstance }) => void
  onDestroy?: () => void
}

export interface EditorInstance {
  view: EditorView
  state: EditorState
  schema: Schema
  extensions: Extension[]
  element: HTMLElement
  options: EditorOptions
  commands: SingleCommands

  // Content methods
  getHTML(): string
  getJSON(): Record<string, any>
  getText(): string
  setContent(content: string, emitUpdate?: boolean): void

  // Selection methods
  getSelection(): EditorSelection
  setSelection(position: number | EditorSelection): void

  // Command methods
  can(): ChainedCommands
  chain(): ChainedCommands

  // State methods
  isActive(name: string, attributes?: Record<string, any>): boolean
  isEditable(): boolean
  isEmpty(): boolean

  // Focus methods
  focus(position?: number | 'start' | 'end'): void
  blur(): void
  isFocused(): boolean

  // Lifecycle
  destroy(): void
  mount(element: HTMLElement): void

  // DOM
  get dom(): HTMLElement
}

export interface EditorSelection {
  from: number
  to: number
  anchor: number
  head: number
  empty: boolean
}

// Extension System Types
export interface Extension {
  name?: string
  type?: 'mark' | 'node' | 'plugin' | 'extension'
  priority?: number

  addCommands?(): Record<string, (args?: any) => Command>
  addKeyboardShortcuts?(): Record<string, () => boolean>
  addNodeView?(): any
  addOptions?(): Record<string, any>
  addProseMirrorPlugins?(): any[]

  onCreate?(editor: EditorInstance): void
  onDestroy?(): void
}

// Command System Types
export type Command = (props: CommandProps) => boolean

export interface CommandProps {
  editor: EditorInstance
  commands: SingleCommands
  tr: Transaction
  dispatch?: (tr: Transaction) => void
  state?: EditorState
  view?: EditorView
}

export interface SingleCommands {
  // Text formatting
  bold: () => boolean
  italic: () => boolean
  underline: () => boolean
  strike: () => boolean
  code: () => boolean
  superscript: () => boolean
  subscript: () => boolean

  // Color formatting
  textColor: (color: string | null) => boolean
  backgroundColor: (color: string | null) => boolean

  // Font formatting
  fontFamily: (family: string | null) => boolean
  fontSize: (size: string | null) => boolean

  // Block formatting
  paragraph: () => boolean
  heading: (level?: 1 | 2 | 3 | 4 | 5 | 6) => boolean
  blockquote: () => boolean
  codeBlock: () => boolean

  // Lists
  bulletList: () => boolean
  orderedList: () => boolean
  listItem: () => boolean
  liftListItem: () => boolean
  sinkListItem: () => boolean

  // History
  undo: () => boolean
  redo: () => boolean

  // Selection
  selectAll: () => boolean

  // Content
  clearContent: () => boolean
  insertContent: (content: string) => boolean

  // Focus
  focus: (position?: number | 'start' | 'end') => boolean
  blur: () => boolean

  // Utility
  deleteSelection: () => boolean
  enter: () => boolean
  hardBreak: () => boolean

  // Link commands
  link: (href: string, title?: string, target?: string) => boolean
  unsetLink: () => boolean
  isLinkActive: () => boolean

  // Image commands
  insertImage: (src: string, alt?: string, title?: string, width?: number, height?: number, alignment?: string) => boolean
  updateImage: (oldSrc: string, newSrc: string, alt?: string, title?: string, width?: number, height?: number, alignment?: string) => boolean
  removeImage: (src: string) => boolean
  uploadImage: (file: File) => boolean
  insertImageWithPrompt: () => boolean

  // Table commands
  insertTable: (rows?: number, cols?: number, withHeaderRow?: boolean) => boolean
  addColumnBefore: () => boolean
  addColumnAfter: () => boolean
  deleteColumn: () => boolean
  addRowBefore: () => boolean
  addRowAfter: () => boolean
  deleteRow: () => boolean
  deleteTable: () => boolean
  mergeCells: () => boolean
  splitCell: () => boolean
  toggleHeaderRow: () => boolean
  toggleHeaderColumn: () => boolean

  // Text alignment commands
  alignLeft: () => boolean
  alignCenter: () => boolean
  alignRight: () => boolean
  alignJustify: () => boolean
  clearAlignment: () => boolean

  // Clipboard commands (optional, may not exist on all editors)
  copy?: () => boolean
  cut?: () => boolean
  paste?: () => boolean
  pasteAsPlainText?: () => boolean
}

export interface ChainedCommands {
  [K: string]: (...args: any[]) => ChainedCommands
  run: () => boolean
}

// Toolbar Types
export interface ToolbarItem {
  type: 'button' | 'dropdown' | 'separator' | 'group' | 'color' | 'font' | 'heading' | 'link'
  name?: string
  icon?: string
  title?: string
  command?: string
  isActive?: boolean
  isDisabled?: boolean
  items?: ToolbarItem[]
  action?: () => void
  fontType?: 'family' | 'size'
}

// Plugin Options
export interface PluginOptions {
  [key: string]: any
}

// Composable Return Type
export interface UseTextEditorReturn {
  // Core
  editor: Ref<EditorInstance | null>
  isReady: Ref<boolean>
  isFocused: Ref<boolean>
  isEmpty: ComputedRef<boolean>
  isEditable: ComputedRef<boolean>
  canUndo: ComputedRef<boolean>
  canRedo: ComputedRef<boolean>
  wordCount: ComputedRef<number>
  characterCount: ComputedRef<number>

  // Methods
  mount?: (element: HTMLElement) => void
  createEditor?: () => void
  destroyEditor: () => void
  getHTML: () => string
  getJSON: () => Record<string, any>
  getText: () => string
  setContent: (content: string, emitUpdate?: boolean) => void
  clearContent: () => void
  focus: (position?: number | 'start' | 'end') => void
  blur: () => void

  // Commands
  commands: ComputedRef<SingleCommands | Record<string, never>>
  can: ComputedRef<ChainedCommands | Record<string, never>>
  chain: ComputedRef<ChainedCommands | Record<string, never>>
}

// Event Types
export interface EditorEvent {
  editor: EditorInstance
  event?: Event
  transaction?: Transaction
}

export interface EditorEvents {
  create: EditorEvent
  update: EditorEvent
  selectionUpdate: EditorEvent
  focus: EditorEvent & { event: FocusEvent }
  blur: EditorEvent & { event: FocusEvent }
  destroy: void
}

// Theme Types
export interface EditorTheme {
  colorBackground?: string
  colorText?: string
  colorBorder?: string
  colorSelection?: string
  colorFocus?: string
  colorToolbar?: string
  colorToolbarText?: string
  borderRadius?: string
  fontFamily?: string
  fontSize?: string
  lineHeight?: string
}

// Image Extension Types
export interface ImageAttributes {
  src: string
  alt?: string
  title?: string
  width?: number
  height?: number
  alignment?: 'left' | 'center' | 'right'
}

// Link Extension Types
export interface LinkAttributes {
  href: string
  title?: string
  target?: string
}

// Table Extension Types
export interface TableOptions {
  resizable?: boolean
  handleWidth?: number
  cellMinWidth?: number
  lastColumnResizable?: boolean
}

// Context Menu Types
export interface ContextMenuPosition {
  x: number
  y: number
}

export interface ContextMenuItem {
  label: string
  icon?: string
  command?: string
  action?: () => void
  disabled?: boolean
  separator?: boolean
}

// Color Picker Types
export interface ColorOption {
  value: string
  label?: string
}

// Font Selector Types
export interface FontOption {
  value: string
  label: string
}

// Heading Selector Types
export interface HeadingOption {
  level: number
  label: string
}

// Upload Types
export interface UploadProgress {
  loaded: number
  total: number
  percent: number
}

export interface UploadError {
  message: string
  code?: string
}

// Clipboard Types
export interface ClipboardData {
  html?: string
  text?: string
  files?: File[]
}
