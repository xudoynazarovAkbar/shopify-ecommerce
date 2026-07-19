<script setup lang="ts">
import { useLogin } from '../../composables/useLogin';

const { email, password, loading, handleLogin } = useLogin();
</script>

<template>
  <div class="max-w-md mx-auto my-12 bg-cardBg p-8 rounded-xl shadow-md border border-appBorder transition-colors">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-textPrimary mb-2">{{ $t('auth.welcomeBack') }}</h1>
      <p class="text-textMuted text-sm">{{ $t('auth.signInSubtitle') }}</p>
    </div>

    <form class="space-y-6" @submit.prevent="handleLogin">
      <!-- Email -->
      <CommonBaseInput
        id="email"
        v-model="email"
        type="email"
        :label="$t('auth.emailAddress')"
        required
        placeholder="your@email.com"
      />

      <!-- Password -->
      <CommonBaseInput
        id="password"
        v-model="password"
        type="password"
        :label="$t('auth.password')"
        required
        placeholder="••••••••"
      />

      <!-- Submit Button -->
      <CommonBaseButton type="submit" :loading="loading">
        {{ $t('auth.signInBtn') }}
      </CommonBaseButton>
    </form>

    <div class="mt-8 pt-6 border-t border-appBorder text-center text-sm text-textMuted">
      {{ $t('auth.dontHaveAccount') }}
      <NuxtLink to="/register" class="font-semibold text-brand hover:text-brandHover ml-1 transition-colors">
        {{ $t('auth.signUpHere') }}
      </NuxtLink>
    </div>
  </div>
</template>
