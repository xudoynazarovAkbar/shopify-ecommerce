<script setup lang="ts">
interface Props {
  totalSpentSum: number;
}
defineProps<Props>();
</script>

<template>
  <div class="grid grid-cols-1 gap-6">
    <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm hover:shadow transition flex items-center gap-5">
      <div class="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
        <Icon name="heroicons:credit-card-solid" class="w-6 h-6" />
      </div>
      <div>
        <span class="text-[10px] text-textMuted font-bold block uppercase tracking-wide">
          {{ $t('buyer.spendings.totalSpent') }} (Selected Period)
        </span>
        <span class="text-2xl font-black text-textPrimary block mt-1">
          ${{ totalSpentSum.toFixed(2) }}
        </span>
      </div>
    </div>
  </div>
</template>
