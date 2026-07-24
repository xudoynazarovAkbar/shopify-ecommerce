import { ref, computed } from 'vue';
import { useApi } from './useApi';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import type { AdCampaign, AdPricingSettings, CreateCampaignParams, EditCampaignParams } from '../types';

export const useVendorCampaigns = () => {
  const api = useApi();
  const authStore = useAuthStore();
  const toastStore = useToastStore();

  const campaigns = ref<AdCampaign[]>([]);
  const pricingSettings = ref<AdPricingSettings | null>(null);
  const calculatedCosts = ref<Record<number, number>>({});
  const loading = ref(false);
  const submitting = ref(false);

  const autoApprove = computed(() => authStore.user?.vendorProfile?.autoApproveProducts ?? false);

  const fetchCampaignsAndPricing = async () => {
    loading.value = true;
    try {
      const [campaignsRes, pricingRes] = await Promise.all([
        api.get<AdCampaign[]>('/campaigns/vendor'),
        api.get<{ settings: AdPricingSettings; calculatedCosts: Record<number, number> }>('/campaigns/pricing-settings'),
      ]);
      campaigns.value = campaignsRes || [];
      if (pricingRes) {
        pricingSettings.value = pricingRes.settings || null;
        calculatedCosts.value = pricingRes.calculatedCosts || {};
      }
    } catch (err) {
      console.error('Failed to load campaigns data:', err);
      toastStore.error('Failed to load campaigns or pricing settings');
    } finally {
      loading.value = false;
    }
  };

  const createCampaign = async (params: CreateCampaignParams): Promise<AdCampaign> => {
    submitting.value = true;
    try {
      const formData = new FormData();
      formData.append('file', params.file);
      formData.append('startDate', new Date(params.startDate).toISOString());
      formData.append('durationWeeks', String(params.durationWeeks));
      formData.append('tier', String(params.tier));
      formData.append('label', params.label);
      formData.append('labelColor', params.labelColor);

      const res = await api.post<AdCampaign>('/campaigns/create', formData);
      return res;
    } catch (err: unknown) {
      console.error('Failed to create campaign:', err);
      const apiErr = err as { data?: { message?: string } };
      throw new Error(apiErr?.data?.message || 'Failed to create campaign', { cause: err });
    } finally {
      submitting.value = false;
    }
  };

  const editCampaign = async (campaignId: string, params: EditCampaignParams): Promise<AdCampaign> => {
    submitting.value = true;
    try {
      const formData = new FormData();
      if (params.file) {
        formData.append('file', params.file);
      }
      formData.append('label', params.label);
      formData.append('labelColor', params.labelColor);

      const res = await api.patch<AdCampaign>(`/campaigns/vendor/${campaignId}/edit`, formData);
      return res;
    } catch (err: unknown) {
      console.error('Failed to edit campaign:', err);
      const apiErr = err as { data?: { message?: string } };
      throw new Error(apiErr?.data?.message || 'Failed to edit campaign details', { cause: err });
    } finally {
      submitting.value = false;
    }
  };

  const togglePauseCampaign = async (campaignId: string, isVendorPaused: boolean): Promise<AdCampaign> => {
    try {
      const res = await api.patch<AdCampaign>(`/campaigns/vendor/${campaignId}/pause`, {
        isVendorPaused,
      });
      return res;
    } catch (err: unknown) {
      console.error('Failed to toggle pause:', err);
      const apiErr = err as { data?: { message?: string } };
      throw new Error(apiErr?.data?.message || 'Failed to update campaign pause state', { cause: err });
    }
  };

  const processPayment = async (campaignId: string): Promise<AdCampaign> => {
    submitting.value = true;
    try {
      const res = await api.post<AdCampaign>(`/campaigns/${campaignId}/checkout`);
      return res;
    } catch (err: unknown) {
      console.error('Failed checkout:', err);
      const apiErr = err as { data?: { message?: string } };
      throw new Error(apiErr?.data?.message || 'Payment simulation failed', { cause: err });
    } finally {
      submitting.value = false;
    }
  };

  // High-level Actions (Business logic handles + Toast triggers)
  const createCampaignAction = async (payload: CreateCampaignParams, onSuccess?: (res: AdCampaign) => void) => {
    try {
      const res = await createCampaign(payload);
      toastStore.success(
        autoApprove.value
          ? useNuxtApp().$i18n.t('vendor.campaigns.campaignCreatedLive')
          : useNuxtApp().$i18n.t('vendor.campaigns.campaignCreatedPending')
      );
      await fetchCampaignsAndPricing();
      if (onSuccess) onSuccess(res);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : useNuxtApp().$i18n.t('vendor.campaigns.campaignCreatedError');
      toastStore.error(errorMsg);
    }
  };

  const editCampaignAction = async (campaignId: string, payload: EditCampaignParams, onSuccess?: () => void) => {
    try {
      await editCampaign(campaignId, payload);
      toastStore.success(
        autoApprove.value
          ? useNuxtApp().$i18n.t('vendor.campaigns.campaignUpdatedSuccess')
          : useNuxtApp().$i18n.t('vendor.campaigns.campaignUpdatedPending')
      );
      if (onSuccess) onSuccess();
      await fetchCampaignsAndPricing();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to edit campaign details';
      toastStore.error(errorMsg);
    }
  };

  const togglePauseCampaignAction = async (campaign: AdCampaign) => {
    const nextPauseState = !campaign.isVendorPaused;
    try {
      await togglePauseCampaign(campaign.id, nextPauseState);
      toastStore.success(
        nextPauseState
          ? 'Campaign paused successfully!'
          : 'Campaign resumed successfully!'
      );
      await fetchCampaignsAndPricing();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update campaign pause state';
      toastStore.error(errorMsg);
    }
  };

  const processPaymentAction = async (campaignId: string, onSuccess?: () => void) => {
    try {
      await processPayment(campaignId);
      toastStore.success(useNuxtApp().$i18n.t('vendor.campaigns.paymentSuccess'));
      if (onSuccess) onSuccess();
      await fetchCampaignsAndPricing();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Payment simulation failed';
      toastStore.error(errorMsg);
    }
  };

  return {
    campaigns,
    pricingSettings,
    calculatedCosts,
    loading,
    submitting,
    autoApprove,
    fetchCampaignsAndPricing,
    createCampaignAction,
    editCampaignAction,
    togglePauseCampaignAction,
    processPaymentAction,
  };
};
