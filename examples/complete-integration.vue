<template>
  <div class="demo-container">
    <header class="demo-header">
      <h1>Complete Text Editor Integration</h1>
      <p class="demo-description">
        This demo showcases all implemented features: rich text formatting,
        links, images, tables, text alignment, and clipboard operations.
      </p>
    </header>

    <div class="demo-content">
      <div class="editor-section">
        <h2>Rich Text Editor</h2>
        <p class="feature-info">
          <strong>Features included:</strong> Text formatting, colors, fonts,
          links, images, tables, text alignment, lists, clipboard operations,
          and more.
        </p>

        <TextEditor
          v-model="editorContent"
          :show-toolbar="true"
          :show-status-bar="true"
          :toolbar-items="customToolbarItems"
          placeholder="Start typing your content here... Try all the features!"
          class="demo-editor"
        />
      </div>

      <div class="info-section">
        <div class="feature-grid">
          <div class="feature-card">
            <h3>🎨 Text Formatting</h3>
            <ul>
              <li>Bold, Italic, Underline, Strikethrough</li>
              <li>Text & Background Colors</li>
              <li>Font Family & Size</li>
              <li>Superscript, Subscript, Code</li>
            </ul>
          </div>

          <div class="feature-card">
            <h3>🔗 Links & Media</h3>
            <ul>
              <li>Insert/Edit Links (Ctrl+K)</li>
              <li>Auto-link detection</li>
              <li>Image upload with drag & drop</li>
              <li>Image resizing & alignment</li>
            </ul>
          </div>

          <div class="feature-card">
            <h3>📊 Tables</h3>
            <ul>
              <li>Insert tables with customizable dimensions</li>
              <li>Add/Delete columns and rows</li>
              <li>Merge and split cells</li>
              <li>Toggle header rows and columns</li>
              <li>Delete entire tables</li>
              <li>Column resizing support</li>
            </ul>
          </div>

          <div class="feature-card">
            <h3>⚡ Text Alignment</h3>
            <ul>
              <li>Align Left, Center, Right</li>
              <li>Justify text alignment</li>
              <li>Apply to paragraphs and headings</li>
              <li>Keyboard shortcuts support</li>
            </ul>
          </div>

          <div class="feature-card">
            <h3>📋 Clipboard Operations</h3>
            <ul>
              <li>Copy (Ctrl+C) / Cut (Ctrl+X)</li>
              <li>Paste (Ctrl+V)</li>
              <li>Paste as Plain Text (Ctrl+Shift+V)</li>
              <li>Right-click context menu</li>
            </ul>
          </div>

          <div class="feature-card">
            <h3>📝 Document Structure</h3>
            <ul>
              <li>Headings (H1-H6)</li>
              <li>Blockquotes & Code blocks</li>
              <li>Bullet & Numbered lists</li>
              <li>Horizontal rules</li>
            </ul>
          </div>
        </div>

        <div class="testing-guide">
          <h3>🧪 Testing Guide</h3>
          <div class="test-categories">
            <div class="test-category">
              <h4>Text Formatting</h4>
              <ol>
                <li>Select text and try formatting buttons</li>
                <li>Change text colors and background</li>
                <li>Try different fonts and sizes</li>
              </ol>
            </div>

            <div class="test-category">
              <h4>Links</h4>
              <ol>
                <li>Press Ctrl+K to insert a link</li>
                <li>Type a URL and watch auto-detection</li>
                <li>Edit existing links by clicking them</li>
              </ol>
            </div>

            <div class="test-category">
              <h4>Images</h4>
              <ol>
                <li>Click 🖼️ image button in toolbar</li>
                <li>
                  Enter an image URL (try: https://via.placeholder.com/300x200)
                </li>
                <li>Optionally provide alt text</li>
                <li>Image will be inserted into the editor</li>
              </ol>
            </div>

            <div class="test-category">
              <h4>Tables</h4>
              <ol>
                <li>Click Insert Table button</li>
                <li>Add/delete rows and columns</li>
                <li>Select cells and merge them</li>
                <li>Toggle header rows/columns</li>
              </ol>
            </div>

            <div class="test-category">
              <h4>Text Alignment</h4>
              <ol>
                <li>Select text and try alignment buttons</li>
                <li>Use on headings and paragraphs</li>
                <li>Try justify alignment for longer text</li>
              </ol>
            </div>

            <div class="test-category">
              <h4>Clipboard</h4>
              <ol>
                <li>Select text and use toolbar buttons</li>
                <li>Right-click for context menu</li>
                <li>Try Ctrl+Shift+V for plain text paste</li>
              </ol>
            </div>
          </div>
        </div>

        <div class="content-preview">
          <h3>📄 Current Content</h3>
          <details>
            <summary>View HTML Source</summary>
            <pre class="content-display">{{ editorContent }}</pre>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { TextEditor } from "../src";
import type { ToolbarItem } from "../src/types";

// Editor content with sample data showcasing all features
const editorContent = ref(`
<h1>Welcome to the Complete Text Editor</h1>

<p>This editor includes <strong>all implemented features</strong> from our development phases:</p>

<h2>Phase 1: Core Text Formatting ✨</h2>
<p>Basic formatting like <strong>bold</strong>, <em>italic</em>, <u>underline</u>, and <s>strikethrough</s>.</p>
<p>Advanced formatting: <sup>superscript</sup>, <sub>subscript</sub>, and <code>inline code</code>.</p>

<h2>Phase 2: Advanced Styling 🎨</h2>
<p style="color: #e74c3c;">Colored text</p>
<p style="background-color: #f1c40f;">Highlighted backgrounds</p>
<p style="font-family: 'Courier New', monospace;">Different font families</p>

<h2>Phase 3: Links & Media Integration 🔗</h2>
<p>Check out this link: <a href="https://example.com">Example Website</a></p>
<p>Auto-detected URLs: https://github.com/user/repo</p>

<div class="image-wrapper image-center">
  <img src="https://via.placeholder.com/400x200/3b82f6/ffffff?text=Sample+Image" alt="Sample placeholder image" title="Click the image button in toolbar to add your own!" data-alignment="center" width="400" height="200">
</div>
<p style="text-align: center;"><em>Click the 🖼️ button in the toolbar to add your own images!</em></p>

<blockquote>
  <p>This is a blockquote demonstrating the quote formatting feature.</p>
</blockquote>

<h3>Lists Support</h3>
<ul>
  <li>Bullet point one</li>
  <li>Bullet point two</li>
  <li>Bullet point three</li>
</ul>

<ol>
  <li>Numbered item one</li>
  <li>Numbered item two</li>
  <li>Numbered item three</li>
</ol>

<h3>Code Blocks</h3>
<pre><code>function example() {
  console.log("Code block formatting");
  return true;
}</code></pre>

<hr>

<h2>Phase 4: Tables & Advanced Features 📊</h2>
<table>
  <tr>
    <th>Feature</th>
    <th>Status</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>Tables</td>
    <td>✅ Complete</td>
    <td>Full table support with merge/split cells</td>
  </tr>
  <tr>
    <td>Text Alignment</td>
    <td>✅ Complete</td>
    <td>Left, center, right, justify alignment</td>
  </tr>
  <tr>
    <td>Image Upload</td>
    <td>✅ Complete</td>
    <td>Drag & drop with resize capabilities</td>
  </tr>
</table>

<h3 style="text-align: center;">Text Alignment Examples</h3>
<p style="text-align: left;">This paragraph is left-aligned (default).</p>
<p style="text-align: center;">This paragraph is center-aligned.</p>
<p style="text-align: right;">This paragraph is right-aligned.</p>
<p style="text-align: justify;">This paragraph is justified. It demonstrates how justify alignment works by spreading text evenly across the line width, which is especially noticeable in longer paragraphs with multiple lines of text.</p>

<h2>Phase 5: Clipboard Operations 📋</h2>
<p><strong>Try these clipboard features:</strong></p>
<ul>
  <li>Select text and use toolbar buttons (Copy, Cut, Paste)</li>
  <li>Right-click for context menu access</li>
  <li>Use keyboard shortcuts: Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+Shift+V</li>
  <li>Paste as plain text to remove formatting</li>
</ul>

<p style="text-align: center;">🎉 <strong>All features are now integrated and ready for testing!</strong></p>
`);

// Complete toolbar configuration with all features
const customToolbarItems = ref<ToolbarItem[]>([
  // Text formatting group
  {
    type: "group",
    items: [
      {
        type: "button",
        name: "bold",
        icon: "bold",
        title: "Bold (Ctrl+B)",
        command: "bold",
      },
      {
        type: "button",
        name: "italic",
        icon: "italic",
        title: "Italic (Ctrl+I)",
        command: "italic",
      },
      {
        type: "button",
        name: "underline",
        icon: "underline",
        title: "Underline (Ctrl+U)",
        command: "underline",
      },
      {
        type: "button",
        name: "strike",
        icon: "strike",
        title: "Strikethrough",
        command: "strike",
      },
    ],
  },
  { type: "separator" },

  // Color formatting
  { type: "color", title: "Text Color", command: "textColor" },
  { type: "color", title: "Highlight Color", command: "backgroundColor" },
  { type: "separator" },

  // Font formatting
  {
    type: "font",
    title: "Font Family",
    command: "fontFamily",
    fontType: "family",
  },
  { type: "font", title: "Font Size", command: "fontSize", fontType: "size" },
  { type: "separator" },

  // Script formatting
  {
    type: "group",
    items: [
      {
        type: "button",
        name: "superscript",
        icon: "superscript",
        title: "Superscript",
        command: "superscript",
      },
      {
        type: "button",
        name: "subscript",
        icon: "subscript",
        title: "Subscript",
        command: "subscript",
      },
      {
        type: "button",
        name: "code",
        icon: "code",
        title: "Inline Code (Ctrl+E)",
        command: "code",
      },
    ],
  },
  { type: "separator" },

  // Links & Media
  {
    type: "link",
    name: "link",
    icon: "link",
    title: "Insert/Edit Link (Ctrl+K)",
    command: "toggleLink",
  },
  {
    type: "button",
    name: "image",
    icon: "🖼️",
    title: "Insert Image (Ctrl+Shift+I)",
    command: "insertImageWithPrompt",
  },
  { type: "separator" },

  // Tables
  {
    type: "group",
    items: [
      {
        type: "button",
        name: "insertTable",
        icon: "⊞",
        title: "Insert Table",
        command: "insertTable",
      },
      {
        type: "button",
        name: "addColumnBefore",
        icon: "⊲",
        title: "Add Column Before",
        command: "addColumnBefore",
      },
      {
        type: "button",
        name: "addColumnAfter",
        icon: "⊳",
        title: "Add Column After",
        command: "addColumnAfter",
      },
      {
        type: "button",
        name: "deleteColumn",
        icon: "⊘",
        title: "Delete Column",
        command: "deleteColumn",
      },
      {
        type: "button",
        name: "addRowBefore",
        icon: "⊤",
        title: "Add Row Before",
        command: "addRowBefore",
      },
      {
        type: "button",
        name: "addRowAfter",
        icon: "⊥",
        title: "Add Row After",
        command: "addRowAfter",
      },
      {
        type: "button",
        name: "deleteRow",
        icon: "⊖",
        title: "Delete Row",
        command: "deleteRow",
      },
      {
        type: "button",
        name: "mergeCells",
        icon: "⋈",
        title: "Merge Cells",
        command: "mergeCells",
      },
      {
        type: "button",
        name: "splitCell",
        icon: "⊟",
        title: "Split Cell",
        command: "splitCell",
      },
      {
        type: "button",
        name: "toggleHeaderColumn",
        icon: "⊤",
        title: "Toggle Header Column",
        command: "toggleHeaderColumn",
      },
      {
        type: "button",
        name: "toggleHeaderRow",
        icon: "⊤",
        title: "Toggle Header Row",
        command: "toggleHeaderRow",
      },
      {
        type: "button",
        name: "deleteTable",
        icon: "🗑️",
        title: "Delete Table",
        command: "deleteTable",
      },
    ],
  },
  { type: "separator" },

  // Text Alignment
  {
    type: "group",
    items: [
      {
        type: "button",
        name: "alignLeft",
        icon: "⌊",
        title: "Align Left",
        command: "alignLeft",
      },
      {
        type: "button",
        name: "alignCenter",
        icon: "⌊⌋",
        title: "Align Center",
        command: "alignCenter",
      },
      {
        type: "button",
        name: "alignRight",
        icon: "⌋",
        title: "Align Right",
        command: "alignRight",
      },
      {
        type: "button",
        name: "alignJustify",
        icon: "≡",
        title: "Align Justify",
        command: "alignJustify",
      },
    ],
  },
  { type: "separator" },

  // Block formatting
  { type: "heading", title: "Heading", command: "setHeading" },
  {
    type: "button",
    name: "blockquote",
    icon: "blockquote",
    title: "Blockquote",
    command: "toggleBlockquote",
  },
  {
    type: "button",
    name: "codeBlock",
    icon: "code-block",
    title: "Code Block",
    command: "toggleCodeBlock",
  },
  {
    type: "button",
    name: "horizontalRule",
    icon: "hr",
    title: "Insert Divider",
    command: "insertHorizontalRule",
  },
  { type: "separator" },

  // Lists
  {
    type: "button",
    name: "bulletList",
    icon: "list-ul",
    title: "Bullet List",
    command: "bulletList",
  },
  {
    type: "button",
    name: "orderedList",
    icon: "list-ol",
    title: "Ordered List",
    command: "orderedList",
  },
  { type: "separator" },

  // History
  {
    type: "button",
    name: "undo",
    icon: "undo",
    title: "Undo (Ctrl+Z)",
    command: "undo",
  },
  {
    type: "button",
    name: "redo",
    icon: "redo",
    title: "Redo (Ctrl+Y)",
    command: "redo",
  },
  { type: "separator" },

  // Clipboard
  {
    type: "group",
    items: [
      {
        type: "button",
        name: "copy",
        icon: "copy",
        title: "Copy (Ctrl+C)",
        command: "copy",
      },
      {
        type: "button",
        name: "cut",
        icon: "cut",
        title: "Cut (Ctrl+X)",
        command: "cut",
      },
      {
        type: "button",
        name: "paste",
        icon: "paste",
        title: "Paste (Ctrl+V)",
        command: "paste",
      },
      {
        type: "button",
        name: "pasteAsText",
        icon: "paste-text",
        title: "Paste as Plain Text (Ctrl+Shift+V)",
        command: "pasteAsPlainText",
      },
    ],
  },
]);
</script>

<style scoped>
.demo-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.demo-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}

.demo-header h1 {
  color: #1f2937;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.demo-description {
  color: #6b7280;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

.demo-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: start;
}

.editor-section h2 {
  color: #1f2937;
  margin-bottom: 10px;
}

.feature-info {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #3b82f6;
}

.demo-editor {
  min-height: 500px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.feature-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.feature-card h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #1f2937;
  font-size: 1.1rem;
}

.feature-card ul {
  margin: 0;
  padding-left: 20px;
}

.feature-card li {
  margin-bottom: 5px;
  color: #4b5563;
  font-size: 0.9rem;
}

.testing-guide {
  background: #f0f9ff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #0ea5e9;
}

.testing-guide h3 {
  margin-top: 0;
  color: #0c4a6e;
}

.test-categories {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.test-category h4 {
  color: #0369a1;
  margin-bottom: 8px;
}

.test-category ol {
  margin: 0;
  padding-left: 20px;
}

.test-category li {
  margin-bottom: 4px;
  font-size: 0.9rem;
  color: #1e40af;
}

.content-preview {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

.content-preview h3 {
  margin-top: 0;
  color: #374151;
}

.content-display {
  background: #1f2937;
  color: #f9fafb;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 10px 0 0 0;
}

/* Responsive design */
@media (max-width: 1024px) {
  .demo-content {
    grid-template-columns: 1fr;
  }

  .test-categories {
    grid-template-columns: 1fr;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .demo-container {
    background: #111827;
    color: #f9fafb;
  }

  .demo-header h1 {
    color: #f9fafb;
  }

  .demo-description {
    color: #d1d5db;
  }

  .feature-info {
    background: #1f2937;
    color: #e5e7eb;
    border-left-color: #60a5fa;
  }

  .feature-card {
    background: #1f2937;
    border-color: #374151;
  }

  .feature-card h3 {
    color: #f9fafb;
  }

  .feature-card li {
    color: #d1d5db;
  }

  .testing-guide {
    background: #1e3a8a;
    border-color: #3b82f6;
  }

  .testing-guide h3 {
    color: #bfdbfe;
  }

  .test-category h4 {
    color: #93c5fd;
  }

  .test-category li {
    color: #dbeafe;
  }

  .content-preview {
    background: #1f2937;
    border-color: #4b5563;
  }

  .content-preview h3 {
    color: #e5e7eb;
  }
}

/* Image display styles */
.image-wrapper {
  margin: 16px 0;
  text-align: center;
}

.image-wrapper.image-left {
  text-align: left;
}

.image-wrapper.image-right {
  text-align: right;
}

.image-wrapper.image-center {
  text-align: center;
}

.image-wrapper img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
