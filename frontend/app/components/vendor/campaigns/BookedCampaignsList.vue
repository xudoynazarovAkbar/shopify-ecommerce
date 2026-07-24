<script setup lang="ts">
import type { AdCampaign } from '../../../types';

defineProps<{
  campaigns: AdCampaign[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle-pause' | 'edit', campaign: AdCampaign): void;
  (e: 'checkout', campaignId: string): void;
}>();
</script>

<template>
  <div class="bg-cardBg border border-appBorder rounded-2xl p-5 shadow-sm space-y-4">
    <h3 class="text-xs font-extrabold text-textPrimary uppercase tracking-wider border-b border-appBorder pb-2 flex items-center gap-1.5">
      <Icon name="heroicons:calendar-days" class="w-4.5 h-4.5 text-brand" />
      <span>{{ $t('vendor.campaigns.myBookings') }} ({{ campaigns.length }})</span>
    </h3>

    <div v-if="loading" class="space-y-3 animate-pulse">
      <div v-for="n in 3" :key="'bskel-' + n" class="h-16 bg-appBg border border-appBorder rounded-xl" />
    </div>

    <div v-else-if="campaigns.length === 0" class="text-center py-6 space-y-2">
      <Icon name="heroicons:megaphone" class="w-8 h-8 text-textMuted mx-auto" />
      <p class="text-xs text-textMuted font-bold">
        {{ $t('vendor.campaigns.noCampaigns') }}
      </p>
    </div>

    <div v-else class="space-y-3 max-h-[350px] overflow-y-auto pr-1">
      <div
        v-for="campaign in campaigns"
        :key="campaign.id"
        class="p-3 bg-appBg/40 border border-appBorder rounded-xl space-y-2 flex flex-col justify-between"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <h4 class="text-xs font-extrabold text-textPrimary font-black">Tier {{ campaign.tier }} Booking</h4>
            <p class="text-[9px] text-textMuted font-semibold bg-brand/10 text-brand px-1.5 py-0.5 rounded w-fit mt-1">
              {{ $t('vendor.campaigns.autoAllocatedSlot', { slot: campaign.slidePosition }) }}
            </p>
            <p class="text-[10px] text-textMuted mt-1">
              {{ new Date(campaign.startDate).toLocaleDateString() }} - {{ new Date(campaign.endDate).toLocaleDateString() }}
            </p>
          </div>
          <!-- Status badges -->
          <div class="flex flex-col items-end gap-1 shrink-0">
            <span
              v-if="campaign.isVendorPaused"
              class="text-[9px] font-bold bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded border border-zinc-500/10 animate-pulse"
            >
              {{ $t('vendor.campaigns.paused') }}
            </span>
            <span
              v-else-if="campaign.status === 'PENDING_APPROVAL'"
              class="text-[9px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/10 animate-pulse"
            >
              {{ $t('vendor.campaigns.pendingReview') }}
            </span>
            <span
              v-else-if="campaign.status === 'REJECTED'"
              class="text-[9px] font-bold bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded border border-rose-500/10"
            >
              {{ $t('vendor.campaigns.rejected') }}
            </span>
            <span
              v-else-if="!campaign.isPaid"
              class="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/10"
            >
              {{ $t('vendor.campaigns.approvedUnpaid') }}
            </span>
            <span
              v-else
              class="text-[9px] font-bold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded border border-blue-500/10"
            >
              {{ $t('vendor.campaigns.paidActive') }}
            </span>
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-appBorder/40 pt-2 text-xs">
          <span class="font-extrabold text-textSecondary font-black">${{ campaign.totalPaid.toFixed(2) }}</span>
          
          <div class="flex items-center gap-2">
            <!-- Pause/Resume button -->
            <button
              v-if="campaign.isPaid && campaign.status === 'APPROVED'"
              type="button"
              :class="[
                'text-[10px] font-bold px-2.5 py-1 rounded-md border transition',
                campaign.isVendorPaused
                  ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                  : 'bg-zinc-500/5 border-zinc-500/15 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-500/10'
              ]"
              @click="emit('toggle-pause', campaign)"
            >
              {{ campaign.isVendorPaused ? $t('vendor.campaigns.resume') : $t('vendor.campaigns.pause') }}
            </button>

            <!-- Edit button -->
            <button
              type="button"
              class="text-[10px] font-bold bg-appBg hover:bg-appBorder border border-appBorder text-textPrimary px-2.5 py-1 rounded-md transition"
              @click="emit('edit', campaign)"
            >
              {{ $t('vendor.campaigns.edit') }}
            </button>

            <!-- Checkout trigger button -->
            <button
              v-if="campaign.status === 'APPROVED' && !campaign.isPaid"
              class="text-[10px] font-bold bg-brand hover:bg-brandHover text-brandText px-2.5 py-1 rounded-md transition"
              @click="emit('checkout', campaign.id)"
            >
              {{ $t('vendor.campaigns.payNow') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
