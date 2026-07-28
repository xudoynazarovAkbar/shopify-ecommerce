<script setup lang="ts">
import { useRegister } from '../../composables/useRegister';

const {
  email,
  password,
  role,
  shopName,
  shopDescription,
  logo,
  emailError,
  passwordError,
  shopNameError,
  shopDescriptionError,
  logoError,
  loading,
  handleRegister,
} = useRegister();
const showPassword = ref(false);

const logoPreview = ref<string | null>(null);

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    logo.value = file;
    logoPreview.value = URL.createObjectURL(file);
  } else {
    logo.value = null;
    logoPreview.value = null;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto my-12 bg-cardBg p-8 rounded-xl shadow-md border border-appBorder transition-colors">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-textPrimary mb-2">{{ $t('auth.createAccount') }}</h1>
      <p class="text-textMuted text-sm">{{ $t('auth.registerSubtitle') }}</p>
    </div>

    <form class="space-y-6" novalidate @submit.prevent="handleRegister">
      <!-- Role Toggle -->
      <div>
        <label class="block text-sm font-medium text-textSecondary mb-2">
          {{ $t('auth.roleLabel') }}
        </label>
        <div class="grid grid-cols-2 gap-2 p-1 bg-appBg rounded-lg transition-colors">
          <button
            type="button"
            class="py-2 text-sm font-semibold rounded-md transition-all duration-200"
            :class="
              role === 'BUYER'
                ? 'bg-cardBg text-brand shadow-sm'
                : 'text-textSecondary hover:text-textPrimary'
            "
            @click="role = 'BUYER'"
          >
            {{ $t('auth.buyerRole') }}
          </button>
          <button
            type="button"
            class="py-2 text-sm font-semibold rounded-md transition-all duration-200"
            :class="
              role === 'VENDOR'
                ? 'bg-cardBg text-brand shadow-sm'
                : 'text-textSecondary hover:text-textPrimary'
            "
            @click="role = 'VENDOR'"
          >
            {{ $t('auth.vendorRole') }}
          </button>
        </div>
      </div>

      <!-- Email -->
      <CommonBaseInput
        id="email"
        v-model="email"
        type="email"
        :label="$t('auth.emailAddress')"
        required
        :error="emailError"
        placeholder="your@email.com"
      />

      <!-- Password -->
      <CommonBaseInput
        id="password"
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        :label="$t('auth.password')"
        required
        :error="passwordError"
        placeholder="••••••••"
        :right-icon="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'"
        @click:right="showPassword = !showPassword"
      />

      <!-- Vendor Conditional Fields -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div v-if="role === 'VENDOR'" class="space-y-4 pt-4 border-t border-appBorder">
          <CommonBaseInput
            id="shopName"
            v-model="shopName"
            type="text"
            :label="$t('auth.shopName')"
            :required="role === 'VENDOR'"
            :error="shopNameError"
            placeholder="e.g. Pizza Paradise"
          />

          <CommonBaseTextarea
            id="shopDescription"
            v-model="shopDescription"
            :label="$t('auth.shopDescription')"
            :error="shopDescriptionError"
            :placeholder="$t('auth.shopDescriptionPlaceholder')"
          />

          <!-- Shop Logo File Upload -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-textSecondary">
              {{ $t('auth.shopLogo') }}
            </label>
            <div class="flex items-center space-x-4">
              <!-- Preview or Icon -->
              <div class="w-16 h-16 rounded-xl border border-appBorder bg-appBg flex items-center justify-center overflow-hidden transition-colors shadow-sm">
                <img
                  v-if="logoPreview"
                  :src="logoPreview"
                  alt="Logo preview"
                  class="w-full h-full object-cover"
                />
                <Icon
                  v-else
                  name="heroicons:photo"
                  class="w-8 h-8 text-textMuted"
                />
              </div>
              
              <!-- File Input Button -->
              <label class="px-4 py-2 bg-brand hover:bg-brandHover text-white text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer select-none">
                <span>Choose Image</span>
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onFileChange"
                />
              </label>
            </div>
            <p v-if="logoError" class="text-xs text-rose-500 font-medium">
              {{ logoError }}
            </p>
          </div>
        </div>
      </Transition>

      <!-- Submit Button -->
      <CommonBaseButton type="submit" :loading="loading">
        {{ $t('auth.registerBtn') }}
      </CommonBaseButton>
    </form>

    <div class="mt-8 pt-6 border-t border-appBorder text-center text-sm text-textMuted">
      {{ $t('auth.alreadyHaveAccount') }}
      <NuxtLink to="/login" class="font-semibold text-brand hover:text-brandHover ml-1 transition-colors">
        {{ $t('auth.signInBtn') }}
      </NuxtLink>
    </div>
  </div>
</template>
