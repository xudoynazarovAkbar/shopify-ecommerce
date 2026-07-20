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

const loadingCategories = ref(true);
const loadingData = ref(true);
const selectedCategoryId = ref<string | null>(null);

const loadData = async () => {
  loadingData.value = true;
  try {
    const params: Record<string, string | number | boolean> = {};
    if (selectedCategoryId.value) {
      params.categoryId = selectedCategoryId.value;
    }
    const [vendorsRes, productsRes] = await Promise.all([
      api.get<Vendor[]>('/vendors', { params }),
      api.get<Product[]>('/products', { params }),
    ]);
    vendors.value = vendorsRes || [];
    products.value = productsRes || [];
  } catch (err) {
    console.error('Failed to load home page data:', err);
  } finally {
    loadingData.value = false;
  }
};

onMounted(async () => {
  try {
    categories.value = await api.get<Category[]>('/categories') || [];
  } catch (err) {
    console.error('Failed to load categories:', err);
  } finally {
    loadingCategories.value = false;
  }
  await loadData();
});

watch(selectedCategoryId, () => {
  loadData();
});
</script>

<template>
  <div class="space-y-12">
    <IndexHeroBanner />
    <IndexCategoryGrid v-model="selectedCategoryId" :categories="categories" :loading="loadingCategories" />
    <IndexFeaturedStores :vendors="vendors" :loading="loadingData" />
    <IndexProductAdditions :products="products" :loading="loadingData" />
  </div>
</template>
