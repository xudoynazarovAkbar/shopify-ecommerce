<script setup lang="ts">
import type { CouponDiscountType } from '../../types';

defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: { code: string; discountType: CouponDiscountType; discountValue: number }): void;
}>();

const code = ref('');
const discountType = ref<CouponDiscountType>('PERCENTAGE');
const discountValue = ref<number | ''>('');
const isSubmitting = ref(false);
const formError = ref<string | null>(null);

const resetForm = () => {
  code.value = '';
  discountType.value = 'PERCENTAGE';
  discountValue.value = '';
  formError.value = null;
};

const handleCancel = () => {
  resetForm();
  emit('close');
};

const handleSubmit = async () => {
  formError.value = null;

  const normalizedCode = code.value.trim().toUpperCase();

  if (!normalizedCode) {
    formError.value = useNuxtApp().$i18n.t('vendor.errors.couponCodeRequired');
    return;
  }
  if (!/^[A-Z0-9]+$/.test(normalizedCode)) {
    formError.value = useNuxtApp().$i18n.t('vendor.errors.couponAlphanumeric');
    return;
  }
  if (discountValue.value === '' || isNaN(Number(discountValue.value)) || Number(discountValue.value) <= 0) {
    formError.value = useNuxtApp().$i18n.t('vendor.errors.discountPositive');
    return;
  }
  if (discountType.value === 'PERCENTAGE' && Number(discountValue.value) > 100) {
    formError.value = useNuxtApp().$i18n.t('vendor.errors.discountPercentageCap');
    return;
  }

  isSubmitting.value = true;
  try {
    emit('submit', {
      code: normalizedCode,
      discountType: discountType.value,
      discountValue: Number(discountValue.value),
    });
    resetForm();
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition"
  >
    <div
      class="relative bg-cardBg rounded-2xl border border-appBorder shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition duration-300 flex flex-col"
    >
      <!-- Modal Header -->
      <div class="px-6 py-5 border-b border-appBorder flex items-center justify-between">
        <h3 class="font-black text-textPrimary text-lg">
          {{ $t('vendor.addCoupon') }}
        </h3>
        <button
          class="p-1 rounded-lg text-textMuted hover:text-textPrimary hover:bg-appBg/80 transition"
          @click="handleCancel"
        >
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body Form -->
      <div class="p-6 space-y-5 flex-1">
        <!-- Error alert -->
        <div
          v-if="formError"
          class="bg-rose-500/10 border border-rose-500/25 p-3 rounded-lg text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-1.5 animate-pulse"
        >
          <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
          {{ formError }}
        </div>

        <!-- Code Input -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-textPrimary uppercase tracking-wider block">
            {{ $t('vendor.couponCode') }} *
          </label>
          <input
            v-model="code"
            type="text"
            class="w-full bg-appBg text-textPrimary border border-appBorder rounded-xl p-3 text-sm placeholder:text-textMuted/60 uppercase focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
            placeholder="BURGER20"
            maxlength="15"
          >
          <span class="text-[10px] text-textMuted block mt-1">
            {{ $t('vendor.couponHelp') }}
          </span>
        </div>

        <!-- Discount Type selection -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-textPrimary uppercase tracking-wider block">
            {{ $t('vendor.discountType') }} *
          </label>
          <div class="grid grid-cols-2 gap-3 mt-1.5">
            <button
              type="button"
              :class="[
                'p-3 rounded-xl border text-sm font-bold transition flex items-center justify-center gap-2',
                discountType === 'PERCENTAGE'
                  ? 'border-brand bg-brand/5 text-brand'
                  : 'border-appBorder bg-appBg text-textSecondary hover:text-textPrimary',
              ]"
              @click="discountType = 'PERCENTAGE'"
            >
              <Icon name="heroicons:percent-badge" class="w-4 h-4" />
              {{ $t('vendor.percentage') }}
            </button>
            <button
              type="button"
              :class="[
                'p-3 rounded-xl border text-sm font-bold transition flex items-center justify-center gap-2',
                discountType === 'FLAT'
                  ? 'border-brand bg-brand/5 text-brand'
                  : 'border-appBorder bg-appBg text-textSecondary hover:text-textPrimary',
              ]"
              @click="discountType = 'FLAT'"
            >
              <Icon name="heroicons:currency-dollar" class="w-4 h-4" />
              {{ $t('vendor.flatRate') }}
            </button>
          </div>
        </div>

        <!-- Discount Value Input -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-textPrimary uppercase tracking-wider block">
            {{ $t('vendor.discountValue') }} *
          </label>
          <input
            v-model="discountValue"
            type="number"
            step="0.1"
            min="0.1"
            class="w-full bg-appBg text-textPrimary border border-appBorder rounded-xl p-3 text-sm placeholder:text-textMuted/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
            :placeholder="discountType === 'PERCENTAGE' ? '20' : '10.00'"
          >
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4 bg-appBg/50 border-t border-appBorder flex items-center justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 text-sm font-bold text-textSecondary hover:text-textPrimary rounded-xl transition hover:bg-appBg"
          @click="handleCancel"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          type="button"
          :disabled="isSubmitting"
          class="px-5 py-2 bg-brand hover:bg-brandHover text-white font-bold rounded-xl text-sm transition shadow-sm hover:shadow active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
          @click="handleSubmit"
        >
          <Icon v-if="isSubmitting" name="svg-spinners:ring-resize" class="w-4 h-4" />
          <Icon v-else name="heroicons:ticket" class="w-4 h-4" />
          {{ $t('vendor.createCoupon') }}
        </button>
      </div>
    </div>
  </div>
</template>
