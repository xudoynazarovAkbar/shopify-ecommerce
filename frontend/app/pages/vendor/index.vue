<script setup lang="ts">
import { useAuthStore } from '../../stores/auth';
import { useVendorOrders } from '../../composables/useVendorOrders';
import { useVendorProducts } from '../../composables/useVendorProducts';
import { useVendorCoupons } from '../../composables/useVendorCoupons';

definePageMeta({
  middleware: ['auth', 'role'],
  meta: { roles: ['VENDOR'] },
});

const authStore = useAuthStore();
const { orders, fetchOrders } = useVendorOrders();
const { products, fetchProducts } = useVendorProducts();
const { coupons, fetchCoupons } = useVendorCoupons();

onMounted(async () => {
  await Promise.all([
    fetchOrders(),
    fetchProducts(),
    fetchCoupons(),
  ]);
});

const autoApprove = computed(() => authStore.user?.vendorProfile?.autoApproveProducts ?? false);
const vendorStatus = computed(() => authStore.user?.vendorProfile?.status ?? 'PENDING');

const totalEarnings = computed(() => {
  return orders.value
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.total, 0);
});

const pendingOrdersCount = computed(() => {
  return orders.value.filter((o) => o.status === 'PENDING').length;
});

const activeCouponsCount = computed(() => {
  return coupons.value.filter((c) => c.isActive).length;
});
</script>

<template>
  <div class="space-y-8">
    <!-- Trust Governance Status Bar -->
    <div
      :class="[
        'p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm',
        vendorStatus === 'APPROVED'
          ? 'bg-emerald-500/5 border-emerald-500/15'
          : vendorStatus === 'REJECTED'
          ? 'bg-rose-500/5 border-rose-500/15'
          : 'bg-amber-500/5 border-amber-500/15',
      ]"
    >
      <div class="space-y-1.5">
        <h3 class="font-extrabold text-textPrimary text-base flex items-center gap-2">
          <Icon
            :name="
              vendorStatus === 'APPROVED'
                ? 'heroicons:check-badge-solid'
                : vendorStatus === 'REJECTED'
                ? 'heroicons:x-circle-solid'
                : 'heroicons:clock-solid'
            "
            :class="[
              'w-5 h-5',
              vendorStatus === 'APPROVED'
                ? 'text-emerald-500'
                : vendorStatus === 'REJECTED'
                ? 'text-rose-500'
                : 'text-amber-500',
            ]"
          />
          {{ $t('vendor.storeStatus') }}: {{ $t(`vendor.statusLabel.${vendorStatus.toLowerCase()}`) }}
        </h3>
        <p class="text-xs text-textMuted max-w-2xl leading-relaxed">
          {{
            vendorStatus === 'APPROVED'
              ? $t('vendor.storeApprovedHelp')
              : vendorStatus === 'REJECTED'
              ? $t('vendor.storeRejectedHelp')
              : $t('vendor.storePendingHelp')
          }}
        </p>
      </div>

      <!-- Trust Auto-Approve Indicator -->
      <div
        v-if="vendorStatus === 'APPROVED'"
        class="bg-cardBg px-5 py-4 rounded-xl border border-appBorder flex items-center gap-3.5 shrink-0 self-start md:self-auto"
      >
        <div
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm',
            autoApprove ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500',
          ]"
        >
          <Icon :name="autoApprove ? 'heroicons:bolt-solid' : 'heroicons:shield-exclamation-solid'" class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[10px] uppercase font-bold text-textMuted tracking-wider block">
            {{ $t('vendor.trustTier') }}
          </span>
          <span class="text-sm font-black text-textPrimary block mt-0.5">
            {{ autoApprove ? $t('vendor.autoApprovalActive') : $t('vendor.manualModerationActive') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Quick Stat Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Earnings Card -->
      <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm hover:shadow transition flex items-center gap-5">
        <div class="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
          <Icon name="heroicons:currency-dollar-solid" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-xs text-textMuted font-bold block uppercase tracking-wide">{{ $t('vendor.earnings') }}</span>
          <span class="text-2xl font-black text-textPrimary block mt-1">
            ${{ totalEarnings.toFixed(2) }}
          </span>
        </div>
      </div>

      <!-- Open Orders Card -->
      <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm hover:shadow transition flex items-center gap-5">
        <div class="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
          <Icon name="heroicons:clock-solid" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-xs text-textMuted font-bold block uppercase tracking-wide">{{ $t('vendor.openOrders') }}</span>
          <span class="text-2xl font-black text-textPrimary block mt-1">
            {{ pendingOrdersCount }}
          </span>
        </div>
      </div>

      <!-- Inventory Products Card -->
      <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm hover:shadow transition flex items-center gap-5">
        <div class="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
          <Icon name="heroicons:squares-plus-solid" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-xs text-textMuted font-bold block uppercase tracking-wide">{{ $t('vendor.myProducts') }}</span>
          <span class="text-2xl font-black text-textPrimary block mt-1">
            {{ products.length }}
          </span>
        </div>
      </div>

      <!-- Active Coupons Card -->
      <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm hover:shadow transition flex items-center gap-5">
        <div class="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
          <Icon name="heroicons:ticket-solid" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-xs text-textMuted font-bold block uppercase tracking-wide">{{ $t('vendor.activeCoupons') }}</span>
          <span class="text-2xl font-black text-textPrimary block mt-1">
            {{ activeCouponsCount }}
          </span>
        </div>
      </div>
    </div>

    <!-- Instructions / Guide Desk -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-cardBg border border-appBorder rounded-2xl p-8 lg:col-span-2 space-y-4">
        <h4 class="font-extrabold text-textPrimary text-base flex items-center gap-2">
          <Icon name="heroicons:sparkles" class="text-brand w-5 h-5" />
          {{ $t('vendor.dashboardGreeting') }}
        </h4>
        <p class="text-sm text-textSecondary leading-relaxed">
          {{ $t('vendor.dashboardBody') }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <NuxtLink
            to="/vendor/products"
            class="p-4 rounded-xl border border-appBorder bg-appBg/40 hover:border-brand/40 transition flex items-start gap-3"
          >
            <Icon name="heroicons:squares-plus" class="w-5 h-5 text-brand mt-0.5 shrink-0" />
            <div class="space-y-0.5">
              <span class="font-bold text-sm text-textPrimary block">{{ $t('vendor.manageCatalog') }}</span>
              <span class="text-xs text-textMuted block">{{ $t('vendor.manageCatalogHelp') }}</span>
            </div>
          </NuxtLink>
          <NuxtLink
            to="/vendor/coupons"
            class="p-4 rounded-xl border border-appBorder bg-appBg/40 hover:border-brand/40 transition flex items-start gap-3"
          >
            <Icon name="heroicons:ticket" class="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
            <div class="space-y-0.5">
              <span class="font-bold text-sm text-textPrimary block">{{ $t('vendor.managePromo') }}</span>
              <span class="text-xs text-textMuted block">{{ $t('vendor.managePromoHelp') }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Quick Contact Card -->
      <div class="bg-cardBg border border-appBorder rounded-2xl p-6 flex flex-col justify-between">
        <div class="space-y-3">
          <span class="text-[10px] uppercase font-bold text-textMuted tracking-wider block">
            Merchant Support
          </span>
          <h5 class="font-extrabold text-textPrimary text-base leading-tight">
            Need assist setting up products?
          </h5>
          <p class="text-xs text-textMuted leading-relaxed">
            Our market system administration queue is online. Feel free to contact our administrative desk for questions on global categories or trust elevations.
          </p>
        </div>
        <div class="border-t border-appBorder pt-4 mt-6">
          <span class="text-xs font-bold text-brand block">
            admin@shopify.com
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
