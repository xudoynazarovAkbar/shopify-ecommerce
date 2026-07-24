import { ref, computed, watch, onMounted } from 'vue';
import { useApi } from './useApi';
import { useToastStore } from '../stores/toast';

export const useBuyerSpendings = () => {
  const api = useApi();
  const toastStore = useToastStore();

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

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
      const res = await api.get<Array<{ date: string; spendings: number }>>('/stats/buyer/spendings', {
        params: {
          startDate: startDate.value,
          endDate: endDate.value,
        },
      });
      spendingsDataList.value = res || [];
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch spendings';
      toastStore.error(error.value);
    } finally {
      loading.value = false;
    }
  };

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

  return {
    startDate,
    endDate,
    loading,
    error,
    spendingsDataList,
    totalSpentSum,
    fetchSpendingsStats,
    setLastWeek,
    setLastMonth,
    setLast3Months,
    setLastYear,
  };
};
