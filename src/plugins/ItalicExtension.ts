import type { Extension } from '@/types'

export const ItalicExtension: Extension = {
  name: 'italic',
  type: 'mark',

  addCommands() {
    return {
      setItalic: () => ({ commands }) => commands.italic(),
      toggleItalic: () => ({ commands }) => commands.italic(),
      unsetItalic: () => ({ commands }) => commands.italic()
    }
  },

  addKeyboardShortcuts() {
    return {
      // Keyboard shortcuts will be handled by the core editor
    }
  }
}