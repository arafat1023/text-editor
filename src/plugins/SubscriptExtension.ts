import type { Extension } from '@/types'

export const SubscriptExtension: Extension = {
  name: 'subscript',
  type: 'mark',

  addCommands() {
    return {
      setSubscript: () => ({ commands }) => commands.subscript(),
      toggleSubscript: () => ({ commands }) => commands.subscript(),
      unsetSubscript: () => ({ commands }) => commands.subscript()
    }
  },

  addKeyboardShortcuts() {
    return {
      // Keyboard shortcuts will be handled by the core editor
    }
  }
}