<template>
  <div class="font-selector">
    <button
      :class="[
        'font-selector__trigger',
        { 'font-selector__trigger--active': isOpen },
      ]"
      @click="toggleSelector"
    >
      <span class="font-selector__current">{{ currentDisplayValue }}</span>
      <span class="font-selector__arrow">▼</span>
    </button>

    <div v-if="isOpen" class="font-selector__dropdown" @click.stop>
      <div
        v-for="option in options"
        :key="option.value"
        :class="[
          'font-selector__option',
          { 'font-selector__option--active': modelValue === option.value },
        ]"
        :style="
          type === 'family'
            ? { fontFamily: option.value }
            : { fontSize: option.value }
        "
        @click="selectOption(option.value)"
      >
        {{ option.label }}
      </div>

      <div
        v-if="showRemove"
        class="font-selector__remove"
        @click="removeSelection"
      >
        Remove {{ type === "family" ? "Font Family" : "Font Size" }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

interface FontOption {
  label: string;
  value: string;
}

// Props
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    type: "family" | "size";
    options?: FontOption[];
    placeholder?: string;
    showRemove?: boolean;
  }>(),
  {
    placeholder: "Select font",
    showRemove: true,
    options: () => [],
  },
);

// Default options
const defaultFamilyOptions: FontOption[] = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Helvetica", value: "Helvetica, sans-serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: "Courier New, monospace" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
  { label: "Impact", value: "Impact, sans-serif" },
];

const defaultSizeOptions: FontOption[] = [
  { label: "8px", value: "8px" },
  { label: "9px", value: "9px" },
  { label: "10px", value: "10px" },
  { label: "11px", value: "11px" },
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
  { label: "28px", value: "28px" },
  { label: "32px", value: "32px" },
  { label: "36px", value: "36px" },
  { label: "48px", value: "48px" },
  { label: "72px", value: "72px" },
];

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: string | null];
  change: [value: string | null];
}>();

// State
const isOpen = ref(false);

// Computed
const options = computed(() => {
  if (props.options.length > 0) return props.options;
  return props.type === "family" ? defaultFamilyOptions : defaultSizeOptions;
});

const currentDisplayValue = computed(() => {
  if (!props.modelValue) return props.placeholder;

  const option = options.value.find((opt) => opt.value === props.modelValue);
  return option ? option.label : props.modelValue;
});

// Methods
const toggleSelector = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (value: string) => {
  emit("update:modelValue", value);
  emit("change", value);
  isOpen.value = false;
};

const removeSelection = () => {
  emit("update:modelValue", null);
  emit("change", null);
  isOpen.value = false;
};

const closeSelector = (event: Event) => {
  if (!(event.target as Element)?.closest(".font-selector")) {
    isOpen.value = false;
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener("click", closeSelector);
});

onUnmounted(() => {
  document.removeEventListener("click", closeSelector);
});
</script>

<style scoped>
.font-selector {
  position: relative;
  display: inline-block;
}

.font-selector__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
  height: 32px;
  padding: 4px 12px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
  transition: all 0.15s ease;
}

.font-selector__trigger:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.font-selector__trigger--active {
  background: #dbeafe;
  border-color: #bfdbfe;
}

.font-selector__current {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font-selector__arrow {
  font-size: 10px;
  color: #6b7280;
}

.font-selector__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
}

.font-selector__option {
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  border-bottom: 1px solid #f3f4f6;
}

.font-selector__option:hover {
  background: #f9fafb;
}

.font-selector__option--active {
  background: #dbeafe;
  color: #1d4ed8;
}

.font-selector__option:last-child {
  border-bottom: none;
}

.font-selector__remove {
  padding: 8px 12px;
  border-top: 1px solid #e5e7eb;
  color: #ef4444;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s ease;
}

.font-selector__remove:hover {
  background: #fef2f2;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .font-selector__trigger {
    color: #d1d5db;
  }

  .font-selector__trigger:hover {
    background: #374151;
    border-color: #4b5563;
  }

  .font-selector__trigger--active {
    background: #1e40af;
    color: #dbeafe;
    border-color: #3b82f6;
  }

  .font-selector__dropdown {
    background: #1f2937;
    border-color: #374151;
  }

  .font-selector__option {
    color: #d1d5db;
    border-color: #374151;
  }

  .font-selector__option:hover {
    background: #374151;
  }

  .font-selector__option--active {
    background: #1e40af;
    color: #dbeafe;
  }

  .font-selector__remove {
    border-color: #374151;
    color: #f87171;
  }

  .font-selector__remove:hover {
    background: #7f1d1d;
  }
}
</style>
