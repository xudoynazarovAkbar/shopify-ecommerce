<script setup lang="ts">
import { useAdminCampaigns } from '../../composables/useAdminCampaigns';

definePageMeta({
  middleware: ['auth', 'role'],
  meta: { roles: ['ADMIN'] },
});

const {
  campaigns,
  loading,
  savingSettings,
  priceTier1,
  priceTier2,
  priceTier3,
  priceTier4,
  handleSaveSettings,
  handleStatusChange,
  handleToggleActive,
} = useAdminCampaigns();
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
        <AdminCampaignsPricingSettingsForm
          v-model:price-tier1="priceTier1"
          v-model:price-tier2="priceTier2"
          v-model:price-tier3="priceTier3"
          v-model:price-tier4="priceTier4"
          :saving-settings="savingSettings"
          @save-settings="handleSaveSettings"
        />
      </div>

      <!-- Right: Campaigns Auditing Ledger -->
      <div class="lg:col-span-2 space-y-6">
        <AdminCampaignsCampaignAuditingLedger
          :campaigns="campaigns"
          :loading="loading"
          @status-change="handleStatusChange"
          @toggle-active="handleToggleActive"
        />
      </div>
    </div>
  </div>
</template>
