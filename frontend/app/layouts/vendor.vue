<script setup lang="ts">
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const shopName = computed(() => authStore.user?.vendorProfile?.shopName || 'Merchant');
</script>

<template>
  <div class="min-h-screen flex bg-slate-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 left-0 z-30">
      <!-- Sidebar Header -->
      <div class="h-16 flex items-center gap-2 px-6 border-b border-slate-800 shrink-0">
        <NuxtLink to="/vendor" class="flex items-center gap-2 text-lg font-bold text-white">
          <Icon name="heroicons:shopping-bag-solid" class="w-5 h-5 text-indigo-400" />
          <span>Vendor Hub</span>
        </NuxtLink>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-4 py-6 flex flex-col gap-1">
        <NuxtLink
          to="/vendor"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition"
          active-class="bg-indigo-600 text-white"
          end
        >
          <Icon name="heroicons:chart-bar-20-solid" class="w-5 h-5" />
          <span>Overview</span>
        </NuxtLink>

        <NuxtLink
          to="/vendor/products"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition"
          active-class="bg-indigo-600 text-white"
        >
          <Icon name="heroicons:squares-plus-20-solid" class="w-5 h-5" />
          <span>My Products</span>
        </NuxtLink>

        <NuxtLink
          to="/vendor/orders"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition"
          active-class="bg-indigo-600 text-white"
        >
          <Icon name="heroicons:shopping-bag-20-solid" class="w-5 h-5" />
          <span>Orders</span>
        </NuxtLink>

        <NuxtLink
          to="/vendor/coupons"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition"
          active-class="bg-indigo-600 text-white"
        >
          <Icon name="heroicons:ticket-20-solid" class="w-5 h-5" />
          <span>Coupons</span>
        </NuxtLink>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-slate-800 shrink-0 flex flex-col gap-2">
        <NuxtLink
          to="/"
          class="flex items-center gap-3 px-4 py-2 text-xs font-semibold hover:text-white transition"
        >
          <Icon name="heroicons:arrow-left-20-solid" class="w-4 h-4" />
          <span>Back to Marketplace</span>
        </NuxtLink>
        <button
          @click="authStore.logout()"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-slate-800 hover:text-rose-300 transition w-full text-left"
        >
          <Icon name="heroicons:arrow-left-on-rectangle-20-solid" class="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 pl-64 flex flex-col">
      <!-- Header -->
      <header class="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-8 shadow-sm">
        <h2 class="text-lg font-bold text-slate-800">{{ shopName }}</h2>
        <div class="flex items-center gap-3">
          <span class="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
            Active Storefront
          </span>
        </div>
      </header>

      <!-- Main Slot -->
      <main class="flex-1 p-8">
        <slot />
      </main>
    </div>

    <!-- Toast Notifications -->
    <ToastNotification />
  </div>
</template>
