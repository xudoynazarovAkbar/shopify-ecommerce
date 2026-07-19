<script setup lang="ts">
import { useApi } from '../composables/useApi';
import HeroBanner from '../components/index/HeroBanner.vue';
import CategoryGrid from '../components/index/CategoryGrid.vue';
import FeaturedStores from '../components/index/FeaturedStores.vue';
import ProductAdditions from '../components/index/ProductAdditions.vue';

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
    <HeroBanner />
    <CategoryGrid :categories="categories" :loading="loading" />
    <FeaturedStores :vendors="vendors" :loading="loading" />
    <ProductAdditions :products="products" :loading="loading" />
  </div>
</template>
