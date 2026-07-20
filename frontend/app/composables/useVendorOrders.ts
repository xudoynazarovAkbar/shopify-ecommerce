import { useApi } from './useApi';
import type { Order, OrderStatus } from '../types';

export const useVendorOrders = () => {
  const api = useApi();
  const orders = ref<Order[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchOrders = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get<Order[]>('/orders/vendor-orders');
      orders.value = res || [];
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      error.value = apiErr?.data?.message || 'Failed to load incoming orders';
    } finally {
      loading.value = false;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
    try {
      const updatedOrder = await api.patch<Order>(`/orders/${orderId}/status`, { status });
      
      // Update the order locally in our list
      const orderIdx = orders.value.findIndex((o) => o.id === orderId);
      if (orderIdx !== -1) {
        const existingOrder = orders.value[orderIdx];
        if (existingOrder) {
          orders.value[orderIdx] = {
            ...existingOrder,
            status: updatedOrder.status,
            updatedAt: updatedOrder.updatedAt,
          };
        }
      }
      return updatedOrder;
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      throw new Error(apiErr?.data?.message || 'Failed to update order status', { cause: err });
    }
  };

  return {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrderStatus,
  };
};
