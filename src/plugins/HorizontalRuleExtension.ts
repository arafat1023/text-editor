import type { Extension } from '@/types'

export const HorizontalRuleExtension: Extension = {
  name: 'horizontalRule',
  type: 'node',

  addCommands() {
    return {
      setHorizontalRule: () => ({ commands }) => commands.horizontalRule(),
      insertHorizontalRule: () => ({ commands }) => commands.horizontalRule(),
      addDivider: () => ({ commands }) => commands.horizontalRule(),
      insertDivider: () => ({ commands }) => commands.horizontalRule()
    }
  },

  addKeyboardShortcuts() {
    return {
      // Keyboard shortcuts will be handled by the core editor
    }
  },

  // Define horizontal rule properties
  addOptions() {
    return {
      HTMLAttributes: {
        class: 'horizontal-rule'
      }
    }
  }
}