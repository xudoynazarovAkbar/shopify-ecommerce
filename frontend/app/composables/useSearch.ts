import { ref, computed, watch } from 'vue';
import { useApi } from './useApi';
import type { Product, Vendor } from '../types';

// Simple typesafe debounce utility
function debounce<Args extends unknown[], Return>(fn: (...args: Args) => Return, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return function (this: unknown, ...args: Args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export const useSearch = () => {
  const api = useApi();
  const route = useRoute();

  const products = ref<Product[]>([]);
  const vendors = ref<Vendor[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const query = computed(() => (route.query.q as string) || '');

  const fetchResults = async (searchVal: string) => {
    console.log('useSearch: Executing API fetch for query:', searchVal);
    try {
      const res = await api.get<{ products: Product[]; vendors: Vendor[] }>(
        `/search?q=${encodeURIComponent(searchVal)}`
      );
      console.log('useSearch: Received API response:', res);
      products.value = res?.products || [];
      vendors.value = res?.vendors || [];
    } catch (err) {
      console.error('useSearch: Search query failed:', err);
      error.value = 'Failed to fetch search results.';
    } finally {
      loading.value = false;
    }
  };

  // Create a debounced version of our results fetcher
  const debouncedFetch = debounce(fetchResults, 1000);

  const executeSearch = (searchVal: string) => {
    if (!searchVal.trim()) {
      products.value = [];
      vendors.value = [];
      loading.value = false;
      return;
    }

    loading.value = true;
    error.value = null;
    debouncedFetch(searchVal);
  };

  // Listen to route search query parameters reactively
  watch(query, (newQuery) => {
    executeSearch(newQuery);
  }, { immediate: true });

  return {
    query,
    products,
    vendors,
    loading,
    error,
    executeSearch,
  };
};
