import type { Extension } from '@/types'

export const OrderedListExtension: Extension = {
  name: 'orderedList',
  type: 'node',

  addCommands() {
    return {
      setOrderedList: () => ({ commands }) => commands.orderedList(),
      toggleOrderedList: () => ({ commands }) => {
        // Toggle between ordered list and paragraph
        return commands.orderedList()
      },
      unsetOrderedList: () => ({ commands }) => commands.paragraph(),
      wrapInOrderedList: () => ({ commands }) => commands.orderedList()
    }
  },

  addKeyboardShortcuts() {
    return {
      // List keyboard shortcuts are handled in the core editor
    }
  },

  // Define ordered list properties
  addOptions() {
    return {
      HTMLAttributes: {
        class: 'ordered-list'
      },
      keepMarks: false,
      keepAttributes: false
    }
  }
}