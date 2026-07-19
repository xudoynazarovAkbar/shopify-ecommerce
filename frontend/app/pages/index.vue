<script setup lang="ts">
import { useApi } from '../composables/useApi';

definePageMeta({
  layout: 'default',
});

const api = useApi();

const categories = ref<any[]>([]);
const vendors = ref<any[]>([]);
const products = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const [catsRes, vendorsRes, productsRes] = await Promise.all([
      api.get<any[]>('/categories'),
      api.get<any[]>('/vendors'),
      api.get<any[]>('/products'),
    ]);
    categories.value = catsRes || [];
    vendors.value = vendorsRes || [];
    products.value = productsRes || [];
  } catch (err) {
    console.error('Failed to load home page data:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="space-y-12">
    <!-- Hero Banner -->
    <section
      class="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-2xl p-8 sm:p-12 text-center shadow-md relative overflow-hidden"
    >
      <div class="max-w-2xl mx-auto relative z-10 space-y-4">
        <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Your Omnipresent Marketplace
        </h1>
        <p class="text-sm sm:text-base text-indigo-100">
          Browse food, gadgets, fashion and more from trusted merchant shops and
          restaurants, delivered straight to your door.
        </p>
      </div>
      <div
        class="absolute inset-0 bg-grid-white/[0.05] pointer-events-none"
      ></div>
    </section>

    <!-- Categories Section -->
    <section class="space-y-6">
      <h2 class="text-xl font-extrabold text-slate-800 flex items-center gap-2">
        <Icon name="heroicons:tag" class="text-indigo-600 w-5 h-5" />
        Browse Categories
      </h2>
      <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          v-for="i in 4"
          :key="i"
          class="h-16 bg-slate-200 animate-pulse rounded-xl"
        ></div>
      </div>
      <div v-else-if="categories.length === 0" class="text-slate-500 text-sm">
        No categories available yet.
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow transition cursor-pointer flex flex-col justify-center items-center text-center"
        >
          <span class="font-bold text-sm text-slate-800">{{ cat.name }}</span>
          <span class="text-xs text-slate-400 mt-1" v-if="cat.description">
            {{ cat.description }}
          </span>
        </div>
      </div>
    </section>

    <!-- Shops / Restaurants Section -->
    <section class="space-y-6">
      <h2 class="text-xl font-extrabold text-slate-800 flex items-center gap-2">
        <Icon
          name="heroicons:building-storefront"
          class="text-indigo-600 w-5 h-5"
        />
        Featured Stores & Kitchens
      </h2>
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div
          v-for="i in 3"
          :key="i"
          class="h-40 bg-slate-200 animate-pulse rounded-xl"
        ></div>
      </div>
      <div v-else-if="vendors.length === 0" class="text-slate-500 text-sm">
        No active merchants available.
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <NuxtLink
          v-for="vendor in vendors"
          :key="vendor.id"
          :to="`/vendor/${vendor.id}`"
          class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition cursor-pointer block space-y-3"
        >
          <div class="flex items-start justify-between">
            <h3 class="font-bold text-lg text-slate-900">
              {{ vendor.shopName }}
            </h3>
            <span
              class="flex items-center gap-1 text-amber-500 font-bold text-sm"
              v-if="vendor.averageRating"
            >
              <Icon name="heroicons:star-20-solid" class="w-4 h-4" />
              {{ vendor.averageRating.toFixed(1) }}
            </span>
            <span class="text-xs text-slate-400 font-medium" v-else>
              No ratings
            </span>
          </div>
          <p class="text-sm text-slate-500 line-clamp-2">
            {{ vendor.shopDescription || 'No description provided.' }}
          </p>
        </NuxtLink>
      </div>
    </section>

    <!-- Featured Products Section -->
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
  </div>
</template>
