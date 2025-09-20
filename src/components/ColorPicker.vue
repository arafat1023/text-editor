<template>
  <div class="color-picker">
    <button
      :class="[
        'color-picker__trigger',
        { 'color-picker__trigger--active': isOpen }
      ]"
      :title="title"
      @click="togglePicker"
    >
      <span class="color-picker__icon">A</span>
      <span
        class="color-picker__color-bar"
        :style="{ backgroundColor: currentColor }"
      ></span>
      <span class="color-picker__arrow">▼</span>
    </button>

    <div
      v-if="isOpen"
      class="color-picker__dropdown"
      @click.stop
    >
      <div class="color-picker__preset-colors">
        <button
          v-for="color in presetColors"
          :key="color"
          :class="[
            'color-picker__color-option',
            { 'color-picker__color-option--active': currentColor === color }
          ]"
          :style="{ backgroundColor: color }"
          :title="color"
          @click="selectColor(color)"
        ></button>
      </div>

      <div class="color-picker__actions">
        <button
          class="color-picker__remove"
          @click="removeColor"
        >
          Remove Color
        </button>

        <input
          v-model="customColor"
          type="color"
          class="color-picker__custom"
          @change="selectColor(customColor)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props
const props = withDefaults(defineProps<{
  modelValue?: string
  title?: string
  presetColors?: string[]
}>(), {
  title: 'Text Color',
  presetColors: () => [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#808080', '#ffa500',
    '#800080', '#008000', '#000080', '#800000', '#808000'
  ]
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [color: string | null]
  'change': [color: string | null]
}>()

// State
const isOpen = ref(false)
const customColor = ref('#000000')

// Computed
const currentColor = computed(() => props.modelValue || '#000000')

// Methods
const togglePicker = () => {
  isOpen.value = !isOpen.value
}

const selectColor = (color: string) => {
  emit('update:modelValue', color)
  emit('change', color)
  isOpen.value = false
}

const removeColor = () => {
  emit('update:modelValue', null)
  emit('change', null)
  isOpen.value = false
}

const closePicker = (event: Event) => {
  if (!((event.target as Element)?.closest('.color-picker'))) {
    isOpen.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', closePicker)
})

onUnmounted(() => {
  document.removeEventListener('click', closePicker)
})
</script>

<style scoped>
.color-picker {
  position: relative;
  display: inline-block;
}

.color-picker__trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 40px;
  height: 32px;
  padding: 4px 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s ease;
}

.color-picker__trigger:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.color-picker__trigger--active {
  background: #dbeafe;
  border-color: #bfdbfe;
}

.color-picker__icon {
  font-weight: bold;
  font-size: 16px;
}

.color-picker__color-bar {
  width: 12px;
  height: 3px;
  border-radius: 1px;
  border: 1px solid #e5e7eb;
}

.color-picker__arrow {
  font-size: 10px;
  color: #6b7280;
}

.color-picker__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  min-width: 200px;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
}

.color-picker__preset-colors {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  margin-bottom: 12px;
}

.color-picker__color-option {
  width: 24px;
  height: 24px;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.color-picker__color-option:hover {
  border-color: #9ca3af;
  transform: scale(1.1);
}

.color-picker__color-option--active {
  border-color: #3b82f6;
  transform: scale(1.1);
}

.color-picker__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.color-picker__remove {
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: white;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.color-picker__remove:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.color-picker__custom {
  width: 32px;
  height: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .color-picker__trigger {
    color: #d1d5db;
  }

  .color-picker__trigger:hover {
    background: #374151;
    border-color: #4b5563;
  }

  .color-picker__trigger--active {
    background: #1e40af;
    color: #dbeafe;
    border-color: #3b82f6;
  }

  .color-picker__dropdown {
    background: #1f2937;
    border-color: #374151;
  }

  .color-picker__actions {
    border-color: #374151;
  }

  .color-picker__remove {
    background: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }

  .color-picker__remove:hover {
    background: #4b5563;
  }

  .color-picker__custom {
    border-color: #4b5563;
  }
}
</style>