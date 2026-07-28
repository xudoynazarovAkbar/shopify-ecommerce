<script setup lang="ts">
import { useChangePassword } from '../../composables/useChangePassword';

const {
  currentPassword,
  newPassword,
  currentPasswordError,
  newPasswordError,
  loading,
  handleChangePassword,
} = useChangePassword();

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
</script>

<template>
  <div class="bg-cardBg p-6 sm:p-8 rounded-2xl border border-appBorder shadow-sm space-y-6">
    <div class="space-y-1">
      <h3 class="text-xl font-black text-textPrimary tracking-tight">
        {{ $t('settings.changePassword') }}
      </h3>
      <p class="text-xs text-textMuted">
        {{ $t('settings.subtitle') }}
      </p>
    </div>

    <form class="space-y-4" novalidate @submit.prevent="handleChangePassword">
      <!-- Current Password -->
      <CommonBaseInput
        id="currentPassword"
        v-model="currentPassword"
        :type="showCurrentPassword ? 'text' : 'password'"
        :label="$t('settings.currentPassword')"
        required
        :error="currentPasswordError"
        :placeholder="$t('settings.currentPasswordPlaceholder')"
        :right-icon="showCurrentPassword ? 'heroicons:eye-slash' : 'heroicons:eye'"
        @click:right="showCurrentPassword = !showCurrentPassword"
      />

      <!-- New Password -->
      <CommonBaseInput
        id="newPassword"
        v-model="newPassword"
        :type="showNewPassword ? 'text' : 'password'"
        :label="$t('settings.newPassword')"
        required
        :error="newPasswordError"
        :placeholder="$t('settings.newPasswordPlaceholder')"
        :right-icon="showNewPassword ? 'heroicons:eye-slash' : 'heroicons:eye'"
        @click:right="showNewPassword = !showNewPassword"
      />

      <!-- Submit Button -->
      <CommonBaseButton type="submit" :loading="loading" class="w-full sm:w-auto px-6 py-2.5 font-bold rounded-xl text-sm transition shadow-sm active:scale-95 bg-brand hover:bg-brandHover text-white">
        {{ $t('settings.savePasswordBtn') }}
      </CommonBaseButton>
    </form>
  </div>
</template>
