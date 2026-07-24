<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  startDate: string;
  endDate: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:startDate' | 'update:endDate', val: string): void;
  (e: 'setLastWeek' | 'setLastMonth' | 'setLast3Months' | 'setLastYear'): void;
}>();

const localStartDate = computed({
  get: () => props.startDate,
  set: (val) => emit('update:startDate', val),
});

const localEndDate = computed({
  get: () => props.endDate,
  set: (val) => emit('update:endDate', val),
});
</script>

<template>
  <div class="space-y-4">
    <!-- Date Inputs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Start Date picker -->
      <div class="relative rounded-xl border border-appBorder bg-appBg/50 hover:border-brand/30 transition shadow-sm focus-within:ring-2 focus-within:ring-brand/20 flex items-center px-3.5 py-2">
        <Icon name="heroicons:calendar-days-20-solid" class="w-5 h-5 text-textMuted shrink-0 mr-2" />
        <div class="flex-1 flex flex-col">
          <label class="text-[9px] uppercase font-black text-textMuted tracking-wider">{{ $t('buyer.spendings.startDate') }}</label>
          <input
            v-model="localStartDate"
            type="date"
            class="bg-transparent text-textPrimary text-sm font-semibold outline-none border-none w-full p-0 [color-scheme:dark]"
          >
        </div>
      </div>

      <!-- End Date picker -->
      <div class="relative rounded-xl border border-appBorder bg-appBg/50 hover:border-brand/30 transition shadow-sm focus-within:ring-2 focus-within:ring-brand/20 flex items-center px-3.5 py-2">
        <Icon name="heroicons:calendar-days-20-solid" class="w-5 h-5 text-textMuted shrink-0 mr-2" />
        <div class="flex-1 flex flex-col">
          <label class="text-[9px] uppercase font-black text-textMuted tracking-wider">{{ $t('buyer.spendings.endDate') }}</label>
          <input
            v-model="localEndDate"
            type="date"
            class="bg-transparent text-textPrimary text-sm font-semibold outline-none border-none w-full p-0 [color-scheme:dark]"
          >
        </div>
      </div>
    </div>

    <!-- Shortcut triggers -->
    <div class="flex flex-wrap gap-2 pt-1">
      <button
        class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
        type="button"
        @click="emit('setLastWeek')"
      >
        {{ $t('buyer.spendings.lastWeek') }}
      </button>
      <button
        class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
        type="button"
        @click="emit('setLastMonth')"
      >
        {{ $t('buyer.spendings.lastMonth') }}
      </button>
      <button
        class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
        type="button"
        @click="emit('setLast3Months')"
      >
        {{ $t('buyer.spendings.last3Months') }}
      </button>
      <button
        class="px-3.5 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
        type="button"
        @click="emit('setLastYear')"
      >
        {{ $t('buyer.spendings.lastYear') }}
      </button>
    </div>
  </div>
</template>
