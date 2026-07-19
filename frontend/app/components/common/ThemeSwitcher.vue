<script setup lang="ts">
const theme = ref<'light' | 'dark'>('light');

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', theme.value);
    updateDOMTheme();
  }
};

const updateDOMTheme = () => {
  if (typeof window !== 'undefined') {
    const root = document.documentElement;
    if (theme.value === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) {
      theme.value = saved;
    } else {
      // Check system preference
      const preferDark = window.matchMedia('(prefers-color-scheme: dark)')
        .matches;
      theme.value = preferDark ? 'dark' : 'light';
    }
    updateDOMTheme();
  }
});
</script>

<template>
  <button
    @click="toggleTheme"
    type="button"
    class="p-2 rounded-full border border-appBorder bg-cardBg hover:bg-appBg text-textPrimary shadow-sm transition duration-200 flex items-center justify-center shrink-0"
    title="Toggle Theme"
  >
    <Icon
      v-if="theme === 'light'"
      name="heroicons:sun-20-solid"
      class="w-5 h-5 text-amber-500"
    />
    <Icon
      v-else
      name="heroicons:moon-20-solid"
      class="w-5 h-5 text-indigo-400"
    />
  </button>
</template>
