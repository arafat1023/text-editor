// Main component
export { default as TextEditor } from '@/components/TextEditor.vue'
export { default as EditorToolbar } from '@/components/EditorToolbar.vue'
export { default as ColorPicker } from '@/components/ColorPicker.vue'
export { default as FontSelector } from '@/components/FontSelector.vue'

// Core classes
export { Editor } from '@/core/Editor'

// Composables
export { useTextEditor } from '@/composables/useTextEditor'

// Extensions
export {
  BoldExtension,
  ItalicExtension,
  UnderlineExtension,
  StrikethroughExtension,
  CodeExtension,
  SuperscriptExtension,
  SubscriptExtension,
  TextColorExtension,
  BackgroundColorExtension,
  FontFamilyExtension,
  FontSizeExtension,
  BasicExtensions,
  FormattingExtensions
} from '@/plugins'

// Types
export type {
  EditorOptions,
  EditorInstance,
  EditorSelection,
  Extension,
  Command,
  CommandProps,
  ChainedCommands,
  SingleCommands,
  ToolbarItem,
  PluginOptions,
  UseTextEditorReturn,
  EditorEvent,
  EditorEvents,
  EditorTheme
} from '@/types'

// Default export for convenience
import TextEditor from '@/components/TextEditor.vue'
export default TextEditor
