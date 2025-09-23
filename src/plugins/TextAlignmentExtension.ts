import type { Extension } from '@/types'

export interface TextAlignmentOptions {
  alignments?: string[]
  defaultAlignment?: string | null
}

export const TextAlignmentExtension: Extension = {
  name: 'textAlignment',
  type: 'extension',
  priority: 100,

  addCommands() {
    return {
      setTextAlign: (alignment: string | null) => ({ editor, tr }) => {
        const { selection } = editor.state
        const { from, to } = selection

        let updated = false

        editor.state.doc.nodesBetween(from, to, (node: any, pos: number) => {
          if (node.type.name === 'paragraph' || node.type.name === 'heading') {
            const newAttrs = { ...node.attrs, textAlign: alignment }
            tr.setNodeMarkup(pos, null, newAttrs)
            updated = true
          }
        })

        return updated
      },

      alignLeft: () => ({ editor, tr }) => {
        const { selection } = editor.state
        const { from, to } = selection

        let updated = false

        editor.state.doc.nodesBetween(from, to, (node: any, pos: number) => {
          if (node.type.name === 'paragraph' || node.type.name === 'heading') {
            const newAttrs = { ...node.attrs, textAlign: 'left' }
            tr.setNodeMarkup(pos, null, newAttrs)
            updated = true
          }
        })

        return updated
      },

      alignCenter: () => ({ editor, tr }) => {
        const { selection } = editor.state
        const { from, to } = selection

        let updated = false

        editor.state.doc.nodesBetween(from, to, (node: any, pos: number) => {
          if (node.type.name === 'paragraph' || node.type.name === 'heading') {
            const newAttrs = { ...node.attrs, textAlign: 'center' }
            tr.setNodeMarkup(pos, null, newAttrs)
            updated = true
          }
        })

        return updated
      },

      alignRight: () => ({ editor, tr }) => {
        const { selection } = editor.state
        const { from, to } = selection

        let updated = false

        editor.state.doc.nodesBetween(from, to, (node: any, pos: number) => {
          if (node.type.name === 'paragraph' || node.type.name === 'heading') {
            const newAttrs = { ...node.attrs, textAlign: 'right' }
            tr.setNodeMarkup(pos, null, newAttrs)
            updated = true
          }
        })

        return updated
      },

      alignJustify: () => ({ editor, tr }) => {
        const { selection } = editor.state
        const { from, to } = selection

        let updated = false

        editor.state.doc.nodesBetween(from, to, (node: any, pos: number) => {
          if (node.type.name === 'paragraph' || node.type.name === 'heading') {
            const newAttrs = { ...node.attrs, textAlign: 'justify' }
            tr.setNodeMarkup(pos, null, newAttrs)
            updated = true
          }
        })

        return updated
      },

      unsetTextAlign: () => ({ editor, tr }) => {
        const { selection } = editor.state
        const { from, to } = selection

        let updated = false

        editor.state.doc.nodesBetween(from, to, (node: any, pos: number) => {
          if (node.type.name === 'paragraph' || node.type.name === 'heading') {
            const newAttrs = { ...node.attrs, textAlign: null }
            tr.setNodeMarkup(pos, null, newAttrs)
            updated = true
          }
        })

        return updated
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-l': () => false, // Will be handled by commands
      'Mod-Shift-e': () => false, // Will be handled by commands
      'Mod-Shift-r': () => false, // Will be handled by commands
      'Mod-Shift-j': () => false  // Will be handled by commands
    }
  },


}