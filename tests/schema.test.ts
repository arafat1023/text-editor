import { describe, it, expect } from 'vitest'
import { editorSchema, marks, nodes } from '../src/core/schema'

describe('Editor Schema', () => {
  it('should have a valid schema', () => {
    expect(editorSchema).toBeDefined()
    expect(editorSchema.nodes).toBeDefined()
    expect(editorSchema.marks).toBeDefined()
  })

  describe('Marks', () => {
    it('should have strong mark', () => {
      expect(marks.strong).toBeDefined()
      expect(marks.strong.toDOM).toBeDefined()
    })

    it('should have em mark', () => {
      expect(marks.em).toBeDefined()
    })

    it('should have code mark', () => {
      expect(marks.code).toBeDefined()
    })

    it('should have underline mark', () => {
      expect(marks.underline).toBeDefined()
    })

    it('should have strikethrough mark', () => {
      expect(marks.strikethrough).toBeDefined()
    })

    it('should have superscript mark', () => {
      expect(marks.superscript).toBeDefined()
    })

    it('should have subscript mark', () => {
      expect(marks.subscript).toBeDefined()
    })

    it('should have textColor mark with attributes', () => {
      expect(marks.textColor).toBeDefined()
      expect(marks.textColor.attrs).toBeDefined()
      expect(marks.textColor.attrs.color).toBeDefined()
    })

    it('should have backgroundColor mark', () => {
      expect(marks.backgroundColor).toBeDefined()
      expect(marks.backgroundColor.attrs).toBeDefined()
    })

    it('should have fontFamily mark', () => {
      expect(marks.fontFamily).toBeDefined()
      expect(marks.fontFamily.attrs).toBeDefined()
    })

    it('should have fontSize mark', () => {
      expect(marks.fontSize).toBeDefined()
      expect(marks.fontSize.attrs).toBeDefined()
    })

    it('should have link mark', () => {
      expect(marks.link).toBeDefined()
      expect(marks.link.attrs).toBeDefined()
      expect(marks.link.attrs.href).toBeDefined()
    })
  })

  describe('Nodes', () => {
    it('should have doc node', () => {
      expect(nodes.doc).toBeDefined()
    })

    it('should have paragraph node', () => {
      expect(nodes.paragraph).toBeDefined()
      expect(nodes.paragraph.attrs).toBeDefined()
      expect(nodes.paragraph.attrs.textAlign).toBeDefined()
    })

    it('should have heading node', () => {
      expect(nodes.heading).toBeDefined()
      expect(nodes.heading.attrs).toBeDefined()
      expect(nodes.heading.attrs.level).toBeDefined()
    })

    it('should have blockquote node', () => {
      expect(nodes.blockquote).toBeDefined()
    })

    it('should have code_block node', () => {
      expect(nodes.code_block).toBeDefined()
    })

    it('should have horizontal_rule node', () => {
      expect(nodes.horizontal_rule).toBeDefined()
    })

    it('should have image node', () => {
      expect(nodes.image).toBeDefined()
      expect(nodes.image.attrs).toBeDefined()
      expect(nodes.image.attrs.src).toBeDefined()
    })

    it('should have list nodes', () => {
      expect(nodes.bullet_list).toBeDefined()
      expect(nodes.ordered_list).toBeDefined()
      expect(nodes.list_item).toBeDefined()
    })

    it('should have table nodes', () => {
      expect(nodes.table).toBeDefined()
      expect(nodes.table_row).toBeDefined()
      expect(nodes.table_cell).toBeDefined()
      expect(nodes.table_header).toBeDefined()
    })
  })

  describe('Schema Integration', () => {
    it('should have all marks in schema', () => {
      expect(editorSchema.marks.strong).toBeDefined()
      expect(editorSchema.marks.em).toBeDefined()
      expect(editorSchema.marks.code).toBeDefined()
      expect(editorSchema.marks.underline).toBeDefined()
      expect(editorSchema.marks.link).toBeDefined()
    })

    it('should have all nodes in schema', () => {
      expect(editorSchema.nodes.doc).toBeDefined()
      expect(editorSchema.nodes.paragraph).toBeDefined()
      expect(editorSchema.nodes.heading).toBeDefined()
      expect(editorSchema.nodes.blockquote).toBeDefined()
      expect(editorSchema.nodes.image).toBeDefined()
    })
  })
})
