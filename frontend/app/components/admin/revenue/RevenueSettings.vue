<script setup lang="ts">
const commissionRateInput = defineModel<number | null>('commissionRateInput', { required: true });

defineProps<{
  settingsLoading: boolean;
}>();

defineEmits<{
  (e: 'save'): void;
}>();
</script>

<template>
  <!-- Global Settings Control Panel -->
  <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
    <div class="space-y-1">
      <h3 class="font-extrabold text-textPrimary text-sm flex items-center gap-1.5">
        <Icon name="heroicons:cog-6-tooth" class="text-brand w-5 h-5 shrink-0" />
        <span>{{ $t('admin.revenue.platformSettings') }}</span>
      </h3>
      <p class="text-[11px] text-textMuted leading-relaxed">
        Update the system commission rate. This will immediately apply to all new checked-out orders.
      </p>
    </div>
    <div class="space-y-3">
      <!-- Input field -->
      <div class="relative rounded-xl border border-appBorder bg-appBg/50 hover:border-brand/30 transition shadow-sm focus-within:ring-2 focus-within:ring-brand/20 flex items-center px-3.5 py-1.5">
        <Icon name="heroicons:percent-badge" class="w-4 h-4 text-textMuted shrink-0 mr-2" />
        <div class="flex-1 flex flex-col">
          <label class="text-[8px] uppercase font-black text-textMuted tracking-wider">{{ $t('admin.revenue.commissionRateLabel') }}</label>
          <input
            v-model="commissionRateInput"
            type="number"
            min="0"
            max="100"
            :placeholder="$t('admin.revenue.commissionRatePlaceholder')"
            class="bg-transparent text-textPrimary text-sm font-semibold outline-none border-none w-full p-0"
          >
        </div>
      </div>
      <!-- Save button -->
      <button
        :disabled="settingsLoading"
        class="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand hover:bg-brandHover text-brandText transition duration-200 flex items-center gap-2 justify-center w-full shadow-sm"
        @click="$emit('save')"
      >
        <Icon v-if="settingsLoading" name="heroicons:arrow-path" class="w-4 h-4 animate-spin shrink-0" />
        <Icon v-else name="heroicons:check-circle" class="w-4 h-4 shrink-0" />
        <span>{{ $t('admin.revenue.saveCommissionBtn') }}</span>
      </button>
    </div>
  </div>
</template>
