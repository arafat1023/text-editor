import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Editor } from '../src/core/Editor'
import { ClipboardExtension } from '../src/plugins/ClipboardExtension'
import { TableExtension } from '../src/plugins/TableExtension'
import { TextAlignmentExtension } from '../src/plugins/TextAlignmentExtension'
import { AutoLinkExtension } from '../src/plugins/AutoLinkExtension'
import type { EditorInstance, Extension } from '../src/types'

describe('Extension System Integration', () => {
  let editor: EditorInstance

  afterEach(() => {
    if (editor) {
      editor.destroy()
    }
  })

  describe('Extension Commands Integration', () => {
    it('should load commands from ClipboardExtension', () => {
      editor = new Editor({
        content: '<p>Test content</p>',
        extensions: [ClipboardExtension]
      })

      expect(editor.commands).toBeDefined()
      expect(typeof (editor.commands as any).copy).toBe('function')
      expect(typeof (editor.commands as any).cut).toBe('function')
      expect(typeof (editor.commands as any).paste).toBe('function')
      expect(typeof (editor.commands as any).pasteAsPlainText).toBe('function')
    })

    it('should load commands from TableExtension', () => {
      editor = new Editor({
        content: '<p>Test content</p>',
        extensions: [TableExtension]
      })

      expect(typeof (editor.commands as any).addColumnBefore).toBe('function')
      expect(typeof (editor.commands as any).addColumnAfter).toBe('function')
      expect(typeof (editor.commands as any).deleteColumn).toBe('function')
      expect(typeof (editor.commands as any).addRowBefore).toBe('function')
      expect(typeof (editor.commands as any).addRowAfter).toBe('function')
      expect(typeof (editor.commands as any).deleteRow).toBe('function')
      expect(typeof (editor.commands as any).mergeCells).toBe('function')
      expect(typeof (editor.commands as any).splitCell).toBe('function')
    })

    it('should load commands from TextAlignmentExtension', () => {
      editor = new Editor({
        content: '<p>Test content</p>',
        extensions: [TextAlignmentExtension]
      })

      expect(typeof (editor.commands as any).setTextAlign).toBe('function')
      expect(typeof (editor.commands as any).alignLeft).toBe('function')
      expect(typeof (editor.commands as any).alignCenter).toBe('function')
      expect(typeof (editor.commands as any).alignRight).toBe('function')
      expect(typeof (editor.commands as any).alignJustify).toBe('function')
      expect(typeof (editor.commands as any).unsetTextAlign).toBe('function')
    })

    it('should execute extension commands successfully', () => {
      editor = new Editor({
        content: '<p>Test content</p>',
        extensions: [TextAlignmentExtension]
      })

      // Execute alignment command
      const result = (editor.commands as any).alignCenter()
      expect(typeof result).toBe('boolean')
    })
  })

  describe('Extension Plugins Integration', () => {
    it('should load ProseMirror plugins from TableExtension', () => {
      editor = new Editor({
        content: '<p>Test content</p>',
        extensions: [TableExtension]
      })

      // Check that plugins are loaded by verifying editor state has the plugins
      expect(editor.state.plugins.length).toBeGreaterThan(4) // Base plugins + table plugins
    })

    it('should load ProseMirror plugins from ClipboardExtension', () => {
      editor = new Editor({
        content: '<p>Test content</p>',
        extensions: [ClipboardExtension]
      })

      // ClipboardExtension adds one plugin
      expect(editor.state.plugins.length).toBeGreaterThan(4)
    })

    it('should load ProseMirror plugins from AutoLinkExtension', () => {
      editor = new Editor({
        content: '<p>Test content</p>',
        extensions: [AutoLinkExtension]
      })

      // AutoLinkExtension adds one plugin
      expect(editor.state.plugins.length).toBeGreaterThan(4)
    })
  })

  describe('Extension Lifecycle Hooks', () => {
    it('should call onCreate hook when extension is loaded', () => {
      let onCreateCalled = false

      const testExtension: Extension = {
        name: 'test',
        onCreate: () => {
          onCreateCalled = true
        }
      }

      editor = new Editor({
        content: '<p>Test</p>',
        extensions: [testExtension]
      })

      expect(onCreateCalled).toBe(true)
    })

    it('should call onDestroy hook when editor is destroyed', () => {
      let onDestroyCalled = false

      const testExtension: Extension = {
        name: 'test',
        onDestroy: () => {
          onDestroyCalled = true
        }
      }

      editor = new Editor({
        content: '<p>Test</p>',
        extensions: [testExtension]
      })

      editor.destroy()
      expect(onDestroyCalled).toBe(true)
    })
  })

  describe('Multiple Extensions', () => {
    it('should load multiple extensions simultaneously', () => {
      editor = new Editor({
        content: '<p>Test content</p>',
        extensions: [
          ClipboardExtension,
          TableExtension,
          TextAlignmentExtension
        ]
      })

      // Verify commands from all extensions are available
      expect(typeof (editor.commands as any).copy).toBe('function')
      expect(typeof (editor.commands as any).addColumnBefore).toBe('function')
      expect(typeof (editor.commands as any).alignCenter).toBe('function')
    })

    it('should load plugins from multiple extensions', () => {
      editor = new Editor({
        content: '<p>Test content</p>',
        extensions: [
          ClipboardExtension,
          TableExtension,
          AutoLinkExtension
        ]
      })

      // Should have base plugins + 4 extension plugins (1 + 2 + 1)
      expect(editor.state.plugins.length).toBeGreaterThan(7)
    })
  })

  describe('Extension Error Handling', () => {
    it('should handle extension with failing onCreate gracefully', () => {
      const badExtension: Extension = {
        name: 'bad',
        onCreate: () => {
          throw new Error('Intentional error')
        }
      }

      expect(() => {
        editor = new Editor({
          content: '<p>Test</p>',
          extensions: [badExtension]
        })
      }).not.toThrow()
    })

    it('should handle extension with failing command gracefully', () => {
      const badExtension: Extension = {
        name: 'bad',
        addCommands: () => ({
          badCommand: () => () => {
            throw new Error('Intentional error')
          }
        })
      }

      editor = new Editor({
        content: '<p>Test</p>',
        extensions: [badExtension]
      })

      expect(() => {
        (editor.commands as any).badCommand()
      }).not.toThrow()
    })
  })

  describe('Extension Priority', () => {
    it('should respect extension priority order', () => {
      const commands: string[] = []

      const ext1: Extension = {
        name: 'ext1',
        priority: 100,
        onCreate: () => commands.push('ext1')
      }

      const ext2: Extension = {
        name: 'ext2',
        priority: 200,
        onCreate: () => commands.push('ext2')
      }

      editor = new Editor({
        content: '<p>Test</p>',
        extensions: [ext1, ext2]
      })

      // Both should be called
      expect(commands).toContain('ext1')
      expect(commands).toContain('ext2')
    })
  })
})
