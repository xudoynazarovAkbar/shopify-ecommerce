<script setup lang="ts">
import { useRegister } from '../../composables/useRegister';
import BaseInput from '../common/BaseInput.vue';
import BaseButton from '../common/BaseButton.vue';
import BaseTextarea from '../common/BaseTextarea.vue';

const {
  email,
  password,
  role,
  shopName,
  shopDescription,
  loading,
  handleRegister,
} = useRegister();
</script>

<template>
  <div class="max-w-md mx-auto my-12 bg-cardBg p-8 rounded-xl shadow-md border border-appBorder transition-colors">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-textPrimary mb-2">{{ $t('auth.createAccount') }}</h1>
      <p class="text-textMuted text-sm">{{ $t('auth.registerSubtitle') }}</p>
    </div>

    <form class="space-y-6" @submit.prevent="handleRegister">
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
      <BaseInput
        id="email"
        v-model="email"
        type="email"
        :label="$t('auth.emailAddress')"
        required
        placeholder="your@email.com"
      />

      <!-- Password -->
      <BaseInput
        id="password"
        v-model="password"
        type="password"
        :label="$t('auth.password')"
        required
        placeholder="••••••••"
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
          <BaseInput
            id="shopName"
            v-model="shopName"
            type="text"
            :label="$t('auth.shopName')"
            :required="role === 'VENDOR'"
            placeholder="e.g. Pizza Paradise"
          />

          <BaseTextarea
            id="shopDescription"
            v-model="shopDescription"
            :label="$t('auth.shopDescription')"
            :placeholder="$t('auth.shopDescriptionPlaceholder')"
          />
        </div>
      </Transition>

      <!-- Submit Button -->
      <BaseButton type="submit" :loading="loading">
        {{ $t('auth.registerBtn') }}
      </BaseButton>
    </form>

    <div class="mt-8 pt-6 border-t border-appBorder text-center text-sm text-textMuted">
      {{ $t('auth.alreadyHaveAccount') }}
      <NuxtLink to="/login" class="font-semibold text-brand hover:text-brandHover ml-1 transition-colors">
        {{ $t('auth.signInBtn') }}
      </NuxtLink>
    </div>
  </div>
</template>
