import type { Extension } from '@/types'

export const SuperscriptExtension: Extension = {
  name: 'superscript',
  type: 'mark',

  addCommands() {
    return {
      setSuperscript: () => ({ commands }) => commands.superscript(),
      toggleSuperscript: () => ({ commands }) => commands.superscript(),
      unsetSuperscript: () => ({ commands }) => commands.superscript()
    }
  },

  addKeyboardShortcuts() {
    return {
      // Keyboard shortcuts will be handled by the core editor
    }
  }
}