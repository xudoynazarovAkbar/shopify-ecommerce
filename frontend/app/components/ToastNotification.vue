<script setup lang="ts">
import { useToastStore } from '../stores/toast';

const toastStore = useToastStore();
</script>

<template>
  <div class="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
    <TransitionGroup
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="p-4 rounded-lg shadow-lg flex items-center justify-between border"
        :class="{
          'bg-emerald-50 text-emerald-800 border-emerald-200':
            toast.type === 'success',
          'bg-rose-50 text-rose-800 border-rose-200': toast.type === 'error',
          'bg-blue-50 text-blue-800 border-blue-200': toast.type === 'info',
        }"
      >
        <div class="flex items-center gap-3">
          <Icon
            v-if="toast.type === 'success'"
            name="heroicons:check-circle-20-solid"
            class="w-5 h-5 text-emerald-500 shrink-0"
          />
          <Icon
            v-else-if="toast.type === 'error'"
            name="heroicons:x-circle-20-solid"
            class="w-5 h-5 text-rose-500 shrink-0"
          />
          <Icon
            v-else
            name="heroicons:information-circle-20-solid"
            class="w-5 h-5 text-blue-500 shrink-0"
          />
          <p class="text-sm font-medium">{{ toast.message }}</p>
        </div>
        <button
          @click="toastStore.remove(toast.id)"
          class="ml-4 shrink-0 rounded-md hover:bg-black/5 p-1 text-slate-400 hover:text-slate-600 transition"
        >
          <Icon name="heroicons:x-mark-20-solid" class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
