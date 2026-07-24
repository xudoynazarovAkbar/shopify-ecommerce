<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';

const authStore = useAuthStore();
const cartStore = useCartStore();
const route = useRoute();

const isMobileSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);

watch(() => route.path, () => {
  isMobileSidebarOpen.value = false;
});

onMounted(() => {
  if (authStore.isAuthenticated && authStore.role === 'BUYER') {
    cartStore.fetchCart();
  }
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sidebar_collapsed');
    isSidebarCollapsed.value = saved === 'true';
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-appBg text-textSecondary transition-colors duration-200">
    <!-- Navigation Bar (Header) -->
    <CommonNavbar
      v-model:is-sidebar-collapsed="isSidebarCollapsed"
      v-model:is-mobile-sidebar-open="isMobileSidebarOpen"
    />

    <div class="flex flex-1 relative min-h-0">
      <!-- Mobile Sidebar Backdrop -->
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 bg-black/50 z-30 md:hidden"
        @click="isMobileSidebarOpen = false"
      />

      <!-- Sidebar -->
      <aside
        :class="[
          'bg-cardBg text-textSecondary border-r border-appBorder flex flex-col fixed top-16 bottom-0 left-0 z-30 transition-all duration-300',
          isSidebarCollapsed ? 'w-16' : 'w-64',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        ]"
      >
        <!-- Navigation Links -->
        <nav
          :class="[
            'flex-1 py-6 flex flex-col gap-1 overflow-y-auto transition-all duration-300',
            isSidebarCollapsed ? 'px-2' : 'px-4'
          ]"
        >
          <!-- Storefront Tab (Index) -->
          <NuxtLink
            to="/"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
            :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
            active-class="bg-brand text-brandText"
            end
            :title="isSidebarCollapsed ? $t('storefront') : ''"
          >
            <Icon name="heroicons:building-storefront-20-solid" class="w-5 h-5 shrink-0" />
            <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('storefront') }}</span>
          </NuxtLink>

          <!-- Buyer & Guest Navigation -->
          <CommonBuyerNavigation :is-sidebar-collapsed="isSidebarCollapsed" />

          <!-- Vendor Navigation -->
          <CommonVendorNavigation :is-sidebar-collapsed="isSidebarCollapsed" />

          <!-- Admin Navigation -->
          <CommonAdminNavigation :is-sidebar-collapsed="isSidebarCollapsed" />
        </nav>

        <!-- Sidebar Footer -->
        <CommonFooter :is-sidebar-collapsed="isSidebarCollapsed" />
      </aside>

      <!-- Main Content Area -->
      <div
        :class="[
          'flex-1 flex flex-col min-w-0 transition-all duration-300',
          isSidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        ]"
      >
        <main class="flex-1 p-6 md:p-8">
          <slot />
        </main>
      </div>
    </div>

    <!-- Global Toast Notifications Container -->
    <CommonToastNotification />
  </div>
</template>
