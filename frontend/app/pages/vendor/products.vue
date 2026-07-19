<script setup lang="ts">
import { useVendorProducts } from '../../composables/useVendorProducts';
import { useToastStore } from '../../stores/toast';
import type { Product } from '../../types';

definePageMeta({
  layout: 'vendor',
  middleware: ['auth', 'role'],
  meta: { roles: ['VENDOR'] },
});

const {
  products,
  loading,
  error,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = useVendorProducts();

const toastStore = useToastStore();
const { resolveImageUrl } = useImageResolver();

const showModal = ref(false);
const editingProduct = ref<Product | null>(null);

onMounted(async () => {
  await fetchProducts();
});

const openAddModal = () => {
  editingProduct.value = null;
  showModal.value = true;
};

const openEditModal = (product: Product) => {
  editingProduct.value = product;
  showModal.value = true;
};

const closeModal = () => {
  editingProduct.value = null;
  showModal.value = false;
};

const handleFormSubmit = async (payload: { categoryId: string; name: string; description?: string; price: number; image?: string }) => {
  try {
    if (editingProduct.value) {
      await updateProduct(editingProduct.value.id, payload);
      toastStore.success(useNuxtApp().$i18n.t('vendor.productUpdatedSuccess'));
    } else {
      await createProduct(payload);
      toastStore.success(useNuxtApp().$i18n.t('vendor.productCreatedSuccess'));
    }
    closeModal();
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to save product';
    toastStore.error(errMsg);
  }
};

const handleDelete = async (productId: string) => {
  if (!confirm(useNuxtApp().$i18n.t('vendor.deleteConfirmation'))) return;

  try {
    await deleteProduct(productId);
    toastStore.success(useNuxtApp().$i18n.t('vendor.productDeletedSuccess'));
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to delete product';
    toastStore.error(errMsg);
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl font-black text-textPrimary tracking-tight">
          {{ $t('vendor.productsTitle') }}
        </h1>
        <p class="text-xs text-textMuted">
          {{ $t('vendor.productsSubtitle') }}
        </p>
      </div>

      <button
        type="button"
        class="bg-brand hover:bg-brandHover text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-sm hover:shadow active:scale-95 flex items-center justify-center gap-2 self-start sm:self-auto"
        @click="openAddModal"
      >
        <Icon name="heroicons:plus-20-solid" class="w-5 h-5" />
        {{ $t('vendor.addProduct') }}
      </button>
    </div>

    <!-- Error state alert -->
    <div
      v-if="error"
      class="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-2"
    >
      <Icon name="heroicons:exclamation-circle" class="w-5 h-5 shrink-0" />
      {{ error }}
    </div>

    <!-- Skeletons -->
    <div v-if="loading && products.length === 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="h-64 bg-cardBg border border-appBorder rounded-2xl animate-pulse" />
    </div>

    <!-- Empty catalog state -->
    <div
      v-else-if="products.length === 0"
      class="border border-appBorder bg-cardBg rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm"
    >
      <div class="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
        <Icon name="heroicons:squares-plus" class="w-6 h-6" />
      </div>
      <div class="space-y-1">
        <h3 class="font-extrabold text-textPrimary text-sm">
          {{ $t('vendor.emptyProductsTitle') }}
        </h3>
        <p class="text-xs text-textMuted">
          {{ $t('vendor.emptyProductsSubtitle') }}
        </p>
      </div>
    </div>

    <!-- Inventory listing grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="product in products"
        :key="product.id"
        class="bg-cardBg border border-appBorder rounded-2xl overflow-hidden shadow-sm hover:shadow transition flex flex-col group"
      >
        <!-- Product Image frame -->
        <div class="aspect-video w-full bg-appBg relative overflow-hidden border-b border-appBorder flex items-center justify-center">
          <img
            v-if="product.image"
            :src="resolveImageUrl(product.image)"
            :alt="product.name"
            class="w-full h-full object-cover group-hover:scale-102 transition duration-300"
          >
          <Icon v-else name="heroicons:photo" class="w-12 h-12 text-textMuted/40" />

          <!-- Moderation status badge overlay -->
          <div class="absolute top-3 right-3">
            <span
              :class="[
                'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm border',
                product.status === 'APPROVED'
                  ? 'bg-emerald-500 text-white border-emerald-600'
                  : product.status === 'REJECTED'
                  ? 'bg-rose-500 text-white border-rose-600'
                  : 'bg-amber-500 text-white border-amber-600',
              ]"
            >
              {{ $t(`vendor.statusLabel.${product.status.toLowerCase()}`) }}
            </span>
          </div>
        </div>

        <!-- Product core details -->
        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div class="space-y-1.5">
            <div class="flex items-center justify-between gap-4">
              <span class="text-[10px] uppercase font-bold text-brand bg-brand/5 px-2 py-0.5 rounded border border-brand/10">
                {{ product.category?.name || $t('home.uncategorized') }}
              </span>
              <span class="font-extrabold text-textPrimary text-base">
                ${{ product.price.toFixed(2) }}
              </span>
            </div>
            <h3 class="font-bold text-textPrimary text-sm leading-snug line-clamp-1">
              {{ product.name }}
            </h3>
            <p class="text-xs text-textMuted line-clamp-2 leading-relaxed">
              {{ product.description || $t('home.noDescription') }}
            </p>
          </div>

          <!-- Controls panel -->
          <div class="flex items-center gap-3 pt-3 border-t border-appBorder">
            <button
              type="button"
              class="flex-1 bg-appBg hover:bg-appBg/80 text-textPrimary border border-appBorder py-2 font-bold rounded-lg text-xs transition active:scale-95 flex items-center justify-center gap-1.5 focus:outline-none"
              @click="openEditModal(product)"
            >
              <Icon name="heroicons:pencil-square" class="w-4 h-4 text-textMuted" />
              <span>{{ $t('vendor.edit') }}</span>
            </button>
            <button
              type="button"
              class="bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 p-2 rounded-lg border border-rose-500/20 transition active:scale-95 focus:outline-none"
              @click="handleDelete(product.id)"
            >
              <Icon name="heroicons:trash" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Product addition/editing form modal -->
    <VendorProductFormModal
      :show="showModal"
      :product="editingProduct"
      @close="closeModal"
      @submit="handleFormSubmit"
    />
  </div>
</template>
