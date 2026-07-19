import { ref } from 'vue';
import { useApi } from './useApi';
import { useCartStore } from '../stores/cart';
import { useToastStore } from '../stores/toast';

export const useCartCheckout = () => {
  const api = useApi();
  const cartStore = useCartStore();
  const toastStore = useToastStore();

  const promoCode = ref('');
  const selectedCardId = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const executeCheckout = async () => {
    if (cartStore.items.length === 0) {
      toastStore.error('Cannot checkout: Your cart is empty.');
      return;
    }

    loading.value = true;
    error.value = null;
    try {
      const payload = {
        promoCode: promoCode.value.trim() || undefined,
        savedCardId: selectedCardId.value || undefined,
      };

      const res = await api.post<{ id: string; orderNumber: number }>('/orders/checkout', payload);

      toastStore.success(`Order #${res?.orderNumber} placed successfully!`);

      // Clear cart on frontend since it was emptied on the backend
      await cartStore.clearCart();

      // Navigate to buyer's order history page
      navigateTo('/buyer/orders');
    } catch (err) {
      console.error('Checkout failed:', err);
      const fetchError = err as {
        response?: {
          _data?: {
            message?: string;
          };
        };
      };
      const errMsg = fetchError.response?._data?.message || 'Checkout failed. Please try again.';
      toastStore.error(errMsg);
      error.value = errMsg;
    } finally {
      loading.value = false;
    }
  };

  return {
    promoCode,
    selectedCardId,
    loading,
    error,
    executeCheckout,
  };
};
