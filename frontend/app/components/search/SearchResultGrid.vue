<script setup lang="ts">
import type { Product, Vendor } from '../../types';

defineProps<{
  products: Product[];
  vendors: Vendor[];
  loading: boolean;
  query: string;
}>();
</script>

<template>
  <div class="space-y-12">
    <!-- Skeleton Loaders -->
    <div v-if="loading" class="space-y-12">
      <!-- Vendors Skeleton -->
      <div>
        <div class="h-6 w-48 bg-appBorder rounded animate-pulse mb-6"/>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="n in 3" :key="'v-skel-' + n" class="h-40 bg-cardBg border border-appBorder rounded-2xl animate-pulse"/>
        </div>
      </div>
      <!-- Products Skeleton -->
      <div>
        <div class="h-6 w-48 bg-appBorder rounded animate-pulse mb-6"/>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="n in 4" :key="'p-skel-' + n" class="h-64 bg-cardBg border border-appBorder rounded-2xl animate-pulse"/>
        </div>
      </div>
    </div>

    <!-- Results Display -->
    <template v-else>
      <!-- Empty State -->
      <div v-if="!query" class="text-center py-16 bg-cardBg rounded-2xl border border-appBorder p-8 max-w-xl mx-auto shadow-sm">
        <Icon name="heroicons:magnifying-glass" class="w-16 h-16 text-textMuted mx-auto mb-4" />
        <h2 class="text-xl font-bold text-textPrimary mb-2">{{ $t('search.explore') }}</h2>
        <p class="text-textSecondary text-sm">
          {{ $t('search.enterKeyword') }}
        </p>
      </div>

      <!-- No Results State -->
      <div v-else-if="vendors.length === 0 && products.length === 0" class="text-center py-16 bg-cardBg rounded-2xl border border-appBorder p-8 max-w-xl mx-auto shadow-sm">
        <Icon name="heroicons:face-frown" class="w-16 h-16 text-textMuted mx-auto mb-4" />
        <h2 class="text-xl font-bold text-textPrimary mb-2">{{ $t('search.noResultsTitle') }}</h2>
        <p class="text-textSecondary text-sm">
          {{ $t('search.noResultsDesc', { query }) }}
        </p>
      </div>

      <div v-else class="space-y-12">
        <!-- 1. Matching Stores Section -->
        <div>
          <h2 class="text-xl font-bold text-textPrimary mb-6 flex items-center gap-2">
            <Icon name="heroicons:building-storefront-20-solid" class="w-6 h-6 text-brand" />
            <span>{{ $t('search.matchingShops') }} ({{ vendors.length }})</span>
          </h2>

          <div v-if="vendors.length === 0" class="p-6 bg-cardBg border border-appBorder border-dashed rounded-2xl text-center text-textMuted">
            {{ $t('search.noShops') }}
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NuxtLink
              v-for="vendor in vendors"
              :key="vendor.id"
              :to="`/vendors/${vendor.id}`"
              class="group bg-cardBg border border-appBorder hover:border-brand rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between gap-2 mb-3">
                  <h3 class="font-bold text-lg text-textPrimary group-hover:text-brand transition-colors">
                    {{ vendor.shopName }}
                  </h3>
                  <!-- Store Star Badge -->
                  <div class="flex items-center gap-1 shrink-0 bg-appBg px-2.5 py-1 rounded-full text-xs font-semibold">
                    <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-amber-500" />
                    <span class="text-textPrimary">
                      {{ vendor.averageRating !== null ? vendor.averageRating : 'N/A' }}
                    </span>
                  </div>
                </div>

                <p class="text-textSecondary text-sm line-clamp-2 mb-4">
                  {{ vendor.shopDescription || $t('home.noDescription') }}
                </p>
              </div>

              <div class="flex items-center justify-between text-xs text-textMuted border-t border-appBorder pt-4 mt-auto">
                <span>{{ vendor.reviewCount }} {{ $t('home.noRatings').toLowerCase() }}</span>
                <span class="font-semibold text-brand group-hover:underline flex items-center gap-1">
                  {{ $t('search.visitStore') }}
                  <Icon name="heroicons:arrow-right-20-solid" class="w-3.5 h-3.5" />
                </span>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- 2. Matching Products Section -->
        <div>
          <h2 class="text-xl font-bold text-textPrimary mb-6 flex items-center gap-2">
            <Icon name="heroicons:shopping-bag-20-solid" class="w-6 h-6 text-brand" />
            <span>{{ $t('search.matchingProducts') }} ({{ products.length }})</span>
          </h2>

          <div v-if="products.length === 0" class="p-6 bg-cardBg border border-appBorder border-dashed rounded-2xl text-center text-textMuted">
            {{ $t('search.noProducts') }}
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <NuxtLink
              v-for="product in products"
              :key="product.id"
              :to="`/vendors/${product.vendorId}`"
              class="group bg-cardBg border border-appBorder hover:border-brand rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
            >
              <!-- Product Image Placeholder -->
              <div class="aspect-video w-full bg-appBg flex items-center justify-center relative border-b border-appBorder overflow-hidden">
                <img
                  v-if="product.image"
                  :src="product.image"
                  :alt="product.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                >
                <div v-else class="flex flex-col items-center text-textMuted">
                  <Icon name="heroicons:photo" class="w-10 h-10 mb-1" />
                  <span class="text-xs">No Image</span>
                </div>
                <!-- Category Tag -->
                <span class="absolute top-2 left-2 bg-cardBg/90 backdrop-blur-sm border border-appBorder text-textSecondary text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {{ product.category?.name || $t('home.uncategorized') }}
                </span>
              </div>

              <!-- Product Details -->
              <div class="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <h3 class="font-semibold text-textPrimary group-hover:text-brand transition-colors line-clamp-1">
                    {{ product.name }}
                  </h3>
                  <!-- Vendor Name -->
                  <p class="text-xs text-textMuted mb-2">
                    by {{ product.vendor?.shopName || $t('home.unknownShop') }}
                  </p>
                  <p class="text-textSecondary text-xs line-clamp-2 mb-4">
                    {{ product.description || $t('home.noDescription') }}
                  </p>
                </div>

                <div class="flex items-center justify-between border-t border-appBorder pt-3 mt-auto">
                  <span class="font-bold text-textPrimary">${{ product.price.toFixed(2) }}</span>
                  <span class="text-xs font-semibold text-brand group-hover:underline flex items-center gap-0.5">
                    {{ $t('search.visitStore') }}
                    <Icon name="heroicons:chevron-right-20-solid" class="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
