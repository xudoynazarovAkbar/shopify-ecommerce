<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';

const authStore = useAuthStore();
const cartStore = useCartStore();
const route = useRoute();
const router = useRouter();

const searchQuery = ref((route.query.q as string) || '');
const isMobileSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);

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
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
};

const toggleSidebarCollapsed = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  if (typeof window !== 'undefined') {
    localStorage.setItem('sidebar_collapsed', String(isSidebarCollapsed.value));
  }
};

watch(() => route.path, () => {
  isMobileSidebarOpen.value = false;
});

onMounted(() => {
  if (authStore.isAuthenticated && authStore.role === 'BUYER') {
    cartStore.fetchCart();
  }
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sidebar_collapsed');
    isSidebarCollapsed.value = saved === 'true';
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-appBg text-textSecondary transition-colors duration-200">
    <!-- Navigation Bar (Header) -->
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

    <div class="flex flex-1 relative min-h-0">
      <!-- Mobile Sidebar Backdrop -->
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 bg-black/50 z-30 md:hidden"
        @click="isMobileSidebarOpen = false"
      />

      <!-- Sidebar -->
      <aside
        :class="[
          'bg-cardBg text-textSecondary border-r border-appBorder flex flex-col fixed top-16 bottom-0 left-0 z-30 transition-all duration-300',
          isSidebarCollapsed ? 'w-16' : 'w-64',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        ]"
      >
        <!-- Navigation Links -->
        <nav
          :class="[
            'flex-1 py-6 flex flex-col gap-1 overflow-y-auto transition-all duration-300',
            isSidebarCollapsed ? 'px-2' : 'px-4'
          ]"
        >
          <!-- Storefront Tab (Index) -->
          <NuxtLink
            to="/"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
            :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
            active-class="bg-brand text-brandText"
            end
            :title="isSidebarCollapsed ? $t('storefront') : ''"
          >
            <Icon name="heroicons:building-storefront-20-solid" class="w-5 h-5 shrink-0" />
            <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('storefront') }}</span>
          </NuxtLink>

          <!-- Buyer & Guest Navigation -->
          <template v-if="!authStore.isAuthenticated || authStore.role === 'BUYER'">
            <!-- Cart Link -->
            <NuxtLink
              to="/cart"
              class="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200 relative"
              :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
              active-class="bg-brand text-brandText"
              :title="isSidebarCollapsed ? $t('cartNav') : ''"
            >
              <div class="flex items-center gap-3">
                <Icon name="heroicons:shopping-cart-20-solid" class="w-5 h-5 shrink-0" />
                <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('cartNav') }}</span>
              </div>
              
              <!-- Badge when expanded -->
              <span
                v-if="cartStore.itemCount > 0 && !isSidebarCollapsed"
                class="bg-brand text-brandText text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                :class="{ 'bg-brandText !text-brand': route.path === '/cart' }"
              >
                {{ cartStore.itemCount }}
              </span>

              <!-- Badge overlay when collapsed -->
              <span
                v-if="cartStore.itemCount > 0 && isSidebarCollapsed"
                class="absolute top-1 right-1 bg-brand text-brandText text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-cardBg md:flex hidden"
              >
                {{ cartStore.itemCount }}
              </span>
            </NuxtLink>

            <!-- My Orders Link -->
            <NuxtLink
              v-if="authStore.isAuthenticated"
              to="/buyer/orders"
              class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
              :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
              active-class="bg-brand text-brandText"
              :title="isSidebarCollapsed ? $t('myOrders') : ''"
            >
              <Icon name="heroicons:clipboard-document-list-20-solid" class="w-5 h-5 shrink-0" />
              <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('myOrders') }}</span>
            </NuxtLink>
          </template>

          <!-- Vendor Navigation -->
          <template v-if="authStore.isAuthenticated && authStore.role === 'VENDOR'">
            <div
              v-if="!isSidebarCollapsed"
              class="mt-4 mb-1 px-4 text-xs font-semibold text-textMuted uppercase tracking-wider"
            >
              {{ $t('vendorHub') }}
            </div>
            <hr v-else class="border-appBorder my-3 md:block hidden mx-2" >
            
            <NuxtLink
              to="/vendor"
              class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
              :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
              active-class="bg-brand text-brandText"
              end
              :title="isSidebarCollapsed ? $t('dashboard') : ''"
            >
              <Icon name="heroicons:chart-bar-20-solid" class="w-5 h-5 shrink-0" />
              <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('dashboard') }}</span>
            </NuxtLink>

            <NuxtLink
              to="/vendor/products"
              class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
              :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
              active-class="bg-brand text-brandText"
              :title="isSidebarCollapsed ? $t('vendor.myProducts') : ''"
            >
              <Icon name="heroicons:squares-plus-20-solid" class="w-5 h-5 shrink-0" />
              <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('vendor.myProducts') }}</span>
            </NuxtLink>

            <NuxtLink
              to="/vendor/orders"
              class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
              :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
              active-class="bg-brand text-brandText"
              :title="isSidebarCollapsed ? $t('vendor.openOrders') : ''"
            >
              <Icon name="heroicons:shopping-bag-20-solid" class="w-5 h-5 shrink-0" />
              <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('vendor.openOrders') }}</span>
            </NuxtLink>

            <NuxtLink
              to="/vendor/coupons"
              class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
              :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
              active-class="bg-brand text-brandText"
              :title="isSidebarCollapsed ? $t('vendor.activeCoupons') : ''"
            >
              <Icon name="heroicons:ticket-20-solid" class="w-5 h-5 shrink-0" />
              <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('vendor.activeCoupons') }}</span>
            </NuxtLink>
          </template>

          <!-- Admin Navigation -->
          <template v-if="authStore.isAuthenticated && authStore.role === 'ADMIN'">
            <div
              v-if="!isSidebarCollapsed"
              class="mt-4 mb-1 px-4 text-xs font-semibold text-textMuted uppercase tracking-wider"
            >
              {{ $t('adminCentral') }}
            </div>
            <hr v-else class="border-appBorder my-3 md:block hidden mx-2" >

            <NuxtLink
              to="/admin"
              class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
              :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
              active-class="bg-brand text-brandText"
              end
              :title="isSidebarCollapsed ? $t('dashboard') : ''"
            >
              <Icon name="heroicons:chart-pie-20-solid" class="w-5 h-5 shrink-0" />
              <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('dashboard') }}</span>
            </NuxtLink>

            <NuxtLink
              to="/admin/vendors"
              class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
              :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
              active-class="bg-brand text-brandText"
              :title="isSidebarCollapsed ? $t('admin.onboardingBtn') : ''"
            >
              <Icon name="heroicons:building-storefront-20-solid" class="w-5 h-5 shrink-0" />
              <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('admin.onboardingBtn') }}</span>
            </NuxtLink>

            <NuxtLink
              to="/admin/products"
              class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
              :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
              active-class="bg-brand text-brandText"
              :title="isSidebarCollapsed ? $t('admin.moderationBtn') : ''"
            >
              <Icon name="heroicons:sparkles-20-solid" class="w-5 h-5 shrink-0" />
              <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('admin.moderationBtn') }}</span>
            </NuxtLink>

            <NuxtLink
              to="/admin/categories"
              class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-appBg hover:text-textPrimary transition-all duration-200"
              :class="[isSidebarCollapsed ? 'md:justify-center md:px-0 md:h-10 md:w-10 md:mx-auto' : '']"
              active-class="bg-brand text-brandText"
              :title="isSidebarCollapsed ? $t('admin.categoriesBtn') : ''"
            >
              <Icon name="heroicons:tag-20-solid" class="w-5 h-5 shrink-0" />
              <span :class="[isSidebarCollapsed ? 'md:hidden' : '']">{{ $t('admin.categoriesBtn') }}</span>
            </NuxtLink>
          </template>
        </nav>

        <!-- Sidebar Footer -->
        <div
          :class="[
            'border-t border-appBorder shrink-0 flex flex-col gap-3 bg-cardBg transition-all duration-300',
            isSidebarCollapsed ? 'p-2' : 'p-4'
          ]"
        >
          <div
            :class="[
              'flex items-center justify-between gap-2',
              isSidebarCollapsed ? 'md:flex-col md:items-center' : ''
            ]"
          >
            <CommonLanguageSwitcher :collapsed="isSidebarCollapsed" />
            <CommonThemeSwitcher />
          </div>
          <div v-if="!isSidebarCollapsed" class="text-center text-[10px] text-textMuted">
            &copy; 2026 Shopify Multi-Vendor Marketplace.
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div
        :class="[
          'flex-1 flex flex-col min-w-0 transition-all duration-300',
          isSidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        ]"
      >
        <main class="flex-1 p-6 md:p-8">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
