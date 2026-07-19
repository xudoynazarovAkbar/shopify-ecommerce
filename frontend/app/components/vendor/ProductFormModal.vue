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

// Drag-and-Drop Image refs and handlers
const fileInput = ref<HTMLInputElement | null>(null);
const dragActive = ref(false);
const isUploading = ref(false);
const { resolveImageUrl } = useImageResolver();

const triggerFileSelect = () => {
  fileInput.value?.click();
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = false;
};

const handleDrop = async (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    await processFile(files[0]);
  }
};

const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    await processFile(files[0]);
  }
};

const processFile = async (file: File) => {
  formError.value = null;

  // Client-side preflight validations
  if (!file.type.startsWith('image/')) {
    formError.value = useNuxtApp().$i18n.t('vendor.dragDropTypeErr');
    return;
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    formError.value = useNuxtApp().$i18n.t('vendor.dragDropSizeErr');
    return;
  }

  isUploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', file);

    const apiBase = useRuntimeConfig().public.apiBase;
    const token = useAuthStore().token;

    const response = await fetch(`${apiBase}/products/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const res = await response.json();

    if (res && res.url) {
      image.value = res.url;
    } else {
      throw new Error('No URL returned from server');
    }
  } catch (err: unknown) {
    console.error('Failed to upload product image:', err);
    formError.value = useNuxtApp().$i18n.t('vendor.dragDropError');
  } finally {
    isUploading.value = false;
  }
};

const removeImage = () => {
  image.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

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

        <!-- Drag-and-Drop Image Uploader -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-textPrimary uppercase tracking-wider block">
            {{ $t('vendor.imageUrl') }} ({{ $t('vendor.optional') }})
          </label>
          
          <!-- Hidden Input for File Selection -->
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          >

          <!-- Uploader Container -->
          <div
            v-if="!image && !isUploading"
            :class="[
              'border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer text-center space-y-2 transition-all',
              dragActive
                ? 'border-brand bg-brand/5 scale-[1.01]'
                : 'border-appBorder bg-appBg hover:border-brand hover:bg-brand/[0.02]',
            ]"
            @click="triggerFileSelect"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
          >
            <div class="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center">
              <Icon name="heroicons:arrow-up-tray" class="w-5 h-5" />
            </div>
            <div class="space-y-1">
              <p class="text-xs font-bold text-textPrimary">
                {{ $t('vendor.dragDropPlaceholder') }}
              </p>
              <p class="text-[10px] text-textMuted">
                {{ $t('vendor.dragDropSizeErr') }}
              </p>
            </div>
          </div>

          <!-- Uploading Spinner State -->
          <div
            v-else-if="isUploading"
            class="border-2 border-dashed border-appBorder bg-appBg rounded-xl p-6 flex flex-col items-center justify-center space-y-2"
          >
            <Icon name="svg-spinners:ring-resize" class="w-8 h-8 text-brand" />
            <p class="text-xs font-bold text-brand animate-pulse">
              {{ $t('vendor.dragDropUploading') }}
            </p>
          </div>

          <!-- Image Preview / Manage State -->
          <div
            v-else
            class="relative rounded-xl overflow-hidden border border-appBorder bg-appBg flex flex-col items-center group/preview"
          >
            <!-- Image Frame -->
            <div class="aspect-video w-full relative flex items-center justify-center bg-slate-950/20">
              <img
                :src="resolveImageUrl(image)"
                alt="Product Preview"
                class="w-full h-full object-cover"
              >
              <!-- Hover Overlay for Actions -->
              <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  class="px-3.5 py-1.5 bg-cardBg/90 hover:bg-cardBg border border-appBorder text-xs font-bold text-textPrimary rounded-lg shadow transition flex items-center gap-1.5"
                  @click="triggerFileSelect"
                >
                  <Icon name="heroicons:pencil-square" class="w-3.5 h-3.5" />
                  {{ $t('vendor.replaceImage') }}
                </button>
                <button
                  type="button"
                  class="px-3.5 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-xs font-bold text-white rounded-lg shadow transition flex items-center gap-1.5"
                  @click="removeImage"
                >
                  <Icon name="heroicons:trash" class="w-3.5 h-3.5" />
                  {{ $t('vendor.removeImage') }}
                </button>
              </div>
            </div>
          </div>
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
