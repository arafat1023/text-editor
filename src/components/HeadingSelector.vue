<template>
  <div class="heading-selector">
    <button
      :class="[
        'heading-selector__trigger',
        { 'heading-selector__trigger--active': isOpen }
      ]"
      @click="toggleSelector"
    >
      <span class="heading-selector__current">{{ currentDisplayValue }}</span>
      <span class="heading-selector__arrow">▼</span>
    </button>

    <div
      v-if="isOpen"
      class="heading-selector__dropdown"
      @click.stop
    >
      <div
        v-for="option in headingOptions"
        :key="option.value ?? 'paragraph'"
        :class="[
          'heading-selector__option',
          { 'heading-selector__option--active': modelValue === option.value }
        ]"
        :style="{ fontSize: option.fontSize, fontWeight: option.fontWeight }"
        @click="selectOption(option.value)"
      >
        {{ option.label }}
      </div>

      <div
        v-if="showRemove && modelValue"
        class="heading-selector__remove"
        @click="removeSelection"
      >
        Remove Heading
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface HeadingOption {
  label: string
  value: number | null
  fontSize: string
  fontWeight: string
}

// Props
const props = withDefaults(defineProps<{
  modelValue?: number | null
  placeholder?: string
  showRemove?: boolean
}>(), {
  placeholder: 'Paragraph',
  showRemove: true
})

// Heading options with visual styling
const headingOptions: HeadingOption[] = [
  { label: 'Paragraph', value: null, fontSize: '14px', fontWeight: 'normal' },
  { label: 'Heading 1', value: 1, fontSize: '32px', fontWeight: 'bold' },
  { label: 'Heading 2', value: 2, fontSize: '24px', fontWeight: 'bold' },
  { label: 'Heading 3', value: 3, fontSize: '20px', fontWeight: 'bold' },
  { label: 'Heading 4', value: 4, fontSize: '18px', fontWeight: 'bold' },
  { label: 'Heading 5', value: 5, fontSize: '16px', fontWeight: 'bold' },
  { label: 'Heading 6', value: 6, fontSize: '14px', fontWeight: 'bold' }
]

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  'change': [value: number | null]
}>()

// State
const isOpen = ref(false)

// Computed
const currentDisplayValue = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) {
    return props.placeholder
  }

  const option = headingOptions.find(opt => opt.value === props.modelValue)
  return option ? option.label : `Heading ${props.modelValue}`
})

// Methods
const toggleSelector = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (value: number | null) => {
  emit('update:modelValue', value)
  emit('change', value)
  isOpen.value = false
}

const removeSelection = () => {
  emit('update:modelValue', null)
  emit('change', null)
  isOpen.value = false
}

const closeSelector = (event: Event) => {
  if (!((event.target as Element)?.closest('.heading-selector'))) {
    isOpen.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', closeSelector)
})

onUnmounted(() => {
  document.removeEventListener('click', closeSelector)
})
</script>

<style scoped>
.heading-selector {
  position: relative;
  display: inline-block;
}

.heading-selector__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
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

.heading-selector__trigger:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.heading-selector__trigger--active {
  background: #dbeafe;
  border-color: #bfdbfe;
}

.heading-selector__current {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.heading-selector__arrow {
  font-size: 10px;
  color: #6b7280;
}

.heading-selector__dropdown {
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

.heading-selector__option {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  border-bottom: 1px solid #f3f4f6;
  line-height: 1.2;
}

.heading-selector__option:hover {
  background: #f9fafb;
}

.heading-selector__option--active {
  background: #dbeafe;
  color: #1d4ed8;
}

.heading-selector__option:last-child {
  border-bottom: none;
}

.heading-selector__remove {
  padding: 8px 12px;
  border-top: 1px solid #e5e7eb;
  color: #ef4444;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s ease;
}

.heading-selector__remove:hover {
  background: #fef2f2;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .heading-selector__trigger {
    color: #d1d5db;
  }

  .heading-selector__trigger:hover {
    background: #374151;
    border-color: #4b5563;
  }

  .heading-selector__trigger--active {
    background: #1e40af;
    color: #dbeafe;
    border-color: #3b82f6;
  }

  .heading-selector__dropdown {
    background: #1f2937;
    border-color: #374151;
  }

  .heading-selector__option {
    color: #d1d5db;
    border-color: #374151;
  }

  .heading-selector__option:hover {
    background: #374151;
  }

  .heading-selector__option--active {
    background: #1e40af;
    color: #dbeafe;
  }

  .heading-selector__remove {
    border-color: #374151;
    color: #f87171;
  }

  .heading-selector__remove:hover {
    background: #7f1d1d;
  }
}
</style>