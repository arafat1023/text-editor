import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Editor } from "../src/core/Editor";
import type { EditorInstance } from "../src/types";

describe("Editor", () => {
  let editor: EditorInstance;

  beforeEach(() => {
    editor = new Editor({
      content: "<p>Hello World</p>",
      editable: true,
    });
  });

  afterEach(() => {
    if (editor) {
      editor.destroy();
    }
  });

  describe("Constructor", () => {
    it("should create an editor instance", () => {
      expect(editor).toBeDefined();
      expect(editor.view).toBeDefined();
      expect(editor.state).toBeDefined();
      expect(editor.schema).toBeDefined();
    });

    it("should have commands available", () => {
      expect(editor.commands).toBeDefined();
      expect(typeof editor.commands.bold).toBe("function");
      expect(typeof editor.commands.italic).toBe("function");
    });
  });

  describe("Content Methods", () => {
    it("should get HTML content", () => {
      const html = editor.getHTML();
      expect(html).toContain("Hello World");
    });

    it("should get JSON content", () => {
      const json = editor.getJSON();
      expect(json).toBeDefined();
      expect(json.type).toBe("doc");
    });

    it("should get text content", () => {
      const text = editor.getText();
      expect(text).toContain("Hello World");
    });

    it("should set content", () => {
      editor.setContent("<p>New Content</p>");
      const html = editor.getHTML();
      expect(html).toContain("New Content");
    });

    it("should check if editor is empty", () => {
      expect(editor.isEmpty()).toBe(false);

      editor.setContent("");
      expect(editor.isEmpty()).toBe(true);
    });
  });

  describe("Commands", () => {
    it("should execute bold command", () => {
      const result = editor.commands.bold();
      expect(typeof result).toBe("boolean");
    });

    it("should execute italic command", () => {
      const result = editor.commands.italic();
      expect(typeof result).toBe("boolean");
    });

    it("should execute undo command", () => {
      const result = editor.commands.undo();
      expect(typeof result).toBe("boolean");
    });

    it("should execute redo command", () => {
      const result = editor.commands.redo();
      expect(typeof result).toBe("boolean");
    });

    it("should clear content", () => {
      editor.commands.clearContent();
      expect(editor.isEmpty()).toBe(true);
    });
  });

  describe("State Methods", () => {
    it("should check if editable", () => {
      expect(editor.isEditable()).toBe(true);
    });

    it("should check if empty", () => {
      expect(editor.isEmpty()).toBe(false);
    });

    it("should get selection", () => {
      const selection = editor.getSelection();
      expect(selection).toBeDefined();
      expect(typeof selection.from).toBe("number");
      expect(typeof selection.to).toBe("number");
    });
  });

  describe("Chain Commands", () => {
    it("should create a command chain", () => {
      const chain = editor.chain();
      expect(chain).toBeDefined();
      expect(typeof chain.run).toBe("function");
    });

    it("should create a can chain", () => {
      const can = editor.can();
      expect(can).toBeDefined();
    });
  });

  describe("Lifecycle", () => {
    it("should mount to an element", () => {
      const element = document.createElement("div");
      editor.mount(element);
      expect(editor.view.dom).toBeDefined();
    });

    it("should destroy properly", () => {
      editor.destroy();
      expect(() => editor.getHTML()).toThrow();
    });
  });
});
