<script setup lang="ts">
import { useBuyerOrders } from '../../composables/useBuyerOrders';
import { useToastStore } from '../../stores/toast';
import type { Order } from '../../types';

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  meta: { roles: ['BUYER'] },
});

const { orders, loading, error, fetchOrders, submitReview } = useBuyerOrders();
const toastStore = useToastStore();

const showReviewModal = ref(false);
const activeOrderForReview = ref<Order | null>(null);

onMounted(async () => {
  await fetchOrders();
});

const openReviewModal = (order: Order) => {
  activeOrderForReview.value = order;
  showReviewModal.value = true;
};

const closeReviewModal = () => {
  activeOrderForReview.value = null;
  showReviewModal.value = false;
};

const handleReviewSubmit = async (rating: number, comment: string) => {
  if (!activeOrderForReview.value) return;

  try {
    await submitReview(
      activeOrderForReview.value.id,
      activeOrderForReview.value.vendorId,
      rating,
      comment
    );
    toastStore.success(useNuxtApp().$i18n.t('reviews.successToast'));
    closeReviewModal();
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to submit review';
    toastStore.error(errMsg);
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8 px-4 sm:px-0 py-4">
    <!-- Header Title Section -->
    <div class="space-y-1">
      <h1 class="text-3xl font-black text-textPrimary tracking-tight">
        {{ $t('orders.title') }}
      </h1>
      <p class="text-sm text-textMuted">
        {{ $t('orders.subtitle') }}
      </p>
    </div>

    <!-- Error Alert Banner -->
    <div
      v-if="error"
      class="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-2"
    >
      <Icon name="heroicons:exclamation-circle" class="w-5 h-5 shrink-0" />
      {{ error }}
    </div>

    <!-- Pulse Skeleton Loader -->
    <div v-if="loading && orders.length === 0" class="space-y-4">
      <div
        v-for="i in 3"
        :key="i"
        class="h-28 bg-cardBg rounded-xl border border-appBorder animate-pulse"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="orders.length === 0"
      class="border border-appBorder rounded-2xl bg-cardBg p-12 text-center max-w-md mx-auto space-y-6 shadow-sm"
    >
      <div class="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
        <Icon name="heroicons:clipboard-document-list" class="w-8 h-8" />
      </div>
      <div class="space-y-1">
        <h3 class="font-black text-textPrimary text-lg">
          {{ $t('orders.emptyTitle') }}
        </h3>
        <p class="text-sm text-textMuted">
          {{ $t('orders.emptySubtitle') }}
        </p>
      </div>
      <NuxtLink
        to="/"
        class="inline-flex items-center justify-center bg-brand hover:bg-brandHover text-white px-5 py-2.5 font-bold rounded-xl text-sm transition shadow-sm active:scale-95"
      >
        {{ $t('orders.discoverStores') }}
      </NuxtLink>
    </div>

    <!-- Historical Orders Ledger List -->
    <div v-else class="space-y-4">
      <OrdersOrderItemAccordion
        v-for="order in orders"
        :key="order.id"
        :order="order"
      >
        <!-- Custom Accordion Slot Actions -->
        <template #actions>
          <div class="flex items-center justify-between w-full">
            <span class="text-xs text-textMuted font-medium">
              {{ $t('orders.boughtFrom') }}: <span class="font-bold text-textPrimary">{{ order.vendor?.shopName }}</span>
            </span>

            <!-- Completed & Already Reviewed status label -->
            <div
              v-if="order.status === 'COMPLETED' && order.review"
              class="flex items-center gap-1 text-xs font-bold text-amber-500"
            >
              <Icon name="heroicons:star-solid" class="w-4 h-4" />
              <span>
                {{ $t('reviews.rated') }} {{ order.review.rating }}/5
              </span>
            </div>

            <!-- Completed & Needs review Action Button -->
            <button
              v-else-if="order.status === 'COMPLETED' && !order.review"
              type="button"
              class="bg-brand/10 text-brand hover:bg-brand/20 hover:text-brand px-4 py-2 font-bold rounded-lg text-xs transition active:scale-95 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-brand/20"
              @click="openReviewModal(order)"
            >
              <Icon name="heroicons:pencil-square" class="w-4 h-4" />
              {{ $t('reviews.writeReview') }}
            </button>
          </div>
        </template>
      </OrdersOrderItemAccordion>
    </div>

    <!-- Review Modal Container -->
    <OrdersReviewFormModal
      :show="showReviewModal"
      :order="activeOrderForReview"
      @close="closeReviewModal"
      @submit="handleReviewSubmit"
    />
  </div>
</template>
