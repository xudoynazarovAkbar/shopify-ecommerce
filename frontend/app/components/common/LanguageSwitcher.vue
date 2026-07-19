<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const { locale, setLocale, locales } = useI18n();

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const closeDropdown = () => {
  isOpen.value = false;
};

const handleLocaleChange = async (code: string) => {
  await setLocale(code);
  closeDropdown();
};

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    document.addEventListener('click', handleClickOutside);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    document.removeEventListener('click', handleClickOutside);
  }
});
</script>

<template>
  <div ref="containerRef" class="relative inline-block text-left shrink-0">
    <button
      type="button"
      class="p-2 rounded-full border border-appBorder bg-cardBg hover:bg-appBg text-textPrimary shadow-sm transition duration-200 flex items-center justify-center gap-1 shrink-0 px-3"
      title="Switch Language"
      @click="toggleDropdown"
    >
      <Icon name="heroicons:language-20-solid" class="w-5 h-5 text-brand" />
      <span class="text-xs font-semibold uppercase">{{ locale }}</span>
      <Icon name="heroicons:chevron-down-20-solid" class="w-4 h-4 text-textMuted transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
    </button>

    <div
      v-show="isOpen"
      class="absolute right-0 mt-2 w-36 origin-top-right rounded-lg border border-appBorder bg-cardBg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transition-all duration-200"
    >
      <div class="py-1">
        <button
          v-for="l in locales"
          :key="typeof l === 'object' ? l.code : l"
          type="button"
          class="flex w-full items-center justify-between px-4 py-2 text-sm text-textSecondary hover:bg-appBg hover:text-textPrimary transition"
          :class="{ 'text-brand font-bold bg-brand/5': locale === (typeof l === 'object' ? l.code : l) }"
          @click="handleLocaleChange(typeof l === 'object' ? l.code : l)"
        >
          <span>{{ typeof l === 'object' ? l.name : l }}</span>
          <Icon
            v-if="locale === (typeof l === 'object' ? l.code : l)"
            name="heroicons:check-20-solid"
            class="w-4 h-4 text-brand"
          />
        </button>
      </div>
    </div>
  </div>
</template>
