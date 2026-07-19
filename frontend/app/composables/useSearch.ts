import { ref, computed, watch } from 'vue';
import { useApi } from './useApi';
import type { Product, Vendor } from '../types';

export const useSearch = () => {
  const api = useApi();
  const route = useRoute();

  const products = ref<Product[]>([]);
  const vendors = ref<Vendor[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const query = computed(() => (route.query.q as string) || '');

  const executeSearch = async (searchVal: string) => {
    if (!searchVal.trim()) {
      products.value = [];
      vendors.value = [];
      return;
    }

    loading.value = true;
    error.value = null;
    try {
      const res = await api.get<{ products: Product[]; vendors: Vendor[] }>(
        `/search?q=${encodeURIComponent(searchVal)}`
      );
      products.value = res?.products || [];
      vendors.value = res?.vendors || [];
    } catch (err) {
      console.error('Search query failed:', err);
      error.value = 'Failed to fetch search results.';
    } finally {
      loading.value = false;
    }
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
