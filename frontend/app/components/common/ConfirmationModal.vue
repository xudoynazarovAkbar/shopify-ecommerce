<script setup lang="ts">
import { onUnmounted, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    show: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'primary' | 'danger' | 'warning' | 'success';
    loading?: boolean;
  }>(),
  {
    title: '',
    confirmText: '',
    cancelText: '',
    variant: 'danger',
    loading: false,
  }
);

const emit = defineEmits<{
  (e: 'close' | 'confirm'): void;
}>();

const handleCancel = () => {
  if (props.loading) return;
  emit('close');
};

const handleConfirm = () => {
  if (props.loading) return;
  emit('confirm');
};

// Keyboard accessibility: Close on Escape key press
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.show) {
    handleCancel();
  }
};

watch(
  () => props.show,
  (isShown) => {
    if (isShown) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  document.body.style.overflow = '';
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition duration-300"
      @click.self="handleCancel"
    >
      <div
        class="relative bg-cardBg rounded-2xl border border-appBorder shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition duration-300 flex flex-col animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <!-- Modal Content Header / Icon -->
        <div class="p-6 pb-0 flex items-start gap-4">
          <!-- Icon depending on variant -->
          <div
            class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
            :class="{
              'bg-rose-500/10 text-rose-600 dark:text-rose-400': variant === 'danger',
              'bg-amber-500/10 text-amber-600 dark:text-amber-400': variant === 'warning',
              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': variant === 'success',
              'bg-brand/10 text-brand': variant === 'primary',
            }"
          >
            <Icon
              v-if="variant === 'danger'"
              name="heroicons:exclamation-triangle"
              class="w-6 h-6"
            />
            <Icon
              v-else-if="variant === 'warning'"
              name="heroicons:exclamation-circle"
              class="w-6 h-6"
            />
            <Icon
              v-else-if="variant === 'success'"
              name="heroicons:check-circle"
              class="w-6 h-6"
            />
            <Icon
              v-else
              name="heroicons:information-circle"
              class="w-6 h-6"
            />
          </div>

          <!-- Text Details -->
          <div class="flex-1 space-y-1.5">
            <h3 class="font-black text-textPrimary text-lg leading-6">
              {{ title || $t('common.confirm') }}
            </h3>
            <p class="text-sm text-textSecondary leading-relaxed">
              {{ message }}
            </p>
          </div>
        </div>

        <!-- Action Buttons Footer -->
        <div class="px-6 py-4 mt-6 bg-appBg/50 border-t border-appBorder flex items-center justify-end gap-3">
          <button
            type="button"
            :disabled="loading"
            class="px-4 py-2 text-sm font-bold text-textSecondary hover:text-textPrimary rounded-xl transition hover:bg-appBg disabled:opacity-50 disabled:pointer-events-none"
            @click="handleCancel"
          >
            {{ cancelText || $t('common.cancel') }}
          </button>
          
          <button
            type="button"
            :disabled="loading"
            class="px-5 py-2 font-bold rounded-xl text-sm transition shadow-sm hover:shadow active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
            :class="{
              'bg-rose-600 hover:bg-rose-700 text-white': variant === 'danger',
              'bg-amber-500 hover:bg-amber-600 text-white': variant === 'warning',
              'bg-emerald-600 hover:bg-emerald-700 text-white': variant === 'success',
              'bg-brand hover:bg-brandHover text-brandText': variant === 'primary',
            }"
            @click="handleConfirm"
          >
            <Icon v-if="loading" name="svg-spinners:ring-resize" class="w-4 h-4 animate-spin" />
            <Icon v-else-if="variant === 'danger'" name="heroicons:trash" class="w-4 h-4" />
            <Icon v-else name="heroicons:check" class="w-4 h-4" />
            {{ confirmText || (variant === 'danger' ? $t('common.delete') : $t('common.confirm')) }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
