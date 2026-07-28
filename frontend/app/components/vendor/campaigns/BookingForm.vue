<script setup lang="ts">
import { ref, computed } from 'vue';
import type { AdPricingSettings } from '../../../types';
import { useToastStore } from '../../../stores/toast';

const toastStore = useToastStore();

const props = defineProps<{
  submitting: boolean;
  autoApprove: boolean;
  pricingSettings: AdPricingSettings | null;
  calculatedCosts: Record<number, number>;
}>();

const emit = defineEmits<{
  (e: 'submit', payload: {
    startDate: string;
    durationWeeks: number;
    tier: number;
    label: string;
    labelColor: string;
    file: File;
  }): void;
}>();

// Form State
const startDate = ref('');
const durationWeeks = ref(1);
const tier = ref(1);
const label = ref('');
const labelColor = ref('red');
const selectedFile = ref<File | null>(null);
const filePreview = ref<string | null>(null);

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  if (!file.type.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
    toastStore.error(useNuxtApp().$i18n.t('vendor.campaigns.imageFormatErr'));
    return;
  }
  selectedFile.value = file;
  filePreview.value = URL.createObjectURL(file);
};

// Computes selected tier per-week cost
const selectedTierCost = computed(() => {
  return props.calculatedCosts[tier.value] || 0;
});

// Computes total cost of the campaign booking
const totalCampaignCost = computed(() => {
  return selectedTierCost.value * durationWeeks.value;
});

const handleSubmit = () => {
  if (!startDate.value) {
    toastStore.error(useNuxtApp().$i18n.t('vendor.campaigns.dateReq'));
    return;
  }
  if (!selectedFile.value) {
    toastStore.error(useNuxtApp().$i18n.t('vendor.campaigns.fileReq'));
    return;
  }

  emit('submit', {
    startDate: startDate.value,
    durationWeeks: durationWeeks.value,
    tier: tier.value,
    label: label.value,
    labelColor: labelColor.value,
    file: selectedFile.value,
  });
};

const resetForm = () => {
  startDate.value = '';
  durationWeeks.value = 1;
  tier.value = 1;
  label.value = '';
  labelColor.value = 'red';
  selectedFile.value = null;
  filePreview.value = null;
};

defineExpose({
  resetForm,
});
</script>

<template>
  <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm space-y-6">
    <div class="flex items-center gap-2 border-b border-appBorder pb-3">
      <Icon name="heroicons:megaphone" class="w-5 h-5 text-brand" />
      <h2 class="text-sm font-extrabold text-textPrimary uppercase tracking-wider">
        {{ $t('vendor.campaigns.bookCampaign') }}
      </h2>
    </div>

    <form class="space-y-5" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- Start Date -->
        <div class="space-y-1">
          <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">
            {{ $t('vendor.campaigns.startDate') }}
          </label>
          <input
            v-model="startDate"
            type="date"
            class="w-full px-4 py-2 border border-appBorder rounded-lg text-sm bg-appBg text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none focus:border-brand"
          >
        </div>

        <!-- Duration -->
        <div class="space-y-1">
          <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">
            {{ $t('vendor.campaigns.durationWeeks') }}
          </label>
          <select
            v-model="durationWeeks"
            class="w-full px-4 py-2 border border-appBorder rounded-lg text-sm bg-appBg text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none focus:border-brand"
          >
            <option v-for="w in 4" :key="'wk-' + w" :value="w">
              {{ w }} {{ w === 1 ? 'Week' : 'Weeks' }}
            </option>
          </select>
        </div>

        <!-- Tier select (1-4) -->
        <div class="space-y-1">
          <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">
            {{ $t('vendor.campaigns.placementTier') }}
          </label>
          <select
            v-model="tier"
            class="w-full px-4 py-2 border border-appBorder rounded-lg text-sm bg-appBg text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none focus:border-brand"
          >
            <option :value="1">{{ $t('vendor.campaigns.tier1Option') }}</option>
            <option :value="2">{{ $t('vendor.campaigns.tier2Option') }}</option>
            <option :value="3">{{ $t('vendor.campaigns.tier3Option') }}</option>
            <option :value="4">{{ $t('vendor.campaigns.tier4Option') }}</option>
          </select>
        </div>

        <!-- Label color -->
        <div class="space-y-1">
          <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">
            {{ $t('vendor.campaigns.labelColor') }}
          </label>
          <select
            v-model="labelColor"
            class="w-full px-4 py-2 border border-appBorder rounded-lg text-sm bg-appBg text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none focus:border-brand"
          >
            <option value="red">{{ $t('vendor.campaigns.redLabel') }}</option>
            <option value="blue">{{ $t('vendor.campaigns.blueLabel') }}</option>
            <option value="green">{{ $t('vendor.campaigns.greenLabel') }}</option>
            <option value="gold">{{ $t('vendor.campaigns.goldLabel') }}</option>
          </select>
        </div>

        <!-- Label Badge text -->
        <div class="space-y-1 md:col-span-2">
          <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">
            {{ $t('vendor.campaigns.labelCta') }}
          </label>
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
        <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">
          {{ $t('vendor.campaigns.bannerCreative') }}
        </label>
        <div class="flex items-center justify-center border-2 border-dashed border-appBorder hover:border-brand rounded-xl p-4 bg-appBg/50 transition cursor-pointer relative overflow-hidden group min-h-[140px]">
          <input
            type="file"
            accept="image/*"
            class="absolute inset-0 opacity-0 cursor-pointer z-10"
            @change="onFileChange"
          >
          <div v-if="!filePreview" class="text-center space-y-2">
            <Icon name="heroicons:photo" class="w-8 h-8 text-textMuted mx-auto" />
            <p class="text-xs font-medium text-textSecondary">
              {{ $t('vendor.campaigns.clickDragBanner') }}
            </p>
            <p class="text-[10px] text-textMuted">
              {{ $t('vendor.campaigns.allowedFormats') }}
            </p>
          </div>
          <div v-else class="relative w-full h-32">
            <img :src="filePreview" class="w-full h-full object-cover rounded-lg">
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span class="text-xs font-bold text-white bg-brand px-3 py-1.5 rounded-lg shadow">
                {{ $t('vendor.campaigns.changeImage') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Price Breakdown Summary bar -->
      <div class="bg-appBg border border-appBorder rounded-xl p-4 flex items-center justify-between">
        <div>
          <p class="text-xs text-textMuted font-bold uppercase tracking-wider">
            {{ $t('vendor.campaigns.estimatedBooking') }}
          </p>
          <p class="text-sm font-bold text-textSecondary mt-0.5">
            Tier {{ tier }}: <span class="text-textPrimary">${{ selectedTierCost.toFixed(2) }}</span> / {{ $t('vendor.campaigns.perWeek') }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-[10px] text-textMuted uppercase font-bold tracking-widest">
            {{ $t('vendor.campaigns.totalCostFor', { weeks: durationWeeks }) }}
          </p>
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
        <Icon name="heroicons:check-circle" class="w-5 h-5" />
        <span>
          {{ autoApprove ? $t('vendor.campaigns.bookAndPay') : $t('vendor.campaigns.submitReview') }}
        </span>
      </button>
    </form>
  </div>
</template>
