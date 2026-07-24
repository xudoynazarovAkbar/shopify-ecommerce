import { ref, computed } from 'vue';
import { useApi } from './useApi';
import { useToastStore } from '../stores/toast';

export interface IncomeStatItem {
  date: string;
  netIncome: number;
}

export interface ProductSalesBucket {
  date: string;
  [productName: string]: string | number;
}

export const useVendorAnalytics = () => {
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
  const incomeDataList = ref<IncomeStatItem[]>([]);

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
      const res = await api.get<IncomeStatItem[]>('/stats/vendor/income', {
        params: {
          startDate: incomeStartDate.value,
          endDate: incomeEndDate.value,
        },
      });
      incomeDataList.value = res || [];
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
      productsList.value = res.products || [];
      productsDataList.value = res.chartData || [];
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

  return {
    formatDate,
    incomeStartDate,
    incomeEndDate,
    incomeLoading,
    incomeError,
    incomeDataList,
    productsStartDate,
    productsEndDate,
    productsLoading,
    productsError,
    productsList,
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
  };
};
