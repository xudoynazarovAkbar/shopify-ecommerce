<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';

const authStore = useAuthStore();
const cartStore = useCartStore();

const searchQuery = ref('');

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
  <div class="min-h-screen flex flex-col bg-slate-50">
    <!-- Navigation Bar -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold text-slate-900 shrink-0">
          <Icon name="heroicons:shopping-bag-solid" class="w-6 h-6 text-indigo-600" />
          <span>Shopify</span>
        </NuxtLink>

        <!-- Search Bar -->
        <div class="flex-1 max-w-lg">
          <form @submit.prevent="onSearch" class="relative">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search products, shops, restaurants..."
              class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            <Icon
              name="heroicons:magnifying-glass-20-solid"
              class="w-5 h-5 text-slate-400 absolute left-3 top-2.5 pointer-events-none"
            />
          </form>
        </div>

        <!-- Navigation Links -->
        <nav class="flex items-center gap-4 shrink-0">
          <!-- Buyer Cart -->
          <NuxtLink
            v-if="authStore.role === 'BUYER'"
            to="/cart"
            class="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition"
          >
            <Icon name="heroicons:shopping-cart-20-solid" class="w-6 h-6" />
            <span
              v-if="cartStore.itemCount > 0"
              class="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
            >
              {{ cartStore.itemCount }}
            </span>
          </NuxtLink>

          <!-- Logged In Links -->
          <template v-if="authStore.isAuthenticated">
            <NuxtLink
              v-if="authStore.role === 'VENDOR'"
              to="/vendor"
              class="text-sm font-semibold text-slate-700 hover:text-indigo-600"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink
              v-if="authStore.role === 'ADMIN'"
              to="/admin"
              class="text-sm font-semibold text-slate-700 hover:text-indigo-600"
            >
              Admin Central
            </NuxtLink>
            <NuxtLink
              v-if="authStore.role === 'BUYER'"
              to="/buyer/orders"
              class="text-sm font-semibold text-slate-700 hover:text-indigo-600"
            >
              My Orders
            </NuxtLink>
            <button
              @click="authStore.logout()"
              class="text-sm font-semibold text-rose-600 hover:text-rose-700"
            >
              Logout
            </button>
          </template>

          <!-- Guest Links -->
          <template v-else>
            <NuxtLink
              to="/login"
              class="text-sm font-semibold text-slate-700 hover:text-indigo-600"
            >
              Sign In
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition"
            >
              Onboard
            </NuxtLink>
          </template>
        </nav>
      </div>
    </header>

    <!-- Main Content Slot -->
    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 py-6 mt-auto">
      <div class="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
        &copy; 2026 Shopify Multi-Vendor Marketplace. Built with Nuxt 3 & NestJS.
      </div>
    </footer>

    <!-- Toast Notifications -->
    <ToastNotification />
  </div>
</template>
