import { useApi } from './useApi';
import type { Coupon, CreateCouponPayload } from '../types';

export const useVendorCoupons = () => {
  const api = useApi();
  const coupons = ref<Coupon[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchCoupons = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get<Coupon[]>('/coupons');
      coupons.value = res || [];
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      error.value = apiErr?.data?.message || 'Failed to load coupons';
    } finally {
      loading.value = false;
    }
  };

  const createCoupon = async (payload: CreateCouponPayload): Promise<Coupon> => {
    try {
      const created = await api.post<Coupon>('/coupons', payload);
      coupons.value = [created, ...coupons.value];
      return created;
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      throw new Error(apiErr?.data?.message || 'Failed to create coupon', { cause: err });
    }
  };

  const toggleCouponActive = async (couponId: string, isActive: boolean): Promise<Coupon> => {
    try {
      const updated = await api.patch<Coupon>(`/coupons/${couponId}`, { isActive });
      
      const couponIdx = coupons.value.findIndex((c) => c.id === couponId);
      if (couponIdx !== -1) {
        coupons.value[couponIdx] = {
          ...coupons.value[couponIdx],
          isActive: updated.isActive,
        };
      }
      return updated;
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      throw new Error(apiErr?.data?.message || 'Failed to toggle coupon status', { cause: err });
    }
  };

  const deleteCoupon = async (couponId: string): Promise<void> => {
    try {
      await api.delete(`/coupons/${couponId}`);
      coupons.value = coupons.value.filter((c) => c.id !== couponId);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      throw new Error(apiErr?.data?.message || 'Failed to delete coupon', { cause: err });
    }
  };

  return {
    coupons,
    loading,
    error,
    fetchCoupons,
    createCoupon,
    toggleCouponActive,
    deleteCoupon,
  };
};
