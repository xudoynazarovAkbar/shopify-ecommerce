<script setup lang="ts">
import { useAuthStore, type User } from '../../stores/auth';
import { useToastStore } from '../../stores/toast';
import { useApi } from '../../composables/useApi';

const authStore = useAuthStore();
const toastStore = useToastStore();
const api = useApi();

const email = ref('');
const password = ref('');
const loading = ref(false);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    toastStore.error('Please fill in all fields');
    return;
  }

  loading.value = true;
  try {
    // 1. Authenticate & fetch JWT token
    const loginRes = await api.post<{ accessToken: string }>('/auth/login', {
      email: email.value,
      password: password.value,
    });

    const token = loginRes.accessToken;

    // 2. Query user profile using token
    const config = useRuntimeConfig();
    const profileRes = await $fetch<User>(
      `${config.public.apiBase}/auth/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // 3. Save to Auth Store
    authStore.setAuth(token, profileRes);
    toastStore.success('Logged in successfully!');

    // 4. Redirect based on role
    if (profileRes.role === 'VENDOR') {
      navigateTo('/vendor');
    } else if (profileRes.role === 'ADMIN') {
      navigateTo('/admin');
    } else {
      navigateTo('/');
    }
  } catch (err: any) {
    console.error(err);
    const errorMessage =
      err.response?._data?.message || 'Invalid email or password';
    toastStore.error(errorMessage);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto my-12 bg-white p-8 rounded-xl shadow-md border border-slate-200">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h1>
      <p class="text-slate-500 text-sm">Sign in to your marketplace account</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-6">
      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-medium text-slate-700 mb-1">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          v-model="email"
          required
          placeholder="your@email.com"
          class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />
      </div>

      <!-- Password -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label for="password" class="block text-sm font-medium text-slate-700">
            Password
          </label>
        </div>
        <input
          id="password"
          type="password"
          v-model="password"
          required
          placeholder="••••••••"
          class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading">Signing in...</span>
        <span v-else>Sign In</span>
      </button>
    </form>

    <div class="mt-8 pt-6 border-t border-slate-150 text-center text-sm text-slate-500">
      Don't have an account?
      <NuxtLink to="/register" class="font-semibold text-indigo-600 hover:text-indigo-500 ml-1">
        Sign Up here
      </NuxtLink>
    </div>
  </div>
</template>
