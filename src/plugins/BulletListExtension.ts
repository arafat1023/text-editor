import type { Extension } from '@/types'

export const BulletListExtension: Extension = {
  name: 'bulletList',
  type: 'node',

  addCommands() {
    return {
      setBulletList: () => ({ commands }) => commands.bulletList(),
      toggleBulletList: () => ({ commands }) => {
        // Toggle between bullet list and paragraph
        return commands.bulletList()
      },
      unsetBulletList: () => ({ commands }) => commands.paragraph(),
      wrapInBulletList: () => ({ commands }) => commands.bulletList()
    }
  },

  addKeyboardShortcuts() {
    return {
      // Keyboard shortcuts will be handled by the core editor
    }
  },

  // Define bullet list properties
  addOptions() {
    return {
      HTMLAttributes: {
        class: 'bullet-list'
      },
      keepMarks: false,
      keepAttributes: false
    }
  }
}