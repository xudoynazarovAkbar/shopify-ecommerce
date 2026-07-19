import { ref } from 'vue';
import { useAuthStore, type User } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { useApi } from './useApi';

export const useLogin = () => {
  const authStore = useAuthStore();
  const toastStore = useToastStore();
  const api = useApi();

  const email = ref('');
  const password = ref('');
  const loading = ref(false);

  const handleLogin = async () => {
    if (!email.value || !password.value) {
      toastStore.error('Please fill in all fields');
      return;
    }

    loading.value = true;
    try {
      // 1. Authenticate & fetch JWT token
      const loginRes = await api.post<{ accessToken: string }>('/auth/login', {
        email: email.value,
        password: password.value,
      });

      const token = loginRes.accessToken;

      // 2. Query user profile using token
      const config = useRuntimeConfig();
      const profileRes = await $fetch<User>(
        `${config.public.apiBase}/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // 3. Save to Auth Store
      authStore.setAuth(token, profileRes);
      toastStore.success('Logged in successfully!');

      // 4. Redirect based on role
      if (profileRes.role === 'VENDOR') {
        navigateTo('/vendor');
      } else if (profileRes.role === 'ADMIN') {
        navigateTo('/admin');
      } else {
        navigateTo('/');
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err.response?._data?.message || 'Invalid email or password';
      toastStore.error(errorMessage);
    } finally {
      loading.value = false;
    }
  };

  return {
    email,
    password,
    loading,
    handleLogin,
  };
};
