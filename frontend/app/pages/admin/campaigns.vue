<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '../../composables/useApi';
import { useToastStore } from '../../stores/toast';
import { useImageResolver } from '../../composables/useImageResolver';

definePageMeta({
  middleware: ['auth', 'role'],
  meta: { roles: ['ADMIN'] },
});

const api = useApi();
const toastStore = useToastStore();
const { resolveImageUrl } = useImageResolver();

const campaigns = ref<any[]>([]);
const pricingSettings = ref<any>(null);
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
      api.get<any[]>('/campaigns/admin'),
      api.get<any>('/campaigns/pricing-settings'),
    ]);
    campaigns.value = campaignsRes || [];
    if (pricingRes && pricingRes.settings) {
      pricingSettings.value = pricingRes.settings;
      priceTier1.value = pricingRes.settings.priceTier1;
      priceTier2.value = pricingRes.settings.priceTier2;
      priceTier3.value = pricingRes.settings.priceTier3;
      priceTier4.value = pricingRes.settings.priceTier4;
    }
  } catch (err) {
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
  } catch (err: any) {
    console.error('Failed to update settings:', err);
    toastStore.error(err.message || 'Failed to update pricing rules');
  } finally {
    savingSettings.value = false;
  }
};

const handleStatusChange = async (campaignId: string, status: string) => {
  try {
    await api.patch(`/campaigns/${campaignId}/status`, { status });
    toastStore.success(`Campaign has been successfully marked as ${status.toLowerCase()}!`);
    await loadData();
  } catch (err: any) {
    console.error('Failed to change status:', err);
    toastStore.error(err.message || 'Failed to update campaign status');
  }
};

const handleToggleActive = async (campaignId: string, currentActive: boolean) => {
  try {
    await api.patch(`/campaigns/${campaignId}/active`, { isActive: !currentActive });
    toastStore.success(currentActive ? 'Campaign paused!' : 'Campaign resumed and activated!');
    await loadData();
  } catch (err: any) {
    console.error('Failed to toggle active state:', err);
    toastStore.error(err.message || 'Failed to toggle active state');
  }
};

onMounted(async () => {
  await loadData();
});
</script>

<template>
  <div class="space-y-8 max-w-6xl mx-auto">
    <!-- Header banner -->
    <div class="bg-cardBg border border-appBorder rounded-2xl p-6">
      <h1 class="text-2xl font-extrabold text-textPrimary tracking-tight">Ad Campaigns & Pricing Panel</h1>
      <p class="text-sm text-textSecondary mt-1">Audit merchant slide campaigns, review creative uploads, and customize separate flat tier prices.</p>
    </div>

    <!-- Main split layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left: Pricing Settings Form -->
      <div class="space-y-6">
        <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm space-y-5">
          <div class="flex items-center gap-2 border-b border-appBorder pb-3">
            <Icon name="heroicons:cog-6-tooth" class="w-5 h-5 text-brand" />
            <h2 class="text-sm font-extrabold text-textPrimary uppercase tracking-wider">Pricing Configuration</h2>
          </div>

          <form @submit.prevent="handleSaveSettings" class="space-y-4">
            <!-- Tier 1 Cost -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">Tier 1 Flat Price (Slots 1-3)</label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-xs text-textMuted font-bold">$</span>
                <input
                  v-model="priceTier1"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full pl-7 pr-4 py-2 border border-appBorder rounded-lg text-sm bg-appBg text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none focus:border-brand"
                >
              </div>
            </div>

            <!-- Tier 2 Cost -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">Tier 2 Flat Price (Slots 4-6)</label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-xs text-textMuted font-bold">$</span>
                <input
                  v-model="priceTier2"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full pl-7 pr-4 py-2 border border-appBorder rounded-lg text-sm bg-appBg text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none focus:border-brand"
                >
              </div>
            </div>

            <!-- Tier 3 Cost -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">Tier 3 Flat Price (Slots 7-9)</label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-xs text-textMuted font-bold">$</span>
                <input
                  v-model="priceTier3"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full pl-7 pr-4 py-2 border border-appBorder rounded-lg text-sm bg-appBg text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none focus:border-brand"
                >
              </div>
            </div>

            <!-- Tier 4 Cost -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">Tier 4 Flat Price (Slots 10-12)</label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-xs text-textMuted font-bold">$</span>
                <input
                  v-model="priceTier4"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full pl-7 pr-4 py-2 border border-appBorder rounded-lg text-sm bg-appBg text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none focus:border-brand"
                >
              </div>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              class="w-full py-2.5 bg-brand hover:bg-brandHover text-brandText font-extrabold rounded-xl transition flex items-center justify-center gap-1 shadow-sm text-xs"
              :disabled="savingSettings"
            >
              <Icon v-if="savingSettings" name="svg-spinners:ring-resize" class="w-4 h-4 animate-spin" />
              <Icon v-else name="heroicons:arrow-path-20-solid" class="w-4 h-4" />
              <span>Apply Pricing Changes</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Right: Campaigns Auditing Ledger -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm space-y-5">
          <div class="flex items-center gap-2 border-b border-appBorder pb-3">
            <Icon name="heroicons:clipboard-document-list" class="w-5 h-5 text-brand" />
            <h2 class="text-sm font-extrabold text-textPrimary uppercase tracking-wider">Campaign Auditing Ledger</h2>
          </div>

          <div v-if="loading" class="space-y-4 animate-pulse">
            <div v-for="n in 3" :key="'as-skel-' + n" class="h-24 bg-appBg border border-appBorder rounded-xl" />
          </div>

          <div v-else-if="campaigns.length === 0" class="text-center py-12 space-y-2">
            <Icon name="heroicons:megaphone" class="w-12 h-12 text-textMuted mx-auto" />
            <p class="text-sm font-bold text-textMuted">No ad campaigns have been booked yet.</p>
          </div>

          <div v-else class="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            <div
              v-for="campaign in campaigns"
              :key="campaign.id"
              class="bg-appBg/40 border border-appBorder hover:border-appBorder/80 rounded-2xl p-4 transition-colors space-y-4"
            >
              <div class="flex flex-col md:flex-row gap-4 justify-between">
                <!-- Thumbnail Creative Preview -->
                <div class="w-full md:w-36 h-20 bg-zinc-950 rounded-xl overflow-hidden shadow-sm shrink-0 border border-appBorder">
                  <img :src="resolveImageUrl(campaign.image)" class="w-full h-full object-cover">
                </div>

                <!-- Info detail -->
                <div class="flex-1 space-y-1 text-xs">
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-extrabold text-textPrimary text-sm">{{ campaign.vendor.shopName }}</span>
                    <!-- Status Badge -->
                    <span
                      v-if="campaign.status === 'PENDING_APPROVAL'"
                      class="text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/15 px-2 py-0.5 rounded uppercase"
                    >
                      Pending Review
                    </span>
                    <span
                      v-else-if="campaign.status === 'REJECTED'"
                      class="text-[9px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/15 px-2 py-0.5 rounded uppercase"
                    >
                      Rejected
                    </span>
                    <span
                      v-else-if="!campaign.isPaid"
                      class="text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 px-2 py-0.5 rounded uppercase"
                    >
                      Approved (Unpaid)
                    </span>
                    <span
                      v-else
                      class="text-[9px] font-black bg-blue-500/10 text-blue-500 border border-blue-500/15 px-2 py-0.5 rounded uppercase"
                    >
                      Active & Paid
                    </span>
                  </div>

                  <p class="text-textSecondary">
                    Selected Tier: <span class="font-bold text-textPrimary">Tier {{ campaign.tier }}</span>
                  </p>
                  <p class="text-textSecondary">
                    Allocated Slide: <span class="font-bold text-textPrimary">Position {{ campaign.slidePosition }}</span>
                  </p>
                  <p class="text-textSecondary">
                    Label: <span class="font-bold text-textPrimary">{{ campaign.label || 'None' }}</span> (color: {{ campaign.labelColor }})
                  </p>
                  <p class="text-textSecondary">
                    Dates: <span class="font-semibold text-textPrimary">{{ new Date(campaign.startDate).toLocaleDateString() }} - {{ new Date(campaign.endDate).toLocaleDateString() }}</span>
                  </p>
                  <p class="text-textSecondary">
                    Paid Amount: <span class="font-extrabold text-brand">${{ campaign.totalPaid.toFixed(2) }}</span>
                  </p>
                </div>
              </div>

              <!-- Action buttons bar -->
              <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-appBorder/50">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs text-textMuted font-bold">Admin Active Toggle:</span>
                  <button
                    class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                    :class="campaign.isActive ? 'bg-brand' : 'bg-zinc-300 dark:bg-zinc-700'"
                    @click="handleToggleActive(campaign.id, campaign.isActive)"
                  >
                    <span
                      class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                      :class="campaign.isActive ? 'translate-x-4' : 'translate-x-0'"
                    />
                  </button>
                </div>

                <!-- Approval/Rejection buttons -->
                <div v-if="campaign.status === 'PENDING_APPROVAL'" class="flex items-center gap-2">
                  <button
                    class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px] transition shadow"
                    @click="handleStatusChange(campaign.id, 'REJECTED')"
                  >
                    Reject Creative
                  </button>
                  <button
                    class="px-3 py-1.5 bg-brand hover:bg-brandHover text-brandText font-bold rounded-lg text-[11px] transition shadow"
                    @click="handleStatusChange(campaign.id, 'APPROVED')"
                  >
                    Approve & Unlock
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
