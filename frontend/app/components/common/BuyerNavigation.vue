<script setup lang="ts">
import { useAuthStore } from '../../stores/auth';
import { useCartStore } from '../../stores/cart';

defineProps<{
  isSidebarCollapsed: boolean;
}>();

const authStore = useAuthStore();
const cartStore = useCartStore();
const route = useRoute();
</script>

<template>
  <!-- Buyer & Guest Navigation -->
  <template v-if="!authStore.isAuthenticated || authStore.role === 'BUYER'">
    <!-- Cart Link -->
    <NuxtLink
      to="/cart"
      class="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200 relative"
      :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
      active-class="bg-brand text-brandText"
      :title="isSidebarCollapsed ? $t('cartNav') : ''"
    >
      <div class="flex items-center gap-3">
        <Icon name="heroicons:shopping-cart-20-solid" class="w-5 h-5 shrink-0" />
        <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('cartNav') }}</span>
      </div>
      
      <!-- Badge when expanded -->
      <span
        v-if="cartStore.itemCount > 0 && !isSidebarCollapsed"
        class="bg-brand text-brandText text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
        :class="{ 'bg-brandText !text-brand': route.path === '/cart' }"
      >
        {{ cartStore.itemCount }}
      </span>

      <!-- Badge overlay when collapsed -->
      <span
        v-if="cartStore.itemCount > 0 && isSidebarCollapsed"
        class="absolute top-1 right-1 bg-brand text-brandText text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-cardBg md:flex hidden"
      >
        {{ cartStore.itemCount }}
      </span>
    </NuxtLink>

    <!-- My Orders Link -->
    <NuxtLink
      v-if="authStore.isAuthenticated"
      to="/buyer/orders"
      class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
      :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
      active-class="bg-brand text-brandText"
      :title="isSidebarCollapsed ? $t('myOrders') : ''"
    >
      <Icon name="heroicons:clipboard-document-list-20-solid" class="w-5 h-5 shrink-0" />
      <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('myOrders') }}</span>
    </NuxtLink>

    <!-- Spendings Link -->
    <NuxtLink
      v-if="authStore.isAuthenticated"
      to="/buyer/spendings"
      class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
      :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
      active-class="bg-brand text-brandText"
      :title="isSidebarCollapsed ? $t('buyer.spendings.title') : ''"
    >
      <Icon name="heroicons:presentation-chart-line-20-solid" class="w-5 h-5 shrink-0" />
      <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('buyer.spendings.title') }}</span>
    </NuxtLink>
  </template>
</template>
