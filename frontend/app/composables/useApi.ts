import { useAuthStore } from '../stores/auth';

export const useApi = () => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase;

  const request = async <T>(url: string, options: any = {}): Promise<T> => {
    const headers = {
      ...options.headers,
    };

    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`;
    }

    try {
      return await $fetch<T>(url, {
        baseURL,
        ...options,
        headers,
      });
    } catch (err: any) {
      // If unauthorized (401) and we are logged in, clear auth session
      if (err.status === 401 && authStore.isAuthenticated) {
        authStore.logout();
      }
      throw err;
    }
  };

  return {
    request,
    get: <T>(url: string, options: any = {}) =>
      request<T>(url, { ...options, method: 'GET' }),
    post: <T>(url: string, body?: any, options: any = {}) =>
      request<T>(url, { ...options, method: 'POST', body }),
    patch: <T>(url: string, body?: any, options: any = {}) =>
      request<T>(url, { ...options, method: 'PATCH', body }),
    delete: <T>(url: string, options: any = {}) =>
      request<T>(url, { ...options, method: 'DELETE' }),
  };
};
