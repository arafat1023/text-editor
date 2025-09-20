import type { Extension } from '@/types'

export const BoldExtension: Extension = {
  name: 'bold',
  type: 'mark',

  addCommands() {
    return {
      setBold: () => ({ commands }) => commands.bold(),
      toggleBold: () => ({ commands }) => commands.bold(),
      unsetBold: () => ({ commands }) => commands.bold()
    }
  },

  addKeyboardShortcuts() {
    return {
      // Keyboard shortcuts will be handled by the core editor
    }
  }
}