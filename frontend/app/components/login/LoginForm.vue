<script setup lang="ts">
import { useLogin } from '../../composables/useLogin';
import BaseInput from '../common/BaseInput.vue';
import BaseButton from '../common/BaseButton.vue';

const { email, password, loading, handleLogin } = useLogin();
</script>

<template>
  <div class="max-w-md mx-auto my-12 bg-cardBg p-8 rounded-xl shadow-md border border-appBorder transition-colors">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-textPrimary mb-2">Welcome Back</h1>
      <p class="text-textMuted text-sm">Sign in to your marketplace account</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-6">
      <!-- Email -->
      <BaseInput
        id="email"
        type="email"
        label="Email Address"
        v-model="email"
        required
        placeholder="your@email.com"
      />

      <!-- Password -->
      <BaseInput
        id="password"
        type="password"
        label="Password"
        v-model="password"
        required
        placeholder="••••••••"
      />

      <!-- Submit Button -->
      <BaseButton type="submit" :loading="loading">
        Sign In
      </BaseButton>
    </form>

    <div class="mt-8 pt-6 border-t border-appBorder text-center text-sm text-textMuted">
      Don't have an account?
      <NuxtLink to="/register" class="font-semibold text-brand hover:text-brandHover ml-1 transition-colors">
        Sign Up here
      </NuxtLink>
    </div>
  </div>
</template>
