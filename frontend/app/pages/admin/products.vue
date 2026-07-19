<script setup lang="ts">
import { useAdminProducts } from '../../composables/useAdminProducts';
import { useToastStore } from '../../stores/toast';
import type { ProductStatus } from '../../types';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  meta: { roles: ['ADMIN'] },
});

const { pendingProducts, loading, error, fetchPendingProducts, updateProductStatus } = useAdminProducts();
const toastStore = useToastStore();
const { resolveImageUrl } = useImageResolver();

onMounted(async () => {
  await fetchPendingProducts();
});

const handleStatusChange = async (productId: string, status: 'APPROVED' | 'REJECTED') => {
  try {
    await updateProductStatus(productId, status as ProductStatus);
    toastStore.success(useNuxtApp().$i18n.t('admin.productModerationSuccess'));
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to moderate product';
    toastStore.error(errMsg);
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-1">
      <h1 class="text-2xl font-black text-textPrimary tracking-tight">
        {{ $t('admin.moderationTitle') }}
      </h1>
      <p class="text-xs text-textMuted">
        {{ $t('admin.moderationSubtitle') }}
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
    <div v-if="loading && pendingProducts.length === 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="h-64 bg-cardBg border border-appBorder rounded-2xl animate-pulse" />
    </div>

    <!-- Empty moderation queue state -->
    <div
      v-else-if="pendingProducts.length === 0"
      class="border border-appBorder bg-cardBg rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm"
    >
      <div class="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
        <Icon name="heroicons:sparkles" class="w-6 h-6" />
      </div>
      <div class="space-y-1">
        <h3 class="font-extrabold text-textPrimary text-sm">
          {{ $t('admin.emptyModerationTitle') }}
        </h3>
        <p class="text-xs text-textMuted">
          {{ $t('admin.emptyModerationSubtitle') }}
        </p>
      </div>
    </div>

    <!-- Interactive moderation list -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="p in pendingProducts"
        :key="p.id"
        class="bg-cardBg border border-appBorder rounded-2xl overflow-hidden shadow-sm hover:shadow transition flex flex-col justify-between"
      >
        <!-- Image assets frame -->
        <div class="aspect-video w-full bg-appBg flex items-center justify-center relative border-b border-appBorder">
          <img
            v-if="p.image"
            :src="resolveImageUrl(p.image)"
            :alt="p.name"
            class="w-full h-full object-cover"
          >
          <Icon v-else name="heroicons:photo" class="w-12 h-12 text-textMuted/40" />

          <!-- Floating Category label -->
          <div class="absolute top-3 left-3">
            <span class="text-[9px] uppercase font-bold text-brand bg-cardBg/90 border border-appBorder px-2 py-0.5 rounded shadow-sm">
              {{ p.category?.name || $t('home.uncategorized') }}
            </span>
          </div>
        </div>

        <!-- Body specs -->
        <div class="p-5 space-y-4 flex-1 flex flex-col justify-between">
          <div class="space-y-1.5">
            <div class="flex items-center justify-between gap-4">
              <span class="text-[10px] font-black uppercase text-textMuted tracking-wider block">
                Store: <span class="text-brand">{{ p.vendor?.shopName || $t('home.unknownShop') }}</span>
              </span>
              <span class="font-extrabold text-textPrimary text-sm">
                ${{ p.price.toFixed(2) }}
              </span>
            </div>
            <h3 class="font-bold text-textPrimary text-sm line-clamp-1">
              {{ p.name }}
            </h3>
            <p class="text-xs text-textMuted line-clamp-2 leading-relaxed">
              {{ p.description || $t('home.noDescription') }}
            </p>
          </div>

          <!-- Moderation Controls -->
          <div class="flex items-center gap-3 pt-3 border-t border-appBorder">
            <button
              type="button"
              class="flex-1 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 border border-rose-500/20 py-2 font-bold rounded-lg text-xs transition active:scale-95 focus:outline-none"
              @click="handleStatusChange(p.id, 'REJECTED')"
            >
              <Icon name="heroicons:x-circle" class="w-4 h-4 inline mr-1" />
              {{ $t('admin.reject') }}
            </button>
            <button
              type="button"
              class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 font-bold rounded-lg text-xs transition active:scale-95 shadow-sm focus:outline-none"
              @click="handleStatusChange(p.id, 'APPROVED')"
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
