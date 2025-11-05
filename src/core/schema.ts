import { Schema, MarkSpec, NodeSpec } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { tableNodes } from "prosemirror-tables";

// Extended mark specifications
const marks: { [name: string]: MarkSpec } = {
  // Basic marks
  strong: {
    parseDOM: [
      { tag: "strong" },
      {
        tag: "b",
        getAttrs: (node: any) => node.style.fontWeight !== "normal" && null,
      },
      {
        style: "font-weight",
        getAttrs: (value: any) =>
          /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
      },
    ],
    toDOM() {
      return ["strong", 0];
    },
  },

  em: {
    parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
    toDOM() {
      return ["em", 0];
    },
  },

  code: {
    parseDOM: [{ tag: "code" }],
    toDOM() {
      return ["code", { class: "inline-code" }, 0];
    },
  },

  // New marks
  underline: {
    parseDOM: [{ tag: "u" }, { style: "text-decoration=underline" }],
    toDOM() {
      return ["u", 0];
    },
  },

  strikethrough: {
    parseDOM: [
      { tag: "s" },
      { tag: "strike" },
      { tag: "del" },
      { style: "text-decoration=line-through" },
    ],
    toDOM() {
      return ["s", 0];
    },
  },

  superscript: {
    parseDOM: [{ tag: "sup" }, { style: "vertical-align=super" }],
    toDOM() {
      return ["sup", 0];
    },
  },

  subscript: {
    parseDOM: [{ tag: "sub" }, { style: "vertical-align=sub" }],
    toDOM() {
      return ["sub", 0];
    },
  },

  textColor: {
    attrs: { color: { default: null } },
    parseDOM: [
      {
        style: "color",
        getAttrs: (value: any) => ({ color: value }),
      },
    ],
    toDOM(mark) {
      const { color } = mark.attrs;
      return ["span", { style: `color: ${color}` }, 0];
    },
  },

  backgroundColor: {
    attrs: { color: { default: null } },
    parseDOM: [
      {
        style: "background-color",
        getAttrs: (value: any) => ({ color: value }),
      },
      {
        tag: "mark",
        getAttrs: (node: any) => ({
          color: node.style.backgroundColor || "#ffff00",
        }),
      },
    ],
    toDOM(mark) {
      const { color } = mark.attrs;
      return ["span", { style: `background-color: ${color}` }, 0];
    },
  },

  fontFamily: {
    attrs: { family: { default: null } },
    parseDOM: [
      {
        style: "font-family",
        getAttrs: (value: any) => ({ family: value }),
      },
    ],
    toDOM(mark) {
      const { family } = mark.attrs;
      return ["span", { style: `font-family: ${family}` }, 0];
    },
  },

  fontSize: {
    attrs: { size: { default: null } },
    parseDOM: [
      {
        style: "font-size",
        getAttrs: (value: any) => ({ size: value }),
      },
    ],
    toDOM(mark) {
      const { size } = mark.attrs;
      return ["span", { style: `font-size: ${size}` }, 0];
    },
  },

  link: {
    attrs: {
      href: { default: null },
      title: { default: null },
      target: { default: null },
    },
    inclusive: false,
    parseDOM: [
      {
        tag: "a[href]",
        getAttrs: (dom: any) => ({
          href: dom.getAttribute("href"),
          title: dom.getAttribute("title"),
          target: dom.getAttribute("target"),
        }),
      },
    ],
    toDOM(mark) {
      const { href, title, target } = mark.attrs;
      const attrs: any = { href };
      if (title) attrs.title = title;
      if (target) attrs.target = target;
      return ["a", attrs, 0];
    },
  },
};

// Enhanced nodes
const baseNodes = addListNodes(
  basicSchema.spec.nodes,
  "paragraph block*",
  "block",
);

// Convert to regular object
const nodes: { [name: string]: NodeSpec } = {};

// Copy base nodes
Object.keys(baseNodes.toObject()).forEach((key) => {
  nodes[key] = baseNodes.get(key)!;
});

// Add table nodes from prosemirror-tables
const tableNodeSpecs = tableNodes({
  tableGroup: "block",
  cellContent: "block+",
  cellAttributes: {
    background: {
      default: null,
      getFromDOM(dom: any) {
        return dom.style.backgroundColor || null;
      },
      setDOMAttr(value: any, attrs: any) {
        if (value)
          attrs.style = (attrs.style || "") + `background-color: ${value};`;
      },
    },
  },
});

Object.keys(tableNodeSpecs).forEach((key) => {
  nodes[key] = (tableNodeSpecs as any)[key];
});

// Update paragraph node to support text alignment
nodes.paragraph = {
  attrs: {
    textAlign: { default: null },
  },
  content: "inline*",
  group: "block",
  parseDOM: [
    {
      tag: "p",
      getAttrs: (dom: any) => ({
        textAlign: dom.style.textAlign || null,
      }),
    },
  ],
  toDOM(node) {
    const { textAlign } = node.attrs;
    const attrs: any = {};
    if (textAlign) {
      attrs.style = `text-align: ${textAlign}`;
    }
    return ["p", attrs, 0];
  },
};

// Add enhanced nodes
nodes.heading = {
  attrs: {
    level: { default: 1 },
    textAlign: { default: null },
  },
  content: "inline*",
  group: "block",
  defining: true,
  parseDOM: [
    {
      tag: "h1",
      attrs: { level: 1 },
      getAttrs: (dom: any) => ({
        level: 1,
        textAlign: dom.style.textAlign || null,
      }),
    },
    {
      tag: "h2",
      attrs: { level: 2 },
      getAttrs: (dom: any) => ({
        level: 2,
        textAlign: dom.style.textAlign || null,
      }),
    },
    {
      tag: "h3",
      attrs: { level: 3 },
      getAttrs: (dom: any) => ({
        level: 3,
        textAlign: dom.style.textAlign || null,
      }),
    },
    {
      tag: "h4",
      attrs: { level: 4 },
      getAttrs: (dom: any) => ({
        level: 4,
        textAlign: dom.style.textAlign || null,
      }),
    },
    {
      tag: "h5",
      attrs: { level: 5 },
      getAttrs: (dom: any) => ({
        level: 5,
        textAlign: dom.style.textAlign || null,
      }),
    },
    {
      tag: "h6",
      attrs: { level: 6 },
      getAttrs: (dom: any) => ({
        level: 6,
        textAlign: dom.style.textAlign || null,
      }),
    },
  ],
  toDOM(node) {
    const { level, textAlign } = node.attrs;
    const attrs: any = {};
    if (textAlign) {
      attrs.style = `text-align: ${textAlign}`;
    }
    return [`h${level}`, attrs, 0];
  },
};

nodes.blockquote = {
  content: "block+",
  group: "block",
  defining: true,
  parseDOM: [{ tag: "blockquote" }],
  toDOM() {
    return ["blockquote", 0];
  },
};

nodes.code_block = {
  attrs: { language: { default: null } },
  content: "text*",
  marks: "",
  group: "block",
  code: true,
  defining: true,
  parseDOM: [
    {
      tag: "pre",
      preserveWhitespace: "full",
      getAttrs: (node: any) => ({
        language: node.getAttribute("data-language") || null,
      }),
    },
  ],
  toDOM(node) {
    const attrs: any = {};
    if (node.attrs.language) {
      attrs["data-language"] = node.attrs.language;
    }
    return ["pre", attrs, ["code", 0]];
  },
};

nodes.horizontal_rule = {
  group: "block",
  parseDOM: [{ tag: "hr" }],
  toDOM() {
    return ["hr"];
  },
};

nodes.image = {
  inline: false,
  attrs: {
    src: { default: "" },
    alt: { default: "" },
    title: { default: null },
    width: { default: null },
    height: { default: null },
    alignment: { default: "center" },
  },
  group: "block",
  selectable: true,
  draggable: true,
  parseDOM: [
    {
      tag: "img[src]",
      getAttrs: (dom: any) => ({
        src: dom.getAttribute("src"),
        alt: dom.getAttribute("alt") || "",
        title: dom.getAttribute("title"),
        width: dom.getAttribute("width")
          ? parseInt(dom.getAttribute("width"))
          : null,
        height: dom.getAttribute("height")
          ? parseInt(dom.getAttribute("height"))
          : null,
        alignment: dom.getAttribute("data-alignment") || "center",
      }),
    },
    {
      tag: "div.image-wrapper img[src]",
      getAttrs: (dom: any) => {
        const img = dom.tagName === "IMG" ? dom : dom.querySelector("img");
        const wrapper = img.closest(".image-wrapper");
        return {
          src: img.getAttribute("src"),
          alt: img.getAttribute("alt") || "",
          title: img.getAttribute("title"),
          width: img.getAttribute("width")
            ? parseInt(img.getAttribute("width"))
            : null,
          height: img.getAttribute("height")
            ? parseInt(img.getAttribute("height"))
            : null,
          alignment: wrapper?.classList.contains("image-left")
            ? "left"
            : wrapper?.classList.contains("image-right")
              ? "right"
              : "center",
        };
      },
    },
  ],
  toDOM(node) {
    const { src, alt, title, width, height, alignment } = node.attrs;
    const imgAttrs: any = {
      src,
      alt,
      "data-alignment": alignment,
    };
    if (title) imgAttrs.title = title;
    if (width) imgAttrs.width = width;
    if (height) imgAttrs.height = height;

    return [
      "div",
      { class: `image-wrapper image-${alignment}` },
      ["img", imgAttrs],
    ];
  },
};

// Create the comprehensive schema
export const editorSchema = new Schema({
  nodes,
  marks,
});

// Export individual mark and node types for extensions
export { marks, nodes };
