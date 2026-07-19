import { useAuthStore } from '../stores/auth';

export interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  [key: string]: unknown;
}

// Global flag and queue to prevent concurrent refresh requests
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

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
        credentials: 'include', // Send and receive HttpOnly cookies cross-origin
        ...options,
        headers,
      } as Parameters<typeof $fetch>[1]);
    } catch (err) {
      const isRefreshRequest = url.includes('/auth/refresh');
      const isLoginRequest = url.includes('/auth/login');

      // If unauthorized (401) and we are logged in, try to refresh token silently
      if (
        err &&
        typeof err === 'object' &&
        'status' in err &&
        err.status === 401 &&
        authStore.isAuthenticated &&
        !isRefreshRequest &&
        !isLoginRequest
      ) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            // Request a new access token using the httpOnly refresh cookie
            const refreshData = await $fetch<{ accessToken: string }>('/auth/refresh', {
              baseURL,
              method: 'POST',
              credentials: 'include',
            });

            const newToken = refreshData.accessToken;
            authStore.setToken(newToken);
            isRefreshing = false;
            onRefreshed(newToken);
          } catch (refreshErr) {
            isRefreshing = false;
            authStore.logout();
            throw refreshErr;
          }
        }

        // Wait for the token refresh and retry the failed request
        return new Promise<T>((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            const retryHeaders = {
              ...headers,
              'Authorization': `Bearer ${newToken}`,
            };
            $fetch<T>(url, {
              baseURL,
              credentials: 'include',
              ...options,
              headers: retryHeaders,
            } as Parameters<typeof $fetch>[1])
              .then(resolve)
              .catch(reject);
          });
        });
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
