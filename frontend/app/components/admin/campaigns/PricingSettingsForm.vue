<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  priceTier1: number;
  priceTier2: number;
  priceTier3: number;
  priceTier4: number;
  savingSettings: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:priceTier1' | 'update:priceTier2' | 'update:priceTier3' | 'update:priceTier4', val: number): void;
  (e: 'saveSettings'): void;
}>();

const localPriceTier1 = computed({
  get: () => props.priceTier1,
  set: (val) => emit('update:priceTier1', Number(val)),
});

const localPriceTier2 = computed({
  get: () => props.priceTier2,
  set: (val) => emit('update:priceTier2', Number(val)),
});

const localPriceTier3 = computed({
  get: () => props.priceTier3,
  set: (val) => emit('update:priceTier3', Number(val)),
});

const localPriceTier4 = computed({
  get: () => props.priceTier4,
  set: (val) => emit('update:priceTier4', Number(val)),
});
</script>

<template>
  <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm space-y-5">
    <div class="flex items-center gap-2 border-b border-appBorder pb-3">
      <Icon name="heroicons:cog-6-tooth" class="w-5 h-5 text-brand" />
      <h2 class="text-sm font-extrabold text-textPrimary uppercase tracking-wider">Pricing Configuration</h2>
    </div>

    <form class="space-y-4" @submit.prevent="emit('saveSettings')">
      <!-- Tier 1 Cost -->
      <div class="space-y-1">
        <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">Tier 1 Flat Price (Slots 1-3)</label>
        <div class="relative">
          <span class="absolute left-3 top-2.5 text-xs text-textMuted font-bold">$</span>
          <input
            v-model="localPriceTier1"
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
            v-model="localPriceTier2"
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
            v-model="localPriceTier3"
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
            v-model="localPriceTier4"
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
</template>
