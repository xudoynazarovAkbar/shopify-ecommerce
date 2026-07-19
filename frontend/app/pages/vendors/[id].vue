<script setup lang="ts">
import { useVendorStorefront } from '../../composables/useVendorStorefront';
import StorefrontHeader from '../../components/vendors/StorefrontHeader.vue';
import ProductCatalog from '../../components/vendors/ProductCatalog.vue';
import StorefrontReviews from '../../components/vendors/StorefrontReviews.vue';

definePageMeta({
  layout: 'default',
});

const route = useRoute();
const vendorId = computed(() => route.params.id as string);

const { vendor, reviews, groupedProducts, loading, error } = useVendorStorefront(vendorId.value);
</script>

<template>
  <div class="space-y-12">
    <!-- Error State -->
    <div v-if="error" class="text-center py-16 bg-cardBg border border-appBorder rounded-2xl max-w-md mx-auto p-8 shadow-sm">
      <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-rose-500 mx-auto mb-4 animate-bounce" />
      <h2 class="text-xl font-bold text-textPrimary mb-2">Storefront Unavailable</h2>
      <p class="text-textSecondary text-sm mb-6">{{ error }}</p>
      <NuxtLink to="/" class="inline-flex items-center gap-1 text-xs font-bold bg-brand hover:bg-brandHover text-brandText px-4 py-2.5 rounded-xl transition">
        <Icon name="heroicons:home" class="w-4 h-4" />
        <span>{{ $t('backToMarketplace') || 'Back to Marketplace' }}</span>
      </NuxtLink>
    </div>

    <!-- Loading Skeleton for entire Storefront -->
    <div v-else-if="loading" class="space-y-10 animate-pulse">
      <!-- Header Skeleton -->
      <div class="bg-cardBg border border-appBorder rounded-2xl p-6 md:p-8 h-44"/>
      <!-- Catalog Section Skeleton -->
      <div class="space-y-6">
        <div class="h-6 w-48 bg-appBorder rounded"/>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="n in 4" :key="'store-skel-' + n" class="h-64 bg-cardBg border border-appBorder rounded-2xl"/>
        </div>
      </div>
    </div>

    <!-- Loaded Storefront Content -->
    <template v-else-if="vendor">
      <!-- 1. Storefront Header Details -->
      <StorefrontHeader :vendor="vendor" />

      <!-- 2. Interactive Product Catalog (Grouped by Category) -->
      <ProductCatalog :grouped-products="groupedProducts" :loading="loading" />

      <!-- 3. Storefront Reviews & Testimonials Ledger -->
      <StorefrontReviews :reviews="reviews" :loading="loading" />
    </template>
  </div>
</template>
