import type { Extension } from '@/types'
import {
  columnResizing,
  tableEditing,
  goToNextCell,
  addColumnBefore,
  addColumnAfter,
  deleteColumn,
  addRowBefore,
  addRowAfter,
  deleteRow,
  mergeCells,
  splitCell,
  setCellAttr,
  toggleHeaderRow,
  toggleHeaderColumn,
  toggleHeaderCell,
  deleteTable
} from 'prosemirror-tables'

export interface TableOptions {
  resizable?: boolean
  lastColumnResizable?: boolean
  allowTableNodeSelection?: boolean
}

export const TableExtension: Extension = {
  name: 'table',
  type: 'node',
  priority: 500,


  addCommands() {
    return {
      insertTable: (rows: number = 3, cols: number = 3, withHeaderRow: boolean = true) => ({ editor, tr }) => {
        const { schema } = editor.state
        const tableNode = schema.nodes.table
        const rowNode = schema.nodes.table_row
        const cellNode = schema.nodes.table_cell
        const headerCellNode = schema.nodes.table_header

        if (!tableNode || !rowNode || !cellNode || !headerCellNode) {
          console.error('Table nodes not found in schema')
          return false
        }

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

        return true
      },

      addColumnBefore: () => ({ editor }) => {
        return addColumnBefore(editor.state, editor.view.dispatch)
      },

      addColumnAfter: () => ({ editor }) => {
        return addColumnAfter(editor.state, editor.view.dispatch)
      },

      deleteColumn: () => ({ editor }) => {
        return deleteColumn(editor.state, editor.view.dispatch)
      },

      addRowBefore: () => ({ editor }) => {
        return addRowBefore(editor.state, editor.view.dispatch)
      },

      addRowAfter: () => ({ editor }) => {
        return addRowAfter(editor.state, editor.view.dispatch)
      },

      deleteRow: () => ({ editor }) => {
        return deleteRow(editor.state, editor.view.dispatch)
      },

      deleteTable: () => ({ editor }) => {
        return deleteTable(editor.state, editor.view.dispatch)
      },

      mergeCells: () => ({ editor }) => {
        return mergeCells(editor.state, editor.view.dispatch)
      },

      splitCell: () => ({ editor }) => {
        return splitCell(editor.state, editor.view.dispatch)
      },

      toggleHeaderColumn: () => ({ editor }) => {
        return toggleHeaderColumn(editor.state, editor.view.dispatch)
      },

      toggleHeaderRow: () => ({ editor }) => {
        return toggleHeaderRow(editor.state, editor.view.dispatch)
      },

      toggleHeaderCell: () => ({ editor }) => {
        return toggleHeaderCell(editor.state, editor.view.dispatch)
      },

      goToNextCell: () => ({ editor }) => {
        return goToNextCell(1)(editor.state, editor.view.dispatch)
      },

      goToPreviousCell: () => ({ editor }) => {
        return goToNextCell(-1)(editor.state, editor.view.dispatch)
      },

      setCellAttribute: (name: string, value: any) => ({ editor }) => {
        return setCellAttr(name, value)(editor.state, editor.view.dispatch)
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        return false // Will be handled by tableEditing plugin
      },
      'Shift-Tab': () => {
        return false // Will be handled by tableEditing plugin
      }
    }
  },

  addProseMirrorPlugins() {
    return [
      columnResizing(),
      tableEditing()
    ]
  },

}