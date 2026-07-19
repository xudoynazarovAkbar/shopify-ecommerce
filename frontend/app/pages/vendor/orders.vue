<script setup lang="ts">
import { useVendorOrders } from '../../composables/useVendorOrders';
import { useToastStore } from '../../stores/toast';
import type { OrderStatus } from '../../types';

definePageMeta({
  layout: 'vendor',
  middleware: ['auth', 'role'],
  meta: { roles: ['VENDOR'] },
});

const { orders, loading, error, fetchOrders, updateOrderStatus } = useVendorOrders();
const toastStore = useToastStore();

onMounted(async () => {
  await fetchOrders();
});

const handleStatusChange = async (orderId: string, status: string) => {
  try {
    await updateOrderStatus(orderId, status as OrderStatus);
    toastStore.success(useNuxtApp().$i18n.t('vendor.orderStatusSuccess'));
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to update order status';
    toastStore.error(errMsg);
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-1">
      <h1 class="text-2xl font-black text-textPrimary tracking-tight">
        {{ $t('vendor.ordersTitle') }}
      </h1>
      <p class="text-xs text-textMuted">
        {{ $t('vendor.ordersSubtitle') }}
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

    <!-- Skeleton loaders -->
    <div v-if="loading && orders.length === 0" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-40 bg-cardBg rounded-2xl border border-appBorder animate-pulse" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="orders.length === 0"
      class="border border-appBorder bg-cardBg rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm"
    >
      <div class="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
        <Icon name="heroicons:shopping-bag" class="w-6 h-6" />
      </div>
      <div class="space-y-1">
        <h3 class="font-extrabold text-textPrimary text-sm">
          {{ $t('vendor.noIncomingOrders') }}
        </h3>
        <p class="text-xs text-textMuted">
          {{ $t('vendor.noIncomingOrdersHelp') }}
        </p>
      </div>
    </div>

    <!-- Vendor orders ledger table / card layout -->
    <div v-else class="space-y-6">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-cardBg border border-appBorder rounded-2xl overflow-hidden shadow-sm flex flex-col divide-y divide-appBorder"
      >
        <!-- Top bar section -->
        <div class="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-appBg/20">
          <div class="space-y-1">
            <div class="flex items-center gap-3">
              <span class="font-black text-textPrimary text-base">
                {{ $t('orders.orderNo') }} #{{ order.orderNumber }}
              </span>
              <span class="text-xs text-textMuted">
                {{ new Date(order.createdAt).toLocaleString($i18n.locale) }}
              </span>
            </div>
            <p class="text-xs text-textSecondary font-medium flex items-center gap-1">
              <Icon name="heroicons:user" class="w-3.5 h-3.5 text-textMuted" />
              {{ order.buyer?.email }}
            </p>
          </div>

          <!-- Interactive Action Status controller -->
          <div class="flex items-center gap-3 self-start sm:self-auto">
            <span class="text-xs font-bold text-textMuted tracking-wide uppercase">{{ $t('vendor.cycleStatus') }}:</span>
            <select
              :value="order.status"
              :class="[
                'text-xs font-bold rounded-lg px-3 py-1.5 border focus:outline-none focus:ring-2 focus:ring-brand/20 transition',
                order.status === 'COMPLETED'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                  : order.status === 'CANCELLED'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
              ]"
              @change="handleStatusChange(order.id, ($event.target as HTMLSelectElement).value)"
            >
              <option value="PENDING">{{ $t('orders.status.pending') }}</option>
              <option value="COMPLETED">{{ $t('orders.status.completed') }}</option>
              <option value="CANCELLED">{{ $t('orders.status.cancelled') }}</option>
            </select>
          </div>
        </div>

        <!-- Ordered Items list -->
        <div class="p-5 space-y-3">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex items-center justify-between text-sm gap-4 py-1"
          >
            <div class="flex items-center gap-2.5">
              <span class="text-xs font-black text-brand bg-brand/10 w-6 h-6 rounded flex items-center justify-center shrink-0">
                x{{ item.quantity }}
              </span>
              <span class="font-bold text-textPrimary">{{ item.product?.name || $t('orders.unknownProduct') }}</span>
            </div>
            <span class="font-bold text-textSecondary">${{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>

        <!-- Financial Summary Bar -->
        <div class="p-5 flex justify-end bg-appBg/10">
          <div class="w-full sm:w-72 text-xs space-y-1.5 text-textSecondary">
            <div class="flex justify-between">
              <span>{{ $t('orders.subtotal') }}</span>
              <span>${{ order.subtotal.toFixed(2) }}</span>
            </div>
            <div v-if="order.discount > 0" class="flex justify-between text-rose-500 font-bold">
              <span>{{ $t('orders.discount') }}</span>
              <span>-${{ order.discount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>{{ $t('orders.tax') }}</span>
              <span>${{ order.tax.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>{{ $t('orders.deliveryFee') }}</span>
              <span>${{ order.deliveryFee.toFixed(2) }}</span>
            </div>
            <div class="border-t border-appBorder pt-2 mt-2 flex justify-between font-black text-sm text-textPrimary">
              <span>{{ $t('orders.total') }}</span>
              <span class="text-brand">${{ order.total.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
