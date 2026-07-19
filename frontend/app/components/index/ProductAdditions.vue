<script setup lang="ts">
defineProps<{
  products: any[];
  loading: boolean;
}>();
</script>

<template>
  <section class="space-y-6">
    <h2 class="text-xl font-extrabold text-slate-800 flex items-center gap-2">
      <Icon name="heroicons:sparkles" class="text-indigo-600 w-5 h-5" />
      Fresh Additions
    </h2>
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-6">
      <div
        v-for="i in 4"
        :key="i"
        class="h-60 bg-slate-200 animate-pulse rounded-xl"
      ></div>
    </div>
    <div v-else-if="products.length === 0" class="text-slate-500 text-sm">
      No products available yet.
    </div>
    <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-6">
      <NuxtLink
        v-for="product in products"
        :key="product.id"
        :to="`/product/${product.id}`"
        class="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow transition flex flex-col overflow-hidden cursor-pointer"
      >
        <div class="bg-slate-100 aspect-square flex items-center justify-center">
          <Icon name="heroicons:photo" class="w-12 h-12 text-slate-300" />
        </div>
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <span class="text-xs font-bold text-indigo-600 uppercase">
              {{ product.category?.name }}
            </span>
            <h3 class="font-bold text-slate-950 mt-1 line-clamp-1">
              {{ product.name }}
            </h3>
            <span class="text-xs text-slate-400 mt-1 block">
              by {{ product.vendor?.shopName }}
            </span>
          </div>
          <div class="flex items-center justify-between mt-4 pt-2 border-t border-slate-50">
            <span class="font-extrabold text-slate-900">
              ${{ product.price.toFixed(2) }}
            </span>
            <span class="text-xs text-indigo-600 font-bold hover:underline">
              View Detail
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
