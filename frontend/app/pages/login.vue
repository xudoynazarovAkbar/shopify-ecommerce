<script setup lang="ts">
import { useToastStore } from '../stores/toast';

definePageMeta({
  layout: 'default',
});

const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();
const { t } = useI18n();

onMounted(() => {
  if (route.query.cart_error === '1') {
    toastStore.error(t('cart.authRequiredMessage') || 'Cart is only available to authenticated users.');
    
    // Clean up query param from URL
    const query = { ...route.query };
    delete query.cart_error;
    router.replace({ query });
  }
});
</script>

<template>
  <AuthLoginForm />
</template>
