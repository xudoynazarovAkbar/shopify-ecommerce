<script setup lang="ts">
import { useCartStore } from '../stores/cart';
import { useCartCheckout } from '../composables/useCartCheckout';
import CartItemRow from '../components/cart/CartItemRow.vue';
import CouponInput from '../components/cart/CouponInput.vue';
import SavedCardSelector from '../components/cart/SavedCardSelector.vue';

definePageMeta({
  layout: 'default',
  middleware: 'auth',
});

const cartStore = useCartStore();
const { promoCode, selectedCardId, loading, executeCheckout } = useCartCheckout();

onMounted(async () => {
  await cartStore.fetchCart();
});
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="border-b border-appBorder pb-4 flex items-center justify-between gap-4">
      <h1 class="text-2xl font-extrabold text-textPrimary flex items-center gap-2">
        <Icon name="heroicons:shopping-cart" class="w-8 h-8 text-brand" />
        <span>{{ $t('cart.title') || 'Your Shopping Cart' }}</span>
      </h1>
      <!-- Locked Vendor Indicator -->
      <p v-if="cartStore.vendor" class="text-xs text-textMuted font-semibold">
        Locked to: <span class="text-brand font-bold">{{ cartStore.vendor.shopName }}</span>
      </p>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="cartStore.loading && cartStore.items.length === 0" class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
      <div class="lg:col-span-2 space-y-4">
        <div v-for="n in 3" :key="'item-skel-' + n" class="h-24 bg-cardBg border border-appBorder rounded-2xl"/>
      </div>
      <div class="h-96 bg-cardBg border border-appBorder rounded-2xl"/>
    </div>

    <template v-else>
      <!-- Empty Cart Template -->
      <div v-if="cartStore.items.length === 0" class="text-center py-20 bg-cardBg rounded-2xl border border-appBorder p-8 max-w-xl mx-auto shadow-sm">
        <Icon name="heroicons:shopping-cart" class="w-16 h-16 text-textMuted mx-auto mb-4" />
        <h2 class="text-xl font-bold text-textPrimary mb-2">{{ $t('cart.emptyTitle') || 'Your Cart is Empty' }}</h2>
        <p class="text-textSecondary text-sm mb-6">
          {{ $t('cart.emptyDesc') || 'You have not added any products to your shopping cart yet. Start exploring our trusted merchant stores!' }}
        </p>
        <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-xs font-bold bg-brand hover:bg-brandHover text-brandText px-5 py-3 rounded-xl transition">
          <Icon name="heroicons:building-storefront" class="w-4 h-4" />
          <span>{{ $t('backToMarketplace') || 'Back to Marketplace' }}</span>
        </NuxtLink>
      </div>

      <!-- Active Cart Grid -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <!-- Left Panel: Cart Items Row -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between border-b border-appBorder pb-2">
            <h3 class="text-sm font-bold text-textPrimary uppercase tracking-wider">
              Cart Contents ({{ cartStore.itemCount }} items)
            </h3>
            <!-- Clear Cart Button -->
            <button
              class="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-0.5"
              @click="cartStore.clearCart"
            >
              <Icon name="heroicons:trash" class="w-4 h-4" />
              <span>Clear Entire Cart</span>
            </button>
          </div>

          <!-- Items Ledger -->
          <div class="space-y-3">
            <CartItemRow
              v-for="item in cartStore.items"
              :key="item.id"
              :item="item"
            />
          </div>
        </div>

        <!-- Right Panel: Summary & Vaulting Method -->
        <div class="space-y-6">
          <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm space-y-6">
            <h3 class="text-sm font-extrabold text-textPrimary uppercase tracking-wider border-b border-appBorder pb-3">
              Order Summary
            </h3>

            <!-- Price Calculations list -->
            <div class="space-y-3 text-sm">
              <div class="flex items-center justify-between text-textSecondary">
                <span>Subtotal</span>
                <span class="font-semibold text-textPrimary">${{ cartStore.subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between text-textSecondary">
                <span>Estimated Tax (15%)</span>
                <span class="font-semibold text-textPrimary">${{ cartStore.tax.toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between text-textSecondary border-b border-appBorder pb-3">
                <span>Delivery Fee</span>
                <span class="font-semibold text-textPrimary">${{ cartStore.deliveryFee.toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between text-textPrimary font-extrabold text-base pt-1">
                <span>Estimated Total</span>
                <span>${{ cartStore.total.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Merchant Coupon input -->
            <CouponInput v-model="promoCode" />

            <!-- Vaulted Saved Card Selector -->
            <SavedCardSelector v-model="selectedCardId" />

            <!-- Checkout Execute Button -->
            <button
              class="w-full py-3.5 bg-brand hover:bg-brandHover text-brandText font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
              :disabled="loading || !selectedCardId"
              @click="executeCheckout"
            >
              <Icon v-if="loading" name="svg-spinners:ring-resize" class="w-5 h-5 shrink-0" />
              <Icon v-else name="heroicons:shield-check-20-solid" class="w-5 h-5 shrink-0" />
              <span>Complete Secured Purchase</span>
            </button>

            <!-- SSL Secure Vaulting Notice -->
            <div class="flex items-center justify-center gap-1 text-[10px] text-textMuted text-center opacity-85">
              <Icon name="heroicons:lock-closed-20-solid" class="w-3.5 h-3.5 text-teal-500" />
              <span>Tokenized Vaulting Security. Your raw card details are never saved.</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
