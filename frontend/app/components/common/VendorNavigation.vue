<script setup lang="ts">
import { useAuthStore } from '../../stores/auth';

defineProps<{
  isSidebarCollapsed: boolean;
}>();

const authStore = useAuthStore();
</script>

<template>
  <!-- Vendor Navigation -->
  <template v-if="authStore.isAuthenticated && authStore.role === 'VENDOR'">
    <div
      v-if="!isSidebarCollapsed"
      class="mt-4 mb-1 px-4 text-xs font-semibold text-textMuted uppercase tracking-wider"
    >
      {{ $t('vendorHub') }}
    </div>
    <hr v-else class="border-appBorder my-3 md:block hidden mx-2" >
    
    <NuxtLink
      to="/vendor"
      class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
      :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
      active-class="bg-brand text-brandText"
      end
      :title="isSidebarCollapsed ? $t('dashboard') : ''"
    >
      <Icon name="heroicons:chart-bar-20-solid" class="w-5 h-5 shrink-0" />
      <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('dashboard') }}</span>
    </NuxtLink>

    <NuxtLink
      to="/vendor/products"
      class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
      :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
      active-class="bg-brand text-brandText"
      :title="isSidebarCollapsed ? $t('vendor.myProducts') : ''"
    >
      <Icon name="heroicons:squares-plus-20-solid" class="w-5 h-5 shrink-0" />
      <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('vendor.myProducts') }}</span>
    </NuxtLink>

    <NuxtLink
      to="/vendor/orders"
      class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
      :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
      active-class="bg-brand text-brandText"
      :title="isSidebarCollapsed ? $t('vendor.openOrders') : ''"
    >
      <Icon name="heroicons:shopping-bag-20-solid" class="w-5 h-5 shrink-0" />
      <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('vendor.openOrders') }}</span>
    </NuxtLink>

    <NuxtLink
      to="/vendor/coupons"
      class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
      :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
      active-class="bg-brand text-brandText"
      :title="isSidebarCollapsed ? $t('vendor.activeCoupons') : ''"
    >
      <Icon name="heroicons:ticket-20-solid" class="w-5 h-5 shrink-0" />
      <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('vendor.activeCoupons') }}</span>
    </NuxtLink>

    <NuxtLink
      to="/vendor/campaigns"
      class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
      :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
      active-class="bg-brand text-brandText"
      :title="isSidebarCollapsed ? $t('vendor.campaignsBtn') || 'Ad Campaigns' : ''"
    >
      <Icon name="heroicons:megaphone-20-solid" class="w-5 h-5 shrink-0" />
      <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('vendor.campaignsBtn') || 'Ad Campaigns' }}</span>
    </NuxtLink>

    <NuxtLink
      to="/vendor/analytics"
      class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
      :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
      active-class="bg-brand text-brandText"
      :title="isSidebarCollapsed ? $t('vendor.analyticsBtn') : ''"
    >
      <Icon name="heroicons:presentation-chart-line-20-solid" class="w-5 h-5 shrink-0" />
      <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('vendor.analyticsBtn') }}</span>
    </NuxtLink>
  </template>
</template>
