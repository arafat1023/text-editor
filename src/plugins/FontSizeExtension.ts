import type { Extension } from '@/types'

export const FontSizeExtension: Extension = {
  name: 'fontSize',
  type: 'mark',

  addCommands() {
    return {
      setFontSize: (size: string) => ({ commands }) => commands.fontSize(size),
      unsetFontSize: () => ({ commands }) => commands.fontSize(null)
    }
  },

  addKeyboardShortcuts() {
    return {
      // No default shortcuts for font size
    }
  }
}