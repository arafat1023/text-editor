import { ref, computed, onMounted, onUnmounted } from "vue";
import { Editor } from "@/core/Editor";
import type {
  EditorOptions,
  EditorInstance,
  UseTextEditorReturn,
} from "@/types";

export function useTextEditor(
  options: EditorOptions = {},
): UseTextEditorReturn {
  const editor = ref<EditorInstance | null>(null);
  const isReady = ref(false);
  const isFocused = ref(false);

  // Reactive state
  const isEmpty = computed(() => {
    if (!editor.value || !isReady.value) return true;
    return editor.value.isEmpty();
  });

  const isEditable = computed(() => {
    if (!editor.value || !isReady.value) return false;
    return editor.value.isEditable();
  });

  const canUndo = computed(() => {
    if (!editor.value || !isReady.value) return false;
    try {
      return (editor.value.can().undo() as any) || false;
    } catch {
      return false;
    }
  });

  const canRedo = computed(() => {
    if (!editor.value || !isReady.value) return false;
    try {
      return (editor.value.can().redo() as any) || false;
    } catch {
      return false;
    }
  });

  const wordCount = computed(() => {
    if (!editor.value || !isReady.value) return 0;
    const text = editor.value.getText();
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  });

  const characterCount = computed(() => {
    if (!editor.value || !isReady.value) return 0;
    return editor.value.getText().length;
  });

  // Create editor instance
  const createEditor = () => {
    const editorOptions: EditorOptions = {
      ...options,
      onCreate: ({ editor: editorInstance }) => {
        isReady.value = true;
        if (options.onCreate) {
          options.onCreate({ editor: editorInstance });
        }
      },
      onFocus: ({ editor: editorInstance, event }) => {
        isFocused.value = true;
        if (options.onFocus) {
          options.onFocus({ editor: editorInstance, event });
        }
      },
      onBlur: ({ editor: editorInstance, event }) => {
        isFocused.value = false;
        if (options.onBlur) {
          options.onBlur({ editor: editorInstance, event });
        }
      },
      onDestroy: () => {
        isReady.value = false;
        isFocused.value = false;
        if (options.onDestroy) {
          options.onDestroy();
        }
      },
    };

    editor.value = new Editor(editorOptions) as unknown as EditorInstance;
  };

  // Destroy editor
  const destroyEditor = () => {
    if (editor.value) {
      editor.value.destroy();
      editor.value = null;
    }
  };

  // Mount editor to DOM element
  const mount = (element: HTMLElement) => {
    if (editor.value) {
      editor.value.mount(element);
    }
  };

  // Helper methods
  const getHTML = () => editor.value?.getHTML() || "";
  const getJSON = () => editor.value?.getJSON() || {};
  const getText = () => editor.value?.getText() || "";
  const setContent = (content: string, emitUpdate = true) => {
    editor.value?.setContent(content, emitUpdate);
  };
  const clearContent = () => editor.value?.commands.clearContent();
  const focus = (position?: number | "start" | "end") =>
    editor.value?.focus(position);
  const blur = () => editor.value?.blur();

  // Command shortcuts
  const commands = computed(() => editor.value?.commands || {});
  const can = computed(() => editor.value?.can() || {});
  const chain = computed(() => editor.value?.chain() || {});

  // Auto-create editor on mount
  onMounted(() => {
    createEditor();
  });

  // Auto-destroy editor on unmount
  onUnmounted(() => {
    destroyEditor();
  });

  return {
    // Core
    // @ts-expect-error vue-tsc false positive - Editor class implements EditorInstance
    editor,
    isReady,
    isFocused,
    isEmpty,
    isEditable,
    canUndo,
    canRedo,
    wordCount,
    characterCount,

    // Methods
    mount,
    createEditor,
    destroyEditor,
    getHTML,
    getJSON,
    getText,
    setContent,
    clearContent,
    focus,
    blur,

    // Commands
    commands,
    can,
    chain,
  };
}
