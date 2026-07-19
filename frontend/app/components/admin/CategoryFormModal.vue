<script setup lang="ts">
import type { Category } from '../../types';

const props = defineProps<{
  show: boolean;
  category: Category | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: { name: string; description?: string; icon?: string }): void;
}>();

const name = ref('');
const description = ref('');
const icon = ref('');
const isSubmitting = ref(false);
const formError = ref<string | null>(null);

// Watch for category pre-population
watch(
  () => props.category,
  (newCat) => {
    if (newCat) {
      name.value = newCat.name;
      description.value = newCat.description || '';
      icon.value = newCat.icon || '';
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

const resetForm = () => {
  name.value = '';
  description.value = '';
  icon.value = '';
  formError.value = null;
};

const handleCancel = () => {
  resetForm();
  emit('close');
};

const handleSubmit = async () => {
  formError.value = null;

  if (!name.value.trim()) {
    formError.value = useNuxtApp().$i18n.t('admin.errors.categoryNameRequired');
    return;
  }

  isSubmitting.value = true;
  try {
    emit('submit', {
      name: name.value.trim(),
      description: description.value.trim() || undefined,
      icon: icon.value.trim() || undefined,
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition"
  >
    <div
      class="relative bg-cardBg rounded-2xl border border-appBorder shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition duration-300 flex flex-col"
    >
      <!-- Modal Header -->
      <div class="px-6 py-5 border-b border-appBorder flex items-center justify-between">
        <h3 class="font-black text-textPrimary text-lg">
          {{ category ? $t('admin.editCategory') : $t('admin.addCategory') }}
        </h3>
        <button
          class="p-1 rounded-lg text-textMuted hover:text-textPrimary hover:bg-appBg/80 transition"
          @click="handleCancel"
        >
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body Form -->
      <div class="p-6 space-y-5 flex-1">
        <!-- Error alert -->
        <div
          v-if="formError"
          class="bg-rose-500/10 border border-rose-500/25 p-3 rounded-lg text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-1.5 animate-pulse"
        >
          <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
          {{ formError }}
        </div>

        <!-- Name Input -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-textPrimary uppercase tracking-wider block">
            {{ $t('admin.categoryName') }} *
          </label>
          <input
            v-model="name"
            type="text"
            class="w-full bg-appBg text-textPrimary border border-appBorder rounded-xl p-3 text-sm placeholder:text-textMuted/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
            :placeholder="$t('admin.categoryNamePlaceholder')"
            maxlength="40"
          >
        </div>

        <!-- Icon Input -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-textPrimary uppercase tracking-wider block">
            {{ $t('admin.iconTag') }} ({{ $t('vendor.optional') }})
          </label>
          <input
            v-model="icon"
            type="text"
            class="w-full bg-appBg text-textPrimary border border-appBorder rounded-xl p-3 text-sm placeholder:text-textMuted/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
            placeholder="heroicons:shopping-cart"
          >
          <span class="text-[10px] text-textMuted block mt-1">
            {{ $t('admin.iconHelp') }}
          </span>
        </div>

        <!-- Description Textarea -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-textPrimary uppercase tracking-wider block">
            {{ $t('vendor.description') }} ({{ $t('vendor.optional') }})
          </label>
          <textarea
            v-model="description"
            rows="3"
            class="w-full bg-appBg text-textPrimary border border-appBorder rounded-xl p-3 text-sm placeholder:text-textMuted/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
            :placeholder="$t('admin.categoryDescPlaceholder')"
            maxlength="150"
          />
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4 bg-appBg/50 border-t border-appBorder flex items-center justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 text-sm font-bold text-textSecondary hover:text-textPrimary rounded-xl transition hover:bg-appBg"
          @click="handleCancel"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          type="button"
          :disabled="isSubmitting"
          class="px-5 py-2 bg-brand hover:bg-brandHover text-white font-bold rounded-xl text-sm transition shadow-sm hover:shadow active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
          @click="handleSubmit"
        >
          <Icon v-if="isSubmitting" name="svg-spinners:ring-resize" class="w-4 h-4" />
          <Icon v-else name="heroicons:document-plus" class="w-4 h-4" />
          {{ category ? $t('vendor.saveChanges') : $t('admin.createCategory') }}
        </button>
      </div>
    </div>
  </div>
</template>
