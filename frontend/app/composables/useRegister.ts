import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';
import { watch } from 'vue';
import { useToastStore } from '../stores/toast';
import { useApi } from './useApi';

export const useRegister = () => {
  const toastStore = useToastStore();
  const api = useApi();

  const schema = yup.object({
    role: yup.string().oneOf(['BUYER', 'VENDOR']).required(),
    email: yup
      .string()
      .required('Email is required')
      .email('Must be a valid email address'),
    password: yup
      .string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters long'),
    shopName: yup.string().when('role', {
      is: 'VENDOR',
      then: (schema) => schema.required('Shop name is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    shopDescription: yup.string().optional(),
    logo: yup.mixed().nullable().optional(),
  });

  const { handleSubmit, isSubmitting, resetForm } = useForm({
    validationSchema: schema,
    initialValues: {
      role: 'BUYER',
      email: '',
      password: '',
      shopName: '',
      shopDescription: '',
      logo: null as File | null,
    },
  });

  const { value: role } = useField<'BUYER' | 'VENDOR'>('role');
  const { value: email, errorMessage: emailError } = useField<string>('email');
  const { value: password, errorMessage: passwordError } = useField<string>('password');
  const { value: shopName, errorMessage: shopNameError } = useField<string>('shopName');
  const { value: shopDescription, errorMessage: shopDescriptionError } = useField<string>('shopDescription');
  const { value: logo, errorMessage: logoError } = useField<File | null>('logo');

  // Reset form inputs and error messages when switching between roles (tabs)
  watch(role, (newRole) => {
    resetForm({
      values: {
        role: newRole,
        email: '',
        password: '',
        shopName: '',
        shopDescription: '',
        logo: null,
      },
    });
  });

  const handleRegister = handleSubmit(async (values) => {
    try {
      let payload: FormData | { email: string; password: string; role: 'BUYER' | 'VENDOR' };

      if (values.role === 'VENDOR') {
        const formData = new FormData();
        formData.append('email', values.email);
        formData.append('password', values.password);
        formData.append('role', values.role);
        formData.append('shopName', values.shopName || '');
        if (values.shopDescription) {
          formData.append('shopDescription', values.shopDescription);
        }
        if (values.logo) {
          formData.append('logo', values.logo);
        }
        payload = formData;
      } else {
        payload = {
          email: values.email,
          password: values.password,
          role: values.role as 'BUYER' | 'VENDOR',
        };
      }

      await api.post('/auth/register', payload);

      if (values.role === 'VENDOR') {
        toastStore.success(
          'Account created! Your merchant application is currently pending admin approval.',
          6000,
        );
      } else {
        toastStore.success('Account created successfully! You can now log in.');
      }

      navigateTo('/login');
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
        fetchError.response?._data?.message || 'Failed to register account';
      toastStore.error(errorMessage);
    }
  });

  return {
    email,
    password,
    role,
    shopName,
    shopDescription,
    logo,
    emailError,
    passwordError,
    shopNameError,
    shopDescriptionError,
    logoError,
    loading: isSubmitting,
    handleRegister,
  };
};
