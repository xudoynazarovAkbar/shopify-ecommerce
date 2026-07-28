<script setup lang="ts">
import { useVendorSettings } from '../../composables/useVendorSettings';
import { useImageResolver } from '../../composables/useImageResolver';

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  meta: { roles: ['VENDOR'] },
});

const {
  shopName,
  shopDescription,
  shopNameError,
  shopDescriptionError,
  logoFile,
  currentLogo,
  loading,
  fetchProfile,
  handleUpdateProfile,
  handleDeleteStore,
} = useVendorSettings();

const { resolveImageUrl } = useImageResolver();

const fileInput = ref<HTMLInputElement | null>(null);
const logoPreview = ref<string | null>(null);

onMounted(async () => {
  await fetchProfile();
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    logoFile.value = file;
    logoPreview.value = URL.createObjectURL(file);
  }
};

const confirmDeleteStore = () => {
  if (window.confirm(useNuxtApp().$i18n.t('settings.deleteStoreConfirm'))) {
    handleDeleteStore();
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8 px-4 sm:px-0 py-4">
    <!-- Header Title Section -->
    <div class="space-y-1">
      <h1 class="text-3xl font-black text-textPrimary tracking-tight">
        {{ $t('settings.title') }}
      </h1>
      <p class="text-sm text-textMuted">
        {{ $t('settings.subtitle') }}
      </p>
    </div>

    <!-- 1. Shop Info Update Form Card -->
    <div class="bg-cardBg p-6 sm:p-8 rounded-2xl border border-appBorder shadow-sm space-y-6">
      <div class="space-y-1">
        <h3 class="text-xl font-black text-textPrimary tracking-tight">
          {{ $t('settings.shopInfo') }}
        </h3>
      </div>

      <form class="space-y-5" novalidate @submit.prevent="handleUpdateProfile">
        <!-- Shop Name Input -->
        <CommonBaseInput
          id="shopName"
          v-model="shopName"
          type="text"
          :label="$t('settings.shopName')"
          required
          :error="shopNameError"
          :placeholder="$t('settings.shopNamePlaceholder')"
        />

        <!-- Shop Description Input -->
        <div class="space-y-1.5">
          <label for="shopDescription" class="block text-xs font-bold text-textSecondary uppercase tracking-wider">
            {{ $t('settings.shopDescription') }} <span class="text-rose-500">*</span>
          </label>
          <textarea
            id="shopDescription"
            v-model="shopDescription"
            rows="4"
            class="w-full bg-appBg/50 text-textPrimary border border-appBorder rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition resize-none placeholder:text-textMuted/50"
            :placeholder="$t('settings.shopDescriptionPlaceholder')"
          />
          <p v-if="shopDescriptionError" class="text-xs font-semibold text-rose-500 flex items-center gap-1 mt-1">
            <Icon name="heroicons:exclamation-circle" class="w-4 h-4 shrink-0" />
            {{ shopDescriptionError }}
          </p>
        </div>

        <!-- Logo Upload Section -->
        <div class="space-y-2">
          <label class="block text-xs font-bold text-textSecondary uppercase tracking-wider">
            {{ $t('settings.logo') }}
          </label>
          <div class="flex items-center gap-5">
            <!-- Current/Preview Logo Circle -->
            <div class="w-20 h-20 rounded-full border border-appBorder bg-appBg overflow-hidden flex items-center justify-center shrink-0">
              <img
                v-if="logoPreview"
                :src="logoPreview"
                alt="Logo Preview"
                class="w-full h-full object-cover"
              >
              <img
                v-else-if="currentLogo"
                :src="resolveImageUrl(currentLogo)"
                alt="Current Logo"
                class="w-full h-full object-cover"
              >
              <Icon v-else name="heroicons:photo" class="w-8 h-8 text-textMuted/40" />
            </div>

            <!-- Upload Action Button -->
            <div>
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                accept="image/*"
                @change="handleFileChange"
              >
              <button
                type="button"
                class="inline-flex items-center gap-2 bg-appBg hover:bg-appBg/80 text-textPrimary border border-appBorder px-4 py-2 rounded-xl text-sm font-bold transition active:scale-95"
                @click="triggerFileInput"
              >
                <Icon name="heroicons:arrow-up-tray" class="w-4 h-4" />
                {{ $t('settings.uploadLogo') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <CommonBaseButton type="submit" :loading="loading" class="w-full sm:w-auto px-6 py-2.5 font-bold rounded-xl text-sm transition shadow-sm active:scale-95 bg-brand hover:bg-brandHover text-white">
          {{ $t('settings.saveShopInfoBtn') }}
        </CommonBaseButton>
      </form>
    </div>

    <!-- 2. Secure Password Change Form Card -->
    <AuthChangePasswordForm />

    <!-- 3. Danger Zone Card -->
    <div class="bg-rose-500/5 p-6 sm:p-8 rounded-2xl border border-rose-500/20 shadow-sm space-y-6">
      <div class="space-y-1">
        <h3 class="text-xl font-black text-rose-600 dark:text-rose-400 tracking-tight flex items-center gap-2">
          <Icon name="heroicons:exclamation-triangle" class="w-6 h-6" />
          {{ $t('settings.dangerZone') }}
        </h3>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-rose-500/10 pt-6">
        <div class="space-y-1">
          <h4 class="font-bold text-textPrimary text-sm">
            {{ $t('settings.deleteStore') }}
          </h4>
          <p class="text-xs text-textMuted max-w-lg">
            {{ $t('settings.deleteStoreConfirm') }}
          </p>
        </div>
        <button
          type="button"
          class="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition active:scale-95 shrink-0 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
          @click="confirmDeleteStore"
        >
          {{ $t('settings.deleteStore') }}
        </button>
      </div>
    </div>
  </div>
</template>
