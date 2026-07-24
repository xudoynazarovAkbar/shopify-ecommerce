<script setup lang="ts">
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import type { RevenueStatItem } from '../../../composables/useAdminRevenue';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

defineProps<{
  loading: boolean;
  chartDataList: RevenueStatItem[];
  chartData: ChartData<'line'>;
  chartOptions: ChartOptions<'line'>;
}>();
</script>

<template>
  <!-- Line Chart Visual Frame -->
  <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm space-y-4">
    <div class="flex items-center justify-between border-b border-appBorder pb-4">
      <h3 class="font-extrabold text-textPrimary text-base flex items-center gap-2">
        <Icon name="heroicons:presentation-chart-line" class="text-brand w-5 h-5" />
        {{ $t('admin.revenue.title') }}
      </h3>
      <span v-if="loading" class="text-xs text-brand animate-pulse font-bold flex items-center gap-1.5">
        <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
        {{ $t('admin.revenue.loading') }}
      </span>
    </div>

    <!-- Graph -->
    <div class="h-96 w-full relative">
      <div v-if="loading && chartDataList.length === 0" class="absolute inset-0 flex items-center justify-center bg-cardBg/80">
        <div class="text-center space-y-3">
          <Icon name="heroicons:arrow-path" class="w-8 h-8 text-brand animate-spin mx-auto" />
          <p class="text-xs text-textMuted font-bold">{{ $t('admin.revenue.loading') }}</p>
        </div>
      </div>

      <div v-else-if="chartDataList.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-3">
        <div class="w-12 h-12 rounded-full bg-appBg border border-appBorder text-textMuted/40 flex items-center justify-center">
          <Icon name="heroicons:chart-bar" class="w-6 h-6" />
        </div>
        <div class="space-y-1">
          <h4 class="font-bold text-sm text-textPrimary">{{ $t('admin.revenue.noData') }}</h4>
        </div>
      </div>

      <div v-else class="h-full w-full">
        <ClientOnly>
          <Line :data="chartData" :options="chartOptions" />
        </ClientOnly>
      </div>
    </div>
  </div>
</template>
