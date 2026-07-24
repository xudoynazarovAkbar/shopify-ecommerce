import { ref, computed } from 'vue';
import { useApi } from './useApi';
import { useToastStore } from '../stores/toast';

export interface RevenueStatItem {
  date: string;
  campaignsRevenue: number;
  commissionRevenue: number;
  totalIncome: number;
}

export const useAdminRevenue = () => {
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
  const chartDataList = ref<RevenueStatItem[]>([]);

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
      const res = await api.get<{ commissionRate: number; chartData: RevenueStatItem[] }>('/stats/revenue', {
        params: {
          startDate: startDate.value,
          endDate: endDate.value,
        },
      });
      commissionRate.value = res.commissionRate;
      chartDataList.value = res.chartData || [];
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

  const chartOptions = computed(() => ({
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
          label: (context: {
            dataset: {
              label: string;
            };
            parsed: {
              y: number;
            };
          }) => {
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
  }));

  return {
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
  };
};
