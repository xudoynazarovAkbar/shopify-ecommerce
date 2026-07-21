<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useCartStore } from '../../stores/cart';
import { useToastStore } from '../../stores/toast';
import { useApi } from '../../composables/useApi';
import type { Product } from '../../types';

const cartStore = useCartStore();
const toastStore = useToastStore();
const api = useApi();
const { resolveImageUrl } = useImageResolver();

const products = ref<Product[]>([]);
const loading = ref(false);
const addingProductId = ref<string | null>(null);

const fetchProducts = async () => {
  if (!cartStore.vendorId) {
    products.value = [];
    return;
  }
  loading.value = true;
  try {
    const res = await api.get<Product[]>(`/products?vendorId=${cartStore.vendorId}`);
    products.value = res || [];
  } catch (err) {
    console.error('Failed to fetch vendor products:', err);
  } finally {
    loading.value = false;
  }
};

const recommendedProducts = computed(() => {
  return products.value.filter(
    (product) => !cartStore.items.some((item) => item.product.id === product.id)
  ).slice(0, 4); // Show top 4 items for a clean grid layout
});

const onAddToCart = async (product: Product) => {
  addingProductId.value = product.id;
  try {
    await cartStore.addItem(product.id, 1);
    toastStore.success(`${product.name} added to cart!`);
  } catch (err) {
    console.error('Failed to add to cart:', err);
    toastStore.error('Failed to add item to cart');
  } finally {
    addingProductId.value = null;
  }
};

watch(() => cartStore.vendorId, (newId) => {
  if (newId) {
    fetchProducts();
  } else {
    products.value = [];
  }
});

onMounted(() => {
  if (cartStore.vendorId) {
    fetchProducts();
  }
});
</script>

<template>
  <div v-if="cartStore.vendorId && recommendedProducts.length > 0" class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
    <!-- Header with Visit Store Link -->
    <div class="flex items-center justify-between border-b border-appBorder pb-3">
      <div class="flex items-center gap-2">
        <Icon name="heroicons:shopping-bag" class="w-5 h-5 text-brand" />
        <h3 class="text-xs font-extrabold text-textPrimary uppercase tracking-wider">
          {{ $t('cart.moreFromVendor', { vendor: cartStore.vendor?.shopName || 'this store' }) }}
        </h3>
      </div>
      <NuxtLink
        :to="`/vendors/${cartStore.vendorId}`"
        class="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline transition"
      >
        <span>Visit Full Store</span>
        <Icon name="heroicons:arrow-right" class="w-4 h-4" />
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
      <div v-for="n in 4" :key="'rec-skel-' + n" class="h-44 bg-appBg/50 border border-appBorder rounded-xl" />
    </div>

    <!-- Product Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div
        v-for="product in recommendedProducts"
        :key="product.id"
        class="group bg-appBg/20 hover:bg-appBg/40 border border-appBorder hover:border-brand/30 rounded-xl overflow-hidden flex flex-col justify-between transition duration-200"
      >
        <!-- Product Thumbnail Image -->
        <div class="relative w-full aspect-video bg-zinc-100 dark:bg-zinc-800 border-b border-appBorder flex items-center justify-center overflow-hidden shrink-0">
          <img
            v-if="product.image"
            :src="resolveImageUrl(product.image)"
            :alt="product.name"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            @error="product.image = ''"
          >
          <div v-else class="flex flex-col items-center justify-center text-textMuted py-4">
            <Icon name="heroicons:photo" class="w-6 h-6 mb-1" />
            <span class="text-[9px]">No Image</span>
          </div>
        </div>

        <!-- Details & CTA -->
        <div class="p-3 flex-1 flex flex-col justify-between gap-2">
          <div>
            <h4 class="font-bold text-textPrimary text-xs line-clamp-1 group-hover:text-brand transition-colors">
              {{ product.name }}
            </h4>
            <p class="text-textSecondary text-[10px] line-clamp-1">
              {{ product.description || $t('home.noDescription') }}
            </p>
          </div>

          <div class="flex items-center justify-between border-t border-appBorder/50 pt-2 mt-auto">
            <span class="font-extrabold text-textPrimary text-xs">${{ product.price.toFixed(2) }}</span>
            <button
              class="flex items-center gap-0.5 text-[10px] font-bold bg-brand hover:bg-brandHover text-brandText px-2.5 py-1.5 rounded-lg transition"
              :disabled="addingProductId === product.id"
              @click="onAddToCart(product)"
            >
              <Icon
                v-if="addingProductId === product.id"
                name="svg-spinners:ring-resize"
                class="w-3.5 h-3.5 shrink-0 animate-spin"
              />
              <Icon v-else name="heroicons:plus" class="w-3.5 h-3.5 shrink-0" />
              <span>{{ $t('cart.addBtn') || 'Add' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
