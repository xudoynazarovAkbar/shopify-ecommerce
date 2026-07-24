<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useAdminRevenue } from '../../composables/useAdminRevenue';

definePageMeta({
  middleware: ['auth', 'role'],
  meta: { roles: ['ADMIN'] },
});

const {
  startDate,
  endDate,
  loading,
  error,
  commissionRate,
  chartDataList,
  commissionRateInput,
  settingsLoading,
  totalCampaignsRevenue,
  totalCommissionRevenue,
  totalIncome,
  fetchSettings,
  saveCommissionRate,
  fetchRevenueStats,
  setLastWeek,
  setLastMonth,
  setLast3Months,
  setLastYear,
  chartDataComputed,
  chartOptions,
} = useAdminRevenue();

// Watch changes to dates to fetch new data automatically
watch([startDate, endDate], () => {
  fetchRevenueStats();
});

onMounted(() => {
  fetchRevenueStats();
  fetchSettings();
});
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="space-y-1">
      <h1 class="text-3xl font-black text-textPrimary tracking-tight">
        {{ $t('admin.revenue.title') }}
      </h1>
      <p class="text-sm text-textMuted">
        {{ $t('admin.revenue.subtitle') }}
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <AdminRevenueDateFilter
        v-model:start-date="startDate"
        v-model:end-date="endDate"
        @set-last-week="setLastWeek"
        @set-last-month="setLastMonth"
        @set-last-3-months="setLast3Months"
        @set-last-year="setLastYear"
      />

      <AdminRevenueSettings
        v-model:commission-rate-input="commissionRateInput"
        :settings-loading="settingsLoading"
        @save="saveCommissionRate"
      />
    </div>

    <!-- Error Banner -->
    <div
      v-if="error"
      class="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-2"
    >
      <Icon name="heroicons:exclamation-circle" class="w-5 h-5 shrink-0" />
      {{ error }}
    </div>

    <AdminRevenueSummaryCards
      :total-campaigns-revenue="totalCampaignsRevenue"
      :total-commission-revenue="totalCommissionRevenue"
      :commission-rate="commissionRate"
      :total-income="totalIncome"
    />

    <!-- Line Chart Visual Frame -->
    <AdminRevenueLineChart
      :loading="loading"
      :chart-data-list="chartDataList"
      :chart-data="chartDataComputed"
      :chart-options="chartOptions"
    />
  </div>
</template>
