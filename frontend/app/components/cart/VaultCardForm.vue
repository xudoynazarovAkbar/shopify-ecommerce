<script setup lang="ts">
import { useApi } from '../../composables/useApi';
import { useToastStore } from '../../stores/toast';
import type { SavedCard } from '../../types';

const emit = defineEmits<{
  (e: 'card-added', card: SavedCard): void;
  (e: 'cancel'): void;
}>();

const api = useApi();
const toastStore = useToastStore();

const cardNumber = ref('');
const cardBrand = ref('Visa');
const expMonth = ref(12);
const expYear = ref(2029);
const vaulting = ref(false);

const handleAddCard = async () => {
  const digits = cardNumber.value.replace(/\s+/g, '');
  if (digits.length < 16) {
    toastStore.error('Please enter a valid 16-digit card number');
    return;
  }

  vaulting.value = true;
  try {
    const payload = {
      cardNumber: digits,
      brand: cardBrand.value,
      expMonth: Number(expMonth.value),
      expYear: Number(expYear.value),
    };

    const newCard = await api.post<SavedCard>('/payments/cards', payload);
    toastStore.success('Card secured and vaulted successfully!');
    
    // Reset form
    cardNumber.value = '';
    
    emit('card-added', newCard);
  } catch (err) {
    console.error('Failed to vault card:', err);
    const fetchError = err as {
      response?: {
        _data?: {
          message?: string;
        };
      };
    };
    toastStore.error(fetchError.response?._data?.message || 'Failed to save card method.');
  } finally {
    vaulting.value = false;
  }
};
</script>

<template>
  <form class="bg-cardBg border border-appBorder rounded-xl p-4 space-y-3 animate-slideIn" @submit.prevent="handleAddCard">
    <h4 class="text-xs font-bold text-textPrimary uppercase tracking-wide">
      Secure Payment Vaulting
    </h4>

    <div class="space-y-3">
      <!-- Card Number -->
      <div>
        <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Card Number</label>
        <input
          v-model="cardNumber"
          type="text"
          maxlength="16"
          placeholder="4242 4242 4242 4242"
          class="w-full px-3 py-1.5 border border-appBorder rounded-lg bg-appBg text-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand"
        >
      </div>

      <!-- Brand & Expiry Row -->
      <div class="grid grid-cols-3 gap-2">
        <div>
          <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Brand</label>
          <select
            v-model="cardBrand"
            class="w-full px-2 py-1.5 border border-appBorder rounded-lg bg-appBg text-textPrimary text-xs focus:outline-none"
          >
            <option value="Visa">Visa</option>
            <option value="MasterCard">MasterCard</option>
            <option value="Amex">Amex</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Exp Month</label>
          <select
            v-model="expMonth"
            class="w-full px-2 py-1.5 border border-appBorder rounded-lg bg-appBg text-textPrimary text-xs focus:outline-none"
          >
            <option v-for="m in 12" :key="'m-' + m" :value="m">{{ String(m).padStart(2, '0') }}</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-textMuted uppercase mb-1">Exp Year</label>
          <select
            v-model="expYear"
            class="w-full px-2 py-1.5 border border-appBorder rounded-lg bg-appBg text-textPrimary text-xs focus:outline-none"
          >
            <option v-for="y in 10" :key="'y-' + y" :value="2025 + y">{{ 2025 + y }}</option>
          </select>
        </div>
      </div>
    </div>

    <button
      type="submit"
      class="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 mt-2"
      :disabled="vaulting || !cardNumber.trim()"
    >
      <Icon v-if="vaulting" name="svg-spinners:ring-resize" class="w-4 h-4" />
      <Icon v-else name="heroicons:shield-check" class="w-4 h-4" />
      <span>Save & Authorize Card</span>
    </button>
  </form>
</template>
