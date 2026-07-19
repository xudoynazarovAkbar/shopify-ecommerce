import { ref, computed, onMounted } from 'vue';
import { useApi } from './useApi';
import type { Product, Vendor, Review } from '../types';

export const useVendorStorefront = (vendorId: string) => {
  const api = useApi();

  const vendor = ref<Vendor | null>(null);
  const products = ref<Product[]>([]);
  const reviews = ref<Review[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const fetchStorefrontData = async () => {
    if (!vendorId) return;

    loading.value = true;
    error.value = null;
    try {
      const [vendorRes, productsRes, reviewsRes] = await Promise.all([
        api.get<Vendor>(`/vendors/${vendorId}`),
        api.get<Product[]>(`/products?vendorId=${vendorId}`),
        api.get<Review[]>(`/reviews/vendor/${vendorId}`),
      ]);

      vendor.value = vendorRes || null;
      products.value = productsRes || [];
      reviews.value = reviewsRes || [];
    } catch (err) {
      console.error('Failed to fetch storefront data:', err);
      error.value = 'Failed to load vendor storefront details.';
    } finally {
      loading.value = false;
    }
  };

  const groupedProducts = computed(() => {
    const groups: Record<string, { id: string; name: string; products: Product[] }> = {};

    products.value.forEach((product) => {
      const categoryName = product.category?.name || 'Uncategorized';
      const categoryId = product.categoryId || 'uncategorized';

      if (!groups[categoryId]) {
        groups[categoryId] = {
          id: categoryId,
          name: categoryName,
          products: [],
        };
      }
      groups[categoryId].products.push(product);
    });

    return Object.values(groups);
  });

  onMounted(() => {
    fetchStorefrontData();
  });

  return {
    vendor,
    products,
    reviews,
    groupedProducts,
    loading,
    error,
    refresh: fetchStorefrontData,
  };
};
