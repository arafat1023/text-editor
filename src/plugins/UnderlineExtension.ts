import type { Extension } from '@/types'

export const UnderlineExtension: Extension = {
  name: 'underline',
  type: 'mark',

  addCommands() {
    return {
      setUnderline: () => ({ commands }) => commands.underline(),
      toggleUnderline: () => ({ commands }) => commands.underline(),
      unsetUnderline: () => ({ commands }) => commands.underline()
    }
  },

  addKeyboardShortcuts() {
    return {
      // Keyboard shortcuts will be handled by the core editor
    }
  }
}