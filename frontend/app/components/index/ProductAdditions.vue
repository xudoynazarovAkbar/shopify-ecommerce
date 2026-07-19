<script setup lang="ts">
import type { Product } from '../../types';

defineProps<{
  products: Product[];
  loading: boolean;
}>();

const { resolveImageUrl } = useImageResolver();
</script>

<template>
  <section class="space-y-6">
    <h2 class="text-xl font-extrabold text-textPrimary flex items-center gap-2">
      <Icon name="heroicons:sparkles" class="text-brand w-5 h-5" />
      {{ $t('home.freshAdditions') }}
    </h2>
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-6">
      <div
        v-for="i in 4"
        :key="i"
        class="h-60 bg-appBg animate-pulse rounded-xl"
      />
    </div>
    <div v-else-if="products.length === 0" class="text-textMuted text-sm">
      {{ $t('home.noProducts') }}
    </div>
    <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-6">
      <NuxtLink
        v-for="product in products"
        :key="product.id"
        :to="`/vendors/${product.vendorId}`"
        class="bg-cardBg rounded-xl border border-appBorder shadow-sm hover:shadow transition flex flex-col overflow-hidden cursor-pointer group"
        >
        <div class="bg-appBg aspect-square flex items-center justify-center overflow-hidden relative border-b border-appBorder">
          <img
            v-if="product.image"
            :src="resolveImageUrl(product.image)"
            :alt="product.name"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          >
          <Icon v-else name="heroicons:photo" class="w-12 h-12 text-textMuted/50" />
        </div>
        <div class="p-4 flex-1 flex flex-col">
          <div class="flex-1">
            <span class="text-xs font-bold text-brand uppercase">
              {{ product.category?.name || $t('home.uncategorized') }}
            </span>
            <h3 class="font-bold text-textPrimary mt-1 line-clamp-1">
              {{ product.name }}
            </h3>
            <span class="text-xs text-textMuted mt-1 block">
              by {{ product.vendor?.shopName || $t('home.unknownShop') }}
            </span>
          </div>
          <div class="flex items-center justify-between mt-4 pt-2 border-t border-appBorder">
            <span class="font-extrabold text-textPrimary">
              ${{ product.price.toFixed(2) }}
            </span>
            <span class="text-xs text-brand font-bold hover:underline">
              {{ $t('home.viewDetail') }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
