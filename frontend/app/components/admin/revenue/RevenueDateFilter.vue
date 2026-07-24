<script setup lang="ts">
const startDate = defineModel<string>('startDate', { required: true });
const endDate = defineModel<string>('endDate', { required: true });

defineEmits<{
  (e: 'setLastWeek' | 'setLastMonth' | 'setLast3Months' | 'setLastYear'): void;
}>();
</script>

<template>
  <!-- Period Selection Panel -->
  <div class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Start Date picker -->
      <div class="relative rounded-xl border border-appBorder bg-appBg/50 hover:border-brand/30 transition shadow-sm focus-within:ring-2 focus-within:ring-brand/20 flex items-center px-3.5 py-2">
        <Icon name="heroicons:calendar-days-20-solid" class="w-5 h-5 text-textMuted shrink-0 mr-2" />
        <div class="flex-1 flex flex-col">
          <label class="text-[9px] uppercase font-black text-textMuted tracking-wider">{{ $t('admin.revenue.startDate') }}</label>
          <input
            v-model="startDate"
            type="date"
            class="bg-transparent text-textPrimary text-sm font-semibold outline-none border-none w-full p-0 [color-scheme:dark]"
          >
        </div>
      </div>

      <!-- End Date picker -->
      <div class="relative rounded-xl border border-appBorder bg-appBg/50 hover:border-brand/30 transition shadow-sm focus-within:ring-2 focus-within:ring-brand/20 flex items-center px-3.5 py-2">
        <Icon name="heroicons:calendar-days-20-solid" class="w-5 h-5 text-textMuted shrink-0 mr-2" />
        <div class="flex-1 flex flex-col">
          <label class="text-[9px] uppercase font-black text-textMuted tracking-wider">{{ $t('admin.revenue.endDate') }}</label>
          <input
            v-model="endDate"
            type="date"
            class="bg-transparent text-textPrimary text-sm font-semibold outline-none border-none w-full p-0 [color-scheme:dark]"
          >
        </div>
      </div>
    </div>

    <!-- Quick Select Shortcuts -->
    <div class="flex flex-wrap gap-2 pt-1">
      <button
        class="px-4 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
        @click="$emit('setLastWeek')"
      >
        {{ $t('admin.revenue.lastWeek') }}
      </button>
      <button
        class="px-4 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
        @click="$emit('setLastMonth')"
      >
        {{ $t('admin.revenue.lastMonth') }}
      </button>
      <button
        class="px-4 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
        @click="$emit('setLast3Months')"
      >
        {{ $t('admin.revenue.last3Months') }}
      </button>
      <button
        class="px-4 py-2 rounded-xl text-xs font-bold border border-appBorder bg-appBg hover:bg-cardBg hover:text-brand hover:border-brand/30 transition duration-200"
        @click="$emit('setLastYear')"
      >
        {{ $t('admin.revenue.lastYear') }}
      </button>
    </div>
  </div>
</template>
