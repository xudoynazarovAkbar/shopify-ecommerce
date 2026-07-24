<script setup lang="ts">
import { useApi } from '../../composables/useApi';
import type { SavedCard } from '../../types';

const props = defineProps<{
  modelValue: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void;
}>();

const api = useApi();

const cards = ref<SavedCard[]>([]);
const loading = ref(true);

// Toggle state
const showAddForm = ref(false);

const fetchCards = async () => {
  loading.value = true;
  try {
    const res = await api.get<SavedCard[]>('/payments/cards');
    cards.value = res || [];
    
    // Auto-select first card if none is selected
    if (cards.value.length > 0 && !props.modelValue) {
      const firstCard = cards.value[0];
      if (firstCard) {
        emit('update:modelValue', firstCard.id);
      }
    }
  } catch (err) {
    console.error('Failed to fetch vaulted cards:', err);
  } finally {
    loading.value = false;
  }
};

const handleSelect = (cardId: string) => {
  emit('update:modelValue', cardId);
};

const onCardAdded = async (newCard: SavedCard) => {
  showAddForm.value = false;
  await fetchCards();
  if (newCard?.id) {
    emit('update:modelValue', newCard.id);
  }
};

onMounted(() => {
  fetchCards();
});
</script>

<template>
  <div class="space-y-4 bg-appBg/40 border border-appBorder rounded-2xl p-4 transition-colors">
    <div class="flex items-center justify-between gap-2 border-b border-appBorder pb-2 mb-2">
      <label class="block text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
        <Icon name="heroicons:credit-card" class="w-4 h-4 text-brand" />
        <span>{{ $t('cart.paymentLabel') || 'Payment Method' }}</span>
      </label>

      <!-- Toggle Add Card -->
      <button
        type="button"
        class="text-xs font-bold text-brand hover:underline flex items-center gap-0.5"
        @click="showAddForm = !showAddForm"
      >
        <Icon :name="showAddForm ? 'heroicons:minus' : 'heroicons:plus'" class="w-3.5 h-3.5" />
        <span>{{ showAddForm ? 'Cancel' : 'Add New' }}</span>
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading && cards.length === 0" class="space-y-2 py-2 animate-pulse">
      <div v-for="n in 2" :key="'card-skel-' + n" class="h-12 bg-appBorder rounded-xl"/>
    </div>

    <template v-else>
      <!-- Expandable Add New Card Drawer -->
      <CartVaultCardForm
        v-if="showAddForm"
        @card-added="onCardAdded"
      />

      <!-- Empty State: No Cards Saved -->
      <div v-if="cards.length === 0" class="text-center py-4 text-textMuted text-xs">
        <Icon name="heroicons:credit-card" class="w-8 h-8 text-textMuted mx-auto mb-1 opacity-60" />
        <p>No payment methods on file.</p>
        <p class="text-[10px] opacity-85 mt-0.5">Click 'Add New' to vault a card securely.</p>
      </div>

      <!-- Selector Radio List -->
      <div v-else class="space-y-2">
        <button
          v-for="card in cards"
          :key="card.id"
          type="button"
          :class="[
            modelValue === card.id ? 'border-brand bg-brand/5 ring-1 ring-brand' : 'border-appBorder bg-cardBg hover:border-textMuted',
            'w-full text-left border rounded-xl p-3 flex items-center justify-between gap-3 transition-all duration-200'
          ]"
          @click="handleSelect(card.id)"
        >
          <div class="flex items-center gap-3">
            <Icon
              :name="card.brand.toLowerCase() === 'visa' ? 'logos:visa' : card.brand.toLowerCase() === 'mastercard' ? 'logos:mastercard' : 'heroicons:credit-card'"
              class="w-8 h-6 shrink-0"
            />
            <div>
              <p class="text-xs font-bold text-textPrimary uppercase">
                {{ card.brand }} •••• {{ card.last4 }}
              </p>
              <p class="text-[10px] text-textMuted leading-none mt-0.5">
                Expires {{ String(card.expMonth).padStart(2, '0') }}/{{ card.expYear }}
              </p>
            </div>
          </div>

          <!-- Radio Circle -->
          <div
:class="[
            modelValue === card.id ? 'border-brand bg-brand' : 'border-appBorder bg-transparent',
            'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0'
          ]">
            <div v-if="modelValue === card.id" class="w-1.5 h-1.5 rounded-full bg-white"/>
          </div>
        </button>
      </div>
    </template>
  </div>
</template>
