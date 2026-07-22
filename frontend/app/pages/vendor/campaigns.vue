<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useApi } from '../../composables/useApi';
import { useToastStore } from '../../stores/toast';
import { useImageResolver } from '../../composables/useImageResolver';

definePageMeta({
  middleware: ['auth', 'role'],
  meta: { roles: ['VENDOR'] },
});

const authStore = useAuthStore();
const api = useApi();
const toastStore = useToastStore();
const { resolveImageUrl } = useImageResolver();

const campaigns = ref<any[]>([]);
const pricingSettings = ref<any>(null);
const calculatedCosts = ref<Record<number, number>>({});
const loading = ref(true);
const submitting = ref(false);
const payingCampaignId = ref<string | null>(null);
const isCheckoutOpen = ref(false);

// Form State
const startDate = ref('');
const durationWeeks = ref(1);
const tier = ref(1);
const label = ref('');
const labelColor = ref('red');
const selectedFile = ref<File | null>(null);
const filePreview = ref<string | null>(null);

// Payment simulated details
const cardNumber = ref('4242 •••• •••• 4242');
const expMonth = ref(12);
const expYear = ref(2027);

const autoApprove = computed(() => authStore.user?.vendorProfile?.autoApproveProducts ?? false);

const fetchCampaignsAndPricing = async () => {
  loading.value = true;
  try {
    const [campaignsRes, pricingRes] = await Promise.all([
      api.get<any[]>('/campaigns/vendor'),
      api.get<any>('/campaigns/pricing-settings'),
    ]);
    campaigns.value = campaignsRes || [];
    if (pricingRes) {
      pricingSettings.value = pricingRes.settings;
      calculatedCosts.value = pricingRes.calculatedCosts || {};
    }
  } catch (err) {
    console.error('Failed to load campaigns data:', err);
    toastStore.error('Failed to load campaigns or pricing settings');
  } finally {
    loading.value = false;
  }
};

const onFileChange = (e: any) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
    toastStore.error('Only image files are allowed!');
    return;
  }
  selectedFile.value = file;
  filePreview.value = URL.createObjectURL(file);
};

// Computes selected tier per-week cost
const selectedTierCost = computed(() => {
  return calculatedCosts.value[tier.value] || 0;
});

// Computes total cost of the campaign booking
const totalCampaignCost = computed(() => {
  return selectedTierCost.value * durationWeeks.value;
});

const getTierLabel = (t: number) => {
  if (t === 1) return 'Tier 1 (Premium storefront top banner)';
  if (t === 2) return 'Tier 2 (Highly visible mid-page banner)';
  if (t === 3) return 'Tier 3 (Standard budget placement)';
  return 'Tier 4 (Affordable budget placement)';
};

const handleCreateCampaign = async () => {
  if (!startDate.value) {
    toastStore.error('Start date is required');
    return;
  }
  if (!selectedFile.value) {
    toastStore.error('Ad creative image is required');
    return;
  }

  submitting.value = true;
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('startDate', new Date(startDate.value).toISOString());
    formData.append('durationWeeks', String(durationWeeks.value));
    formData.append('tier', String(tier.value));
    formData.append('label', label.value);
    formData.append('labelColor', labelColor.value);

    const res = await api.post<any>('/campaigns/create', formData);

    toastStore.success(
      autoApprove.value
        ? 'Campaign created and approved! Proceeding to payment.'
        : 'Campaign submitted for admin review!'
    );

    // Reset Form
    startDate.value = '';
    selectedFile.value = null;
    filePreview.value = null;
    label.value = '';

    await fetchCampaignsAndPricing();

    // If auto-approved, open checkout immediately
    if (res && res.status === 'APPROVED') {
      triggerCheckout(res.id);
    }
  } catch (err: any) {
    console.error('Failed to create campaign:', err);
    toastStore.error(err.message || 'All slots in this Tier are booked for this timeframe!');
  } finally {
    submitting.value = false;
  }
};

const triggerCheckout = (campaignId: string) => {
  payingCampaignId.value = campaignId;
  isCheckoutOpen.value = true;
};

const closeCheckout = () => {
  isCheckoutOpen.value = false;
  payingCampaignId.value = null;
};

const handlePayment = async () => {
  if (!payingCampaignId.value) return;
  submitting.value = true;
  try {
    await api.post(`/campaigns/${payingCampaignId.value}/checkout`);
    toastStore.success('Simulated payment processed! Your ad is now active.');
    closeCheckout();
    await fetchCampaignsAndPricing();
  } catch (err: any) {
    console.error('Failed checkout:', err);
    toastStore.error(err.message || 'Payment simulation failed');
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  await fetchCampaignsAndPricing();
});
</script>

<template>
  <div class="space-y-8 max-w-6xl mx-auto">
    <!-- Header banner -->
    <div class="bg-cardBg border border-appBorder rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-textPrimary tracking-tight">Ad Campaign Manager</h1>
        <p class="text-sm text-textSecondary mt-1">Book high-visibility slides on our storefront swiper to maximize your sales.</p>
      </div>
      <!-- Trust Governance Info -->
      <div
        :class="[
          'px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2',
          autoApprove ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/5 border-amber-500/15 text-amber-600 dark:text-amber-400'
        ]"
      >
        <Icon :name="autoApprove ? 'heroicons:check-badge' : 'heroicons:exclamation-triangle'" class="w-5 h-5 shrink-0" />
        <span>
          {{ autoApprove ? 'Trusted Store: Direct Checkout Enabled' : 'New Store: Admin Moderation Required' }}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left 2 Cols: Form & Active Bookings list -->
      <div class="lg:col-span-2 space-y-8">
        <!-- New Campaign Booking Form -->
        <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm space-y-6">
          <div class="flex items-center gap-2 border-b border-appBorder pb-3">
            <Icon name="heroicons:megaphone" class="w-5 h-5 text-brand" />
            <h2 class="text-sm font-extrabold text-textPrimary uppercase tracking-wider">Book New Campaign</h2>
          </div>

          <form @submit.prevent="handleCreateCampaign" class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <!-- Start Date -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">Start Date</label>
                <input
                  v-model="startDate"
                  type="date"
                  class="w-full px-4 py-2 border border-appBorder rounded-lg text-sm bg-appBg text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none focus:border-brand"
                >
              </div>

              <!-- Duration -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">Duration (Weeks)</label>
                <select
                  v-model="durationWeeks"
                  class="w-full px-4 py-2 border border-appBorder rounded-lg text-sm bg-appBg text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none focus:border-brand"
                >
                  <option v-for="w in 4" :key="'wk-' + w" :value="w">{{ w }} {{ w === 1 ? 'Week' : 'Weeks' }}</option>
                </select>
              </div>

              <!-- Tier select (1-4) -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">Ad Placement Priority Tier</label>
                <select
                  v-model="tier"
                  class="w-full px-4 py-2 border border-appBorder rounded-lg text-sm bg-appBg text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none focus:border-brand"
                >
                  <option :value="1">Tier 1 — Top Premium Banner</option>
                  <option :value="2">Tier 2 — Mid Highly Visible Banner</option>
                  <option :value="3">Tier 3 — Standard Budget Placement</option>
                  <option :value="4">Tier 4 — Economical Budget Placement</option>
                </select>
              </div>

              <!-- Label color -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">Label Badge Color</label>
                <select
                  v-model="labelColor"
                  class="w-full px-4 py-2 border border-appBorder rounded-lg text-sm bg-appBg text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none focus:border-brand"
                >
                  <option value="red">Red (Urgency)</option>
                  <option value="blue">Blue (Primary Info)</option>
                  <option value="green">Green (Exclusive / Offer)</option>
                  <option value="gold">Gold (Premium Elite)</option>
                </select>
              </div>

              <!-- Label Badge text -->
              <div class="space-y-1 md:col-span-2">
                <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">Slide Label / CTA Text (Optional)</label>
                <input
                  v-model="label"
                  type="text"
                  placeholder="e.g. EXCLUSIVE DEAL, 50% OFF, LIMITED"
                  class="w-full px-4 py-2 border border-appBorder rounded-lg text-sm bg-appBg text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none focus:border-brand"
                >
              </div>
            </div>

            <!-- Ad Creative Image Upload -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">Creative Banner Image (Aspect Ratio ~2.5:1)</label>
              <div class="flex items-center justify-center border-2 border-dashed border-appBorder hover:border-brand rounded-xl p-4 bg-appBg/50 transition cursor-pointer relative overflow-hidden group min-h-[140px]">
                <input
                  type="file"
                  accept="image/*"
                  class="absolute inset-0 opacity-0 cursor-pointer z-10"
                  @change="onFileChange"
                >
                <div v-if="!filePreview" class="text-center space-y-2">
                  <Icon name="heroicons:photo" class="w-8 h-8 text-textMuted mx-auto" />
                  <p class="text-xs font-medium text-textSecondary">Click or drag banner here to upload</p>
                  <p class="text-[10px] text-textMuted">PNG, JPG, JPEG, WEBP files allowed</p>
                </div>
                <div v-else class="relative w-full h-32">
                  <img :src="filePreview" class="w-full h-full object-cover rounded-lg">
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span class="text-xs font-bold text-white bg-brand px-3 py-1.5 rounded-lg shadow">Change Image</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Price Breakdown Summary bar -->
            <div class="bg-appBg border border-appBorder rounded-xl p-4 flex items-center justify-between">
              <div>
                <p class="text-xs text-textMuted font-bold uppercase tracking-wider">Estimated Booking Price</p>
                <p class="text-sm font-bold text-textSecondary mt-0.5">
                  Tier {{ tier }}: <span class="text-textPrimary">${{ selectedTierCost.toFixed(2) }}</span> / week
                </p>
              </div>
              <div class="text-right">
                <p class="text-[10px] text-textMuted uppercase font-bold tracking-widest">Total cost for {{ durationWeeks }} wk</p>
                <p class="text-xl font-black text-brand">${{ totalCampaignCost.toFixed(2) }}</p>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="w-full py-3 bg-brand hover:bg-brandHover text-brandText font-extrabold rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
              :disabled="submitting"
            >
              <Icon v-if="submitting" name="svg-spinners:ring-resize" class="w-5 h-5 animate-spin" />
              <Icon v-else name="heroicons:check-circle" class="w-5 h-5" />
              <span>
                {{ autoApprove ? 'Book and Pay Now' : 'Submit for Review' }}
              </span>
            </button>
          </form>
        </div>
      </div>

      <!-- Right 1 Col: Dynamic pricing matrix & My Campaigns list -->
      <div class="space-y-8">
        <!-- Live Pricing Settings matrix -->
        <div class="bg-cardBg border border-appBorder rounded-2xl p-5 shadow-sm space-y-4">
          <h3 class="text-xs font-extrabold text-textPrimary uppercase tracking-wider border-b border-appBorder pb-2 flex items-center gap-1.5">
            <Icon name="heroicons:currency-dollar" class="w-4.5 h-4.5 text-brand" />
            <span>Pricing matrix</span>
          </h3>

          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between text-textSecondary border-b border-appBorder/40 pb-1.5">
              <span>Tier 1 Flat Price</span>
              <span class="font-extrabold text-textPrimary">${{ pricingSettings?.priceTier1?.toFixed(2) || '100.00' }}</span>
            </div>
            <div class="flex items-center justify-between text-textSecondary border-b border-appBorder/40 pb-1.5">
              <span>Tier 2 Flat Price</span>
              <span class="font-extrabold text-textPrimary">${{ pricingSettings?.priceTier2?.toFixed(2) || '80.00' }}</span>
            </div>
            <div class="flex items-center justify-between text-textSecondary border-b border-appBorder/40 pb-1.5">
              <span>Tier 3 Flat Price</span>
              <span class="font-extrabold text-textPrimary">${{ pricingSettings?.priceTier3?.toFixed(2) || '60.00' }}</span>
            </div>
            <div class="flex items-center justify-between text-textSecondary pb-1">
              <span>Tier 4 Flat Price</span>
              <span class="font-extrabold text-textPrimary">${{ pricingSettings?.priceTier4?.toFixed(2) || '40.00' }}</span>
            </div>
          </div>
        </div>

        <!-- Booked campaigns overview list -->
        <div class="bg-cardBg border border-appBorder rounded-2xl p-5 shadow-sm space-y-4">
          <h3 class="text-xs font-extrabold text-textPrimary uppercase tracking-wider border-b border-appBorder pb-2 flex items-center gap-1.5">
            <Icon name="heroicons:calendar-days" class="w-4.5 h-4.5 text-brand" />
            <span>My Bookings ({{ campaigns.length }})</span>
          </h3>

          <div v-if="loading" class="space-y-3 animate-pulse">
            <div v-for="n in 3" :key="'bskel-' + n" class="h-16 bg-appBg border border-appBorder rounded-xl" />
          </div>

          <div v-else-if="campaigns.length === 0" class="text-center py-6 space-y-2">
            <Icon name="heroicons:megaphone" class="w-8 h-8 text-textMuted mx-auto" />
            <p class="text-xs text-textMuted font-bold">No campaigns booked yet.</p>
          </div>

          <div v-else class="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            <div
              v-for="campaign in campaigns"
              :key="campaign.id"
              class="p-3 bg-appBg/40 border border-appBorder rounded-xl space-y-2 flex flex-col justify-between"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h4 class="text-xs font-extrabold text-textPrimary">Tier {{ campaign.tier }} Booking</h4>
                  <p class="text-[9px] text-textMuted font-semibold bg-brand/10 text-brand px-1.5 py-0.5 rounded w-fit mt-1">
                    Auto-allocated slot: {{ campaign.slidePosition }}
                  </p>
                  <p class="text-[10px] text-textMuted mt-1">
                    {{ new Date(campaign.startDate).toLocaleDateString() }} - {{ new Date(campaign.endDate).toLocaleDateString() }}
                  </p>
                </div>
                <!-- Status badges -->
                <div class="flex flex-col items-end gap-1 shrink-0">
                  <span
                    v-if="campaign.status === 'PENDING_APPROVAL'"
                    class="text-[9px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/10"
                  >
                    Pending Review
                  </span>
                  <span
                    v-else-if="campaign.status === 'REJECTED'"
                    class="text-[9px] font-bold bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded border border-rose-500/10"
                  >
                    Rejected
                  </span>
                  <span
                    v-else-if="!campaign.isPaid"
                    class="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/10"
                  >
                    Approved (Unpaid)
                  </span>
                  <span
                    v-else
                    class="text-[9px] font-bold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded border border-blue-500/10"
                  >
                    Paid & Active
                  </span>
                </div>
              </div>

              <div class="flex items-center justify-between border-t border-appBorder/40 pt-2 text-xs">
                <span class="font-extrabold text-textSecondary">${{ campaign.totalPaid.toFixed(2) }}</span>
                <!-- Checkout trigger button -->
                <button
                  v-if="campaign.status === 'APPROVED' && !campaign.isPaid"
                  class="text-[10px] font-bold bg-brand hover:bg-brandHover text-brandText px-2.5 py-1 rounded-md transition"
                  @click="triggerCheckout(campaign.id)"
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Simulated Checkout Modal -->
    <div v-if="isCheckoutOpen" class="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
      <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-xl max-w-md w-full space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between border-b border-appBorder pb-3">
          <div class="flex items-center gap-2">
            <Icon name="heroicons:credit-card" class="w-5 h-5 text-brand" />
            <h3 class="text-sm font-extrabold text-textPrimary uppercase tracking-wider">Simulated Checkout</h3>
          </div>
          <button @click="closeCheckout" class="p-1 text-textMuted hover:text-textPrimary transition">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <div class="bg-appBg border border-appBorder rounded-xl p-4 space-y-2">
            <p class="text-[10px] font-extrabold text-textMuted uppercase tracking-wider">Vaulted Payment Card</p>
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <Icon name="logos:visa" class="w-8 h-4 shrink-0" />
                <span class="font-bold text-textPrimary">{{ cardNumber }}</span>
              </div>
              <span class="text-xs text-textSecondary font-semibold">{{ expMonth }}/{{ expYear }}</span>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="text-textSecondary">Merchant Ad Service</span>
              <span class="font-extrabold text-textPrimary">$100.00</span>
            </div>
            <hr class="border-appBorder" />
            <div class="flex items-center justify-between text-sm">
              <span class="font-extrabold text-textPrimary">Total Paid Amount</span>
              <span class="font-black text-brand">Total calculated automatically</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            class="flex-1 py-2.5 bg-appBg hover:bg-appBg/80 border border-appBorder text-textPrimary font-bold rounded-xl transition text-xs"
            @click="closeCheckout"
          >
            Cancel
          </button>
          <button
            class="flex-1 py-2.5 bg-brand hover:bg-brandHover text-brandText font-extrabold rounded-xl transition text-xs flex items-center justify-center gap-1 shadow"
            :disabled="submitting"
            @click="handlePayment"
          >
            <Icon v-if="submitting" name="svg-spinners:ring-resize" class="w-4 h-4 animate-spin" />
            <span>Process Payment</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
