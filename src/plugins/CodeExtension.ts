import type { Extension } from '@/types'

export const CodeExtension: Extension = {
  name: 'code',
  type: 'mark',

  addCommands() {
    return {
      setCode: () => ({ commands }) => commands.code(),
      toggleCode: () => ({ commands }) => commands.code(),
      unsetCode: () => ({ commands }) => commands.code()
    }
  },

  addKeyboardShortcuts() {
    return {
      // Keyboard shortcuts will be handled by the core editor
    }
  }
}