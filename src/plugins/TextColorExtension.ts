import type { Extension } from '@/types'

export const TextColorExtension: Extension = {
  name: 'textColor',
  type: 'mark',

  addCommands() {
    return {
      setTextColor: (color: string) => ({ commands }) => commands.textColor(color),
      unsetTextColor: () => ({ commands }) => commands.textColor(null)
    }
  },

  addKeyboardShortcuts() {
    return {
      // No default shortcuts for color
    }
  }
}