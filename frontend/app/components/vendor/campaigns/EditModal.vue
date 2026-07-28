<script setup lang="ts">
import { ref, watch } from 'vue';
import type { AdCampaign } from '../../../types';
import { useToastStore } from '../../../stores/toast';

const toastStore = useToastStore();

const props = defineProps<{
  show: boolean;
  submitting: boolean;
  autoApprove: boolean;
  campaign: AdCampaign | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: { label: string; labelColor: string; file: File | null }): void;
}>();

const editLabel = ref('');
const editLabelColor = ref('red');
const editSelectedFile = ref<File | null>(null);

watch(
  () => props.campaign,
  (newCampaign) => {
    if (newCampaign) {
      editLabel.value = newCampaign.label || '';
      editLabelColor.value = newCampaign.labelColor || 'red';
      editSelectedFile.value = null;
    }
  },
  { immediate: true }
);

const handleEditFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  if (!file.type.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
    toastStore.error(useNuxtApp().$i18n.t('vendor.campaigns.imageFormatErr'));
    return;
  }
  editSelectedFile.value = file;
};

const handleSubmit = () => {
  emit('submit', {
    label: editLabel.value,
    labelColor: editLabelColor.value,
    file: editSelectedFile.value,
  });
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
    <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-xl max-w-md w-full space-y-6 animate-in fade-in zoom-in-95 duration-150">
      <div class="flex items-center justify-between border-b border-appBorder pb-3">
        <div class="flex items-center gap-2">
          <Icon name="heroicons:pencil-square" class="w-5 h-5 text-brand" />
          <h3 class="text-sm font-extrabold text-textPrimary uppercase tracking-wider">
            {{ $t('vendor.campaigns.editCampaignTitle') }}
          </h3>
        </div>
        <button class="p-1 text-textMuted hover:text-textPrimary transition" @click="emit('close')">
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Campaign Info -->
        <div class="bg-appBg border border-appBorder rounded-xl p-3 text-xs text-textSecondary space-y-1">
          <p><strong>Tier:</strong> {{ campaign?.tier }}</p>
          <p><strong>Allocated Slot Position:</strong> {{ campaign?.slidePosition }}</p>
          <p>
            <strong>Trust Level:</strong> 
            <span :class="autoApprove ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'">
              {{ autoApprove ? $t('vendor.campaigns.trustedStore') : $t('vendor.campaigns.newStore') }}
            </span>
          </p>
        </div>

        <!-- Creative Image (Optional) -->
        <div class="space-y-1">
          <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">
            {{ $t('vendor.campaigns.bannerCreative') }} ({{ $t('vendor.optional') }})
          </label>
          <input
            type="file"
            accept="image/*"
            class="w-full text-xs text-textSecondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand/10 file:text-brand hover:file:bg-brand/20 cursor-pointer"
            @change="handleEditFileChange"
          >
          <p class="text-[10px] text-textMuted mt-0.5">
            {{ $t('vendor.campaigns.leaveBlankKeep') }}
          </p>
        </div>

        <!-- Label Text -->
        <div class="space-y-1">
          <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">
            {{ $t('vendor.campaigns.labelCta') }}
          </label>
          <input
            v-model="editLabel"
            type="text"
            placeholder="e.g. EXCLUSIVE, HOT, 50% OFF"
            class="w-full px-4 py-2 border border-appBorder rounded-lg text-sm bg-appBg text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none focus:border-brand"
          >
        </div>

        <!-- Label Color -->
        <div class="space-y-1">
          <label class="block text-xs font-bold text-textPrimary uppercase tracking-wide">
            {{ $t('vendor.campaigns.labelColor') }}
          </label>
          <select
            v-model="editLabelColor"
            class="w-full px-4 py-2 border border-appBorder rounded-lg text-sm bg-appBg text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none focus:border-brand"
          >
            <option value="red">{{ $t('vendor.campaigns.redLabel') }}</option>
            <option value="blue">{{ $t('vendor.campaigns.blueLabel') }}</option>
            <option value="green">{{ $t('vendor.campaigns.greenLabel') }}</option>
            <option value="gold">{{ $t('vendor.campaigns.goldLabel') }}</option>
          </select>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button
            type="button"
            class="flex-1 py-2.5 bg-appBg hover:bg-appBg/80 border border-appBorder text-textPrimary font-bold rounded-xl transition text-xs"
            @click="emit('close')"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="submit"
            class="flex-1 py-2.5 bg-brand hover:bg-brandHover text-brandText font-extrabold rounded-xl transition text-xs flex items-center justify-center gap-1 shadow"
            :disabled="submitting"
          >
            <Icon v-if="submitting" name="svg-spinners:ring-resize" class="w-4 h-4 animate-spin" />
            <span>{{ $t('vendor.campaigns.saveChanges') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
