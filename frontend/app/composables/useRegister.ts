import { ref } from 'vue';
import { useToastStore } from '../stores/toast';
import { useApi } from './useApi';

export const useRegister = () => {
  const toastStore = useToastStore();
  const api = useApi();

  const email = ref('');
  const password = ref('');
  const role = ref<'BUYER' | 'VENDOR'>('BUYER');
  const shopName = ref('');
  const shopDescription = ref('');
  const loading = ref(false);

  const handleRegister = async () => {
    if (!email.value || !password.value) {
      toastStore.error('Please fill in email and password');
      return;
    }

    if (role.value === 'VENDOR' && !shopName.value) {
      toastStore.error('Please enter a shop name');
      return;
    }

    loading.value = true;
    try {
      const payload = {
        email: email.value,
        password: password.value,
        role: role.value,
        shopName: role.value === 'VENDOR' ? shopName.value : undefined,
        shopDescription:
          role.value === 'VENDOR' && shopDescription.value
            ? shopDescription.value
            : undefined,
      };

      await api.post('/auth/register', payload);

      if (role.value === 'VENDOR') {
        toastStore.success(
          'Account created! Your merchant application is currently pending admin approval.',
          6000,
        );
      } else {
        toastStore.success('Account created successfully! You can now log in.');
      }

      navigateTo('/login');
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err.response?._data?.message || 'Failed to register account';
      toastStore.error(errorMessage);
    } finally {
      loading.value = false;
    }
  };

  return {
    email,
    password,
    role,
    shopName,
    shopDescription,
    loading,
    handleRegister,
  };
};
