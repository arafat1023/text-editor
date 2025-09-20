import type { Extension } from '@/types'

export const BlockquoteExtension: Extension = {
  name: 'blockquote',
  type: 'node',

  addCommands() {
    return {
      setBlockquote: () => ({ commands }) => commands.blockquote(),
      toggleBlockquote: () => ({ commands }) => {
        // Toggle between blockquote and paragraph
        return commands.blockquote()
      },
      unsetBlockquote: () => ({ commands }) => commands.paragraph(),
      wrapInBlockquote: () => ({ commands }) => commands.blockquote()
    }
  },

  addKeyboardShortcuts() {
    return {
      // Keyboard shortcuts will be handled by the core editor
    }
  },

  // Define blockquote properties
  addOptions() {
    return {
      HTMLAttributes: {
        class: 'blockquote'
      }
    }
  }
}