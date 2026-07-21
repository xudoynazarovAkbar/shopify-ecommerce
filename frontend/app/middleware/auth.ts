import { useAuthStore } from '../stores/auth';

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) {
    if (to.path === '/cart') {
      return navigateTo('/login?cart_error=1');
    }
    return navigateTo('/login');
  }
});
