import { defineStore } from 'pinia';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [] as Toast[],
  }),
  actions: {
    add(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) {
      const id = Math.random().toString(36).substring(2, 9);
      const toast: Toast = { id, message, type, duration };
      this.toasts.push(toast);

      setTimeout(() => {
        this.remove(id);
      }, duration);
    },
    success(message: string, duration = 3000) {
      this.add(message, 'success', duration);
    },
    error(message: string, duration = 3000) {
      this.add(message, 'error', duration);
    },
    info(message: string, duration = 3000) {
      this.add(message, 'info', duration);
    },
    remove(id: string) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    },
  },
});
