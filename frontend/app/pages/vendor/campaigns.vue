<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useVendorCampaigns } from '../../composables/useVendorCampaigns';
import type { AdCampaign, CreateCampaignParams, EditCampaignParams } from '../../types';

definePageMeta({
  middleware: ['auth', 'role'],
  meta: { roles: ['VENDOR'] },
});

const {
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
} = useVendorCampaigns();

// Modal & Component Refs
const bookingFormRef = ref<{ resetForm: () => void } | null>(null);
const isCheckoutOpen = ref(false);
const payingCampaignId = ref<string | null>(null);

const isEditOpen = ref(false);
const editingCampaign = ref<AdCampaign | null>(null);

onMounted(async () => {
  await fetchCampaignsAndPricing();
});

// Orchestration Handlers
const handleCreateCampaign = async (payload: CreateCampaignParams) => {
  await createCampaignAction(payload, (res) => {
    if (bookingFormRef.value) {
      bookingFormRef.value.resetForm();
    }
    if (res && res.status === 'APPROVED') {
      triggerCheckout(res.id);
    }
  });
};

const handleEditCampaign = async (payload: EditCampaignParams) => {
  if (!editingCampaign.value) return;
  await editCampaignAction(editingCampaign.value.id, payload, () => {
    closeEditModal();
  });
};

const handleTogglePause = async (campaign: AdCampaign) => {
  await togglePauseCampaignAction(campaign);
};

const handlePayment = async () => {
  if (!payingCampaignId.value) return;
  await processPaymentAction(payingCampaignId.value, () => {
    closeCheckout();
  });
};

// Checkout Toggles
const triggerCheckout = (campaignId: string) => {
  payingCampaignId.value = campaignId;
  isCheckoutOpen.value = true;
};

const closeCheckout = () => {
  isCheckoutOpen.value = false;
  payingCampaignId.value = null;
};

// Edit Modal Toggles
const openEditModal = (campaign: AdCampaign) => {
  editingCampaign.value = campaign;
  isEditOpen.value = true;
};

const closeEditModal = () => {
  isEditOpen.value = false;
  editingCampaign.value = null;
};
</script>

<template>
  <div class="space-y-8 max-w-6xl mx-auto">
    <!-- Header Banner Component -->
    <VendorCampaignsHeaderBanner :auto-approve="autoApprove" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left 2 Cols: Form component -->
      <div class="lg:col-span-2 space-y-8">
        <VendorCampaignsBookingForm
          ref="bookingFormRef"
          :submitting="submitting"
          :auto-approve="autoApprove"
          :pricing-settings="pricingSettings"
          :calculated-costs="calculatedCosts"
          @submit="handleCreateCampaign"
        />
      </div>

      <!-- Right 1 Col: Pricing Settings & Booked Campaigns List -->
      <div class="space-y-8">
        <VendorCampaignsPricingMatrix :pricing-settings="pricingSettings" />

        <VendorCampaignsBookedCampaignsList
          :campaigns="campaigns"
          :loading="loading"
          @toggle-pause="handleTogglePause"
          @edit="openEditModal"
          @checkout="triggerCheckout"
        />
      </div>
    </div>

    <!-- Simulated Checkout Modal -->
    <VendorCampaignsCheckoutModal
      :show="isCheckoutOpen"
      :submitting="submitting"
      @close="closeCheckout"
      @submit="handlePayment"
    />

    <!-- Edit Campaign Modal -->
    <VendorCampaignsEditModal
      :show="isEditOpen"
      :submitting="submitting"
      :auto-approve="autoApprove"
      :campaign="editingCampaign"
      @close="closeEditModal"
      @submit="handleEditCampaign"
    />
  </div>
</template>
