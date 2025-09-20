import type { Extension } from '@/types'

export const HeadingExtension: Extension = {
  name: 'heading',
  type: 'node',

  addCommands() {
    return {
      setHeading: (level: number) => ({ commands }) => commands.heading(level),
      toggleHeading: (level: number) => ({ commands }) => {
        // Toggle between heading and paragraph
        return commands.heading(level)
      },
      clearHeading: () => ({ commands }) => commands.paragraph()
    }
  },

  addKeyboardShortcuts() {
    return {
      // Keyboard shortcuts will be handled by the core editor
    }
  },

  // Define heading levels and their properties
  addOptions() {
    return {
      levels: [1, 2, 3, 4, 5, 6],
      defaultLevel: 1
    }
  }
}