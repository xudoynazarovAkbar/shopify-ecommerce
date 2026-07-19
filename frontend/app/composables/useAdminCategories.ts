import { useApi } from './useApi';
import type { Category } from '../types';

export const useAdminCategories = () => {
  const api = useApi();
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchCategories = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get<Category[]>('/categories');
      categories.value = res || [];
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      error.value = apiErr?.data?.message || 'Failed to load global categories';
    } finally {
      loading.value = false;
    }
  };

  const createCategory = async (payload: { name: string; description?: string; icon?: string }): Promise<Category> => {
    try {
      const created = await api.post<Category>('/categories', payload);
      categories.value = [...categories.value, created];
      return created;
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      throw new Error(apiErr?.data?.message || 'Failed to create category', { cause: err });
    }
  };

  const updateCategory = async (
    categoryId: string,
    payload: { name: string; description?: string; icon?: string }
  ): Promise<Category> => {
    try {
      const updated = await api.patch<Category>(`/categories/${categoryId}`, payload);
      
      const idx = categories.value.findIndex((c) => c.id === categoryId);
      if (idx !== -1) {
        categories.value[idx] = {
          ...categories.value[idx],
          ...updated,
        };
      }
      return updated;
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      throw new Error(apiErr?.data?.message || 'Failed to update category', { cause: err });
    }
  };

  const deleteCategory = async (categoryId: string): Promise<void> => {
    try {
      await api.delete(`/categories/${categoryId}`);
      categories.value = categories.value.filter((c) => c.id !== categoryId);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      throw new Error(apiErr?.data?.message || 'Failed to delete category', { cause: err });
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
