import type { Extension } from '@/types'

export const FontFamilyExtension: Extension = {
  name: 'fontFamily',
  type: 'mark',

  addCommands() {
    return {
      setFontFamily: (family: string) => ({ commands }) => commands.fontFamily(family),
      unsetFontFamily: () => ({ commands }) => commands.fontFamily(null)
    }
  },

  addKeyboardShortcuts() {
    return {
      // No default shortcuts for font family
    }
  }
}