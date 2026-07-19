<script setup lang="ts">
defineProps<{
  vendors: any[];
  loading: boolean;
}>();
</script>

<template>
  <section class="space-y-6">
    <h2 class="text-xl font-extrabold text-textPrimary flex items-center gap-2">
      <Icon
        name="heroicons:building-storefront"
        class="text-brand w-5 h-5"
      />
      Featured Stores & Kitchens
    </h2>
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div
        v-for="i in 3"
        :key="i"
        class="h-40 bg-appBg animate-pulse rounded-xl"
      ></div>
    </div>
    <div v-else-if="vendors.length === 0" class="text-textMuted text-sm">
      No active merchants available.
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <NuxtLink
        v-for="vendor in vendors"
        :key="vendor.id"
        :to="`/vendor/${vendor.id}`"
        class="bg-cardBg p-6 rounded-xl border border-appBorder shadow-sm hover:shadow transition cursor-pointer block space-y-3"
      >
        <div class="flex items-start justify-between">
          <h3 class="font-bold text-lg text-textPrimary">
            {{ vendor.shopName }}
          </h3>
          <span
            class="flex items-center gap-1 text-amber-500 font-bold text-sm"
            v-if="vendor.averageRating"
          >
            <Icon name="heroicons:star-20-solid" class="w-4 h-4" />
            {{ vendor.averageRating.toFixed(1) }}
          </span>
          <span class="text-xs text-textMuted font-medium" v-else>
            No ratings
          </span>
        </div>
        <p class="text-sm text-textMuted line-clamp-2">
          {{ vendor.shopDescription || 'No description provided.' }}
        </p>
      </NuxtLink>
    </div>
  </section>
</template>
