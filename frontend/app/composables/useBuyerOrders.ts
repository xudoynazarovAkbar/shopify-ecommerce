import { useApi } from './useApi';
import type { Order, Review } from '../types';

export const useBuyerOrders = () => {
  const api = useApi();
  const orders = ref<Order[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchOrders = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get<Order[]>('/orders/my-orders');
      orders.value = res || [];
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      error.value = apiErr?.data?.message || 'Failed to fetch order history';
    } finally {
      loading.value = false;
    }
  };

  const submitReview = async (
    orderId: string,
    vendorId: string,
    rating: number,
    comment: string
  ): Promise<Review> => {
    try {
      const reviewRes = await api.post<Review>('/reviews', {
        orderId,
        rating,
        comment: comment.trim() || undefined,
      });

      // Update the order in our local list to append this new review instantly
      const orderIdx = orders.value.findIndex((o) => o.id === orderId);
      if (orderIdx !== -1) {
        const existingOrder = orders.value[orderIdx];
        if (existingOrder) {
          orders.value[orderIdx] = {
            ...existingOrder,
            review: reviewRes,
          };
        }
      }

      return reviewRes;
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      throw new Error(apiErr?.data?.message || 'Failed to submit review', { cause: err });
    }
  };

  return {
    orders,
    loading,
    error,
    fetchOrders,
    submitReview,
  };
};
