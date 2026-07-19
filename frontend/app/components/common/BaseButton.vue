<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    disabled?: boolean;
    loading?: boolean;
  }>(),
  {
    type: 'button',
    variant: 'primary',
    disabled: false,
    loading: false,
  },
);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="w-full font-semibold py-3 px-4 rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="{
      'bg-brand hover:bg-brandHover text-brandText shadow-sm':
        variant === 'primary',
      'bg-appBg hover:bg-cardBg/80 text-textPrimary border border-appBorder':
        variant === 'secondary',
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm':
        variant === 'danger',
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm':
        variant === 'success',
    }"
  >
    <slot v-if="!loading" />
    <span v-else class="flex items-center gap-2">
      <svg
        class="animate-spin h-5 w-5 text-current"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span>Loading...</span>
    </span>
  </button>
</template>
