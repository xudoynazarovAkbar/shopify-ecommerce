<script setup lang="ts">
import { useVendorCoupons } from '../../composables/useVendorCoupons';
import { useToastStore } from '../../stores/toast';
import CouponFormModal from '../../components/vendor/CouponFormModal.vue';

definePageMeta({
  layout: 'vendor',
  middleware: ['auth', 'role'],
  meta: { roles: ['VENDOR'] },
});

const {
  coupons,
  loading,
  error,
  fetchCoupons,
  createCoupon,
  toggleCouponActive,
  deleteCoupon,
} = useVendorCoupons();

const toastStore = useToastStore();
const showModal = ref(false);

onMounted(async () => {
  await fetchCoupons();
});

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleFormSubmit = async (payload: { code: string; discountType: 'PERCENTAGE' | 'FLAT'; discountValue: number }) => {
  try {
    await createCoupon(payload);
    toastStore.success(useNuxtApp().$i18n.t('vendor.couponCreatedSuccess'));
    closeModal();
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to create coupon';
    toastStore.error(errMsg);
  }
};

const handleToggleActive = async (couponId: string, currentStatus: boolean) => {
  try {
    await toggleCouponActive(couponId, !currentStatus);
    toastStore.success(useNuxtApp().$i18n.t('vendor.couponToggleSuccess'));
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to toggle coupon status';
    toastStore.error(errMsg);
  }
};

const handleDelete = async (couponId: string) => {
  if (!confirm(useNuxtApp().$i18n.t('vendor.couponDeleteConfirmation'))) return;

  try {
    await deleteCoupon(couponId);
    toastStore.success(useNuxtApp().$i18n.t('vendor.couponDeletedSuccess'));
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to delete coupon';
    toastStore.error(errMsg);
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl font-black text-textPrimary tracking-tight">
          {{ $t('vendor.couponsTitle') }}
        </h1>
        <p class="text-xs text-textMuted">
          {{ $t('vendor.couponsSubtitle') }}
        </p>
      </div>

      <button
        type="button"
        class="bg-brand hover:bg-brandHover text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-sm hover:shadow active:scale-95 flex items-center justify-center gap-2 self-start sm:self-auto"
        @click="openModal"
      >
        <Icon name="heroicons:plus-20-solid" class="w-5 h-5" />
        {{ $t('vendor.addCoupon') }}
      </button>
    </div>

    <!-- Error state alert -->
    <div
      v-if="error"
      class="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-2"
    >
      <Icon name="heroicons:exclamation-circle" class="w-5 h-5 shrink-0" />
      {{ error }}
    </div>

    <!-- Skeletons -->
    <div v-if="loading && coupons.length === 0" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-20 bg-cardBg border border-appBorder rounded-2xl animate-pulse" />
    </div>

    <!-- Empty catalog state -->
    <div
      v-else-if="coupons.length === 0"
      class="border border-appBorder bg-cardBg rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm"
    >
      <div class="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
        <Icon name="heroicons:ticket" class="w-6 h-6" />
      </div>
      <div class="space-y-1">
        <h3 class="font-extrabold text-textPrimary text-sm">
          {{ $t('vendor.emptyCouponsTitle') }}
        </h3>
        <p class="text-xs text-textMuted">
          {{ $t('vendor.emptyCouponsSubtitle') }}
        </p>
      </div>
    </div>

    <!-- Coupons ledger list -->
    <div v-else class="space-y-4">
      <div
        v-for="coupon in coupons"
        :key="coupon.id"
        class="bg-cardBg border border-appBorder rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-brand/5 border border-brand/10 flex items-center justify-center shrink-0 text-brand">
            <Icon name="heroicons:ticket-solid" class="w-6 h-6" />
          </div>
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-black text-textPrimary text-base uppercase tracking-wider">
                {{ coupon.code }}
              </span>
              <span
                :class="[
                  'px-2 py-0.5 rounded text-[10px] font-bold border uppercase',
                  coupon.isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-textMuted/10 text-textMuted border-appBorder',
                ]"
              >
                {{ coupon.isActive ? $t('vendor.active') : $t('vendor.inactive') }}
              </span>
            </div>
            <p class="text-xs text-textMuted">
              {{ $t('vendor.offers') }}
              <span class="font-bold text-textSecondary">
                {{ coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `$${coupon.discountValue.toFixed(2)}` }}
              </span>
              {{ $t('vendor.discountOnCheckout') }}
            </p>
          </div>
        </div>

        <!-- Controls panel -->
        <div class="flex items-center gap-4">
          <!-- Toggle active switch -->
          <button
            type="button"
            :class="[
              'px-4 py-1.5 font-bold rounded-lg text-xs border transition active:scale-95 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-brand/10',
              coupon.isActive
                ? 'bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/10'
                : 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10',
            ]"
            @click="handleToggleActive(coupon.id, coupon.isActive)"
          >
            <Icon :name="coupon.isActive ? 'heroicons:power' : 'heroicons:bolt'" class="w-4 h-4" />
            <span>{{ coupon.isActive ? $t('vendor.deactivate') : $t('vendor.activate') }}</span>
          </button>

          <!-- Delete Coupon button -->
          <button
            type="button"
            class="bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 p-2.5 rounded-xl border border-rose-500/15 transition active:scale-95 focus:outline-none"
            @click="handleDelete(coupon.id)"
          >
            <Icon name="heroicons:trash" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Add Coupon modal -->
    <CouponFormModal
      :show="showModal"
      @close="closeModal"
      @submit="handleFormSubmit"
    />
  </div>
</template>
