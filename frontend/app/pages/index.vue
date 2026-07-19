<script setup lang="ts">
import { useApi } from '../composables/useApi';
import type { Category, Vendor, Product } from '../types';

definePageMeta({
  layout: 'default',
});

const api = useApi();

const categories = ref<Category[]>([]);
const vendors = ref<Vendor[]>([]);
const products = ref<Product[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const [catsRes, vendorsRes, productsRes] = await Promise.all([
      api.get<Category[]>('/categories'),
      api.get<Vendor[]>('/vendors'),
      api.get<Product[]>('/products'),
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
    <IndexHeroBanner />
    <IndexCategoryGrid :categories="categories" :loading="loading" />
    <IndexFeaturedStores :vendors="vendors" :loading="loading" />
    <IndexProductAdditions :products="products" :loading="loading" />
  </div>
</template>
