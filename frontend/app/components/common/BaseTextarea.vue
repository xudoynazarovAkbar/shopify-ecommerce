<script setup lang="ts">
defineProps<{
  modelValue: string;
  id: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}>();

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="space-y-1 w-full text-left">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-textSecondary transition-colors"
    >
      {{ label }} <span v-if="required" class="text-rose-500">*</span>
    </label>
    <textarea
      :id="id"
      :rows="rows || 3"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      class="w-full px-4 py-2.5 border rounded-lg text-sm bg-cardBg text-textPrimary placeholder-textMuted/70 focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:bg-appBg"
      :class="
        error
          ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
          : 'border-appBorder focus:ring-brand focus:border-brand'
      "
      @input="
        $emit(
          'update:modelValue',
          ($event.target as HTMLTextAreaElement).value,
        )
      "
    />
    <p v-if="error" class="text-xs text-rose-500 mt-1">{{ error }}</p>
  </div>
</template>
