import type { Extension } from '@/types'
import { keymap } from 'prosemirror-keymap'
import { selectAll } from 'prosemirror-commands'
import { EditorView } from 'prosemirror-view'
import { Slice, Fragment } from 'prosemirror-model'
import { Plugin, PluginKey } from 'prosemirror-state'

export interface ClipboardOptions {
  enableRichPaste: boolean
  enablePlainTextPaste: boolean
  enableCustomShortcuts: boolean
}

const defaultOptions: ClipboardOptions = {
  enableRichPaste: true,
  enablePlainTextPaste: true,
  enableCustomShortcuts: true
}

export const ClipboardExtension: Extension = {
  name: 'clipboard',
  type: 'extension',

  addOptions() {
    return defaultOptions
  },

  addKeymap() {
    return keymap({
      'Mod-c': copyCommand(),
      'Mod-x': cutCommand(),
      'Mod-v': pasteCommand(),
      'Mod-Shift-v': pasteAsPlainTextCommand(),
      'Mod-a': selectAll,
    })
  },

  addCommands() {
    return {
      copy: () => copyCommand(),
      cut: () => cutCommand(),
      paste: () => pasteCommand(),
      pasteAsPlainText: () => pasteAsPlainTextCommand(),
      selectAll: () => selectAll,
    }
  },

  addProseMirrorPlugins() {
    return [
      createClipboardPlugin()
    ]
  }
}

function copyCommand() {
  return (state: any, dispatch?: any, view?: EditorView) => {
    if (!view || state.selection.empty) return false

    try {
      // Copy to system clipboard
      copyToClipboard(view, state.selection)
      return true
    } catch (error) {
      console.warn('Copy operation failed:', error)
      return false
    }
  }
}

function cutCommand() {
  return (state: any, dispatch?: any, view?: EditorView) => {
    if (!view || state.selection.empty) return false

    try {
      // Copy to system clipboard first
      copyToClipboard(view, state.selection)

      // Then delete the selection
      if (dispatch) {
        dispatch(state.tr.deleteSelection())
      }

      return true
    } catch (error) {
      console.warn('Cut operation failed:', error)
      return false
    }
  }
}

function pasteCommand() {
  return (state: any, dispatch?: any, view?: EditorView) => {
    if (!view) return false

    try {
      // Let browser handle paste naturally for keyboard shortcuts
      // This command is mainly for programmatic access
      handlePaste(view, false).catch(err =>
        console.warn('Paste operation failed:', err)
      )
      return true
    } catch (error) {
      console.warn('Paste operation failed:', error)
      return false
    }
  }
}

function pasteAsPlainTextCommand() {
  return (state: any, dispatch?: any, view?: EditorView) => {
    if (!view) return false

    try {
      // Let browser handle paste naturally for keyboard shortcuts
      // This command is mainly for programmatic access
      handlePaste(view, true).catch(err =>
        console.warn('Paste as plain text failed:', err)
      )
      return true
    } catch (error) {
      console.warn('Paste as plain text operation failed:', error)
      return false
    }
  }
}

async function copyToClipboard(view: EditorView, selection: any) {
  try {
    const { from, to } = selection
    const selectedContent = view.state.doc.slice(from, to)

    // Get text content
    let textContent = selectedContent.content.textBetween(0, selectedContent.content.size, '\n')

    // Get HTML representation
    let htmlContent = ''
    try {
      const { DOMSerializer } = await import('prosemirror-model')
      const serializer = DOMSerializer.fromSchema(view.state.schema)
      const fragment = serializer.serializeFragment(selectedContent.content)
      const div = document.createElement('div')
      div.appendChild(fragment)
      htmlContent = div.innerHTML
    } catch (err) {
      console.warn('Failed to serialize HTML content:', err)
    }

    // Use modern Clipboard API if available
    if (navigator.clipboard && window.ClipboardItem) {
      const items: Record<string, Blob> = {
        'text/plain': new Blob([textContent], { type: 'text/plain' })
      }

      if (htmlContent) {
        items['text/html'] = new Blob([htmlContent], { type: 'text/html' })
      }

      await navigator.clipboard.write([new ClipboardItem(items)])
    } else {
      // Fallback to legacy clipboard API
      await navigator.clipboard.writeText(textContent)
    }
  } catch (error) {
    console.warn('Failed to copy to clipboard:', error)
  }
}

async function handlePaste(view: EditorView, asPlainText: boolean = false): Promise<boolean> {
  try {
    if (!navigator.clipboard) {
      // Fallback: Let the browser handle it naturally
      return false
    }

    const clipboardData = await navigator.clipboard.read()

    for (const item of clipboardData) {
      if (asPlainText && item.types.includes('text/plain')) {
        const text = await (await item.getType('text/plain')).text()
        return insertPlainText(view, text)
      } else if (!asPlainText && item.types.includes('text/html')) {
        const html = await (await item.getType('text/html')).text()
        return insertHTML(view, html)
      } else if (item.types.includes('text/plain')) {
        const text = await (await item.getType('text/plain')).text()
        return insertPlainText(view, text)
      }
    }

    return false
  } catch (error) {
    console.warn('Paste operation failed:', error)
    return false
  }
}

function insertPlainText(view: EditorView, text: string): boolean {
  try {
    const { state, dispatch } = view
    const { selection } = state

    // Create a text node
    const textNode = state.schema.text(text)
    const slice = new Slice(Fragment.from(textNode), 0, 0)

    // Insert the text
    const tr = state.tr.replaceSelection(slice)
    dispatch(tr)

    return true
  } catch (error) {
    console.warn('Failed to insert plain text:', error)
    return false
  }
}

function insertHTML(view: EditorView, html: string): boolean {
  try {
    const { state, dispatch } = view

    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html

    // Parse HTML with ProseMirror
    const { DOMParser } = require('prosemirror-model')
    const parser = DOMParser.fromSchema(state.schema)

    const doc = parser.parse(tempDiv)
    const slice = doc.slice(0, doc.content.size)

    // Insert the content
    const tr = state.tr.replaceSelection(slice)
    dispatch(tr)

    return true
  } catch (error) {
    console.warn('Failed to insert HTML:', error)
    // Fallback to plain text
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    return insertPlainText(view, tempDiv.textContent || '')
  }
}

function createClipboardPlugin() {
  return new Plugin({
    key: new PluginKey('clipboard'),

    props: {
      handleDOMEvents: {
        paste: (view: EditorView, event: ClipboardEvent) => {
          // Let the browser handle paste naturally for most cases
          // Our custom commands will be used when called explicitly
          return false
        },

        copy: (view: EditorView, event: ClipboardEvent) => {
          // Enhanced copy handling
          if (!view.state.selection.empty) {
            copyToClipboard(view, view.state.selection)
          }
          return false // Let browser handle too
        },

        cut: (view: EditorView, event: ClipboardEvent) => {
          // Enhanced cut handling
          if (!view.state.selection.empty) {
            copyToClipboard(view, view.state.selection)
          }
          return false // Let browser handle the actual cut
        }
      }
    }
  })
}

export default ClipboardExtension