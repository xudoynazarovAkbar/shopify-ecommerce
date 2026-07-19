<script setup lang="ts">
defineProps<{
  categories: any[];
  loading: boolean;
}>();
</script>

<template>
  <section class="space-y-6">
    <h2 class="text-xl font-extrabold text-textPrimary flex items-center gap-2">
      <Icon name="heroicons:tag" class="text-brand w-5 h-5" />
      Browse Categories
    </h2>
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div
        v-for="i in 4"
        :key="i"
        class="h-16 bg-appBg animate-pulse rounded-xl"
      ></div>
    </div>
    <div v-else-if="categories.length === 0" class="text-textMuted text-sm">
      No categories available yet.
    </div>
    <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="bg-cardBg p-4 rounded-xl shadow-sm border border-appBorder hover:shadow transition cursor-pointer flex flex-col justify-center items-center text-center"
      >
        <span class="font-bold text-sm text-textPrimary">{{ cat.name }}</span>
        <span class="text-xs text-textMuted mt-1" v-if="cat.description">
          {{ cat.description }}
        </span>
      </div>
    </div>
  </section>
</template>
