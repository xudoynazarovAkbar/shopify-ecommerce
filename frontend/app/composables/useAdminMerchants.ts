import { useApi } from './useApi';
import type { Vendor, VendorStatus } from '../types';

export const useAdminMerchants = () => {
  const api = useApi();
  const merchants = ref<Vendor[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchMerchants = async (status?: VendorStatus) => {
    loading.value = true;
    error.value = null;
    try {
      const url = status ? `/admin/vendors?status=${status}` : '/admin/vendors';
      const res = await api.get<Vendor[]>(url);
      merchants.value = res || [];
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      error.value = apiErr?.data?.message || 'Failed to load merchant profiles';
    } finally {
      loading.value = false;
    }
  };

  const updateMerchantStatus = async (vendorId: string, status: VendorStatus): Promise<Vendor> => {
    try {
      const updated = await api.patch<Vendor>(`/admin/vendors/${vendorId}/status`, { status });
      
      const idx = merchants.value.findIndex((m) => m.id === vendorId);
      if (idx !== -1) {
        merchants.value[idx] = {
          ...merchants.value[idx],
          status: updated.status,
        };
      }
      return updated;
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      throw new Error(apiErr?.data?.message || 'Failed to update merchant status', { cause: err });
    }
  };

  const updateMerchantTrust = async (vendorId: string, autoApproveProducts: boolean): Promise<Vendor> => {
    try {
      const updated = await api.patch<Vendor>(`/admin/vendors/${vendorId}/trust`, { autoApproveProducts });
      
      const idx = merchants.value.findIndex((m) => m.id === vendorId);
      if (idx !== -1) {
        merchants.value[idx] = {
          ...merchants.value[idx],
          autoApproveProducts: updated.autoApproveProducts,
        };
      }
      return updated;
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      throw new Error(apiErr?.data?.message || 'Failed to update merchant trust tier', { cause: err });
    }
  };

  return {
    merchants,
    loading,
    error,
    fetchMerchants,
    updateMerchantStatus,
    updateMerchantTrust,
  };
};
