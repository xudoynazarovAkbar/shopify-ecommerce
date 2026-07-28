<script setup lang="ts">
import type { Vendor } from '../../types';
import { useImageResolver } from '../../composables/useImageResolver';

defineProps<{
  vendor: Vendor;
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
  <div class="bg-cardBg border border-appBorder rounded-2xl p-6 md:p-8 shadow-sm transition-colors duration-200">
    <div class="flex flex-col md:flex-row gap-6 items-start md:items-center">
      <!-- Store Avatar/Logo Image -->
      <div class="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl overflow-hidden shadow-md border border-appBorder bg-white">
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

      <!-- Shop Info -->
      <div class="flex-1 space-y-3">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-2xl md:text-3xl font-extrabold text-textPrimary leading-tight">
            {{ vendor.shopName }}
          </h1>

          <!-- High Trust Badge -->
          <span
            v-if="vendor.autoApproveProducts"
            v-tooltip="'High Trust Merchant: Auto Product Approval enabled'"
            class="flex items-center gap-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold px-2.5 py-1 rounded-full border border-teal-500/20"
          >
            <Icon name="heroicons:shield-check" class="w-4 h-4 shrink-0" />
            <span>{{ $t('vendor.trusted') }}</span>
          </span>
        </div>

        <p class="text-textSecondary text-sm md:text-base leading-relaxed max-w-2xl">
          {{ vendor.shopDescription || $t('home.noDescription') }}
        </p>

        <!-- Dynamic Rating Stats -->
        <div class="flex flex-wrap items-center gap-4 text-sm border-t border-appBorder pt-4 mt-2">
          <!-- Average Stars -->
          <div class="flex items-center gap-1.5 font-bold text-textPrimary">
            <Icon name="heroicons:star-20-solid" class="w-5 h-5 text-amber-500" />
            <span>
              {{ vendor.averageRating != null ? vendor.averageRating.toFixed(1) : '0.0' }}
            </span>
            <span class="text-textMuted text-xs font-normal">/ 5.0</span>
          </div>

          <span class="text-appBorder">|</span>

          <!-- Total Review Count -->
          <div class="flex items-center gap-1 text-textSecondary">
            <Icon name="heroicons:chat-bubble-left-right-20-solid" class="w-4 h-4 text-textMuted" />
            <span class="font-semibold">{{ vendor.reviewCount || 0 }}</span>
            <span class="text-textMuted text-xs">{{ $t('home.noRatings').toLowerCase() }}</span>
          </div>

          <span class="text-appBorder">|</span>

          <!-- Joined Date -->
          <div class="text-textMuted text-xs flex items-center gap-1">
            <Icon name="heroicons:calendar" class="w-4 h-4" />
            <span>{{ $t('vendor.memberSince') }}: {{ new Date(vendor.createdAt).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
