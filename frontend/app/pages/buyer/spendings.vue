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
  meta: { roles: ['BUYER'] },
});

const api = useApi();
const toastStore = useToastStore();

const formatDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Default Date Configuration: Last 30 Days
const getInitialDates = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  return {
    start: formatDate(thirtyDaysAgo),
    end: formatDate(today),
  };
};

const dates = getInitialDates();
const startDate = ref(dates.start);
const endDate = ref(dates.end);
const loading = ref(false);
const error = ref<string | null>(null);
const spendingsDataList = ref<Array<{ date: string; spendings: number }>>([]);

const totalSpentSum = computed(() => {
  return spendingsDataList.value.reduce((sum, item) => sum + item.spendings, 0);
});

const fetchSpendingsStats = async () => {
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
    const res = await api.get<typeof spendingsDataList.value>('/stats/buyer/spendings', {
      params: {
        startDate: startDate.value,
        endDate: endDate.value,
      },
    });
    spendingsDataList.value = res;
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch spendings';
    toastStore.error(error.value);
  } finally {
    loading.value = false;
  }
};

// Date Shortcuts
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

watch([startDate, endDate], () => {
  fetchSpendingsStats();
});

onMounted(() => {
  fetchSpendingsStats();
});

const spendingsChartDataComputed = computed(() => {
  const labels = spendingsDataList.value.map(item => item.date);
  return {
    labels,
    datasets: [
      {
        label: useNuxtApp().$i18n.t('buyer.spendings.chartTitle'),
        borderColor: '#3b82f6', // Premium Blue
        backgroundColor: '#3b82f6',
        data: spendingsDataList.value.map(item => item.spendings),
        tension: 0.3,
        pointRadius: labels.length > 30 ? 0 : 3,
        pointHoverRadius: 6,
        fill: false,
      },
    ],
  };
});

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
      },
    },
  },
};

interface ChartTooltipContext {
  dataset: {
    label: string;
  };
  parsed: {
    y: number;
  };
}

const spendingsChartOptionsComputed = computed(() => {
  const options = JSON.parse(JSON.stringify(chartOptions));
  options.plugins.tooltip.callbacks = {
    label: (context: ChartTooltipContext) => ` ${context.dataset.label}: $${context.parsed.y.toFixed(2)}`,
  };
  options.scales.y.ticks.callback = (value: string | number) => `$${value}`;
  return options;
});
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

        <!-- Date Inputs -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Start Date picker -->
          <div class="relative rounded-xl border border-appBorder bg-appBg/50 hover:border-brand/30 transition shadow-sm focus-within:ring-2 focus-within:ring-brand/20 flex items-center px-3.5 py-2">
            <Icon name="heroicons:calendar-days-20-solid" class="w-5 h-5 text-textMuted shrink-0 mr-2" />
            <div class="flex-1 flex flex-col">
              <label class="text-[9px] uppercase font-black text-textMuted tracking-wider">{{ $t('buyer.spendings.startDate') }}</label>
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
              <label class="text-[9px] uppercase font-black text-textMuted tracking-wider">{{ $t('buyer.spendings.endDate') }}</label>
              <input
                v-model="endDate"
                type="date"
                class="bg-transparent text-textPrimary text-sm font-semibold outline-none border-none w-full p-0 [color-scheme:dark]"
              >
            </div>
          </div>
        </div>

        <!-- Shortcut triggers -->
        <div class="flex flex-wrap gap-2 pt-1">
          <button
            class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
            @click="setLastWeek"
          >
            {{ $t('buyer.spendings.lastWeek') }}
          </button>
          <button
            class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
            @click="setLastMonth"
          >
            {{ $t('buyer.spendings.lastMonth') }}
          </button>
          <button
            class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
            @click="setLast3Months"
          >
            {{ $t('buyer.spendings.last3Months') }}
          </button>
          <button
            class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
            @click="setLastYear"
          >
            {{ $t('buyer.spendings.lastYear') }}
          </button>
        </div>

        <!-- Chart canvas wrapper -->
        <div class="h-80 w-full relative pt-4">
          <div v-if="loading && spendingsDataList.length === 0" class="absolute inset-0 flex items-center justify-center bg-cardBg/80">
            <div class="text-center space-y-3">
              <Icon name="heroicons:arrow-path" class="w-8 h-8 text-brand animate-spin mx-auto" />
              <p class="text-xs text-textMuted font-bold">{{ $t('buyer.spendings.loading') }}</p>
            </div>
          </div>

          <div v-else-if="spendingsDataList.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div class="w-12 h-12 rounded-full bg-appBg border border-appBorder text-textMuted/40 flex items-center justify-center">
              <Icon name="heroicons:chart-bar" class="w-6 h-6" />
            </div>
            <h4 class="font-bold text-sm text-textPrimary">{{ $t('buyer.spendings.noData') }}</h4>
          </div>

          <div v-else class="h-full w-full">
            <ClientOnly>
              <Line :data="spendingsChartDataComputed" :options="spendingsChartOptionsComputed" />
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>