<script setup lang="ts">
defineProps<{
  categories: any[];
  loading: boolean;
}>();
</script>

<template>
  <section class="space-y-6">
    <h2 class="text-xl font-extrabold text-slate-800 flex items-center gap-2">
      <Icon name="heroicons:tag" class="text-indigo-600 w-5 h-5" />
      Browse Categories
    </h2>
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div
        v-for="i in 4"
        :key="i"
        class="h-16 bg-slate-200 animate-pulse rounded-xl"
      ></div>
    </div>
    <div v-else-if="categories.length === 0" class="text-slate-500 text-sm">
      No categories available yet.
    </div>
    <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow transition cursor-pointer flex flex-col justify-center items-center text-center"
      >
        <span class="font-bold text-sm text-slate-800">{{ cat.name }}</span>
        <span class="text-xs text-slate-400 mt-1" v-if="cat.description">
          {{ cat.description }}
        </span>
      </div>
    </div>
  </section>
</template>
