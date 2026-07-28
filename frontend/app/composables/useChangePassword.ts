import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';
import { useToastStore } from '../stores/toast';
import { useApi } from './useApi';

export const useChangePassword = () => {
  const toastStore = useToastStore();
  const api = useApi();

  const schema = yup.object({
    currentPassword: yup
      .string()
      .required('Current password is required'),
    newPassword: yup
      .string()
      .required('New password is required')
      .min(6, 'New password must be at least 6 characters long'),
  });

  const { handleSubmit, isSubmitting, resetForm } = useForm({
    validationSchema: schema,
  });

  const { value: currentPassword, errorMessage: currentPasswordError } = useField<string>('currentPassword');
  const { value: newPassword, errorMessage: newPasswordError } = useField<string>('newPassword');

  const handleChangePassword = handleSubmit(async (values) => {
    try {
      await api.patch('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      toastStore.success(useNuxtApp().$i18n.t('settings.passwordSuccessToast'));
      resetForm();
    } catch (err: unknown) {
      console.error(err);
      const fetchError = err as {
        response?: {
          _data?: {
            message?: string;
          };
        };
      };
      const errorMessage =
        fetchError.response?._data?.message || 'Failed to update password';
      toastStore.error(errorMessage);
    }
  });

  return {
    currentPassword,
    newPassword,
    currentPasswordError,
    newPasswordError,
    loading: isSubmitting,
    handleChangePassword,
  };
};
