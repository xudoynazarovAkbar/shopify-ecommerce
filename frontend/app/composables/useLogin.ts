import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';
import { useAuthStore } from '../stores/auth';
import type { User } from '../types';
import { useToastStore } from '../stores/toast';
import { useApi } from './useApi';

export const useLogin = () => {
  const authStore = useAuthStore();
  const toastStore = useToastStore();
  const api = useApi();

  const schema = yup.object({
    email: yup
      .string()
      .required('Email is required')
      .email('Must be a valid email address'),
    password: yup
      .string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters long'),
  });

  const { handleSubmit, isSubmitting } = useForm({
    validationSchema: schema,
  });

  const { value: email, errorMessage: emailError } = useField<string>('email');
  const { value: password, errorMessage: passwordError } = useField<string>('password');

  const handleLogin = handleSubmit(async (values) => {
    try {
      // 1. Authenticate & fetch JWT token
      const loginRes = await api.post<{ accessToken: string }>('/auth/login', {
        email: values.email,
        password: values.password,
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
    } catch (err) {
      console.error(err);
      const fetchError = err as {
        response?: {
          _data?: {
            message?: string;
          };
        };
      };
      const errorMessage =
        fetchError.response?._data?.message || 'Invalid email or password';
      toastStore.error(errorMessage);
    }
  });

  return {
    email,
    password,
    emailError,
    passwordError,
    loading: isSubmitting,
    handleLogin,
  };
};
