<script setup lang="ts">
import type { AdPricingSettings } from '../../../types';

defineProps<{
  pricingSettings: AdPricingSettings | null;
}>();
</script>

<template>
  <div class="bg-cardBg border border-appBorder rounded-2xl p-5 shadow-sm space-y-4">
    <h3 class="text-xs font-extrabold text-textPrimary uppercase tracking-wider border-b border-appBorder pb-2 flex items-center gap-1.5">
      <Icon name="heroicons:currency-dollar" class="w-4.5 h-4.5 text-brand" />
      <span>{{ $t('vendor.campaigns.pricingMatrix') }}</span>
    </h3>

    <div class="space-y-2 text-xs">
      <div class="flex items-center justify-between text-textSecondary border-b border-appBorder/40 pb-1.5">
        <span>Tier 1 Flat Price</span>
        <span class="font-extrabold text-textPrimary">${{ pricingSettings?.priceTier1?.toFixed(2) || '100.00' }}</span>
      </div>
      <div class="flex items-center justify-between text-textSecondary border-b border-appBorder/40 pb-1.5">
        <span>Tier 2 Flat Price</span>
        <span class="font-extrabold text-textPrimary">${{ pricingSettings?.priceTier2?.toFixed(2) || '80.00' }}</span>
      </div>
      <div class="flex items-center justify-between text-textSecondary border-b border-appBorder/40 pb-1.5">
        <span>Tier 3 Flat Price</span>
        <span class="font-extrabold text-textPrimary">${{ pricingSettings?.priceTier3?.toFixed(2) || '60.00' }}</span>
      </div>
      <div class="flex items-center justify-between text-textSecondary pb-1">
        <span>Tier 4 Flat Price</span>
        <span class="font-extrabold text-textPrimary">${{ pricingSettings?.priceTier4?.toFixed(2) || '40.00' }}</span>
      </div>
    </div>
  </div>
</template>
