import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Editor } from '../src/core/Editor'
import type { EditorInstance } from '../src/types'

describe('Editor Commands', () => {
  let editor: EditorInstance

  beforeEach(() => {
    editor = new Editor({
      content: '<p>Test content</p>',
      editable: true
    })
  })

  afterEach(() => {
    if (editor) {
      editor.destroy()
    }
  })

  describe('Text Formatting Commands', () => {
    it('should have bold command', () => {
      expect(editor.commands.bold).toBeDefined()
      expect(typeof editor.commands.bold()).toBe('boolean')
    })

    it('should have italic command', () => {
      expect(editor.commands.italic).toBeDefined()
      expect(typeof editor.commands.italic()).toBe('boolean')
    })

    it('should have underline command', () => {
      expect(editor.commands.underline).toBeDefined()
      expect(typeof editor.commands.underline()).toBe('boolean')
    })

    it('should have strike command', () => {
      expect(editor.commands.strike).toBeDefined()
      expect(typeof editor.commands.strike()).toBe('boolean')
    })

    it('should have code command', () => {
      expect(editor.commands.code).toBeDefined()
      expect(typeof editor.commands.code()).toBe('boolean')
    })
  })

  describe('Block Formatting Commands', () => {
    it('should have paragraph command', () => {
      expect(editor.commands.paragraph).toBeDefined()
      expect(typeof editor.commands.paragraph()).toBe('boolean')
    })

    it('should have heading command', () => {
      expect(editor.commands.heading).toBeDefined()
      expect(typeof editor.commands.heading(1)).toBe('boolean')
    })

    it('should have blockquote command', () => {
      expect(editor.commands.blockquote).toBeDefined()
      expect(typeof editor.commands.blockquote()).toBe('boolean')
    })

    it('should have codeBlock command', () => {
      expect(editor.commands.codeBlock).toBeDefined()
      expect(typeof editor.commands.codeBlock()).toBe('boolean')
    })
  })

  describe('List Commands', () => {
    it('should have bulletList command', () => {
      expect(editor.commands.bulletList).toBeDefined()
      expect(typeof editor.commands.bulletList()).toBe('boolean')
    })

    it('should have orderedList command', () => {
      expect(editor.commands.orderedList).toBeDefined()
      expect(typeof editor.commands.orderedList()).toBe('boolean')
    })
  })

  describe('History Commands', () => {
    it('should have undo command', () => {
      expect(editor.commands.undo).toBeDefined()
    })

    it('should have redo command', () => {
      expect(editor.commands.redo).toBeDefined()
    })

    it('should undo content changes', () => {
      const originalContent = editor.getHTML()
      editor.setContent('<p>Changed content</p>')
      editor.commands.undo()
      const afterUndo = editor.getHTML()
      expect(afterUndo).toBe(originalContent)
    })
  })

  describe('Content Commands', () => {
    it('should clear content', () => {
      editor.commands.clearContent()
      expect(editor.isEmpty()).toBe(true)
    })

    it('should insert content', () => {
      const result = editor.commands.insertContent('New text')
      expect(typeof result).toBe('boolean')
    })

    it('should select all', () => {
      const result = editor.commands.selectAll()
      expect(typeof result).toBe('boolean')
    })
  })

  describe('Color Commands', () => {
    it('should set text color', () => {
      const result = editor.commands.textColor('#ff0000')
      expect(typeof result).toBe('boolean')
    })

    it('should set background color', () => {
      const result = editor.commands.backgroundColor('#ffff00')
      expect(typeof result).toBe('boolean')
    })

    it('should clear text color', () => {
      const result = editor.commands.textColor(null)
      expect(typeof result).toBe('boolean')
    })
  })

  describe('Font Commands', () => {
    it('should set font family', () => {
      const result = editor.commands.fontFamily('Arial')
      expect(typeof result).toBe('boolean')
    })

    it('should set font size', () => {
      const result = editor.commands.fontSize('16px')
      expect(typeof result).toBe('boolean')
    })

    it('should clear font family', () => {
      const result = editor.commands.fontFamily(null)
      expect(typeof result).toBe('boolean')
    })
  })
})
