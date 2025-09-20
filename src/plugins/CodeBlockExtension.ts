import type { Extension } from '@/types'

export const CodeBlockExtension: Extension = {
  name: 'codeBlock',
  type: 'node',

  addCommands() {
    return {
      setCodeBlock: (language?: string) => ({ commands }) => commands.codeBlock(language),
      toggleCodeBlock: (language?: string) => ({ commands }) => {
        // Toggle between code block and paragraph
        return commands.codeBlock(language)
      },
      unsetCodeBlock: () => ({ commands }) => commands.paragraph(),
      insertCodeBlock: (language?: string, content?: string) => ({ commands }) => {
        return commands.codeBlock(language, content)
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      // Keyboard shortcuts will be handled by the core editor
    }
  },

  // Define code block properties and language options
  addOptions() {
    return {
      languages: [
        'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
        'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala',
        'html', 'css', 'scss', 'sass', 'less',
        'json', 'xml', 'yaml', 'markdown',
        'bash', 'shell', 'powershell',
        'sql', 'graphql',
        'plaintext'
      ],
      defaultLanguage: 'plaintext',
      HTMLAttributes: {
        class: 'code-block'
      }
    }
  }
}