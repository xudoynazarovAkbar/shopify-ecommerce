import { useApi } from './useApi';
import type { Product, CreateProductPayload, UpdateProductPayload } from '../types';

export const useVendorProducts = () => {
  const api = useApi();
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchProducts = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get<Product[]>('/products/my-shop');
      products.value = res || [];
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      error.value = apiErr?.data?.message || 'Failed to load store products';
    } finally {
      loading.value = false;
    }
  };

  const createProduct = async (payload: CreateProductPayload): Promise<Product> => {
    try {
      const created = await api.post<Product>('/products', payload);
      products.value = [created, ...products.value];
      return created;
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      throw new Error(apiErr?.data?.message || 'Failed to create product', { cause: err });
    }
  };

  const updateProduct = async (productId: string, payload: UpdateProductPayload): Promise<Product> => {
    try {
      const updated = await api.patch<Product>(`/products/${productId}`, payload);
      
      const productIdx = products.value.findIndex((p) => p.id === productId);
      if (productIdx !== -1) {
        products.value[productIdx] = {
          ...products.value[productIdx],
          ...updated,
        };
      }
      return updated;
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      throw new Error(apiErr?.data?.message || 'Failed to update product', { cause: err });
    }
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    try {
      await api.delete(`/products/${productId}`);
      products.value = products.value.filter((p) => p.id !== productId);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      throw new Error(apiErr?.data?.message || 'Failed to delete product', { cause: err });
    }
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
