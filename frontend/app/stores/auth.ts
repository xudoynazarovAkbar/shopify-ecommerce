import { defineStore } from 'pinia';

export interface User {
  id: string;
  email: string;
  role: 'BUYER' | 'VENDOR' | 'ADMIN';
  vendorProfile?: {
    id: string;
    shopName: string;
    status: string;
  };
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '',
    user: (typeof window !== 'undefined' && localStorage.getItem('user'))
      ? (JSON.parse(localStorage.getItem('user') || 'null') as User | null)
      : (null as User | null),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    role: (state) => state.user?.role || null,
    vendorId: (state) => state.user?.vendorProfile?.id || null,
  },
  actions: {
    setAuth(token: string, user: User) {
      this.token = token;
      this.user = user;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
    },
    logout() {
      this.token = '';
      this.user = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigateTo('/login');
      }
    },
  },
});
