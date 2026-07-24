import { ref, watch, onMounted } from 'vue';
import { useApi } from './useApi';
import { useImageResolver } from './useImageResolver';
import { useAuthStore } from '../stores/auth';
import type { Product, Category } from '../types';

export const useProductForm = (
  props: { show: boolean; product: Product | null },
  emit: {
    (e: 'close'): void;
    (e: 'submit', payload: { categoryId: string; name: string; description?: string; price: number; image?: string }): void;
  }
) => {
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
    if (files && files.length > 0 && files[0]) {
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0 && files[0]) {
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

  // Watch for modal visibility or product changes to pre-populate or reset
  watch(
    [() => props.show, () => props.product],
    ([isShown, newProduct]) => {
      if (isShown) {
        if (newProduct) {
          name.value = newProduct.name;
          description.value = newProduct.description || '';
          price.value = newProduct.price;
          image.value = newProduct.image || '';
          categoryId.value = newProduct.categoryId;
        } else {
          resetForm();
        }
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

  return {
    categories,
    categoriesLoading,
    name,
    description,
    price,
    image,
    categoryId,
    isSubmitting,
    formError,
    fileInput,
    dragActive,
    isUploading,
    resolveImageUrl,
    triggerFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    removeImage,
    resetForm,
    handleCancel,
    handleSubmit,
  };
};
