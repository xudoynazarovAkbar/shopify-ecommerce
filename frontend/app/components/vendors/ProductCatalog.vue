<script setup lang="ts">
import { useCartStore } from '../../stores/cart';
import { useToastStore } from '../../stores/toast';
import type { Product } from '../../types';

defineProps<{
  groupedProducts: Array<{ id: string; name: string; products: Product[] }>;
  loading: boolean;
}>();

const cartStore = useCartStore();
const toastStore = useToastStore();
const { resolveImageUrl } = useImageResolver();

const addingProductId = ref<string | null>(null);
const showConflictModal = ref(false);
const pendingProductId = ref<string | null>(null);
const pendingVendorName = ref('');

const onAddToCart = async (product: Product) => {
  addingProductId.value = product.id;
  try {
    await cartStore.addItem(product.id, 1);
    toastStore.success(`${product.name} added to cart!`);
  } catch (err) {
    console.error('Failed to add to cart:', err);
    
    const fetchError = err as {
      status?: number;
      message?: string;
      response?: {
        _data?: {
          message?: string;
        };
      };
    };

    // Check if error is a single-vendor conflict
    const responseData = fetchError.response?._data;
    const isVendorConflict = responseData?.message?.toLowerCase().includes('different vendor') || 
                             responseData?.message?.toLowerCase().includes('mismatch') ||
                             fetchError.message?.toLowerCase().includes('vendor') ||
                             fetchError.status === 400;

    if (isVendorConflict) {
      pendingProductId.value = product.id;
      pendingVendorName.value = product.vendor?.shopName || 'this store';
      showConflictModal.value = true;
    } else {
      toastStore.error(responseData?.message || 'Failed to add item to cart');
    }
  } finally {
    addingProductId.value = null;
  }
};

const handleResolveConflict = async () => {
  if (!pendingProductId.value) return;
  
  const prodId = pendingProductId.value;
  showConflictModal.value = false;
  pendingProductId.value = null;
  
  try {
    // 1. Clear cart
    await cartStore.clearCart();
    // 2. Add product
    await cartStore.addItem(prodId, 1);
    toastStore.success('Cart cleared and new item added!');
  } catch (err) {
    console.error(err);
    toastStore.error('Failed to update cart.');
  }
};
</script>

<template>
  <div class="space-y-12">
    <!-- Catalog Header -->
    <div class="border-b border-appBorder pb-4">
      <h2 class="text-xl font-extrabold text-textPrimary flex items-center gap-2">
        <Icon name="heroicons:sparkles" class="w-6 h-6 text-brand" />
        <span>{{ $t('home.browseCategories') }}</span>
      </h2>
    </div>

    <!-- Empty Catalog -->
    <div v-if="groupedProducts.length === 0" class="text-center py-16 bg-cardBg rounded-2xl border border-appBorder p-8 max-w-md mx-auto">
      <Icon name="heroicons:shopping-bag" class="w-12 h-12 text-textMuted mx-auto mb-3" />
      <h3 class="text-lg font-bold text-textPrimary mb-1">{{ $t('home.noProducts') }}</h3>
      <p class="text-textSecondary text-sm">This merchant hasn't published any products yet.</p>
    </div>

    <!-- Grouped Categories Grid -->
    <div v-else class="space-y-10">
      <div v-for="group in groupedProducts" :key="group.id" class="space-y-6">
        <!-- Category Anchor Header -->
        <h3 class="text-lg font-bold text-textPrimary flex items-center gap-2 bg-appBg/50 backdrop-blur-md sticky top-16 py-2 z-10">
          <span class="w-1.5 h-6 bg-brand rounded-full"/>
          <span>{{ group.name }}</span>
          <span class="text-textMuted text-xs font-normal">({{ group.products.length }} items)</span>
        </h3>

        <!-- Products in Category -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="product in group.products"
            :key="product.id"
            class="group bg-cardBg border border-appBorder hover:border-brand rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <!-- Image Frame -->
            <div class="aspect-video w-full bg-appBg flex items-center justify-center relative overflow-hidden border-b border-appBorder">
              <img
                v-if="product.image"
                :src="resolveImageUrl(product.image)"
                :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              >
              <div v-else class="flex flex-col items-center text-textMuted">
                <Icon name="heroicons:photo" class="w-8 h-8 mb-1" />
                <span class="text-[10px]">No Image Available</span>
              </div>
            </div>

            <!-- Meta Details -->
            <div class="p-4 flex-1 flex flex-col justify-between gap-3">
              <div>
                <h4 class="font-bold text-textPrimary group-hover:text-brand transition-colors line-clamp-1 mb-1">
                  {{ product.name }}
                </h4>
                <p class="text-textSecondary text-xs line-clamp-2 min-h-[2rem]">
                  {{ product.description || $t('home.noDescription') }}
                </p>
              </div>

              <!-- Price & Call to Action -->
              <div class="flex items-center justify-between border-t border-appBorder pt-3 mt-auto">
                <span class="font-extrabold text-textPrimary text-base">${{ product.price.toFixed(2) }}</span>
                <button
                  class="flex items-center gap-1 text-xs font-semibold bg-brand hover:bg-brandHover text-brandText px-3 py-2 rounded-xl transition"
                  :disabled="addingProductId === product.id"
                  @click="onAddToCart(product)"
                >
                  <Icon
                    v-if="addingProductId === product.id"
                    name="svg-spinners:ring-resize"
                    class="w-4 h-4 shrink-0"
                  />
                  <Icon v-else name="heroicons:shopping-cart-20-solid" class="w-4 h-4 shrink-0" />
                  <span>{{ $t('cart.addBtn') || 'Add to Cart' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scoped Vendor Conflict Dialog -->
    <div v-if="showConflictModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
      <div class="bg-cardBg border border-appBorder rounded-2xl max-w-md w-full p-6 shadow-xl animate-scaleIn">
        <div class="flex items-center gap-3 text-amber-500 mb-4">
          <Icon name="heroicons:exclamation-triangle" class="w-8 h-8" />
          <h3 class="text-lg font-bold text-textPrimary">Switch Shopping Carts?</h3>
        </div>
        <p class="text-textSecondary text-sm leading-relaxed mb-6">
          Your shopping cart currently contains items from another store. In order to add products from <strong class="text-textPrimary">{{ pendingVendorName }}</strong>, you must clear your existing cart first.
        </p>
        <div class="flex items-center justify-end gap-3">
          <button
            class="px-4 py-2 text-xs font-bold text-textSecondary hover:bg-appBg border border-appBorder rounded-xl transition"
            @click="showConflictModal = false"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition flex items-center gap-1"
            @click="handleResolveConflict"
          >
            <Icon name="heroicons:trash" class="w-4 h-4" />
            <span>Clear Cart & Add</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
