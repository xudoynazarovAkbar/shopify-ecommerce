<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const rawCode = ref(props.modelValue);
const isApplied = ref(!!props.modelValue);

const handleApply = () => {
  if (!rawCode.value.trim()) return;
  const normalized = rawCode.value.trim().toUpperCase();
  emit('update:modelValue', normalized);
  isApplied.value = true;
};

const handleRemove = () => {
  rawCode.value = '';
  emit('update:modelValue', '');
  isApplied.value = false;
};

// Sync internal state with external prop changes
watch(() => props.modelValue, (newVal) => {
  rawCode.value = newVal;
  isApplied.value = !!newVal;
});
</script>

<template>
  <div class="space-y-3 bg-appBg/40 border border-appBorder rounded-2xl p-4 transition-colors">
    <label class="block text-xs font-bold text-textPrimary uppercase tracking-wider">
      {{ $t('cart.couponLabel') || 'Have a Promo Code?' }}
    </label>

    <!-- Code Input Field (Not Applied yet) -->
    <form v-if="!isApplied" class="flex gap-2" @submit.prevent="handleApply">
      <input
        v-model="rawCode"
        type="text"
        placeholder="e.g. BURGER20"
        class="flex-1 min-w-0 px-3 py-2 border border-appBorder rounded-xl bg-cardBg text-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-brand uppercase"
      >
      <button
        type="submit"
        class="px-4 py-2 bg-brand hover:bg-brandHover text-brandText text-xs font-bold rounded-xl transition shrink-0"
        :disabled="!rawCode.trim()"
      >
        {{ $t('cart.couponApplyBtn') || 'Apply' }}
      </button>
    </form>

    <!-- Coupon Applied Badge -->
    <div v-else class="flex items-center justify-between gap-3 bg-teal-500/10 border border-teal-500/20 rounded-xl p-3">
      <div class="flex items-center gap-2 text-teal-600 dark:text-teal-400">
        <Icon name="heroicons:ticket" class="w-5 h-5 shrink-0" />
        <div class="text-xs">
          <p class="font-bold uppercase tracking-wide leading-none mb-0.5">
            {{ rawCode }}
          </p>
          <p class="text-[10px] opacity-80 leading-none">
            {{ $t('cart.couponAppliedMsg') || 'Registered for checkout' }}
          </p>
        </div>
      </div>

      <!-- Remove button -->
      <button
        class="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 p-1.5 rounded-lg transition shrink-0"
        @click="handleRemove"
      >
        <Icon name="heroicons:x-mark-20-solid" class="w-4 h-4 shrink-0" />
      </button>
    </div>
  </div>
</template>
