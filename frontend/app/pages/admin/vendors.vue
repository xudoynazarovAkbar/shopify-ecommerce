<script setup lang="ts">
import { useAdminMerchants } from '../../composables/useAdminMerchants';
import { useToastStore } from '../../stores/toast';
import type { VendorStatus } from '../../types';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  meta: { roles: ['ADMIN'] },
});

const {
  merchants,
  loading,
  error,
  fetchMerchants,
  updateMerchantStatus,
  updateMerchantTrust,
} = useAdminMerchants();

const toastStore = useToastStore();

onMounted(async () => {
  await fetchMerchants();
});

const handleStatusChange = async (vendorId: string, status: 'APPROVED' | 'REJECTED') => {
  try {
    await updateMerchantStatus(vendorId, status as VendorStatus);
    toastStore.success(useNuxtApp().$i18n.t('admin.merchantStatusSuccess'));
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to update merchant status';
    toastStore.error(errMsg);
  }
};

const handleTrustToggle = async (vendorId: string, currentTrustSetting: boolean) => {
  try {
    await updateMerchantTrust(vendorId, !currentTrustSetting);
    toastStore.success(useNuxtApp().$i18n.t('admin.merchantTrustSuccess'));
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to toggle merchant trust tier';
    toastStore.error(errMsg);
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-1">
      <h1 class="text-2xl font-black text-textPrimary tracking-tight">
        {{ $t('admin.onboardingTitle') }}
      </h1>
      <p class="text-xs text-textMuted">
        {{ $t('admin.onboardingSubtitle') }}
      </p>
    </div>

    <!-- Error state banner -->
    <div
      v-if="error"
      class="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-2"
    >
      <Icon name="heroicons:exclamation-circle" class="w-5 h-5 shrink-0" />
      {{ error }}
    </div>

    <!-- Skeletons -->
    <div v-if="loading && merchants.length === 0" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-32 bg-cardBg border border-appBorder rounded-2xl animate-pulse" />
    </div>

    <!-- Empty state applications -->
    <div
      v-else-if="merchants.length === 0"
      class="border border-appBorder bg-cardBg rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm"
    >
      <div class="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
        <Icon name="heroicons:building-storefront" class="w-6 h-6" />
      </div>
      <div class="space-y-1">
        <h3 class="font-extrabold text-textPrimary text-sm">
          {{ $t('admin.emptyVendorsTitle') }}
        </h3>
        <p class="text-xs text-textMuted">
          {{ $t('admin.emptyVendorsSubtitle') }}
        </p>
      </div>
    </div>

    <!-- Registered/Applications List -->
    <div v-else class="space-y-4">
      <div
        v-for="v in merchants"
        :key="v.id"
        class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm hover:shadow transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div class="flex items-start gap-4">
          <!-- Logo Circle representation -->
          <div class="w-12 h-12 rounded-2xl bg-brand/5 border border-brand/10 flex items-center justify-center text-brand font-black text-lg shrink-0">
            {{ v.shopName.substring(0, 1).toUpperCase() }}
          </div>
          <div class="space-y-1.5">
            <div class="flex flex-wrap items-center gap-2.5">
              <h3 class="font-black text-textPrimary text-base leading-tight">
                {{ v.shopName }}
              </h3>
              <span
                :class="[
                  'px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider',
                  v.status === 'APPROVED'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : v.status === 'REJECTED'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                ]"
              >
                {{ $t(`vendor.statusLabel.${v.status.toLowerCase()}`) }}
              </span>
            </div>
            <p class="text-xs text-textMuted max-w-xl leading-relaxed">
              {{ v.shopDescription || $t('home.noDescription') }}
            </p>
            <span class="text-[10px] text-textMuted block">
              Email: <span class="font-bold text-textSecondary">{{ v.user?.email || 'N/A' }}</span>
            </span>
          </div>
        </div>

        <!-- System Governance operations -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-4 self-start lg:self-auto shrink-0 border-t sm:border-t-0 border-appBorder pt-4 sm:pt-0 w-full sm:w-auto">
          <!-- Trust Tier config slider (Visible only for APPROVED merchants) -->
          <div
            v-if="v.status === 'APPROVED'"
            class="flex items-center gap-3 bg-appBg/50 border border-appBorder/50 px-4 py-2 rounded-xl"
          >
            <div class="text-left">
              <span class="text-[9px] uppercase font-bold text-textMuted block tracking-wider">
                {{ $t('admin.autoApproveCol') }}
              </span>
              <span class="text-xs font-bold text-textPrimary block">
                {{ v.autoApproveProducts ? $t('vendor.active') : $t('vendor.inactive') }}
              </span>
            </div>

            <!-- Custom checkbox switch -->
            <button
              type="button"
              :class="[
                'w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand/20',
                v.autoApproveProducts ? 'bg-brand' : 'bg-textMuted/20',
              ]"
              @click="handleTrustToggle(v.id, v.autoApproveProducts)"
            >
              <div
                :class="[
                  'bg-white w-4 h-4 rounded-full shadow transform duration-200',
                  v.autoApproveProducts ? 'translate-x-4' : 'translate-x-0',
                ]"
              />
            </button>
          </div>

          <!-- Pending audit actions -->
          <div v-if="v.status === 'PENDING'" class="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              class="flex-1 sm:flex-none bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 border border-rose-500/25 px-4 py-2 font-bold rounded-xl text-xs transition active:scale-95 focus:outline-none"
              @click="handleStatusChange(v.id, 'REJECTED')"
            >
              <Icon name="heroicons:x-circle" class="w-4 h-4 inline mr-1" />
              {{ $t('admin.reject') }}
            </button>
            <button
              type="button"
              class="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 font-bold rounded-xl text-xs transition active:scale-95 shadow-sm focus:outline-none"
              @click="handleStatusChange(v.id, 'APPROVED')"
            >
              <Icon name="heroicons:check-circle" class="w-4 h-4 inline mr-1" />
              {{ $t('admin.approve') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
