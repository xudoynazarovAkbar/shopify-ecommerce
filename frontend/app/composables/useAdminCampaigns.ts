import { ref, onMounted } from 'vue';
import { useApi } from './useApi';
import { useToastStore } from '../stores/toast';
import type { AdCampaign, AdPricingSettings } from '../types';

export interface AdminAdCampaign extends AdCampaign {
  vendor: {
    shopName: string;
  };
  isActive: boolean;
}

interface PricingSettingsResponse {
  settings: AdPricingSettings;
}

export const useAdminCampaigns = () => {
  const api = useApi();
  const toastStore = useToastStore();

  const campaigns = ref<AdminAdCampaign[]>([]);
  const pricingSettings = ref<AdPricingSettings | null>(null);
  const loading = ref(true);
  const savingSettings = ref(false);

  // Pricing Form State
  const priceTier1 = ref(100);
  const priceTier2 = ref(80);
  const priceTier3 = ref(60);
  const priceTier4 = ref(40);

  const loadData = async () => {
    loading.value = true;
    try {
      const [campaignsRes, pricingRes] = await Promise.all([
        api.get<AdminAdCampaign[]>('/campaigns/admin'),
        api.get<PricingSettingsResponse>('/campaigns/pricing-settings'),
      ]);
      campaigns.value = campaignsRes || [];
      if (pricingRes && pricingRes.settings) {
        pricingSettings.value = pricingRes.settings;
        priceTier1.value = pricingRes.settings.priceTier1;
        priceTier2.value = pricingRes.settings.priceTier2;
        priceTier3.value = pricingRes.settings.priceTier3;
        priceTier4.value = pricingRes.settings.priceTier4;
      }
    } catch (err: unknown) {
      console.error('Failed to load admin campaigns data:', err);
      toastStore.error('Failed to load campaigns or pricing settings');
    } finally {
      loading.value = false;
    }
  };

  const handleSaveSettings = async () => {
    savingSettings.value = true;
    try {
      await api.patch('/campaigns/pricing-settings', {
        priceTier1: Number(priceTier1.value),
        priceTier2: Number(priceTier2.value),
        priceTier3: Number(priceTier3.value),
        priceTier4: Number(priceTier4.value),
      });
      toastStore.success('Pricing rules updated successfully!');
      await loadData();
    } catch (err: unknown) {
      console.error('Failed to update settings:', err);
      const apiErr = err as { message?: string };
      toastStore.error(apiErr.message || 'Failed to update pricing rules');
    } finally {
      savingSettings.value = false;
    }
  };

  const handleStatusChange = async (campaignId: string, status: string) => {
    try {
      await api.patch(`/campaigns/${campaignId}/status`, { status });
      toastStore.success(`Campaign has been successfully marked as ${status.toLowerCase()}!`);
      await loadData();
    } catch (err: unknown) {
      console.error('Failed to change status:', err);
      const apiErr = err as { message?: string };
      toastStore.error(apiErr.message || 'Failed to update campaign status');
    }
  };

  const handleToggleActive = async (campaignId: string, currentActive: boolean) => {
    try {
      await api.patch(`/campaigns/${campaignId}/active`, { isActive: !currentActive });
      toastStore.success(currentActive ? 'Campaign paused!' : 'Campaign resumed and activated!');
      await loadData();
    } catch (err: unknown) {
      console.error('Failed to toggle active state:', err);
      const apiErr = err as { message?: string };
      toastStore.error(apiErr.message || 'Failed to toggle active state');
    }
  };

  onMounted(async () => {
    await loadData();
  });

  return {
    campaigns,
    pricingSettings,
    loading,
    savingSettings,
    priceTier1,
    priceTier2,
    priceTier3,
    priceTier4,
    loadData,
    handleSaveSettings,
    handleStatusChange,
    handleToggleActive,
  };
};
