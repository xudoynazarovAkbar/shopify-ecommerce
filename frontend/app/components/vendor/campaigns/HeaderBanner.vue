<script setup lang="ts">
defineProps<{
  autoApprove: boolean;
}>();
</script>

<template>
  <div class="bg-cardBg border border-appBorder rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-extrabold text-textPrimary tracking-tight">
        {{ $t('vendor.campaigns.managerTitle') }}
      </h1>
      <p class="text-sm text-textSecondary mt-1">
        {{ $t('vendor.campaigns.managerSubtitle') }}
      </p>
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
        {{ autoApprove ? $t('vendor.campaigns.trustedStore') : $t('vendor.campaigns.newStore') }}
      </span>
    </div>
  </div>
</template>
