<script setup lang="ts">
import { useAuthStore } from '../../stores/auth';

defineProps<{
  isSidebarCollapsed: boolean;
}>();

const authStore = useAuthStore();
</script>

<template>
  <!-- Admin Navigation -->
  <template v-if="authStore.isAuthenticated && authStore.role === 'ADMIN'">
    <div
      v-if="!isSidebarCollapsed"
      class="mt-4 mb-1 px-4 text-xs font-semibold text-textMuted uppercase tracking-wider"
    >
      {{ $t('adminCentral') }}
    </div>
    <hr v-else class="border-appBorder my-3 md:block hidden mx-2" >

    <NuxtLink
      to="/admin"
      class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
      :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
      active-class="bg-brand text-brandText"
      end
      :title="isSidebarCollapsed ? $t('dashboard') : ''"
    >
      <Icon name="heroicons:chart-pie-20-solid" class="w-5 h-5 shrink-0" />
      <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('dashboard') }}</span>
    </NuxtLink>

    <NuxtLink
      to="/admin/vendors"
      class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
      :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
      active-class="bg-brand text-brandText"
      :title="isSidebarCollapsed ? $t('admin.onboardingBtn') : ''"
    >
      <Icon name="heroicons:building-storefront-20-solid" class="w-5 h-5 shrink-0" />
      <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('admin.onboardingBtn') }}</span>
    </NuxtLink>

    <NuxtLink
      to="/admin/products"
      class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
      :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
      active-class="bg-brand text-brandText"
      :title="isSidebarCollapsed ? $t('admin.moderationBtn') : ''"
    >
      <Icon name="heroicons:sparkles-20-solid" class="w-5 h-5 shrink-0" />
      <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('admin.moderationBtn') }}</span>
    </NuxtLink>

    <NuxtLink
      to="/admin/categories"
      class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
      :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
      active-class="bg-brand text-brandText"
      :title="isSidebarCollapsed ? $t('admin.categoriesBtn') : ''"
    >
      <Icon name="heroicons:tag-20-solid" class="w-5 h-5 shrink-0" />
      <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('admin.categoriesBtn') }}</span>
    </NuxtLink>

    <NuxtLink
      to="/admin/campaigns"
      class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
      :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
      active-class="bg-brand text-brandText"
      :title="isSidebarCollapsed ? $t('admin.campaignsBtn') || 'Ad Campaigns & Pricing' : ''"
    >
      <Icon name="heroicons:megaphone-20-solid" class="w-5 h-5 shrink-0" />
      <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('admin.campaignsBtn') || 'Ad Campaigns & Pricing' }}</span>
    </NuxtLink>

    <NuxtLink
      to="/admin/revenue"
      class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
      :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
      active-class="bg-brand text-brandText"
      :title="isSidebarCollapsed ? $t('admin.revenueBtn') || 'Revenue' : ''"
    >
      <Icon name="heroicons:currency-dollar-20-solid" class="w-5 h-5 shrink-0" />
      <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('admin.revenueBtn') || 'Revenue' }}</span>
    </NuxtLink>
  </template>
</template>
