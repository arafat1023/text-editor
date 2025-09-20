import type { Extension } from '@/types'

export const StrikethroughExtension: Extension = {
  name: 'strikethrough',
  type: 'mark',

  addCommands() {
    return {
      setStrikethrough: () => ({ commands }) => commands.strike(),
      toggleStrikethrough: () => ({ commands }) => commands.strike(),
      unsetStrikethrough: () => ({ commands }) => commands.strike()
    }
  },

  addKeyboardShortcuts() {
    return {
      // Keyboard shortcuts will be handled by the core editor
    }
  }
}