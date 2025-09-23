import { toggleMark, setBlockType, wrapIn } from 'prosemirror-commands'
import { undo, redo } from 'prosemirror-history'
import { AllSelection } from 'prosemirror-state'
import { wrapInList, splitListItem, liftListItem, sinkListItem } from 'prosemirror-schema-list'
import {
  addColumnBefore,
  addColumnAfter,
  deleteColumn,
  addRowBefore,
  addRowAfter,
  deleteRow,
  mergeCells,
  splitCell,
  toggleHeaderRow,
  toggleHeaderColumn,
  deleteTable
} from 'prosemirror-tables'
import type { Editor } from './Editor'
import type { SingleCommands } from '@/types'

export function createCommands(editor: Editor): SingleCommands {
  return {
    // Text formatting
    bold: () => executeCommand(editor, toggleMark(editor.schema.marks.strong)),
    italic: () => executeCommand(editor, toggleMark(editor.schema.marks.em)),
    underline: () => executeCommand(editor, toggleMark(editor.schema.marks.underline)),
    strike: () => executeCommand(editor, toggleMark(editor.schema.marks.strikethrough)),
    code: () => executeCommand(editor, toggleMark(editor.schema.marks.code)),
    superscript: () => executeCommand(editor, toggleMark(editor.schema.marks.superscript)),
    subscript: () => executeCommand(editor, toggleMark(editor.schema.marks.subscript)),

    // Color formatting
    textColor: (color: string | null) => {
      const { tr } = editor.state
      if (color === null) {
        tr.removeMark(tr.selection.from, tr.selection.to, editor.schema.marks.textColor)
      } else {
        tr.addMark(tr.selection.from, tr.selection.to, editor.schema.marks.textColor.create({ color }))
      }
      editor.view.dispatch(tr)
      return true
    },

    backgroundColor: (color: string | null) => {
      const { tr } = editor.state
      if (color === null) {
        tr.removeMark(tr.selection.from, tr.selection.to, editor.schema.marks.backgroundColor)
      } else {
        tr.addMark(tr.selection.from, tr.selection.to, editor.schema.marks.backgroundColor.create({ color }))
      }
      editor.view.dispatch(tr)
      return true
    },

    // Font formatting
    fontFamily: (family: string | null) => {
      const { tr } = editor.state
      if (family === null) {
        tr.removeMark(tr.selection.from, tr.selection.to, editor.schema.marks.fontFamily)
      } else {
        tr.addMark(tr.selection.from, tr.selection.to, editor.schema.marks.fontFamily.create({ family }))
      }
      editor.view.dispatch(tr)
      return true
    },

    fontSize: (size: string | null) => {
      const { tr } = editor.state
      if (size === null) {
        tr.removeMark(tr.selection.from, tr.selection.to, editor.schema.marks.fontSize)
      } else {
        tr.addMark(tr.selection.from, tr.selection.to, editor.schema.marks.fontSize.create({ size }))
      }
      editor.view.dispatch(tr)
      return true
    },

    // Block formatting
    paragraph: () => executeCommand(editor, setBlockType(editor.schema.nodes.paragraph)),
    heading: (level: number = 1) => {
      const headingNode = editor.schema.nodes[`heading${level}`] || editor.schema.nodes.heading
      return executeCommand(editor, setBlockType(headingNode, { level }))
    },
    blockquote: () => executeCommand(editor, wrapIn(editor.schema.nodes.blockquote)),
    codeBlock: () => executeCommand(editor, setBlockType(editor.schema.nodes.code_block)),

    // Lists
    bulletList: () => executeCommand(editor, wrapInList(editor.schema.nodes.bullet_list)),
    orderedList: () => executeCommand(editor, wrapInList(editor.schema.nodes.ordered_list)),
    listItem: () => executeCommand(editor, splitListItem(editor.schema.nodes.list_item)),
    liftListItem: () => executeCommand(editor, liftListItem(editor.schema.nodes.list_item)),
    sinkListItem: () => executeCommand(editor, sinkListItem(editor.schema.nodes.list_item)),

    // History
    undo: () => executeCommand(editor, undo),
    redo: () => executeCommand(editor, redo),

    // Selection
    selectAll: () => {
      const { tr } = editor.state
      tr.setSelection(new AllSelection(tr.doc))
      editor.view.dispatch(tr)
      return true
    },

    // Content
    clearContent: () => {
      const { tr } = editor.state
      tr.delete(0, editor.state.doc.content.size)
      editor.view.dispatch(tr)
      return true
    },

    insertContent: (content: string) => {
      const { tr } = editor.state
      const fragment = editor.view.state.schema.text(content)
      tr.replaceSelectionWith(fragment)
      editor.view.dispatch(tr)
      return true
    },

    // Focus
    focus: (position?: number | 'start' | 'end') => {
      editor.focus(position)
      return true
    },

    blur: () => {
      editor.blur()
      return true
    },

    // Utility
    deleteSelection: () => {
      const { tr } = editor.state
      tr.deleteSelection()
      editor.view.dispatch(tr)
      return true
    },

    enter: () => {
      const { tr } = editor.state
      tr.split(tr.selection.from)
      editor.view.dispatch(tr)
      return true
    },

    hardBreak: () => {
      const { tr } = editor.state
      const hardBreak = editor.schema.nodes.hard_break
      if (hardBreak) {
        tr.replaceSelectionWith(hardBreak.create())
        editor.view.dispatch(tr)
        return true
      }
      return false
    },

    // Link commands
    link: (href: string, title?: string, target?: string) => {
      const { tr, selection } = editor.state
      const linkMark = editor.schema.marks.link
      if (!linkMark || !href) return false

      const attrs: any = { href }
      if (title) attrs.title = title
      if (target) attrs.target = target

      if (selection.empty) {
        // Insert link text at cursor
        const linkText = title || href
        const textNode = editor.schema.text(linkText, [linkMark.create(attrs)])
        tr.replaceSelectionWith(textNode)
      } else {
        // Apply link to selection
        tr.addMark(selection.from, selection.to, linkMark.create(attrs))
      }

      editor.view.dispatch(tr)
      return true
    },

    unsetLink: () => {
      const { tr, selection } = editor.state
      const linkMark = editor.schema.marks.link
      if (!linkMark) return false

      tr.removeMark(selection.from, selection.to, linkMark)
      editor.view.dispatch(tr)
      return true
    },

    isLinkActive: () => {
      return editor.isActive('link')
    },

    // Image commands
    insertImage: (src: string, alt?: string, title?: string, width?: number, height?: number, alignment?: string) => {
      const { tr } = editor.state
      const imageNode = editor.schema.nodes.image
      if (!imageNode || !src) return false

      const attrs: any = {
        src,
        alt: alt || '',
        title,
        width,
        height,
        alignment: alignment || 'center'
      }

      const node = imageNode.create(attrs)
      tr.replaceSelectionWith(node)
      editor.view.dispatch(tr)
      return true
    },

    updateImage: (oldSrc: string, newSrc: string, alt?: string, title?: string, width?: number, height?: number, alignment?: string) => {
      const { tr } = editor.state
      let updated = false

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.src === oldSrc) {
          const newAttrs = {
            ...node.attrs,
            src: newSrc,
            alt: alt !== undefined ? alt : node.attrs.alt,
            title: title !== undefined ? title : node.attrs.title,
            width: width !== undefined ? width : node.attrs.width,
            height: height !== undefined ? height : node.attrs.height,
            alignment: alignment !== undefined ? alignment : node.attrs.alignment
          }
          tr.setNodeMarkup(pos, null, newAttrs)
          updated = true
        }
      })

      if (updated) {
        editor.view.dispatch(tr)
      }
      return updated
    },

    removeImage: (src: string) => {
      const { tr } = editor.state
      let removed = false

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.src === src) {
          tr.delete(pos, pos + node.nodeSize)
          removed = true
        }
      })

      if (removed) {
        editor.view.dispatch(tr)
      }
      return removed
    },

    uploadImage: (file: File) => {
      // This is a simplified version - the actual upload logic is in ImageExtension
      if (!file || !file.type.startsWith('image/')) return false

      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        if (dataUrl) {
          editor.commands.insertImage(dataUrl, file.name)
        }
      }
      reader.readAsDataURL(file)
      return true
    },

    // Table commands
    insertTable: (rows: number = 3, cols: number = 3, withHeaderRow: boolean = true) => {
      const { schema } = editor.state
      const tableNode = schema.nodes.table
      const rowNode = schema.nodes.table_row
      const cellNode = schema.nodes.table_cell
      const headerCellNode = schema.nodes.table_header

      if (!tableNode || !rowNode || !cellNode || !headerCellNode) {
        console.error('Table nodes not found in schema')
        return false
      }

      const { tr } = editor.state

      // Create table rows
      const tableRows = []

      for (let i = 0; i < rows; i++) {
        const cells = []
        const isHeaderRow = withHeaderRow && i === 0

        for (let j = 0; j < cols; j++) {
          const cellType = isHeaderRow ? headerCellNode : cellNode
          cells.push(cellType.createAndFill()!)
        }

        tableRows.push(rowNode.create(null, cells))
      }

      const table = tableNode.create(null, tableRows)
      tr.replaceSelectionWith(table)
      editor.view.dispatch(tr)

      return true
    },

    addColumnBefore: () => executeCommand(editor, addColumnBefore),
    addColumnAfter: () => executeCommand(editor, addColumnAfter),
    deleteColumn: () => executeCommand(editor, deleteColumn),
    addRowBefore: () => executeCommand(editor, addRowBefore),
    addRowAfter: () => executeCommand(editor, addRowAfter),
    deleteRow: () => executeCommand(editor, deleteRow),
    deleteTable: () => executeCommand(editor, deleteTable),
    mergeCells: () => executeCommand(editor, mergeCells),
    splitCell: () => executeCommand(editor, splitCell),
    toggleHeaderRow: () => executeCommand(editor, toggleHeaderRow),
    toggleHeaderColumn: () => executeCommand(editor, toggleHeaderColumn),

    // Text alignment commands
    alignLeft: () => {
      return setTextAlignment(editor, 'left')
    },

    alignCenter: () => {
      return setTextAlignment(editor, 'center')
    },

    alignRight: () => {
      return setTextAlignment(editor, 'right')
    },

    alignJustify: () => {
      return setTextAlignment(editor, 'justify')
    },

    clearAlignment: () => {
      return setTextAlignment(editor, null)
    }
  }
}

function executeCommand(editor: Editor, command: any): boolean {
  return command(editor.state, editor.view.dispatch, editor.view)
}

function setTextAlignment(editor: Editor, alignment: string | null): boolean {
  const { tr, selection } = editor.state
  const { from, to } = selection

  let updated = false

  editor.state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name === 'paragraph' || node.type.name === 'heading') {
      const newAttrs = { ...node.attrs, textAlign: alignment }
      tr.setNodeMarkup(pos, null, newAttrs)
      updated = true
    }
  })

  if (updated) {
    editor.view.dispatch(tr)
  }

  return updated
}