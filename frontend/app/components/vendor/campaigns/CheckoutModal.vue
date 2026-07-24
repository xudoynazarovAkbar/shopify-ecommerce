<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  show: boolean;
  submitting: boolean;
}>();

const emit = defineEmits<{
  (e: 'close' | 'submit'): void;
}>();

const cardNumber = ref('4242 •••• •••• 4242');
const expMonth = ref(12);
const expYear = ref(2027);
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
    <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-xl max-w-md w-full space-y-6 animate-in fade-in zoom-in-95 duration-150">
      <div class="flex items-center justify-between border-b border-appBorder pb-3">
        <div class="flex items-center gap-2">
          <Icon name="heroicons:credit-card" class="w-5 h-5 text-brand" />
          <h3 class="text-sm font-extrabold text-textPrimary uppercase tracking-wider">
            {{ $t('vendor.campaigns.checkoutTitle') }}
          </h3>
        </div>
        <button class="p-1 text-textMuted hover:text-textPrimary transition" @click="emit('close')">
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>

      <div class="space-y-4">
        <div class="bg-appBg border border-appBorder rounded-xl p-4 space-y-2">
          <p class="text-[10px] font-extrabold text-textMuted uppercase tracking-wider">
            {{ $t('vendor.campaigns.vaultedCard') }}
          </p>
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
          <hr class="border-appBorder">
          <div class="flex items-center justify-between text-sm">
            <span class="font-extrabold text-textPrimary">
              {{ $t('vendor.campaigns.totalPaidAmount') }}
            </span>
            <span class="font-black text-brand text-xs">
              {{ $t('vendor.campaigns.totalCalculatedAuto') }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          class="flex-1 py-2.5 bg-appBg hover:bg-appBg/80 border border-appBorder text-textPrimary font-bold rounded-xl transition text-xs"
          @click="emit('close')"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          class="flex-1 py-2.5 bg-brand hover:bg-brandHover text-brandText font-extrabold rounded-xl transition text-xs flex items-center justify-center gap-1 shadow"
          :disabled="submitting"
          @click="emit('submit')"
        >
          <Icon v-if="submitting" name="svg-spinners:ring-resize" class="w-4 h-4 animate-spin" />
          <span>{{ $t('vendor.campaigns.processPayment') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
