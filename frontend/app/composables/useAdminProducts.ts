import { useApi } from './useApi';
import type { Product, ProductStatus } from '../types';

export const useAdminProducts = () => {
  const api = useApi();
  const pendingProducts = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchPendingProducts = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get<Product[]>('/admin/products/pending');
      pendingProducts.value = res || [];
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      error.value = apiErr?.data?.message || 'Failed to load product moderation queue';
    } finally {
      loading.value = false;
    }
  };

  const updateProductStatus = async (productId: string, status: ProductStatus): Promise<Product> => {
    try {
      const updated = await api.patch<Product>(`/admin/products/${productId}/status`, { status });
      
      // Filter out of the local pending list
      pendingProducts.value = pendingProducts.value.filter((p) => p.id !== productId);
      return updated;
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      throw new Error(apiErr?.data?.message || 'Failed to update product moderation status', { cause: err });
    }
  };

  return {
    pendingProducts,
    loading,
    error,
    fetchPendingProducts,
    updateProductStatus,
  };
};
