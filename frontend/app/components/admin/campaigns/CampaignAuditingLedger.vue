<script setup lang="ts">
import { useImageResolver } from '../../../composables/useImageResolver';
import type { AdminAdCampaign } from '../../../composables/useAdminCampaigns';

interface Props {
  campaigns: AdminAdCampaign[];
  loading: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'statusChange', campaignId: string, status: string): void;
  (e: 'toggleActive', campaignId: string, currentActive: boolean): void;
}>();

const { resolveImageUrl } = useImageResolver();
</script>

<template>
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
              @click="emit('toggleActive', campaign.id, campaign.isActive)"
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
              @click="emit('statusChange', campaign.id, 'REJECTED')"
            >
              Reject Creative
            </button>
            <button
              class="px-3 py-1.5 bg-brand hover:bg-brandHover text-brandText font-bold rounded-lg text-[11px] transition shadow"
              @click="emit('statusChange', campaign.id, 'APPROVED')"
            >
              Approve & Unlock
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
