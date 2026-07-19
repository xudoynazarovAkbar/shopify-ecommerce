<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';

const authStore = useAuthStore();
const cartStore = useCartStore();
const route = useRoute();

const searchQuery = ref('');

const showSearch = computed(() => {
  return !['/login', '/register'].includes(route.path);
});

const onSearch = () => {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`);
  }
};

onMounted(() => {
  if (authStore.isAuthenticated && authStore.role === 'BUYER') {
    cartStore.fetchCart();
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-appBg text-textSecondary transition-colors duration-200">
    <!-- Navigation Bar -->
    <header class="bg-cardBg border-b border-appBorder sticky top-0 z-40 shadow-sm transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold text-textPrimary shrink-0">
          <Icon name="heroicons:shopping-bag-solid" class="w-6 h-6 text-brand" />
          <span>Shopify</span>
        </NuxtLink>

        <!-- Search Bar -->
        <div v-if="showSearch" class="flex-1 max-w-lg">
          <form class="relative" @submit.prevent="onSearch">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search products, shops, restaurants..."
              class="w-full pl-10 pr-4 py-2 border border-appBorder rounded-lg text-sm bg-appBg text-textPrimary focus:bg-cardBg focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
            >
            <Icon
              name="heroicons:magnifying-glass-20-solid"
              class="w-5 h-5 text-textMuted absolute left-3 top-2.5 pointer-events-none"
            />
          </form>
        </div>

        <!-- Navigation Links -->
        <nav class="flex items-center gap-4 shrink-0">
          <!-- Buyer Cart -->
          <NuxtLink
            v-if="authStore.role === 'BUYER'"
            to="/cart"
            class="relative p-2 text-textSecondary hover:text-brand hover:bg-appBg rounded-full transition"
          >
            <Icon name="heroicons:shopping-cart-20-solid" class="w-6 h-6" />
            <span
              v-if="cartStore.itemCount > 0"
              class="absolute -top-1 -right-1 bg-brand text-brandText text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-cardBg"
            >
              {{ cartStore.itemCount }}
            </span>
          </NuxtLink>

          <!-- Logged In Links -->
          <template v-if="authStore.isAuthenticated">
            <NuxtLink
              v-if="authStore.role === 'VENDOR'"
              to="/vendor"
              class="text-sm font-semibold text-textSecondary hover:text-brand"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink
              v-if="authStore.role === 'ADMIN'"
              to="/admin"
              class="text-sm font-semibold text-textSecondary hover:text-brand"
            >
              Admin Central
            </NuxtLink>
            <NuxtLink
              v-if="authStore.role === 'BUYER'"
              to="/buyer/orders"
              class="text-sm font-semibold text-textSecondary hover:text-brand"
            >
              My Orders
            </NuxtLink>
            <button
              class="text-sm font-semibold text-rose-600 hover:text-rose-700"
              @click="authStore.logout()"
            >
              Logout
            </button>
          </template>

          <!-- Guest Links -->
          <template v-else>
            <NuxtLink
              to="/login"
              class="text-sm font-semibold text-textSecondary hover:text-brand"
            >
              Sign In
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="text-sm font-semibold text-brandText bg-brand hover:bg-brandHover px-4 py-2 rounded-lg transition"
            >
              Onboard
            </NuxtLink>
          </template>

          <!-- Theme Switcher -->
          <CommonThemeSwitcher />
        </nav>
      </div>
    </header>

    <!-- Main Content Slot -->
    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-cardBg border-t border-appBorder py-6 mt-auto transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 text-center text-sm text-textMuted">
        &copy; 2026 Shopify Multi-Vendor Marketplace. Built with Nuxt 3 & NestJS.
      </div>
    </footer>

    <!-- Toast Notifications -->
    <CommonToastNotification />
  </div>
</template>
