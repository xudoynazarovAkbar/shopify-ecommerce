<script setup lang="ts">
defineProps<{
  isSidebarCollapsed: boolean;
}>();
</script>

<template>
  <div
    :class="[
      'border-t border-appBorder shrink-0 flex flex-col gap-3 bg-cardBg transition-all duration-300',
      isSidebarCollapsed ? 'p-2' : 'p-4'
    ]"
  >
    <div
      :class="[
        'flex items-center justify-between gap-2',
        isSidebarCollapsed ? 'md:flex-col md:items-center' : ''
      ]"
    >
      <CommonLanguageSwitcher :collapsed="isSidebarCollapsed" />
      <CommonThemeSwitcher />
    </div>
    <div v-if="!isSidebarCollapsed" class="text-center text-[10px] text-textMuted">
      &copy; 2026 Shopify Multi-Vendor Marketplace.
    </div>
  </div>
</template>
