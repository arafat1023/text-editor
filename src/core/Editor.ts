import { EditorState, Transaction, TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Schema, DOMParser, DOMSerializer } from 'prosemirror-model'
import { editorSchema } from './schema'
import { history, undo, redo } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'
import { splitListItem, liftListItem, sinkListItem } from 'prosemirror-schema-list'
import type {
  EditorOptions,
  EditorInstance,
  EditorSelection,
  Extension,
  ChainedCommands,
  SingleCommands
} from '@/types'
import { createCommands } from './commands'

export class Editor implements EditorInstance {
  public view: EditorView
  public state: EditorState
  public schema: Schema
  public extensions: Extension[] = []
  public element: HTMLElement
  public options: EditorOptions
  public commands: SingleCommands
  private isDestroyed = false

  constructor(options: EditorOptions = {}) {
    this.options = { editable: true, ...options }

    // Create schema with extensions
    this.schema = this.createSchema()

    // Initialize commands
    this.commands = createCommands(this)

    // Create editor state
    this.state = this.createState()

    // Create editor view
    this.element = document.createElement('div')
    this.view = this.createView()

    // Setup extensions
    this.setupExtensions()

    // Emit create event
    if (this.options.onCreate) {
      this.options.onCreate({ editor: this })
    }
  }

  private createSchema(): Schema {
    return editorSchema
  }

  private createState(): EditorState {
    const doc = this.createDocument(this.options.content || '')

    // Create list-specific keymaps
    const listKeymap = keymap({
      'Enter': splitListItem(this.schema.nodes.list_item),
      'Shift-Tab': liftListItem(this.schema.nodes.list_item),
      'Tab': sinkListItem(this.schema.nodes.list_item)
    })

    return EditorState.create({
      doc,
      schema: this.schema,
      plugins: [
        history(),
        listKeymap,
        keymap(baseKeymap),
        keymap({
          'Mod-z': undo,
          'Mod-y': redo,
          'Mod-Shift-z': redo,
        }),
      ]
    })
  }

  private createView(): EditorView {
    return new EditorView(this.element, {
      state: this.state,
      editable: () => this.options.editable ?? true,
      nodeViews: this.createNodeViews(),
      dispatchTransaction: (transaction: Transaction) => {
        const newState = this.view.state.apply(transaction)
        this.view.updateState(newState)
        this.state = newState

        if (this.options.onUpdate && transaction.docChanged) {
          this.options.onUpdate({ editor: this, transaction })
        }

        if (this.options.onSelectionUpdate && transaction.selectionSet) {
          this.options.onSelectionUpdate({ editor: this })
        }
      },
      handleDOMEvents: {
        focus: (_view, event) => {
          if (this.options.onFocus) {
            this.options.onFocus({ editor: this, event })
          }
          return false
        },
        blur: (_view, event) => {
          if (this.options.onBlur) {
            this.options.onBlur({ editor: this, event })
          }
          return false
        }
      }
    })
  }

  private createDocument(content: string) {
    const element = document.createElement('div')
    element.innerHTML = content
    return DOMParser.fromSchema(this.schema).parse(element)
  }

  private createNodeViews() {
    const nodeViews: Record<string, any> = {}

    for (const extension of this.extensions) {
      if (extension.addNodeView && extension.name) {
        nodeViews[extension.name] = extension.addNodeView()
      }
    }

    return nodeViews
  }

  private setupExtensions() {
    this.extensions = this.options.extensions || []

    for (const extension of this.extensions) {
      if (extension.onCreate) {
        extension.onCreate(this)
      }
    }
  }

  // Content methods
  getHTML(): string {
    const fragment = DOMSerializer.fromSchema(this.schema).serializeFragment(
      this.state.doc.content
    )
    const div = document.createElement('div')
    div.appendChild(fragment)
    return div.innerHTML
  }

  getJSON(): Record<string, any> {
    return this.state.doc.toJSON()
  }

  getText(): string {
    return this.state.doc.textContent
  }

  setContent(content: string, emitUpdate = true): void {
    const doc = this.createDocument(content)
    const transaction = this.state.tr.replaceWith(0, this.state.doc.content.size, doc.content)

    if (emitUpdate && this.options.onUpdate) {
      this.options.onUpdate({ editor: this, transaction })
    }

    this.view.dispatch(transaction)
  }

  // Selection methods
  getSelection(): EditorSelection {
    const { from, to, anchor, head, empty } = this.state.selection
    return { from, to, anchor, head, empty }
  }

  setSelection(position: number | EditorSelection): void {
    const { tr } = this.state

    if (typeof position === 'number') {
      tr.setSelection(TextSelection.near(tr.doc.resolve(position)))
    } else {
      tr.setSelection(
        TextSelection.create(
          tr.doc,
          position.anchor,
          position.head
        )
      )
    }

    this.view.dispatch(tr)
  }

  // Command methods
  can(): ChainedCommands {
    return this.createChainedCommands(true)
  }

  chain(): ChainedCommands {
    return this.createChainedCommands(false)
  }

  private createChainedCommands(shouldCheck = false): ChainedCommands {
    const commands: any = {}
    const commandQueue: Array<() => boolean> = []

    for (const [name, command] of Object.entries(this.commands)) {
      commands[name] = (...args: any[]) => {
        const commandFunc = () => command(...args)

        if (shouldCheck) {
          return commandFunc()
        }

        commandQueue.push(commandFunc)
        return commands
      }
    }

    commands.run = () => {
      return commandQueue.every(command => command())
    }

    return commands
  }

  // State methods
  isActive(name: string, attributes?: Record<string, any>): boolean {
    const { selection } = this.state
    const { $from, to } = selection

    // Check for marks (inline formatting)
    if (this.schema.marks[name]) {
      const markType = this.schema.marks[name]

      if (selection.empty) {
        // Check if mark is active at cursor position
        return !!markType.isInSet($from.marks())
      } else {
        // Check if mark is active across selection
        return this.state.doc.rangeHasMark(selection.from, to, markType)
      }
    }

    // Check for nodes (block formatting)
    if (this.schema.nodes[name]) {
      const nodeType = this.schema.nodes[name]

      // Check if current node or parent is of this type
      let node = $from.node()
      if (node.type === nodeType) {
        if (attributes) {
          // Check if attributes match
          return Object.keys(attributes).every(key => node.attrs[key] === attributes[key])
        }
        return true
      }

      // Check parent nodes
      for (let depth = $from.depth; depth >= 0; depth--) {
        node = $from.node(depth)
        if (node.type === nodeType) {
          if (attributes) {
            return Object.keys(attributes).every(key => node.attrs[key] === attributes[key])
          }
          return true
        }
      }
    }

    return false
  }

  isEditable(): boolean {
    return this.view.editable
  }

  isEmpty(): boolean {
    return this.state.doc.content.size === 0
  }

  // Focus methods
  focus(position?: number | 'start' | 'end'): void {
    this.view.focus()

    if (position !== undefined) {
      let pos: number

      if (position === 'start') {
        pos = 0
      } else if (position === 'end') {
        pos = this.state.doc.content.size
      } else {
        pos = position
      }

      this.setSelection(pos)
    }
  }

  blur(): void {
    this.view.dom.blur()
  }

  isFocused(): boolean {
    return this.view.hasFocus()
  }

  // Lifecycle
  destroy(): void {
    if (this.isDestroyed) return

    // Clean up extensions
    for (const extension of this.extensions) {
      if (extension.onDestroy) {
        extension.onDestroy()
      }
    }

    this.view.destroy()

    if (this.options.onDestroy) {
      this.options.onDestroy()
    }

    this.isDestroyed = true
  }

  // Mount to DOM element
  mount(element: HTMLElement): void {
    if (element !== this.element) {
      element.appendChild(this.view.dom)
    }
  }

  // Get DOM element
  get dom(): HTMLElement {
    return this.view.dom as HTMLElement
  }
}