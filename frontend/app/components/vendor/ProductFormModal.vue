<script setup lang="ts">
import { useApi } from '../../composables/useApi';
import type { Product, Category } from '../../types';

const props = defineProps<{
  show: boolean;
  product: Product | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: { categoryId: string; name: string; description?: string; price: number; image?: string }): void;
}>();

const api = useApi();
const categories = ref<Category[]>([]);
const categoriesLoading = ref(false);

const name = ref('');
const description = ref('');
const price = ref<number | ''>('');
const image = ref('');
const categoryId = ref('');
const isSubmitting = ref(false);
const formError = ref<string | null>(null);

const resetForm = () => {
  name.value = '';
  description.value = '';
  price.value = '';
  image.value = '';
  categoryId.value = '';
  formError.value = null;
};

// Watch for product changes to pre-populate (for Edit Mode)
watch(
  () => props.product,
  (newProduct) => {
    if (newProduct) {
      name.value = newProduct.name;
      description.value = newProduct.description || '';
      price.value = newProduct.price;
      image.value = newProduct.image || '';
      categoryId.value = newProduct.categoryId;
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

// Fetch categories on mount
onMounted(async () => {
  categoriesLoading.value = true;
  try {
    const res = await api.get<Category[]>('/categories');
    categories.value = res || [];
  } catch (err: unknown) {
    console.error('Failed to load categories in modal:', err);
  } finally {
    categoriesLoading.value = false;
  }
});

const handleCancel = () => {
  resetForm();
  emit('close');
};

const handleSubmit = async () => {
  formError.value = null;

  if (!name.value.trim()) {
    formError.value = useNuxtApp().$i18n.t('vendor.errors.nameRequired');
    return;
  }
  if (!categoryId.value) {
    formError.value = useNuxtApp().$i18n.t('vendor.errors.categoryRequired');
    return;
  }
  if (price.value === '' || isNaN(Number(price.value)) || Number(price.value) <= 0) {
    formError.value = useNuxtApp().$i18n.t('vendor.errors.pricePositive');
    return;
  }

  isSubmitting.value = true;
  try {
    emit('submit', {
      name: name.value.trim(),
      description: description.value.trim() || undefined,
      price: Number(price.value),
      image: image.value.trim() || undefined,
      categoryId: categoryId.value,
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
      class="relative bg-cardBg rounded-2xl border border-appBorder shadow-2xl w-full max-w-lg overflow-hidden transform scale-100 transition duration-300 flex flex-col"
    >
      <!-- Modal Header -->
      <div class="px-6 py-5 border-b border-appBorder flex items-center justify-between">
        <h3 class="font-black text-textPrimary text-lg">
          {{ product ? $t('vendor.editProduct') : $t('vendor.addProduct') }}
        </h3>
        <button
          class="p-1 rounded-lg text-textMuted hover:text-textPrimary hover:bg-appBg/80 transition"
          @click="handleCancel"
        >
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body Form -->
      <div class="p-6 space-y-5 flex-1 max-h-[70vh] overflow-y-auto">
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
            {{ $t('vendor.productName') }} *
          </label>
          <input
            v-model="name"
            type="text"
            class="w-full bg-appBg text-textPrimary border border-appBorder rounded-xl p-3 text-sm placeholder:text-textMuted/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
            :placeholder="$t('vendor.productNamePlaceholder')"
            maxlength="100"
          >
        </div>

        <!-- Category Dropdown -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-textPrimary uppercase tracking-wider block">
            {{ $t('vendor.category') }} *
          </label>
          <select
            v-model="categoryId"
            class="w-full bg-appBg text-textPrimary border border-appBorder rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
            :disabled="categoriesLoading"
          >
            <option value="" disabled>{{ $t('vendor.selectCategory') }}</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Price Input -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-textPrimary uppercase tracking-wider block">
            {{ $t('vendor.price') }} ($) *
          </label>
          <input
            v-model="price"
            type="number"
            step="0.01"
            min="0.01"
            class="w-full bg-appBg text-textPrimary border border-appBorder rounded-xl p-3 text-sm placeholder:text-textMuted/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
            placeholder="9.99"
          >
        </div>

        <!-- Image URL Input -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-textPrimary uppercase tracking-wider block">
            {{ $t('vendor.imageUrl') }} ({{ $t('vendor.optional') }})
          </label>
          <input
            v-model="image"
            type="text"
            class="w-full bg-appBg text-textPrimary border border-appBorder rounded-xl p-3 text-sm placeholder:text-textMuted/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
            placeholder="/images/image.png"
          >
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
            :placeholder="$t('vendor.descriptionPlaceholder')"
            maxlength="250"
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
          {{ product ? $t('vendor.saveChanges') : $t('vendor.createProduct') }}
        </button>
      </div>
    </div>
  </div>
</template>
