<script setup lang="ts">
import type { Vendor } from '../../types';
import { useImageResolver } from '../../composables/useImageResolver';

defineProps<{
  vendors: Vendor[];
  loading: boolean;
}>();

const { resolveImageUrl } = useImageResolver();

// Deterministic vibrant colors for fallback logos (white bg + dynamic text color)
const getLogoColor = (name: string): string => {
  const colors = ['dc2626', '000000', '2563eb', 'ea580c', '7c3aed', '059669'];
  const index = name ? name.length % colors.length : 0;
  return colors[index] || '000000';
};
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-extrabold text-textPrimary flex items-center gap-2">
        <Icon
          name="heroicons:building-storefront"
          class="text-brand w-5 h-5"
        />
        {{ $t('home.featuredStores') }}
      </h2>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div
        v-for="i in 6"
        :key="i"
        class="h-40 bg-appBg animate-pulse rounded-2xl border border-appBorder"
      />
    </div>

    <div v-else-if="vendors.length === 0" class="text-textMuted text-sm">
      {{ $t('home.noMerchants') }}
    </div>

    <!-- Vendor Cards Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
      <NuxtLink
        v-for="vendor in vendors"
        :key="vendor.id"
        :to="`/vendor/${vendor.id}`"
        class="group relative flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-800/40 hover:bg-cardBg rounded-2xl border border-transparent hover:border-appBorder hover:shadow-lg transition-all duration-300 cursor-pointer text-center h-44"
      >
        <!-- Logo container: White square with highly rounded corners -->
        <div class="w-20 h-20 rounded-2xl bg-cardBg border border-appBorder shadow-sm flex items-center justify-center overflow-hidden mb-3 transition-colors group-hover:bg-gray-50 dark:group-hover:bg-gray-900">
          <img
            v-if="vendor.logo"
            :src="resolveImageUrl(vendor.logo)"
            alt="logo"
            class="w-full h-full object-cover"
          />
          <img
            v-else
            :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.shopName)}&background=fff&color=${getLogoColor(vendor.shopName)}&size=128&bold=true`"
            alt="logo"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Name -->
        <h3 class="font-bold text-sm text-textPrimary leading-tight line-clamp-2 w-full px-1">
          {{ vendor.shopName }}
        </h3>

        <!-- Rating (optional, compact) -->
        <div
          v-if="vendor.averageRating"
          class="flex items-center gap-0.5 text-amber-500 font-bold text-xs mt-1"
        >
          <Icon name="heroicons:star-20-solid" class="w-3.5 h-3.5" />
          {{ vendor.averageRating.toFixed(1) }}
        </div>

        <!-- Floating Tooltip for Description -->
        <div class="absolute bottom-full mb-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-200 bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl z-20 w-48 left-1/2 -translate-x-1/2">
          <p class="font-bold mb-1 text-white border-b border-slate-800 pb-1">{{ vendor.shopName }}</p>
          <p class="text-slate-300 text-[11px] leading-relaxed line-clamp-3">
            {{ vendor.shopDescription || $t('home.noDescription') }}
          </p>
          <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
