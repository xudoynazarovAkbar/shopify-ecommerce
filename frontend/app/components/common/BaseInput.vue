<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string | number;
    id: string;
    type?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    rightIcon?: string;
    rightIconClickable?: boolean;
  }>(),
  {
    type: 'text',
    label: undefined,
    placeholder: undefined,
    required: false,
    disabled: false,
    error: undefined,
    rightIcon: undefined,
    rightIconClickable: true,
  },
);

defineEmits(['update:modelValue', 'click:right']);
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
    <div class="relative w-full">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="w-full px-4 py-2.5 border rounded-lg text-sm bg-cardBg text-textPrimary placeholder-textMuted/70 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors disabled:opacity-50 disabled:bg-appBg"
        :class="[
          error
            ? 'border-rose-500 focus:ring-rose-500/20'
            : 'border-appBorder focus:ring-brand/20 focus:border-brand',
          (rightIcon || $slots.right) ? 'pr-11' : '',
        ]"
        @input="
          $emit(
            'update:modelValue',
            ($event.target as HTMLInputElement).value,
          )
        "
      >
      <div
        v-if="rightIcon || $slots.right"
        class="absolute inset-y-0 right-0 flex items-center pr-3"
      >
        <slot name="right">
          <button
            v-if="rightIcon"
            :type="rightIconClickable ? 'button' : undefined"
            :disabled="disabled"
            class="text-textMuted transition-colors focus:outline-none flex items-center justify-center"
            :class="{
              'hover:text-textPrimary cursor-pointer': rightIconClickable,
              'cursor-default': !rightIconClickable,
            }"
            @click="rightIconClickable && $emit('click:right')"
          >
            <Icon :name="rightIcon" class="w-5 h-5 shrink-0" />
          </button>
        </slot>
      </div>
      <p
        v-if="error"
        class="absolute left-0 text-xs text-rose-500 font-medium"
        style="top: calc(100% + 4px);"
      >
        {{ error }}
      </p>
    </div>
  </div>
</template>
