<template>
  <div class="demo">
    <h1>Vue Text Editor Demo</h1>

    <div class="demo-section">
      <h2>Basic Usage</h2>
      <TextEditor
        v-model="content"
        :options="editorOptions"
        @create="onEditorCreate"
        @update="onEditorUpdate"
      />
    </div>

    <div class="demo-section">
      <h2>Using Composable</h2>
      <div ref="composableEditorRef" class="composable-editor"></div>
      <div class="controls">
        <button @click="composableCommands.bold">Bold</button>
        <button @click="composableCommands.italic">Italic</button>
        <button @click="composableCommands.undo">Undo</button>
        <button @click="composableCommands.redo">Redo</button>
        <button @click="getComposableContent">Get Content</button>
      </div>
    </div>

    <div class="demo-section">
      <h2>Output</h2>
      <pre>{{ content }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { TextEditor, useTextEditor, FormattingExtensions } from "../src";

// Basic editor with component
const content = ref(
  "<p>Hello <strong>world</strong>! This is a <em>rich text editor</em> for Vue 3.</p>",
);

const editorOptions = {
  placeholder: "Start typing...",
  extensions: FormattingExtensions,
};

const onEditorCreate = ({ editor }: any) => {
  console.log("Editor created:", editor);
};

const onEditorUpdate = ({ editor }: any) => {
  console.log("Editor updated:", editor.getHTML());
};

// Composable editor
const composableEditorRef = ref<HTMLElement>();
const {
  editor: composableEditor,
  isReady,
  mount,
  commands: composableCommands,
  getHTML: getComposableHTML,
} = useTextEditor({
  content:
    "<p>This editor uses the <strong>useTextEditor</strong> composable!</p>",
  extensions: FormattingExtensions,
});

const getComposableContent = () => {
  const html = getComposableHTML();
  console.log("Composable editor content:", html);
  alert(html);
};

onMounted(() => {
  if (composableEditorRef.value && composableEditor.value) {
    mount(composableEditorRef.value);
  }
});
</script>

<style scoped>
.demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.demo-section {
  margin: 2rem 0;
}

.demo-section h2 {
  margin-bottom: 1rem;
  color: #1f2937;
}

.composable-editor {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  min-height: 200px;
  margin-bottom: 1rem;
}

.controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.controls button {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.15s ease;
}

.controls button:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.4;
}
</style>
