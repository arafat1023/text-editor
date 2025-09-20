<template>
  <div style="padding: 20px;">
    <h1>Clipboard Functionality Test</h1>
    <p>This example demonstrates the clipboard functionality including toolbar buttons and context menu.</p>

    <div style="margin-bottom: 20px;">
      <h3>Instructions:</h3>
      <ol>
        <li>Type some text in the editor below</li>
        <li>Select some text and try the clipboard buttons in the toolbar</li>
        <li>Right-click on selected text to see the context menu</li>
        <li>Test keyboard shortcuts: Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+Shift+V</li>
      </ol>
    </div>

    <TextEditor
      v-model="content"
      :show-toolbar="true"
      :show-status-bar="true"
      placeholder="Type your text here to test clipboard functionality..."
      style="min-height: 300px;"
    />

    <div style="margin-top: 20px;">
      <h3>Current Content:</h3>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">{{ content }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TextEditor } from '../src'

const content = ref(`
<h2>Welcome to the Clipboard Test</h2>
<p>This editor now includes comprehensive clipboard functionality:</p>
<ul>
  <li><strong>Copy (Ctrl+C):</strong> Copy selected text</li>
  <li><strong>Cut (Ctrl+X):</strong> Cut selected text</li>
  <li><strong>Paste (Ctrl+V):</strong> Paste with formatting</li>
  <li><strong>Paste as Plain Text (Ctrl+Shift+V):</strong> Paste without formatting</li>
</ul>
<p>Try selecting this text and using the clipboard buttons in the toolbar or right-click for the context menu!</p>
`)
</script>
</template>