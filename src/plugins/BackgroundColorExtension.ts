import type { Extension } from '@/types'

export const BackgroundColorExtension: Extension = {
  name: 'backgroundColor',
  type: 'mark',

  addCommands() {
    return {
      setBackgroundColor: (color: string) => ({ commands }) => commands.backgroundColor(color),
      unsetBackgroundColor: () => ({ commands }) => commands.backgroundColor(null),
      highlight: (color: string = '#ffff00') => ({ commands }) => commands.backgroundColor(color)
    }
  },

  addKeyboardShortcuts() {
    return {
      // Keyboard shortcuts will be handled by the core editor
    }
  }
}