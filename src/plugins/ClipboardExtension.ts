import type { Extension } from "@/types";
import { EditorView } from "prosemirror-view";
import { Slice, Fragment } from "prosemirror-model";
import { Plugin, PluginKey, AllSelection } from "prosemirror-state";

export interface ClipboardOptions {
  enableRichPaste: boolean;
  enablePlainTextPaste: boolean;
  enableCustomShortcuts: boolean;
}

const defaultOptions: ClipboardOptions = {
  enableRichPaste: true,
  enablePlainTextPaste: true,
  enableCustomShortcuts: true,
};

export const ClipboardExtension: Extension = {
  name: "clipboard",
  type: "extension",

  addOptions() {
    return defaultOptions;
  },

  addKeyboardShortcuts() {
    return {
      "Mod-c": () => true,
      "Mod-x": () => true,
      "Mod-v": () => true,
      "Mod-Shift-v": () => true,
      "Mod-a": () => true,
    };
  },

  addCommands() {
    return {
      copy:
        () =>
        ({ view, state }) => {
          if (!view || !state || state.selection.empty) return false;
          try {
            copyToClipboard(view, state.selection);
            return true;
          } catch (error) {
            console.warn("Copy operation failed:", error);
            return false;
          }
        },
      cut:
        () =>
        ({ view, state, dispatch }) => {
          if (!view || !state || state.selection.empty) return false;
          try {
            copyToClipboard(view, state.selection);
            if (dispatch && state) {
              dispatch(state.tr.deleteSelection());
            }
            return true;
          } catch (error) {
            console.warn("Cut operation failed:", error);
            return false;
          }
        },
      paste:
        () =>
        ({ view }) => {
          if (!view) return false;
          try {
            handlePaste(view, false).catch((err) =>
              console.warn("Paste operation failed:", err),
            );
            return true;
          } catch (error) {
            console.warn("Paste operation failed:", error);
            return false;
          }
        },
      pasteAsPlainText:
        () =>
        ({ view }) => {
          if (!view) return false;
          try {
            handlePaste(view, true).catch((err) =>
              console.warn("Paste as plain text failed:", err),
            );
            return true;
          } catch (error) {
            console.warn("Paste as plain text failed:", error);
            return false;
          }
        },
      selectAll:
        () =>
        ({ state, dispatch }) => {
          if (dispatch && state) {
            const { tr } = state;
            const allSelection = new AllSelection(tr.doc);
            dispatch(tr.setSelection(allSelection));
          }
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    return [createClipboardPlugin()];
  },
};

async function copyToClipboard(view: EditorView, selection: any) {
  try {
    const { from, to } = selection;
    const selectedContent = view.state.doc.slice(from, to);

    // Get text content
    const textContent = selectedContent.content.textBetween(
      0,
      selectedContent.content.size,
      "\n",
    );

    // Get HTML representation
    let htmlContent = "";
    try {
      const { DOMSerializer } = await import("prosemirror-model");
      const serializer = DOMSerializer.fromSchema(view.state.schema);
      const fragment = serializer.serializeFragment(selectedContent.content);
      const div = document.createElement("div");
      div.appendChild(fragment);
      htmlContent = div.innerHTML;
    } catch (err) {
      console.warn("Failed to serialize HTML content:", err);
    }

    // Use modern Clipboard API if available
    if (navigator.clipboard && window.ClipboardItem) {
      const items: Record<string, Blob> = {
        "text/plain": new Blob([textContent], { type: "text/plain" }),
      };

      if (htmlContent) {
        items["text/html"] = new Blob([htmlContent], { type: "text/html" });
      }

      await navigator.clipboard.write([new ClipboardItem(items)]);
    } else {
      // Fallback to legacy clipboard API
      await navigator.clipboard.writeText(textContent);
    }
  } catch (error) {
    console.warn("Failed to copy to clipboard:", error);
  }
}

async function handlePaste(
  view: EditorView,
  asPlainText: boolean = false,
): Promise<boolean> {
  try {
    if (!navigator.clipboard) {
      // Fallback: Let the browser handle it naturally
      return false;
    }

    const clipboardData = await navigator.clipboard.read();

    for (const item of clipboardData) {
      if (asPlainText && item.types.includes("text/plain")) {
        const text = await (await item.getType("text/plain")).text();
        return insertPlainText(view, text);
      } else if (!asPlainText && item.types.includes("text/html")) {
        const html = await (await item.getType("text/html")).text();
        return insertHTML(view, html);
      } else if (item.types.includes("text/plain")) {
        const text = await (await item.getType("text/plain")).text();
        return insertPlainText(view, text);
      }
    }

    return false;
  } catch (error) {
    console.warn("Paste operation failed:", error);
    return false;
  }
}

function insertPlainText(view: EditorView, text: string): boolean {
  try {
    const { state, dispatch } = view;
    // const { selection } = state // Will be used for paste logic

    // Create a text node
    const textNode = state.schema.text(text);
    const slice = new Slice(Fragment.from(textNode), 0, 0);

    // Insert the text
    const tr = state.tr.replaceSelection(slice);
    dispatch(tr);

    return true;
  } catch (error) {
    console.warn("Failed to insert plain text:", error);
    return false;
  }
}

function insertHTML(view: EditorView, html: string): boolean {
  try {
    const { state, dispatch } = view;

    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Parse HTML with ProseMirror
    const { DOMParser } = require("prosemirror-model");
    const parser = DOMParser.fromSchema(state.schema);

    const doc = parser.parse(tempDiv);
    const slice = doc.slice(0, doc.content.size);

    // Insert the content
    const tr = state.tr.replaceSelection(slice);
    dispatch(tr);

    return true;
  } catch (error) {
    console.warn("Failed to insert HTML:", error);
    // Fallback to plain text
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return insertPlainText(view, tempDiv.textContent || "");
  }
}

function createClipboardPlugin() {
  return new Plugin({
    key: new PluginKey("clipboard"),

    props: {
      handleDOMEvents: {
        paste: (_view: EditorView, _event: ClipboardEvent) => {
          // Let the browser handle paste naturally for most cases
          // Our custom commands will be used when called explicitly
          return false;
        },

        copy: (view: EditorView, _event: ClipboardEvent) => {
          // Enhanced copy handling
          if (!view.state.selection.empty) {
            copyToClipboard(view, view.state.selection);
          }
          return false; // Let browser handle too
        },

        cut: (view: EditorView, _event: ClipboardEvent) => {
          // Enhanced cut handling
          if (!view.state.selection.empty) {
            copyToClipboard(view, view.state.selection);
          }
          return false; // Let browser handle the actual cut
        },
      },
    },
  });
}

export default ClipboardExtension;
