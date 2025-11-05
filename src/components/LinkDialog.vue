<template>
  <div v-if="isOpen" class="link-dialog-overlay" @click.self="close">
    <div class="link-dialog">
      <div class="link-dialog__header">
        <h3 class="link-dialog__title">
          {{ isEditing ? "Edit Link" : "Insert Link" }}
        </h3>
        <button class="link-dialog__close" type="button" @click="close">
          ×
        </button>
      </div>

      <form class="link-dialog__form" @submit.prevent="handleSubmit">
        <div class="link-dialog__field">
          <label for="link-url" class="link-dialog__label"> URL * </label>
          <input
            id="link-url"
            ref="urlInput"
            v-model="form.url"
            type="url"
            class="link-dialog__input"
            :class="{ 'link-dialog__input--error': errors.url }"
            placeholder="https://example.com"
            required
          />
          <span v-if="errors.url" class="link-dialog__error">
            {{ errors.url }}
          </span>
        </div>

        <div class="link-dialog__field">
          <label for="link-text" class="link-dialog__label">
            Display Text
          </label>
          <input
            id="link-text"
            v-model="form.text"
            type="text"
            class="link-dialog__input"
            placeholder="Link text (optional)"
          />
          <span class="link-dialog__help">
            Leave empty to use the URL as display text
          </span>
        </div>

        <div class="link-dialog__field">
          <label for="link-title" class="link-dialog__label">
            Title (Tooltip)
          </label>
          <input
            id="link-title"
            v-model="form.title"
            type="text"
            class="link-dialog__input"
            placeholder="Link title (optional)"
          />
        </div>

        <div class="link-dialog__field">
          <label class="link-dialog__checkbox">
            <input
              v-model="form.openInNewTab"
              type="checkbox"
              class="link-dialog__checkbox-input"
            />
            <span class="link-dialog__checkbox-label"> Open in new tab </span>
          </label>
        </div>

        <div class="link-dialog__actions">
          <button
            type="button"
            class="link-dialog__button link-dialog__button--secondary"
            @click="close"
          >
            Cancel
          </button>

          <button
            v-if="isEditing"
            type="button"
            class="link-dialog__button link-dialog__button--danger"
            @click="handleRemove"
          >
            Remove Link
          </button>

          <button
            type="submit"
            class="link-dialog__button link-dialog__button--primary"
            :disabled="!form.url || !!errors.url"
          >
            {{ isEditing ? "Update Link" : "Insert Link" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from "vue";
import { normalizeUrl } from "@/plugins/LinkExtension";

interface LinkData {
  href?: string;
  title?: string;
  target?: string;
}

// Props
const props = defineProps<{
  isOpen: boolean;
  linkData?: LinkData | null;
  selectedText?: string;
}>();

// Emits
const emit = defineEmits<{
  close: [];
  insert: [
    data: { url: string; text?: string; title?: string; target?: string },
  ];
  update: [
    data: { url: string; text?: string; title?: string; target?: string },
  ];
  remove: [];
}>();

// Form state
const form = reactive({
  url: "",
  text: "",
  title: "",
  openInNewTab: false,
});

// Validation errors
const errors = reactive({
  url: "",
});

// Refs
const urlInput = ref<HTMLInputElement>();

// Computed
const isEditing = computed(() => !!props.linkData?.href);

// Validation
const validateUrl = (url: string): string => {
  if (!url.trim()) return "URL is required";

  // Check for basic URL patterns
  const urlPattern =
    /^(https?:\/\/)|(www\.)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,})|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;

  if (!urlPattern.test(url)) {
    return "Please enter a valid URL";
  }

  return "";
};

// Watch for URL changes to validate
watch(
  () => form.url,
  (newUrl) => {
    errors.url = validateUrl(newUrl);
  },
);

// Watch for dialog open/close
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      // Reset form
      if (props.linkData) {
        // Editing existing link
        form.url = props.linkData.href || "";
        form.title = props.linkData.title || "";
        form.openInNewTab = props.linkData.target === "_blank";
        form.text = props.selectedText || "";
      } else {
        // New link
        form.url = "";
        form.text = props.selectedText || "";
        form.title = "";
        form.openInNewTab = false;
      }

      // Clear errors
      errors.url = "";

      // Focus URL input
      nextTick(() => {
        urlInput.value?.focus();
        urlInput.value?.select();
      });
    }
  },
);

// Methods
const close = () => {
  emit("close");
};

const handleSubmit = () => {
  // Validate
  errors.url = validateUrl(form.url);
  if (errors.url) return;

  // Normalize URL
  const normalizedUrl = normalizeUrl(form.url);

  const linkData = {
    url: normalizedUrl,
    text: form.text || undefined,
    title: form.title || undefined,
    target: form.openInNewTab ? "_blank" : undefined,
  };

  if (isEditing.value) {
    emit("update", linkData);
  } else {
    emit("insert", linkData);
  }

  close();
};

const handleRemove = () => {
  emit("remove");
  close();
};
</script>

<style scoped>
.link-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.link-dialog {
  background: white;
  border-radius: 12px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 90vw;
  max-height: 80vh;
  overflow: hidden;
}

.link-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.link-dialog__title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.link-dialog__close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.15s ease;
}

.link-dialog__close:hover {
  color: #374151;
}

.link-dialog__form {
  padding: 0 24px 24px;
}

.link-dialog__field {
  margin-bottom: 20px;
}

.link-dialog__label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.link-dialog__input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.link-dialog__input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.link-dialog__input--error {
  border-color: #ef4444;
}

.link-dialog__input--error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.link-dialog__error {
  display: block;
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

.link-dialog__help {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.link-dialog__checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.link-dialog__checkbox-input {
  margin-right: 8px;
}

.link-dialog__checkbox-label {
  font-size: 14px;
  color: #374151;
}

.link-dialog__actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.link-dialog__button {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.link-dialog__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.link-dialog__button--primary {
  background: #3b82f6;
  color: white;
}

.link-dialog__button--primary:hover:not(:disabled) {
  background: #2563eb;
}

.link-dialog__button--secondary {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.link-dialog__button--secondary:hover {
  background: #e5e7eb;
}

.link-dialog__button--danger {
  background: #ef4444;
  color: white;
}

.link-dialog__button--danger:hover {
  background: #dc2626;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .link-dialog {
    background: #1f2937;
    color: #f9fafb;
  }

  .link-dialog__header {
    border-color: #374151;
  }

  .link-dialog__title {
    color: #f9fafb;
  }

  .link-dialog__close {
    color: #9ca3af;
  }

  .link-dialog__close:hover {
    color: #d1d5db;
  }

  .link-dialog__label {
    color: #d1d5db;
  }

  .link-dialog__input {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .link-dialog__input:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
  }

  .link-dialog__help {
    color: #9ca3af;
  }

  .link-dialog__checkbox-label {
    color: #d1d5db;
  }

  .link-dialog__actions {
    border-color: #374151;
  }

  .link-dialog__button--secondary {
    background: #374151;
    color: #d1d5db;
    border-color: #4b5563;
  }

  .link-dialog__button--secondary:hover {
    background: #4b5563;
  }
}
</style>
