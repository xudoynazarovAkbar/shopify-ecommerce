<script setup lang="ts">
import { useToastStore } from '../stores/toast';
import { useApi } from '../composables/useApi';

definePageMeta({
  layout: 'default',
});

const toastStore = useToastStore();
const api = useApi();

const email = ref('');
const password = ref('');
const role = ref<'BUYER' | 'VENDOR'>('BUYER');
const shopName = ref('');
const shopDescription = ref('');
const loading = ref(false);

const handleRegister = async () => {
  if (!email.value || !password.value) {
    toastStore.error('Please fill in email and password');
    return;
  }

  if (role.value === 'VENDOR' && !shopName.value) {
    toastStore.error('Please enter a shop name');
    return;
  }

  loading.value = true;
  try {
    const payload = {
      email: email.value,
      password: password.value,
      role: role.value,
      shopName: role.value === 'VENDOR' ? shopName.value : undefined,
      shopDescription:
        role.value === 'VENDOR' && shopDescription.value
          ? shopDescription.value
          : undefined,
    };

    await api.post('/auth/register', payload);

    if (role.value === 'VENDOR') {
      toastStore.success(
        'Account created! Your merchant application is currently pending admin approval.',
        6000,
      );
    } else {
      toastStore.success('Account created successfully! You can now log in.');
    }

    navigateTo('/login');
  } catch (err: any) {
    console.error(err);
    const errorMessage =
      err.response?._data?.message || 'Failed to register account';
    toastStore.error(errorMessage);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto my-12 bg-white p-8 rounded-xl shadow-md border border-slate-200">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-slate-900 mb-2">Create Account</h1>
      <p class="text-slate-500 text-sm">Join the marketplace as a buyer or vendor</p>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-6">
      <!-- Role Toggle (Tabs style) -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">
          I want to join as a:
        </label>
        <div class="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            @click="role = 'BUYER'"
            class="py-2 text-sm font-semibold rounded-md transition"
            :class="
              role === 'BUYER'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            "
          >
            Buyer (Customer)
          </button>
          <button
            type="button"
            @click="role = 'VENDOR'"
            class="py-2 text-sm font-semibold rounded-md transition"
            :class="
              role === 'VENDOR'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            "
          >
            Vendor (Merchant)
          </button>
        </div>
      </div>

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
        <label for="password" class="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          v-model="password"
          required
          placeholder="••••••••"
          class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />
      </div>

      <!-- Vendor Conditional Fields -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div v-if="role === 'VENDOR'" class="space-y-4 pt-4 border-t border-slate-100">
          <div>
            <label for="shopName" class="block text-sm font-medium text-slate-700 mb-1">
              Shop Name *
            </label>
            <input
              id="shopName"
              type="text"
              v-model="shopName"
              :required="role === 'VENDOR'"
              placeholder="e.g. Pizza Paradise"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label
              for="shopDescription"
              class="block text-sm font-medium text-slate-700 mb-1"
            >
              Shop Description
            </label>
            <textarea
              id="shopDescription"
              v-model="shopDescription"
              rows="3"
              placeholder="Tell customers about your shop..."
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            ></textarea>
          </div>
        </div>
      </Transition>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading">Creating Account...</span>
        <span v-else>Register Account</span>
      </button>
    </form>

    <div class="mt-8 pt-6 border-t border-slate-150 text-center text-sm text-slate-500">
      Already have an account?
      <NuxtLink to="/login" class="font-semibold text-indigo-600 hover:text-indigo-500 ml-1">
        Sign In here
      </NuxtLink>
    </div>
  </div>
</template>
