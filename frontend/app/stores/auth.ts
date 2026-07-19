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
  state: () => {
    const token = useCookie<string>('auth_token');
    const user = useCookie<User | null>('auth_user');

    return {
      token: token.value || '',
      user: user.value || null,
    };
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    role: (state) => state.user?.role || null,
    vendorId: (state) => state.user?.vendorProfile?.id || null,
  },
  actions: {
    setAuth(token: string, user: User) {
      this.token = token;
      this.user = user;

      const tokenCookie = useCookie<string>('auth_token', { maxAge: 15 * 60, path: '/' }); // 15 mins
      const userCookie = useCookie<User | null>('auth_user', { maxAge: 7 * 24 * 60 * 60, path: '/' }); // 7 days

      tokenCookie.value = token;
      userCookie.value = user;
    },
    setToken(token: string) {
      this.token = token;
      const tokenCookie = useCookie<string>('auth_token', { maxAge: 15 * 60, path: '/' });
      tokenCookie.value = token;
    },
    logout() {
      this.token = '';
      this.user = null;

      const tokenCookie = useCookie<string | null>('auth_token', { path: '/' });
      const userCookie = useCookie<User | null>('auth_user', { path: '/' });

      tokenCookie.value = null;
      userCookie.value = null;

      navigateTo('/login');
    },
  },
});
