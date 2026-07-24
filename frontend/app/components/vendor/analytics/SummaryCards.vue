<script setup lang="ts">
defineProps<{
  totalIncomeSum: number;
  totalUnitsSoldSum: number;
}>();
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <!-- Income summary -->
    <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm hover:shadow transition flex items-center gap-5">
      <div class="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
        <Icon name="heroicons:banknotes-solid" class="w-6 h-6" />
      </div>
      <div>
        <span class="text-[10px] text-textMuted font-bold block uppercase tracking-wide">
          {{ $t('vendor.earnings') }} (Selected Period)
        </span>
        <span class="text-2xl font-black text-textPrimary block mt-1">
          ${{ totalIncomeSum.toFixed(2) }}
        </span>
      </div>
    </div>

    <!-- Volume sold summary -->
    <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm hover:shadow transition flex items-center gap-5">
      <div class="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
        <Icon name="heroicons:squares-plus-solid" class="w-6 h-6" />
      </div>
      <div>
        <span class="text-[10px] text-textMuted font-bold block uppercase tracking-wide">
          {{ $t('vendor.analytics.unitsSold') }} (Selected Period)
        </span>
        <span class="text-2xl font-black text-textPrimary block mt-1">
          {{ totalUnitsSoldSum }} units
        </span>
      </div>
    </div>
  </div>
</template>
