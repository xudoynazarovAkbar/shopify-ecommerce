<script setup lang="ts">
import { useAdminMerchants } from '../../composables/useAdminMerchants';
import { useAdminProducts } from '../../composables/useAdminProducts';
import { useAdminCategories } from '../../composables/useAdminCategories';

definePageMeta({
  middleware: ['auth', 'role'],
  meta: { roles: ['ADMIN'] },
});

const { merchants, fetchMerchants } = useAdminMerchants();
const { pendingProducts, fetchPendingProducts } = useAdminProducts();
const { categories, fetchCategories } = useAdminCategories();

onMounted(async () => {
  await Promise.all([
    fetchMerchants(),
    fetchPendingProducts(),
    fetchCategories(),
  ]);
});

const pendingVendorsCount = computed(() => {
  return merchants.value.filter((v) => v.status === 'PENDING').length;
});
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-1">
      <h1 class="text-3xl font-black text-textPrimary tracking-tight">
        {{ $t('admin.welcomeTitle') }}
      </h1>
      <p class="text-sm text-textMuted">
        {{ $t('admin.welcomeSubtitle') }}
      </p>
    </div>

    <!-- Quick Stat Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Stores Card -->
      <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm hover:shadow transition flex items-center gap-5">
        <div class="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
          <Icon name="heroicons:building-storefront-solid" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-xs text-textMuted font-bold block uppercase tracking-wide">{{ $t('admin.totalVendors') }}</span>
          <span class="text-2xl font-black text-textPrimary block mt-1">
            {{ merchants.length }}
          </span>
        </div>
      </div>

      <!-- Pending Applications Card -->
      <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm hover:shadow transition flex items-center gap-5">
        <div class="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
          <Icon name="heroicons:clock-solid" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-xs text-textMuted font-bold block uppercase tracking-wide">{{ $t('admin.pendingOnboarding') }}</span>
          <span class="text-2xl font-black text-textPrimary block mt-1">
            {{ pendingVendorsCount }}
          </span>
        </div>
      </div>

      <!-- Pending Moderation Card -->
      <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm hover:shadow transition flex items-center gap-5">
        <div class="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
          <Icon name="heroicons:shield-exclamation-solid" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-xs text-textMuted font-bold block uppercase tracking-wide">{{ $t('admin.pendingProducts') }}</span>
          <span class="text-2xl font-black text-textPrimary block mt-1">
            {{ pendingProducts.length }}
          </span>
        </div>
      </div>

      <!-- Category totals Card -->
      <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm hover:shadow transition flex items-center gap-5">
        <div class="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
          <Icon name="heroicons:tag-solid" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-xs text-textMuted font-bold block uppercase tracking-wide">{{ $t('admin.totalCategories') }}</span>
          <span class="text-2xl font-black text-textPrimary block mt-1">
            {{ categories.length }}
          </span>
        </div>
      </div>
    </div>

    <!-- Administrative Duties Guide panel -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-cardBg border border-appBorder rounded-2xl p-8 lg:col-span-2 space-y-4">
        <h4 class="font-extrabold text-textPrimary text-base flex items-center gap-2">
          <Icon name="heroicons:shield-check" class="text-brand w-5 h-5" />
          {{ $t('admin.greeting') }}
        </h4>
        <p class="text-sm text-textSecondary leading-relaxed">
          {{ $t('admin.dashboardBody') }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <NuxtLink
            to="/admin/vendors"
            class="p-4 rounded-xl border border-appBorder bg-appBg/40 hover:border-brand/40 transition flex flex-col gap-3"
          >
            <Icon name="heroicons:building-storefront" class="w-6 h-6 text-brand shrink-0" />
            <div class="space-y-0.5">
              <span class="font-bold text-sm text-textPrimary block">{{ $t('admin.onboardingBtn') }}</span>
              <span class="text-xs text-textMuted block">{{ $t('admin.onboardingHelp') }}</span>
            </div>
          </NuxtLink>
          <NuxtLink
            to="/admin/products"
            class="p-4 rounded-xl border border-appBorder bg-appBg/40 hover:border-brand/40 transition flex flex-col gap-3"
          >
            <Icon name="heroicons:sparkles" class="w-6 h-6 text-rose-500 shrink-0" />
            <div class="space-y-0.5">
              <span class="font-bold text-sm text-textPrimary block">{{ $t('admin.moderationBtn') }}</span>
              <span class="text-xs text-textMuted block">{{ $t('admin.moderationHelp') }}</span>
            </div>
          </NuxtLink>
          <NuxtLink
            to="/admin/categories"
            class="p-4 rounded-xl border border-appBorder bg-appBg/40 hover:border-brand/40 transition flex flex-col gap-3"
          >
            <Icon name="heroicons:tag" class="w-6 h-6 text-indigo-500 shrink-0" />
            <div class="space-y-0.5">
              <span class="font-bold text-sm text-textPrimary block">{{ $t('admin.categoriesBtn') }}</span>
              <span class="text-xs text-textMuted block">{{ $t('admin.categoriesHelp') }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Quick Support Information Card -->
      <div class="bg-cardBg border border-appBorder rounded-2xl p-6 flex flex-col justify-between">
        <div class="space-y-3">
          <span class="text-[10px] uppercase font-bold text-textMuted tracking-wider block">
            System Operations
          </span>
          <h5 class="font-extrabold text-textPrimary text-base leading-tight">
            Database & Schema Backends
          </h5>
          <p class="text-xs text-textMuted leading-relaxed">
            All merchant profiles, transactional ledger receipts, rating feedback, and promo code configurations are persisted on disk using PostgreSQL relations.
          </p>
        </div>
        <div class="border-t border-appBorder pt-4 mt-6 flex justify-between items-center text-xs text-textMuted">
          <span>Version 1.0.0-prod</span>
          <span class="font-black text-brand">Admin Mode Active</span>
        </div>
      </div>
    </div>
  </div>
</template>
