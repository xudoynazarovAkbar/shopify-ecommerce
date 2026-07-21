import { defineStore } from 'pinia';
import { useApi } from '../composables/useApi';
import { useAuthStore } from './auth';
import { useToastStore } from './toast';
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
    appliedCoupon: null as { code: string; discountType: 'PERCENTAGE' | 'FLAT'; discountValue: number } | null,
    discount: 0,
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
          this.items = cartData.items || [];
          this.recalculateTotals();
        }
      } catch (err) {
        console.error('Failed to fetch cart:', err);
      } finally {
        this.loading = false;
      }
    },

    recalculateTotals() {
      if (this.appliedCoupon) {
        if (this.appliedCoupon.discountType === 'PERCENTAGE') {
          this.discount = parseFloat(
            (this.subtotal * (this.appliedCoupon.discountValue / 100)).toFixed(2)
          );
        } else {
          this.discount = parseFloat(this.appliedCoupon.discountValue.toFixed(2));
        }
        // Discount cannot exceed subtotal
        this.discount = Math.min(this.discount, this.subtotal);
      } else {
        this.discount = 0;
      }
      this.total = Math.max(0, parseFloat((this.subtotal + this.tax + this.deliveryFee - this.discount).toFixed(2)));
    },

    async applyPromoCode(code: string) {
      if (!code.trim()) return false;
      const api = useApi();
      const toastStore = useToastStore();
      this.loading = true;
      try {
        const coupon = await api.post<{ code: string; discountType: 'PERCENTAGE' | 'FLAT'; discountValue: number }>(
          '/coupons/validate',
          { code: code.trim() }
        );

        if (coupon) {
          this.appliedCoupon = {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
          };
          this.recalculateTotals();
          toastStore.success(`Promo code "${coupon.code}" applied successfully!`);
          return true;
        }
        return false;
      } catch (err) {
        console.error('Failed to apply promo code:', err);
        const fetchError = err as {
          response?: {
            _data?: {
              message?: string;
            };
          };
        };
        const errMsg = fetchError.response?._data?.message || 'Invalid promo code.';
        toastStore.error(errMsg);
        this.removePromoCode();
        throw new Error(errMsg);
      } finally {
        this.loading = false;
      }
    },

    removePromoCode() {
      this.appliedCoupon = null;
      this.discount = 0;
      this.recalculateTotals();
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
        this.appliedCoupon = null;
        this.discount = 0;
      } catch (err) {
        console.error('Failed to clear cart:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
