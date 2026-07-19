import { defineStore } from 'pinia';
import { useApi } from '../composables/useApi';
import { useAuthStore } from './auth';
import type { Cart, CartItem } from '../types';

export const useCartStore = defineStore('cart', {
  state: () => ({
    id: null as string | null,
    vendorId: null as string | null,
    vendor: null as { id: string; shopName: string } | null,
    subtotal: 0,
    tax: 0,
    deliveryFee: 0,
    total: 0,
    items: [] as CartItem[],
    loading: false,
  }),
  getters: {
    itemCount: (state) =>
      state.items.reduce((acc, item) => acc + item.quantity, 0),
  },
  actions: {
    async fetchCart() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || authStore.role !== 'BUYER') return;

      this.loading = true;
      const api = useApi();
      try {
        const cartData = await api.get<Cart>('/cart');
        if (cartData) {
          this.id = cartData.id;
          this.vendorId = cartData.vendorId;
          this.vendor = cartData.vendor || null;
          this.subtotal = cartData.subtotal;
          this.tax = cartData.tax;
          this.deliveryFee = cartData.deliveryFee;
          this.total = cartData.total;
          this.items = cartData.items || [];
        }
      } catch (err) {
        console.error('Failed to fetch cart:', err);
      } finally {
        this.loading = false;
      }
    },

    async addItem(productId: string, quantity = 1) {
      const api = useApi();
      this.loading = true;
      try {
        await api.post('/cart/items', { productId, quantity });
        await this.fetchCart();
      } finally {
        this.loading = false;
      }
    },

    async updateQuantity(itemId: string, quantity: number) {
      const api = useApi();
      this.loading = true;
      try {
        await api.patch(`/cart/items/${itemId}`, { quantity });
        await this.fetchCart();
      } catch (err) {
        console.error('Failed to update quantity:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async removeItem(itemId: string) {
      const api = useApi();
      this.loading = true;
      try {
        await api.delete(`/cart/items/${itemId}`);
        await this.fetchCart();
      } catch (err) {
        console.error('Failed to remove item:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async clearCart() {
      const api = useApi();
      this.loading = true;
      try {
        await api.delete('/cart');
        this.id = null;
        this.vendorId = null;
        this.vendor = null;
        this.subtotal = 0;
        this.tax = 0;
        this.deliveryFee = 0;
        this.total = 0;
        this.items = [];
      } catch (err) {
        console.error('Failed to clear cart:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
