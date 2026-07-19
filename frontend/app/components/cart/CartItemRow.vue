<script setup lang="ts">
import { useCartStore } from '../../stores/cart';
import type { CartItem } from '../../types';

const props = defineProps<{
  item: CartItem;
}>();

const cartStore = useCartStore();
const mutating = ref(false);

const onIncrease = async () => {
  mutating.value = true;
  try {
    await cartStore.updateQuantity(props.item.id, props.item.quantity + 1);
  } catch (err) {
    console.error('Failed to increase quantity:', err);
  } finally {
    mutating.value = false;
  }
};

const onDecrease = async () => {
  if (props.item.quantity <= 1) return;
  mutating.value = true;
  try {
    await cartStore.updateQuantity(props.item.id, props.item.quantity - 1);
  } catch (err) {
    console.error('Failed to decrease quantity:', err);
  } finally {
    mutating.value = false;
  }
};

const onRemove = async () => {
  mutating.value = true;
  try {
    await cartStore.removeItem(props.item.id);
  } catch (err) {
    console.error('Failed to remove item:', err);
  } finally {
    mutating.value = false;
  }
};
</script>

<template>
  <div class="flex items-center gap-4 bg-cardBg border border-appBorder rounded-2xl p-4 shadow-sm transition-all duration-200">
    <!-- Product Image Frame -->
    <div class="w-16 h-16 md:w-20 md:h-20 bg-appBg rounded-xl overflow-hidden border border-appBorder flex items-center justify-center shrink-0">
      <img
        v-if="item.product.image"
        :src="item.product.image"
        :alt="item.product.name"
        class="w-full h-full object-cover"
      >
      <Icon v-else name="heroicons:photo" class="w-8 h-8 text-textMuted" />
    </div>

    <!-- Product Info -->
    <div class="flex-1 min-w-0">
      <h4 class="font-bold text-textPrimary text-sm md:text-base truncate">
        {{ item.product.name }}
      </h4>
      <p class="text-xs text-textMuted font-semibold mb-1">
        ${{ item.product.price.toFixed(2) }} each
      </p>
      <!-- Subtotal calculation -->
      <p class="text-textSecondary text-xs font-bold md:hidden">
        Total: ${{ (item.product.price * item.quantity).toFixed(2) }}
      </p>
    </div>

    <!-- Right Side Actions & Quantity -->
    <div class="flex items-center gap-4 md:gap-8">
      <!-- Quantity Mutator -->
      <div class="flex items-center border border-appBorder rounded-xl bg-appBg overflow-hidden h-9">
        <button
          class="px-2.5 hover:bg-cardBg text-textSecondary disabled:opacity-50 disabled:hover:bg-transparent transition"
          :disabled="item.quantity <= 1 || mutating"
          @click="onDecrease"
        >
          <Icon name="heroicons:minus-20-solid" class="w-4 h-4 shrink-0" />
        </button>
        <span class="px-3 text-sm font-bold text-textPrimary min-w-[2rem] text-center">
          {{ item.quantity }}
        </span>
        <button
          class="px-2.5 hover:bg-cardBg text-textSecondary disabled:opacity-50 disabled:hover:bg-transparent transition"
          :disabled="mutating"
          @click="onIncrease"
        >
          <Icon name="heroicons:plus-20-solid" class="w-4 h-4 shrink-0" />
        </button>
      </div>

      <!-- Price Subtotal (Large screens) -->
      <div class="hidden md:block text-right min-w-[5rem]">
        <p class="text-xs text-textMuted font-semibold">Subtotal</p>
        <p class="text-textPrimary font-bold text-sm">
          ${{ (item.product.price * item.quantity).toFixed(2) }}
        </p>
      </div>

      <!-- Delete Button -->
      <button
        class="p-2 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 rounded-xl transition disabled:opacity-50"
        :disabled="mutating"
        @click="onRemove"
      >
        <Icon v-if="mutating" name="svg-spinners:ring-resize" class="w-5 h-5 shrink-0" />
        <Icon v-else name="heroicons:trash-20-solid" class="w-5 h-5 shrink-0" />
      </button>
    </div>
  </div>
</template>
