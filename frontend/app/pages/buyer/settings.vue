<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  meta: { roles: ['BUYER'] },
});
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

    <!-- Change Password Form Container -->
    <AuthChangePasswordForm />
  </div>
</template>
