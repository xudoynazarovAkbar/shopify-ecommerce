import { useAuthStore } from '../stores/auth';

export interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  [key: string]: unknown;
}

export const useApi = () => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase;

  const request = async <T>(url: string, options: ApiOptions = {}): Promise<T> => {
    const headers: Record<string, string> = {
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
      } as Parameters<typeof $fetch>[1]);
    } catch (err) {
      // If unauthorized (401) and we are logged in, clear auth session
      if (
        err &&
        typeof err === 'object' &&
        'status' in err &&
        err.status === 401 &&
        authStore.isAuthenticated
      ) {
        authStore.logout();
      }
      throw err;
    }
  };

  return {
    request,
    get: <T>(url: string, options: ApiOptions = {}) =>
      request<T>(url, { ...options, method: 'GET' }),
    post: <T>(url: string, body?: unknown, options: ApiOptions = {}) =>
      request<T>(url, { ...options, method: 'POST', body }),
    patch: <T>(url: string, body?: unknown, options: ApiOptions = {}) =>
      request<T>(url, { ...options, method: 'PATCH', body }),
    delete: <T>(url: string, options: ApiOptions = {}) =>
      request<T>(url, { ...options, method: 'DELETE' }),
  };
};
