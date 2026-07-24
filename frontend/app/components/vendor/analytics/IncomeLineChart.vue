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
import type { IncomeStatItem } from '../../../composables/useVendorAnalytics';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

const startDate = defineModel<string>('startDate', { required: true });
const endDate = defineModel<string>('endDate', { required: true });

defineProps<{
  loading: boolean;
  dataList: IncomeStatItem[];
  chartData: ChartData<'line'>;
  chartOptions: ChartOptions<'line'>;
}>();

defineEmits<{
  (e: 'setLastWeek' | 'setLastMonth' | 'setLast3Months' | 'setLastYear'): void;
}>();
</script>

<template>
  <div class="space-y-6">
    <!-- Graph Date Control Block -->
    <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-appBorder pb-4">
        <div class="space-y-0.5">
          <h3 class="font-extrabold text-textPrimary text-base flex items-center gap-2">
            <Icon name="heroicons:banknotes" class="text-emerald-500 w-5 h-5 shrink-0" />
            <span>{{ $t('vendor.analytics.incomeTitle') }}</span>
          </h3>
          <p class="text-[11px] text-textMuted">{{ $t('vendor.analytics.incomeSubtitle') }}</p>
        </div>
        <span v-if="loading" class="text-xs text-brand animate-pulse font-bold flex items-center gap-1.5 self-start md:self-auto">
          <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
          {{ $t('vendor.analytics.loading') }}
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Start Date picker -->
        <div class="relative rounded-xl border border-appBorder bg-appBg/50 hover:border-brand/30 transition shadow-sm focus-within:ring-2 focus-within:ring-brand/20 flex items-center px-3.5 py-2">
          <Icon name="heroicons:calendar-days-20-solid" class="w-5 h-5 text-textMuted shrink-0 mr-2" />
          <div class="flex-1 flex flex-col">
            <label class="text-[9px] uppercase font-black text-textMuted tracking-wider">{{ $t('admin.revenue.startDate') }}</label>
            <input
              v-model="startDate"
              type="date"
              class="bg-transparent text-textPrimary text-sm font-semibold outline-none border-none w-full p-0 [color-scheme:dark]"
            >
          </div>
        </div>

        <!-- End Date picker -->
        <div class="relative rounded-xl border border-appBorder bg-appBg/50 hover:border-brand/30 transition shadow-sm focus-within:ring-2 focus-within:ring-brand/20 flex items-center px-3.5 py-2">
          <Icon name="heroicons:calendar-days-20-solid" class="w-5 h-5 text-textMuted shrink-0 mr-2" />
          <div class="flex-1 flex flex-col">
            <label class="text-[9px] uppercase font-black text-textMuted tracking-wider">{{ $t('admin.revenue.endDate') }}</label>
            <input
              v-model="endDate"
              type="date"
              class="bg-transparent text-textPrimary text-sm font-semibold outline-none border-none w-full p-0 [color-scheme:dark]"
            >
          </div>
        </div>
      </div>

      <!-- Shortcuts -->
      <div class="flex flex-wrap gap-2 pt-1">
        <button
          class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
          @click="$emit('setLastWeek')"
        >
          {{ $t('admin.revenue.lastWeek') }}
        </button>
        <button
          class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
          @click="$emit('setLastMonth')"
        >
          {{ $t('admin.revenue.lastMonth') }}
        </button>
        <button
          class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
          @click="$emit('setLast3Months')"
        >
          {{ $t('admin.revenue.last3Months') }}
        </button>
        <button
          class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
          @click="$emit('setLastYear')"
        >
          {{ $t('admin.revenue.lastYear') }}
        </button>
      </div>

      <!-- Income Graph Line Frame -->
      <div class="h-80 w-full relative pt-4">
        <div v-if="loading && dataList.length === 0" class="absolute inset-0 flex items-center justify-center bg-cardBg/80">
          <div class="text-center space-y-3">
            <Icon name="heroicons:arrow-path" class="w-8 h-8 text-brand animate-spin mx-auto" />
            <p class="text-xs text-textMuted font-bold">{{ $t('vendor.analytics.loading') }}</p>
          </div>
        </div>

        <div v-else-if="dataList.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-3">
          <div class="w-12 h-12 rounded-full bg-appBg border border-appBorder text-textMuted/40 flex items-center justify-center">
            <Icon name="heroicons:chart-bar" class="w-6 h-6" />
          </div>
          <h4 class="font-bold text-sm text-textPrimary">{{ $t('vendor.analytics.noData') }}</h4>
        </div>

        <div v-else class="h-full w-full">
          <ClientOnly>
            <Line :data="chartData" :options="chartOptions" />
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>
