<script setup lang="ts">
import type { Order } from '../../types';

defineProps<{
  order: Order;
}>();

const isOpen = ref(false);

const toggleAccordion = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <div class="border border-appBorder rounded-xl overflow-hidden bg-cardBg shadow-sm transition">
    <!-- Accordion Header Button -->
    <button
      class="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 text-left hover:bg-appBg/50 transition gap-4 focus:outline-none focus:ring-2 focus:ring-brand/20"
      @click="toggleAccordion"
    >
      <div class="space-y-1">
        <div class="flex items-center gap-3">
          <span class="font-bold text-textPrimary text-lg">
            {{ $t('orders.orderNo') }} #{{ order.orderNumber }}
          </span>
          <span
            :class="[
              'px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase',
              order.status === 'COMPLETED'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                : order.status === 'CANCELLED'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25',
            ]"
          >
            {{ $t(`orders.status.${order.status.toLowerCase()}`) }}
          </span>
        </div>
        <p class="text-xs text-textMuted flex items-center gap-1.5">
          <Icon name="heroicons:calendar" class="w-3.5 h-3.5" />
          {{ new Date(order.createdAt).toLocaleDateString($i18n.locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) }}
        </p>
      </div>

      <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
        <div class="text-right">
          <p class="text-xs text-textMuted">{{ $t('orders.total') }}</p>
          <p class="font-black text-textPrimary text-lg">${{ order.total.toFixed(2) }}</p>
        </div>
        <Icon
          name="heroicons:chevron-down"
          :class="[
            'w-5 h-5 text-textMuted transition-transform duration-200',
            isOpen ? 'rotate-180 text-brand' : '',
          ]"
        />
      </div>
    </button>

    <!-- Accordion Content -->
    <div
      v-show="isOpen"
      class="border-t border-appBorder divide-y divide-appBorder bg-appBg/20"
    >
      <!-- Item list -->
      <div class="p-5 space-y-4">
        <h4 class="font-bold text-textPrimary text-sm tracking-wide uppercase flex items-center gap-2">
          <Icon name="heroicons:shopping-bag" class="text-brand w-4 h-4" />
          {{ $t('orders.itemsPurchased') }}
        </h4>
        <div class="space-y-3">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex items-center justify-between gap-4 bg-cardBg p-3 rounded-lg border border-appBorder/50"
          >
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded bg-appBg border border-appBorder overflow-hidden flex items-center justify-center shrink-0">
                <img
                  v-if="item.product?.image"
                  :src="item.product.image"
                  :alt="item.product.name"
                  class="w-full h-full object-cover"
                >
                <Icon v-else name="heroicons:photo" class="w-6 h-6 text-textMuted/40" />
              </div>
              <div>
                <p class="font-bold text-textPrimary text-sm leading-tight">
                  {{ item.product?.name || $t('orders.unknownProduct') }}
                </p>
                <p class="text-xs text-textMuted mt-0.5">
                  ${{ item.price.toFixed(2) }} x {{ item.quantity }}
                </p>
              </div>
            </div>
            <p class="font-extrabold text-textPrimary text-sm">
              ${{ (item.price * item.quantity).toFixed(2) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Financial Invoice Summary -->
      <div class="p-5 flex justify-end">
        <div class="w-full sm:w-80 space-y-2 text-sm">
          <div class="flex justify-between text-textSecondary">
            <span>{{ $t('orders.subtotal') }}</span>
            <span class="font-medium">${{ order.subtotal.toFixed(2) }}</span>
          </div>
          <div v-if="order.discount > 0" class="flex justify-between text-rose-500">
            <span class="flex items-center gap-1">
              <Icon name="heroicons:ticket" class="w-4 h-4" />
              {{ $t('orders.discount') }} ({{ order.promoCode }})
            </span>
            <span class="font-bold">-${{ order.discount.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-textSecondary">
            <span>{{ $t('orders.tax') }}</span>
            <span class="font-medium">${{ order.tax.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-textSecondary">
            <span>{{ $t('orders.deliveryFee') }}</span>
            <span class="font-medium">${{ order.deliveryFee.toFixed(2) }}</span>
          </div>
          <div class="border-t border-appBorder pt-2 mt-2 flex justify-between text-textPrimary font-black text-base">
            <span>{{ $t('orders.total') }}</span>
            <span class="text-brand">${{ order.total.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Slot for extra actions (like Review Submission button) -->
      <div v-if="$slots.actions" class="px-5 py-4 bg-appBg/40 border-t border-appBorder flex justify-end">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
