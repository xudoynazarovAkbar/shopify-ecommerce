<script setup lang="ts">
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
</script>

<template>
  <div class="min-h-screen flex bg-appBg text-textSecondary transition-colors duration-200">
    <!-- Sidebar -->
    <aside class="w-64 bg-cardBg text-textSecondary flex flex-col fixed inset-y-0 left-0 z-30 border-r border-appBorder">
      <!-- Sidebar Header -->
      <div class="h-16 flex items-center gap-2 px-6 border-b border-appBorder shrink-0">
        <NuxtLink to="/admin" class="flex items-center gap-2 text-lg font-bold text-textPrimary">
          <Icon name="heroicons:shield-check-solid" class="w-5 h-5 text-brand" />
          <span>Admin Control</span>
        </NuxtLink>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-4 py-6 flex flex-col gap-1">
        <NuxtLink
          to="/admin"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition"
          active-class="bg-brand text-brandText"
          end
        >
          <Icon name="heroicons:chart-pie-20-solid" class="w-5 h-5" />
          <span>Dashboard</span>
        </NuxtLink>

        <NuxtLink
          to="/admin/vendors"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition"
          active-class="bg-brand text-brandText"
        >
          <Icon name="heroicons:building-storefront-20-solid" class="w-5 h-5" />
          <span>Vendor Approvals</span>
        </NuxtLink>

        <NuxtLink
          to="/admin/products"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition"
          active-class="bg-brand text-brandText"
        >
          <Icon name="heroicons:sparkles-20-solid" class="w-5 h-5" />
          <span>Product Moderation</span>
        </NuxtLink>

        <NuxtLink
          to="/admin/categories"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition"
          active-class="bg-brand text-brandText"
        >
          <Icon name="heroicons:tag-20-solid" class="w-5 h-5" />
          <span>Categories</span>
        </NuxtLink>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-appBorder shrink-0 flex flex-col gap-2">
        <NuxtLink
          to="/"
          class="flex items-center gap-3 px-4 py-2 text-xs font-semibold hover:text-textPrimary transition"
        >
          <Icon name="heroicons:arrow-left-20-solid" class="w-4 h-4" />
          <span>Back to Marketplace</span>
        </NuxtLink>
        <button
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition w-full text-left"
          @click="authStore.logout()"
        >
          <Icon name="heroicons:arrow-left-on-rectangle-20-solid" class="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 pl-64 flex flex-col">
      <!-- Header -->
      <header class="h-16 bg-cardBg border-b border-appBorder sticky top-0 z-20 flex items-center justify-between px-8 shadow-sm transition-colors duration-200">
        <h2 class="text-lg font-bold text-textPrimary">Admin Control Panel</h2>
        <div class="flex items-center gap-3">
          <span class="text-xs bg-brand/10 text-brand font-bold px-2.5 py-1 rounded-full border border-brand/20">
            System Overseer
          </span>
          <CommonThemeSwitcher />
        </div>
      </header>

      <!-- Main Slot -->
      <main class="flex-1 p-8">
        <slot />
      </main>
    </div>

    <!-- Toast Notifications -->
    <CommonToastNotification />
  </div>
</template>
