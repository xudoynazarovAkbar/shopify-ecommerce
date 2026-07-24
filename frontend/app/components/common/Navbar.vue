<script setup lang="ts">
import { useAuthStore } from '../../stores/auth';

const props = defineProps<{
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:isSidebarCollapsed' | 'update:isMobileSidebarOpen', val: boolean): void;
}>();

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const searchQuery = ref((route.query.q as string) || '');

watch(
  () => route.query.q,
  (newQ) => {
    searchQuery.value = (newQ as string) || '';
  }
);

const showSearch = computed(() => {
  return !['/login', '/register'].includes(route.path);
});

watch(searchQuery, (newVal) => {
  const queryStr = newVal.trim();
  if (queryStr === (route.query.q as string || '').trim()) return;

  if (queryStr.length > 0) {
    if (route.path !== '/search') {
      router.push(`/search?q=${encodeURIComponent(queryStr)}`);
    } else {
      router.replace(`/search?q=${encodeURIComponent(queryStr)}`);
    }
  } else if (route.path === '/search' && queryStr.length === 0) {
    router.push('/');
  }
});

const onSearch = () => {
  // Navigation is handled reactively by watch(searchQuery)
};

const toggleMobileSidebar = () => {
  emit('update:isMobileSidebarOpen', !props.isMobileSidebarOpen);
};

const toggleSidebarCollapsed = () => {
  emit('update:isSidebarCollapsed', !props.isSidebarCollapsed);
};
</script>

<template>
  <header class="bg-cardBg border-b border-appBorder sticky top-0 z-40 shadow-sm transition-colors duration-200 h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
    <!-- Left: Hamburger Menu (Mobile) & Logo & Collapse toggle (Desktop) -->
    <div class="flex items-center gap-3 shrink-0">
      <button
        type="button"
        class="p-2 -ml-2 text-textSecondary hover:text-brand rounded-lg md:hidden transition"
        @click="toggleMobileSidebar"
      >
        <Icon name="heroicons:bars-3-20-solid" class="w-6 h-6" />
      </button>

      <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold text-textPrimary">
        <Icon name="heroicons:shopping-bag-solid" class="w-6 h-6 text-brand" />
        <span :class="['transition-all duration-300', isSidebarCollapsed ? 'md:hidden' : '']">Shopify</span>
      </NuxtLink>

      <!-- Desktop Sidebar Collapse/Expand Button -->
      <button
        type="button"
        class="hidden md:flex p-1.5 text-textSecondary hover:text-brand hover:bg-appBg rounded-lg border border-appBorder transition duration-200"
        :title="isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
        @click="toggleSidebarCollapsed"
      >
        <Icon :name="isSidebarCollapsed ? 'heroicons:chevron-right-20-solid' : 'heroicons:chevron-left-20-solid'" class="w-5 h-5" />
      </button>
    </div>

    <!-- Center: Search Bar -->
    <div v-if="showSearch" class="flex-1 max-w-lg">
      <form class="relative" @submit.prevent="onSearch">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('searchPlaceholder')"
          class="w-full pl-10 pr-10 py-2 border border-appBorder rounded-lg text-sm bg-appBg text-textPrimary focus:bg-cardBg focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
        >
        <Icon
          name="heroicons:magnifying-glass-20-solid"
          class="w-5 h-5 text-textMuted absolute left-3 top-2.5 pointer-events-none"
        />
        <!-- Clear Button -->
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-3 top-2.5 text-textMuted hover:text-textPrimary transition-colors flex items-center"
          @click="searchQuery = ''"
        >
          <Icon
            name="heroicons:x-mark-20-solid"
            class="w-5 h-5"
          />
        </button>
      </form>
    </div>

    <!-- Right: Authentication Controls -->
    <div class="flex items-center gap-4 shrink-0">
      <template v-if="authStore.isAuthenticated">
        <span class="hidden sm:inline-block text-xs font-semibold text-textMuted bg-appBg px-2.5 py-1 rounded-full border border-appBorder">
          {{ authStore.user?.email }}
        </span>
        <button
          class="text-sm font-semibold text-rose-600 hover:text-rose-700 transition"
          @click="authStore.logout()"
        >
          {{ $t('logout') }}
        </button>
      </template>

      <template v-else>
        <NuxtLink
          to="/login"
          class="text-sm font-semibold text-textSecondary hover:text-brand transition"
        >
          {{ $t('signIn') }}
        </NuxtLink>
        <NuxtLink
          to="/register"
          class="text-sm font-semibold text-brandText bg-brand hover:bg-brandHover px-4 py-2 rounded-lg transition"
        >
          {{ $t('onboard') }}
        </NuxtLink>
      </template>
    </div>
  </header>
</template>
