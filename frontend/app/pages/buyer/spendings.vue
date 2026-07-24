<script setup lang="ts">
import { useBuyerSpendings } from '../../composables/useBuyerSpendings';

definePageMeta({
  middleware: ['auth', 'role'],
  meta: { roles: ['BUYER'] },
});

const {
  startDate,
  endDate,
  loading,
  spendingsDataList,
  totalSpentSum,
  setLastWeek,
  setLastMonth,
  setLast3Months,
  setLastYear,
} = useBuyerSpendings();
</script>

<template>
  <div class="space-y-10">
    <!-- Header -->
    <div class="space-y-1">
      <h1 class="text-3xl font-black text-textPrimary tracking-tight">
        {{ $t('buyer.spendings.title') }}
      </h1>
      <p class="text-sm text-textMuted">
        {{ $t('buyer.spendings.subtitle') }}
      </p>
    </div>

    <!-- Quick Stats Cards -->
    <BuyerSpendingsStats :total-spent-sum="totalSpentSum" />

    <!-- Graph and Controls Frame -->
    <div class="space-y-6">
      <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm space-y-4">
        <!-- Section Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-appBorder pb-4">
          <div class="space-y-0.5">
            <h3 class="font-extrabold text-textPrimary text-base flex items-center gap-2">
              <Icon name="heroicons:presentation-chart-line-solid" class="text-blue-500 w-5 h-5 shrink-0" />
              <span>{{ $t('buyer.spendings.chartTitle') }}</span>
            </h3>
          </div>
          <span v-if="loading" class="text-xs text-brand animate-pulse font-bold flex items-center gap-1.5 self-start md:self-auto">
            <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
            {{ $t('buyer.spendings.loading') }}
          </span>
        </div>

        <!-- Date Inputs & Shortcut triggers -->
        <BuyerSpendingsFilter
          v-model:start-date="startDate"
          v-model:end-date="endDate"
          @set-last-week="setLastWeek"
          @set-last-month="setLastMonth"
          @set-last3-months="setLast3Months"
          @set-last-year="setLastYear"
        />

        <!-- Chart canvas wrapper -->
        <BuyerSpendingsChart
          :spendings-data-list="spendingsDataList"
          :loading="loading"
        />
      </div>
    </div>
  </div>
</template>
