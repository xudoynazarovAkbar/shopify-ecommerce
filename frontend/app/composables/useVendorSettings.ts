import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';
import type { Vendor } from '../types';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { useApi } from './useApi';

export const useVendorSettings = () => {
  const authStore = useAuthStore();
  const toastStore = useToastStore();
  const api = useApi();

  const loading = ref(false);
  const vendorData = ref<Vendor | null>(null);

  const schema = yup.object({
    shopName: yup
      .string()
      .required('Shop name is required'),
    shopDescription: yup
      .string()
      .required('Shop description is required')
      .min(10, 'Shop description must be at least 10 characters long'),
  });

  const { handleSubmit, isSubmitting, setValues } = useForm({
    validationSchema: schema,
  });

  const { value: shopName, errorMessage: shopNameError } = useField<string>('shopName');
  const { value: shopDescription, errorMessage: shopDescriptionError } = useField<string>('shopDescription');
  const logoFile = ref<File | null>(null);
  const currentLogo = ref<string | null>(null);

  const fetchProfile = async () => {
    try {
      loading.value = true;
      const res = await api.get<Vendor>('/vendors/me');
      vendorData.value = res;
      setValues({
        shopName: res.shopName,
        shopDescription: res.shopDescription || '',
      });
      currentLogo.value = res.logo;
    } catch (err) {
      console.error(err);
      toastStore.error('Failed to load shop profile');
    } finally {
      loading.value = false;
    }
  };

  const handleUpdateProfile = handleSubmit(async (values) => {
    try {
      loading.value = true;

      const formData = new FormData();
      formData.append('shopName', values.shopName);
      formData.append('shopDescription', values.shopDescription);
      if (logoFile.value) {
        formData.append('logo', logoFile.value);
      }

      const res = await api.patch<Vendor>('/vendors/me', formData);

      toastStore.success(useNuxtApp().$i18n.t('settings.shopInfoSuccessToast'));
      currentLogo.value = res.logo;
      
      // Update local profile in auth store
      if (authStore.user && authStore.user.vendorProfile) {
        authStore.user.vendorProfile.shopName = res.shopName;
        authStore.user.vendorProfile.shopDescription = res.shopDescription;
        authStore.user.vendorProfile.logo = res.logo;
      }
    } catch (err: unknown) {
      console.error(err);
      toastStore.error(useNuxtApp().$i18n.t('settings.shopInfoErrorToast'));
    } finally {
      loading.value = false;
    }
  });

  const handleDeleteStore = async () => {
    try {
      loading.value = true;
      await api.delete('/vendors/me');
      toastStore.success(useNuxtApp().$i18n.t('settings.deleteStoreSuccessToast'));
      authStore.logout();
    } catch (err) {
      console.error(err);
      toastStore.error(useNuxtApp().$i18n.t('settings.deleteStoreErrorToast'));
    } finally {
      loading.value = false;
    }
  };

  return {
    shopName,
    shopDescription,
    shopNameError,
    shopDescriptionError,
    logoFile,
    currentLogo,
    loading: computed(() => loading.value || isSubmitting.value),
    fetchProfile,
    handleUpdateProfile,
    handleDeleteStore,
    vendorData,
  };
};
