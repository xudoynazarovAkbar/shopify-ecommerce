<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useApi } from '../../composables/useApi';
import { useToastStore } from '../../stores/toast';
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

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

definePageMeta({
  middleware: ['auth', 'role'],
  meta: { roles: ['ADMIN'] },
});

const api = useApi();
const toastStore = useToastStore();

const formatDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Default range: Last Month (30 days ago)
const today = new Date();
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(today.getDate() - 30);

const startDate = ref(formatDate(thirtyDaysAgo));
const endDate = ref(formatDate(today));

const loading = ref(false);
const error = ref<string | null>(null);
const commissionRate = ref(0.10);
const chartDataList = ref<Array<{ date: string; campaignsRevenue: number; commissionRevenue: number; totalIncome: number }>>([]);

// Settings states
const commissionRateInput = ref<number | null>(10);
const settingsLoading = ref(false);

// Totals calculated reactively
const totalCampaignsRevenue = computed(() => {
  return chartDataList.value.reduce((sum, item) => sum + item.campaignsRevenue, 0);
});

const totalCommissionRevenue = computed(() => {
  return chartDataList.value.reduce((sum, item) => sum + item.commissionRevenue, 0);
});

const totalIncome = computed(() => {
  return chartDataList.value.reduce((sum, item) => sum + item.totalIncome, 0);
});

const fetchSettings = async () => {
  try {
    const res = await api.get<{ commissionRate: number }>('/stats/settings');
    commissionRateInput.value = Math.round(res.commissionRate * 100);
  } catch (err) {
    console.error('Failed to fetch global commission settings:', err);
  }
};

const saveCommissionRate = async () => {
  if (commissionRateInput.value === null || commissionRateInput.value < 0 || commissionRateInput.value > 100) {
    toastStore.error(useNuxtApp().$i18n.t('admin.revenue.invalidCommissionRate'));
    return;
  }

  settingsLoading.value = true;
  try {
    const rateDecimal = commissionRateInput.value / 100;
    await api.patch('/stats/settings', { commissionRate: rateDecimal });
    toastStore.success(useNuxtApp().$i18n.t('admin.revenue.settingsUpdateSuccess'));
    commissionRate.value = rateDecimal;
    await fetchRevenueStats();
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to update commission rate';
    toastStore.error(errMsg);
  } finally {
    settingsLoading.value = false;
  }
};

const fetchRevenueStats = async () => {
  if (!startDate.value || !endDate.value) return;

  const start = Date.parse(startDate.value);
  const end = Date.parse(endDate.value);
  if (start > end) {
    error.value = 'Start Date cannot be after End Date';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const res = await api.get<{ commissionRate: number; chartData: typeof chartDataList.value }>('/stats/revenue', {
      params: {
        startDate: startDate.value,
        endDate: endDate.value,
      },
    });
    commissionRate.value = res.commissionRate;
    chartDataList.value = res.chartData;
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch revenue stats';
    toastStore.error(error.value);
  } finally {
    loading.value = false;
  }
};

// Shortcut handlers
const setLastWeek = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);
  startDate.value = formatDate(start);
  endDate.value = formatDate(end);
};

const setLastMonth = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  startDate.value = formatDate(start);
  endDate.value = formatDate(end);
};

const setLast3Months = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 90);
  startDate.value = formatDate(start);
  endDate.value = formatDate(end);
};

const setLastYear = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 365);
  startDate.value = formatDate(start);
  endDate.value = formatDate(end);
};

// Watch changes to dates to fetch new data automatically
watch([startDate, endDate], () => {
  fetchRevenueStats();
});

onMounted(() => {
  fetchRevenueStats();
  fetchSettings();
});

// Chart.js configuration
const chartDataComputed = computed(() => {
  const labels = chartDataList.value.map(item => item.date);
  return {
    labels,
    datasets: [
      {
        label: useNuxtApp().$i18n.t('admin.revenue.campaignsRevenue'),
        borderColor: '#3b82f6', // blue
        backgroundColor: '#3b82f6',
        data: chartDataList.value.map(item => item.campaignsRevenue),
        tension: 0.3,
        pointRadius: labels.length > 30 ? 0 : 3,
        pointHoverRadius: 6,
        fill: false,
      },
      {
        label: useNuxtApp().$i18n.t('admin.revenue.commissionRevenue'),
        borderColor: '#10b981', // green
        backgroundColor: '#10b981',
        data: chartDataList.value.map(item => item.commissionRevenue),
        tension: 0.3,
        pointRadius: labels.length > 30 ? 0 : 3,
        pointHoverRadius: 6,
        fill: false,
      },
      {
        label: useNuxtApp().$i18n.t('admin.revenue.totalIncome'),
        borderColor: '#8b5cf6', // purple
        backgroundColor: '#8b5cf6',
        data: chartDataList.value.map(item => item.totalIncome),
        tension: 0.3,
        pointRadius: labels.length > 30 ? 0 : 4,
        pointHoverRadius: 7,
        fill: false,
      },
    ],
  };
});

interface ChartTooltipContext {
  dataset: {
    label: string;
  };
  parsed: {
    y: number;
  };
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: '#94a3b8',
        font: {
          family: 'sans-serif',
          weight: 'bold' as const,
          size: 11,
        },
      },
    },
    tooltip: {
      padding: 12,
      cornerRadius: 8,
      backgroundColor: '#1e293b',
      titleFont: { weight: 'bold' as const },
      callbacks: {
        label: (context: ChartTooltipContext) => {
          return ` ${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(148, 163, 184, 0.05)',
      },
      ticks: {
        color: '#94a3b8',
        font: { size: 10 },
      },
    },
    y: {
      grid: {
        color: 'rgba(148, 163, 184, 0.05)',
      },
      ticks: {
        color: '#94a3b8',
        font: { size: 10 },
        callback: (value: string | number) => `$${value}`,
      },
    },
  },
};
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
      <!-- Period Selection Panel -->
      <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Start Date picker -->
          <div class="relative rounded-xl border border-appBorder bg-appBg/50 hover:border-brand/30 transition shadow-sm focus-within:ring-2 focus-within:ring-brand/20 flex items-center px-3.5 py-2">
            <Icon name="heroicons:calendar-days-20-solid" class="w-5 h-5 text-textMuted shrink-0 mr-2" />
            <div class="flex-1 flex flex-col">
              <label class="text-[9px] uppercase font-black text-textMuted tracking-wider">{{ $t('admin.revenue.startDate') }}</label>
              <input
                type="date"
                v-model="startDate"
                class="bg-transparent text-textPrimary text-sm font-semibold outline-none border-none w-full p-0 [color-scheme:dark]"
              />
            </div>
          </div>

          <!-- End Date picker -->
          <div class="relative rounded-xl border border-appBorder bg-appBg/50 hover:border-brand/30 transition shadow-sm focus-within:ring-2 focus-within:ring-brand/20 flex items-center px-3.5 py-2">
            <Icon name="heroicons:calendar-days-20-solid" class="w-5 h-5 text-textMuted shrink-0 mr-2" />
            <div class="flex-1 flex flex-col">
              <label class="text-[9px] uppercase font-black text-textMuted tracking-wider">{{ $t('admin.revenue.endDate') }}</label>
              <input
                type="date"
                v-model="endDate"
                class="bg-transparent text-textPrimary text-sm font-semibold outline-none border-none w-full p-0 [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        <!-- Quick Select Shortcuts -->
        <div class="flex flex-wrap gap-2 pt-1">
          <button
            @click="setLastWeek"
            class="px-4 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
          >
            {{ $t('admin.revenue.lastWeek') }}
          </button>
          <button
            @click="setLastMonth"
            class="px-4 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
          >
            {{ $t('admin.revenue.lastMonth') }}
          </button>
          <button
            @click="setLast3Months"
            class="px-4 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
          >
            {{ $t('admin.revenue.last3Months') }}
          </button>
          <button
            @click="setLastYear"
            class="px-4 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
          >
            {{ $t('admin.revenue.lastYear') }}
          </button>
        </div>
      </div>

      <!-- Global Settings Control Panel -->
      <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
        <div class="space-y-1">
          <h3 class="font-extrabold text-textPrimary text-sm flex items-center gap-1.5">
            <Icon name="heroicons:cog-6-tooth" class="text-brand w-5 h-5 shrink-0" />
            <span>{{ $t('admin.revenue.platformSettings') }}</span>
          </h3>
          <p class="text-[11px] text-textMuted leading-relaxed">
            Update the system commission rate. This will immediately apply to all new checked-out orders.
          </p>
        </div>
        <div class="space-y-3">
          <!-- Input field -->
          <div class="relative rounded-xl border border-appBorder bg-appBg/50 hover:border-brand/30 transition shadow-sm focus-within:ring-2 focus-within:ring-brand/20 flex items-center px-3.5 py-1.5">
            <Icon name="heroicons:percent-badge" class="w-4 h-4 text-textMuted shrink-0 mr-2" />
            <div class="flex-1 flex flex-col">
              <label class="text-[8px] uppercase font-black text-textMuted tracking-wider">{{ $t('admin.revenue.commissionRateLabel') }}</label>
              <input
                type="number"
                v-model="commissionRateInput"
                min="0"
                max="100"
                :placeholder="$t('admin.revenue.commissionRatePlaceholder')"
                class="bg-transparent text-textPrimary text-sm font-semibold outline-none border-none w-full p-0"
              />
            </div>
          </div>
          <!-- Save button -->
          <button
            @click="saveCommissionRate"
            :disabled="settingsLoading"
            class="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand hover:bg-brandHover text-brandText transition duration-200 flex items-center gap-2 justify-center w-full shadow-sm"
          >
            <Icon v-if="settingsLoading" name="heroicons:arrow-path" class="w-4 h-4 animate-spin shrink-0" />
            <Icon v-else name="heroicons:check-circle" class="w-4 h-4 shrink-0" />
            <span>{{ $t('admin.revenue.saveCommissionBtn') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Error Banner -->
    <div
      v-if="error"
      class="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-2"
    >
      <Icon name="heroicons:exclamation-circle" class="w-5 h-5 shrink-0" />
      {{ error }}
    </div>

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
            <Line :data="chartDataComputed" :options="chartOptions" />
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>
