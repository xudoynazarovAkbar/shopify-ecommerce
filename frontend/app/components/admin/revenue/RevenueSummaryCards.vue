<script setup lang="ts">
defineProps<{
  totalCampaignsRevenue: number;
  totalCommissionRevenue: number;
  commissionRate: number;
  totalIncome: number;
}>();
</script>

<template>
  <!-- Financial Summary Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
    <!-- Campaigns Revenue Card -->
    <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm hover:shadow transition flex items-center gap-5">
      <div class="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
        <Icon name="heroicons:megaphone-solid" class="w-6 h-6" />
      </div>
      <div>
        <span class="text-[10px] text-textMuted font-bold block uppercase tracking-wide">{{ $t('admin.revenue.campaignsRevenue') }}</span>
        <span class="text-2xl font-black text-textPrimary block mt-1">
          ${{ totalCampaignsRevenue.toFixed(2) }}
        </span>
      </div>
    </div>

    <!-- Commission Revenue Card -->
    <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm hover:shadow transition flex items-center gap-5">
      <div class="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
        <Icon name="heroicons:banknotes-solid" class="w-6 h-6" />
      </div>
      <div>
        <span class="text-[10px] text-textMuted font-bold block uppercase tracking-wide">
          {{ $t('admin.revenue.commissionRevenue') }}
          <span class="text-[9px] text-emerald-500 font-extrabold lowercase">({{ Math.round(commissionRate * 100) }}%)</span>
        </span>
        <span class="text-2xl font-black text-textPrimary block mt-1">
          ${{ totalCommissionRevenue.toFixed(2) }}
        </span>
      </div>
    </div>

    <!-- Total Income Card -->
    <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm hover:shadow transition flex items-center gap-5">
      <div class="w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
        <Icon name="heroicons:currency-dollar-solid" class="w-6 h-6" />
      </div>
      <div>
        <span class="text-[10px] text-textMuted font-bold block uppercase tracking-wide">{{ $t('admin.revenue.totalIncome') }}</span>
        <span class="text-2xl font-black text-textPrimary block mt-1">
          ${{ totalIncome.toFixed(2) }}
        </span>
      </div>
    </div>
  </div>
</template>
