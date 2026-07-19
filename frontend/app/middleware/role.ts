import { useAuthStore } from '../stores/auth';

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  const requiredRoles = to.meta.roles as string[] | undefined;

  if (!authStore.isAuthenticated) {
    return navigateTo('/login');
  }

  if (requiredRoles && !requiredRoles.includes(authStore.role || '')) {
    // If not authorized for this role, redirect to appropriate home
    if (authStore.role === 'VENDOR') {
      return navigateTo('/vendor');
    } else if (authStore.role === 'ADMIN') {
      return navigateTo('/admin');
    } else {
      return navigateTo('/');
    }
  }
});
