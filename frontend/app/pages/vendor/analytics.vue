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
  meta: { roles: ['VENDOR'] },
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

const dates1 = getInitialDates();
const dates2 = getInitialDates();

// Income graph state
const incomeStartDate = ref(dates1.start);
const incomeEndDate = ref(dates1.end);
const incomeLoading = ref(false);
const incomeError = ref<string | null>(null);
const incomeDataList = ref<Array<{ date: string; netIncome: number }>>([]);

interface ProductSalesBucket {
  date: string;
  [productName: string]: string | number;
}

// Product sales graph state
const productsStartDate = ref(dates2.start);
const productsEndDate = ref(dates2.end);
const productsLoading = ref(false);
const productsError = ref<string | null>(null);
const productsList = ref<string[]>([]);
const productsDataList = ref<ProductSalesBucket[]>([]);

// Total computed values for Summary Cards
const totalIncomeSum = computed(() => {
  return incomeDataList.value.reduce((sum, item) => sum + item.netIncome, 0);
});

const totalUnitsSoldSum = computed(() => {
  let sum = 0;
  for (const bucket of productsDataList.value) {
    for (const prodName of productsList.value) {
      if (bucket[prodName]) {
        sum += Number(bucket[prodName]);
      }
    }
  }
  return sum;
});

// Fetch functions
const fetchIncomeStats = async () => {
  if (!incomeStartDate.value || !incomeEndDate.value) return;

  const start = Date.parse(incomeStartDate.value);
  const end = Date.parse(incomeEndDate.value);
  if (start > end) {
    incomeError.value = 'Start Date cannot be after End Date';
    return;
  }

  incomeLoading.value = true;
  incomeError.value = null;

  try {
    const res = await api.get<typeof incomeDataList.value>('/stats/vendor/income', {
      params: {
        startDate: incomeStartDate.value,
        endDate: incomeEndDate.value,
      },
    });
    incomeDataList.value = res;
  } catch (err: unknown) {
    incomeError.value = err instanceof Error ? err.message : 'Failed to fetch net income';
    toastStore.error(incomeError.value);
  } finally {
    incomeLoading.value = false;
  }
};

const fetchProductSalesStats = async () => {
  if (!productsStartDate.value || !productsEndDate.value) return;

  const start = Date.parse(productsStartDate.value);
  const end = Date.parse(productsEndDate.value);
  if (start > end) {
    productsError.value = 'Start Date cannot be after End Date';
    return;
  }

  productsLoading.value = true;
  productsError.value = null;

  try {
    const res = await api.get<{ products: string[]; chartData: ProductSalesBucket[] }>('/stats/vendor/products', {
      params: {
        startDate: productsStartDate.value,
        endDate: productsEndDate.value,
      },
    });
    productsList.value = res.products;
    productsDataList.value = res.chartData;
  } catch (err: unknown) {
    productsError.value = err instanceof Error ? err.message : 'Failed to fetch product sales';
    toastStore.error(productsError.value);
  } finally {
    productsLoading.value = false;
  }
};

// Shortcut trigger functions - Net Income
const setIncomeLastWeek = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);
  incomeStartDate.value = formatDate(start);
  incomeEndDate.value = formatDate(end);
};

const setIncomeLastMonth = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  incomeStartDate.value = formatDate(start);
  incomeEndDate.value = formatDate(end);
};

const setIncomeLast3Months = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 90);
  incomeStartDate.value = formatDate(start);
  incomeEndDate.value = formatDate(end);
};

const setIncomeLastYear = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 365);
  incomeStartDate.value = formatDate(start);
  incomeEndDate.value = formatDate(end);
};

// Shortcut trigger functions - Product Sales
const setProductsLastWeek = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);
  productsStartDate.value = formatDate(start);
  productsEndDate.value = formatDate(end);
};

const setProductsLastMonth = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  productsStartDate.value = formatDate(start);
  productsEndDate.value = formatDate(end);
};

const setProductsLast3Months = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 90);
  productsStartDate.value = formatDate(start);
  productsEndDate.value = formatDate(end);
};

const setProductsLastYear = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 365);
  productsStartDate.value = formatDate(start);
  productsEndDate.value = formatDate(end);
};

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

// Chart 1: Net Income Configuration
const incomeChartDataComputed = computed(() => {
  const labels = incomeDataList.value.map(item => item.date);
  return {
    labels,
    datasets: [
      {
        label: useNuxtApp().$i18n.t('vendor.analytics.netIncome'),
        borderColor: '#10b981', // Emerald green
        backgroundColor: '#10b981',
        data: incomeDataList.value.map(item => item.netIncome),
        tension: 0.3,
        pointRadius: labels.length > 30 ? 0 : 3,
        pointHoverRadius: 6,
        fill: false,
      },
    ],
  };
});

// Dynamic Colors for multi-line Product Sales graph
const colorPalette = [
  '#3b82f6', // blue
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#10b981', // emerald
  '#14b8a6', // teal
  '#f97316', // orange
];

// Chart 2: Product Sales Configuration
const productsChartDataComputed = computed(() => {
  const labels = productsDataList.value.map(item => item.date);
  
  const datasets = productsList.value.map((prodName, idx) => {
    const color = colorPalette[idx % colorPalette.length];
    return {
      label: prodName,
      borderColor: color,
      backgroundColor: color,
      data: productsDataList.value.map(item => item[prodName] || 0),
      tension: 0.3,
      pointRadius: labels.length > 30 ? 0 : 3,
      pointHoverRadius: 6,
      fill: false,
    };
  });

  return {
    labels,
    datasets,
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

const incomeChartOptionsComputed = computed(() => {
  const options = JSON.parse(JSON.stringify(chartOptions));
  options.plugins.tooltip.callbacks = {
    label: (context: ChartTooltipContext) => ` ${context.dataset.label}: $${context.parsed.y.toFixed(2)}`,
  };
  options.scales.y.ticks.callback = (value: string | number) => `$${value}`;
  return options;
});

const productsChartOptionsComputed = computed(() => {
  const options = JSON.parse(JSON.stringify(chartOptions));
  options.plugins.tooltip.callbacks = {
    label: (context: ChartTooltipContext) => ` ${context.dataset.label}: ${context.parsed.y} units`,
  };
  return options;
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

    <!-- SECTION 1: NET INCOME GRAPH -->
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
          <span v-if="incomeLoading" class="text-xs text-brand animate-pulse font-bold flex items-center gap-1.5 self-start md:self-auto">
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
                type="date"
                v-model="incomeStartDate"
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
                v-model="incomeEndDate"
                class="bg-transparent text-textPrimary text-sm font-semibold outline-none border-none w-full p-0 [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        <!-- Shortcuts -->
        <div class="flex flex-wrap gap-2 pt-1">
          <button
            @click="setIncomeLastWeek"
            class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
          >
            {{ $t('admin.revenue.lastWeek') }}
          </button>
          <button
            @click="setIncomeLastMonth"
            class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
          >
            {{ $t('admin.revenue.lastMonth') }}
          </button>
          <button
            @click="setIncomeLast3Months"
            class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
          >
            {{ $t('admin.revenue.last3Months') }}
          </button>
          <button
            @click="setIncomeLastYear"
            class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
          >
            {{ $t('admin.revenue.lastYear') }}
          </button>
        </div>

        <!-- Income Graph Line Frame -->
        <div class="h-80 w-full relative pt-4">
          <div v-if="incomeLoading && incomeDataList.length === 0" class="absolute inset-0 flex items-center justify-center bg-cardBg/80">
            <div class="text-center space-y-3">
              <Icon name="heroicons:arrow-path" class="w-8 h-8 text-brand animate-spin mx-auto" />
              <p class="text-xs text-textMuted font-bold">{{ $t('vendor.analytics.loading') }}</p>
            </div>
          </div>

          <div v-else-if="incomeDataList.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div class="w-12 h-12 rounded-full bg-appBg border border-appBorder text-textMuted/40 flex items-center justify-center">
              <Icon name="heroicons:chart-bar" class="w-6 h-6" />
            </div>
            <h4 class="font-bold text-sm text-textPrimary">{{ $t('vendor.analytics.noData') }}</h4>
          </div>

          <div v-else class="h-full w-full">
            <ClientOnly>
              <Line :data="incomeChartDataComputed" :options="incomeChartOptionsComputed" />
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 2: PRODUCT SALES GRAPH -->
    <div class="space-y-6">
      <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-appBorder pb-4">
          <div class="space-y-0.5">
            <h3 class="font-extrabold text-textPrimary text-base flex items-center gap-2">
              <Icon name="heroicons:presentation-chart-line" class="text-blue-500 w-5 h-5 shrink-0" />
              <span>{{ $t('vendor.analytics.productsTitle') }}</span>
            </h3>
            <p class="text-[11px] text-textMuted">{{ $t('vendor.analytics.productsSubtitle') }}</p>
          </div>
          <span v-if="productsLoading" class="text-xs text-brand animate-pulse font-bold flex items-center gap-1.5 self-start md:self-auto">
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
                type="date"
                v-model="productsStartDate"
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
                v-model="productsEndDate"
                class="bg-transparent text-textPrimary text-sm font-semibold outline-none border-none w-full p-0 [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        <!-- Shortcuts -->
        <div class="flex flex-wrap gap-2 pt-1">
          <button
            @click="setProductsLastWeek"
            class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
          >
            {{ $t('admin.revenue.lastWeek') }}
          </button>
          <button
            @click="setProductsLastMonth"
            class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
          >
            {{ $t('admin.revenue.lastMonth') }}
          </button>
          <button
            @click="setProductsLast3Months"
            class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
          >
            {{ $t('admin.revenue.last3Months') }}
          </button>
          <button
            @click="setProductsLastYear"
            class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
          >
            {{ $t('admin.revenue.lastYear') }}
          </button>
        </div>

        <!-- Product Sales Graph Multi Line Frame -->
        <div class="h-96 w-full relative pt-4">
          <div v-if="productsLoading && productsDataList.length === 0" class="absolute inset-0 flex items-center justify-center bg-cardBg/80">
            <div class="text-center space-y-3">
              <Icon name="heroicons:arrow-path" class="w-8 h-8 text-brand animate-spin mx-auto" />
              <p class="text-xs text-textMuted font-bold">{{ $t('vendor.analytics.loading') }}</p>
            </div>
          </div>

          <div v-else-if="productsDataList.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div class="w-12 h-12 rounded-full bg-appBg border border-appBorder text-textMuted/40 flex items-center justify-center">
              <Icon name="heroicons:chart-bar" class="w-6 h-6" />
            </div>
            <h4 class="font-bold text-sm text-textPrimary">{{ $t('vendor.analytics.noData') }}</h4>
          </div>

          <div v-else class="h-full w-full">
            <ClientOnly>
              <Line :data="productsChartDataComputed" :options="productsChartOptionsComputed" />
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
