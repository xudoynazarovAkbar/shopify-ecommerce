<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useVendorAnalytics } from '../../composables/useVendorAnalytics';

definePageMeta({
  middleware: ['auth', 'role'],
  meta: { roles: ['VENDOR'] },
});

const {
  incomeStartDate,
  incomeEndDate,
  incomeLoading,
  incomeDataList,
  productsStartDate,
  productsEndDate,
  productsLoading,
  productsDataList,
  totalIncomeSum,
  totalUnitsSoldSum,
  fetchIncomeStats,
  fetchProductSalesStats,
  setIncomeLastWeek,
  setIncomeLastMonth,
  setIncomeLast3Months,
  setIncomeLastYear,
  setProductsLastWeek,
  setProductsLastMonth,
  setProductsLast3Months,
  setProductsLastYear,
  incomeChartDataComputed,
  productsChartDataComputed,
  incomeChartOptionsComputed,
  productsChartOptionsComputed,
} = useVendorAnalytics();

// Watchers
watch([incomeStartDate, incomeEndDate], () => {
  fetchIncomeStats();
});

watch([productsStartDate, productsEndDate], () => {
  fetchProductSalesStats();
});

onMounted(() => {
  fetchIncomeStats();
  fetchProductSalesStats();
});
</script>

<template>
  <div class="space-y-10">
    <!-- Header -->
    <div class="space-y-1">
      <h1 class="text-3xl font-black text-textPrimary tracking-tight">
        {{ $t('vendor.analyticsBtn') }}
      </h1>
      <p class="text-sm text-textMuted">
        Analyze net store earnings and identify high-performing inventory lines using interactive visual statistics.
      </p>
    </div>

    <!-- Quick Stats Cards -->
    <VendorAnalyticsSummaryCards
      :total-income-sum="totalIncomeSum"
      :total-units-sold-sum="totalUnitsSoldSum"
    />

    <!-- SECTION 1: NET INCOME GRAPH -->
    <VendorAnalyticsIncomeLineChart
      v-model:start-date="incomeStartDate"
      v-model:end-date="incomeEndDate"
      :loading="incomeLoading"
      :data-list="incomeDataList"
      :chart-data="incomeChartDataComputed"
      :chart-options="incomeChartOptionsComputed"
      @set-last-week="setIncomeLastWeek"
      @set-last-month="setIncomeLastMonth"
      @set-last-3-months="setIncomeLast3Months"
      @set-last-year="setIncomeLastYear"
    />

    <!-- SECTION 2: PRODUCT SALES GRAPH -->
    <VendorAnalyticsProductSalesChart
      v-model:start-date="productsStartDate"
      v-model:end-date="productsEndDate"
      :loading="productsLoading"
      :data-list="productsDataList"
      :chart-data="productsChartDataComputed"
      :chart-options="productsChartOptionsComputed"
      @set-last-week="setProductsLastWeek"
      @set-last-month="setProductsLastMonth"
      @set-last-3-months="setProductsLast3Months"
      @set-last-year="setProductsLastYear"
    />
  </div>
</template>
